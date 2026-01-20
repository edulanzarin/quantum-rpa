import { PlanoContaService } from "./PlanoContaService";
import { LancamentoFiscalEntradaService } from "./LancamentoFiscalEntradaService";
import { PlanoConciliacaoRepository } from "@repositories/PlanoConciliacaoRepository";
import type { BalanceteLinha } from "@shared/types/BalanceteLinha";
import type { ItemPlanoConciliacao } from "@shared/types/ItemPlanoConciliacao";
import type { MapaSaldoConta } from "@shared/types/MapaSaldoConta";
import { BaseService } from "./BaseService";
import {
  acumularSaldosHierarquicos,
  filtrarContasPatrimoniais,
  filtrarLinhasComSaldo,
  ordenarBalancete,
} from "@utils/contabilidade.utils";
import { calcularRateioImpostos } from "@utils/fiscal.utils";
import { adicionarSaldoConta } from "@utils/contabilidade.utils";
import { CONTAS_SISTEMA, NIVEIS_RELATORIO } from "@constants";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";

export class BalanceteFiscalService extends BaseService {
  constructor(
    private planoContaService = new PlanoContaService(),
    private fiscalService = new LancamentoFiscalEntradaService(),
    private planoConciliacaoRepo = new PlanoConciliacaoRepository(),
  ) {
    super();
  }

  /**
   * Gera projeção do balanço patrimonial baseado em notas fiscais.
   * Aplica regras de conciliação fiscal definidas no plano.
   */
  async gerarBalancoPatrimonialFiscal(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    planoConciliacaoId: number,
  ): Promise<BalanceteLinha[]> {
    // Validações
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarNumeroPositivo(planoConciliacaoId, "ID do plano de conciliação");
    validarIntervaloDatas(dataInicio, dataFim);

    this.log("gerarBalancoPatrimonialFiscal", {
      codigoEmpresa,
      dataInicio,
      dataFim,
      planoConciliacaoId,
    });

    // Busca dados necessários
    const [arvorePlanoContas, notas, regrasItens] = await Promise.all([
      this.planoContaService.obterPlanoProcessado(codigoEmpresa),
      this.fiscalService.buscarLancamentosFiscais(
        codigoEmpresa,
        dataInicio,
        dataFim,
      ),
      this.planoConciliacaoRepo.obterItensPorPlano(planoConciliacaoId),
    ]);

    // Indexa regras por CFOP para acesso O(1)
    const mapaRegras = this.indexarRegrasPorCfop(regrasItens);

    // Calcula saldos projetados
    const saldosProjetados = this.calcularSaldosProjetados(notas, mapaRegras);

    // Gera balancete
    return this.gerarBalancete(arvorePlanoContas, saldosProjetados);
  }

  /**
   * Indexa regras de conciliação por CFOP para busca rápida.
   */
  private indexarRegrasPorCfop(
    regras: ItemPlanoConciliacao[],
  ): Map<number, ItemPlanoConciliacao> {
    const mapa = new Map<number, ItemPlanoConciliacao>();
    regras.forEach((r) => mapa.set(r.cfop, r));
    return mapa;
  }

  /**
   * Calcula saldos projetados baseado nas notas e regras.
   */
  private calcularSaldosProjetados(
    notas: any[],
    mapaRegras: Map<number, ItemPlanoConciliacao>,
  ): MapaSaldoConta {
    const saldos: MapaSaldoConta = new Map();

    for (const nota of notas) {
      const regra = mapaRegras.get(nota.CODIGOCFOP);

      if (!regra || !regra.contabiliza) {
        continue;
      }

      this.processarNota(nota, regra, saldos);
    }

    return saldos;
  }

  /**
   * Processa uma nota fiscal aplicando as regras de conciliação.
   */
  private processarNota(
    nota: any,
    regra: ItemPlanoConciliacao,
    saldos: MapaSaldoConta,
  ): void {
    // Calcula rateio de impostos (para IPI e retenções)
    const rateio = calcularRateioImpostos(nota);

    const valorIcms = nota.VALORIMPOSTO || 0;

    // ICMS A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      valorIcms,
      CONTAS_SISTEMA.ICMS_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // IPI A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      rateio.valorIpiProporcional,
      CONTAS_SISTEMA.IPI_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // ← MUDANÇA: Usar valores DIRETOS da nota (já vem correto da query)
    // PIS A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      nota.VALORPIS || 0, // ← Valor correto do CFOP!
      CONTAS_SISTEMA.PIS_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // COFINS A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      nota.VALORCOFINS || 0, // ← Valor correto do CFOP!
      CONTAS_SISTEMA.COFINS_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // 1. DÉBITO: Valor cheio (sem descontos)
    if (regra.contasDebito) {
      regra.contasDebito.forEach((contaId) => {
        adicionarSaldoConta(saldos, contaId, rateio.valorDebitoPrincipal, "D");
      });
    }

    // 2. CRÉDITO: Valor do fornecedor (já descontado das retenções)
    if (regra.contasCredito) {
      regra.contasCredito.forEach((contaId) => {
        adicionarSaldoConta(saldos, contaId, rateio.valorCreditoPrincipal, "C");
      });
    }

    // 3. RETENÇÕES: Apenas lança na conta de retidos
    if (rateio.valorRetidos > 0) {
      adicionarSaldoConta(
        saldos,
        CONTAS_SISTEMA.RETIDOS,
        rateio.valorRetidos,
        "C",
      );
    }
  }

  /**
   * Processa imposto recuperável.
   * Cria DÉBITO na conta de ativo (A Recuperar) e CRÉDITO na conta principal (reduz custo).
   */
  private processarImpostoRecuperavel(
    saldos: MapaSaldoConta,
    valor: number,
    contaAtivo: number,
    contasPrincipais: number[],
  ): void {
    if (valor <= 0) return;

    // Débito no Ativo (Impostos A Recuperar)
    adicionarSaldoConta(saldos, contaAtivo, valor, "D");

    // Crédito na(s) Conta(s) Principal(is) - Reduz o custo
    contasPrincipais.forEach((contaId) => {
      adicionarSaldoConta(saldos, contaId, valor, "C");
    });
  }

  /**
   * Gera o balancete a partir dos saldos calculados.
   */
  private gerarBalancete(
    arvore: any[],
    saldos: MapaSaldoConta,
  ): BalanceteLinha[] {
    const contasPatrimoniais = filtrarContasPatrimoniais(arvore);
    const linhas: BalanceteLinha[] = [];

    for (const raiz of contasPatrimoniais) {
      acumularSaldosHierarquicos(
        raiz,
        saldos,
        linhas,
        NIVEIS_RELATORIO.ANALITICO,
      );
    }

    const linhasComSaldo = filtrarLinhasComSaldo(linhas);
    return ordenarBalancete(linhasComSaldo);
  }
}
