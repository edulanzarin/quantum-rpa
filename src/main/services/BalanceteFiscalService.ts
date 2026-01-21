// @services/BalanceteFiscalService.ts

import { PlanoContaService } from "./PlanoContaService";
import { LancamentoFiscalEntradaService } from "./LancamentoFiscalEntradaService";
import { LancamentoFiscalSaidaService } from "./LancamentoFiscalSaidaService";
import { DemaisDocumentosFiscalService } from "./DemaisDocumentosFiscalService";
import { OutraOperacaoIcmsSCService } from "./OutraOperacaoIcmsSCService";
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
import {
  calcularRateioImpostos,
  processarPisCofinsRecuperavel,
} from "@utils/fiscal.utils";
import { adicionarSaldoConta } from "@utils/contabilidade.utils";
import { CONTAS_ENTRADA, CONTAS_SAIDA, NIVEIS_RELATORIO } from "@constants";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";

export class BalanceteFiscalService extends BaseService {
  constructor(
    private planoContaService = new PlanoContaService(),
    private fiscalEntradaService = new LancamentoFiscalEntradaService(),
    private fiscalSaidaService = new LancamentoFiscalSaidaService(),
    private demaisDocumentosFiscalService = new DemaisDocumentosFiscalService(),
    private outraOperacaoIcmsSCService = new OutraOperacaoIcmsSCService(),
    private planoConciliacaoRepo = new PlanoConciliacaoRepository(),
  ) {
    super();
  }

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
    const [
      arvorePlanoContas,
      notasEntrada,
      notasSaida,
      demaisDocumentosFiscal,
      totalDCIP,
      regrasItens,
    ] = await Promise.all([
      this.planoContaService.obterPlanoProcessado(codigoEmpresa),
      this.fiscalEntradaService.buscarLancamentosFiscais(
        codigoEmpresa,
        dataInicio,
        dataFim,
      ),
      this.fiscalSaidaService.buscarLancamentosFiscais(
        codigoEmpresa,
        dataInicio,
        dataFim,
      ),
      this.demaisDocumentosFiscalService.buscarPisCofinsDemaisDocumentosFiscal(
        codigoEmpresa,
        dataInicio,
        dataFim,
      ),
      this.outraOperacaoIcmsSCService.buscarDCIP(
        codigoEmpresa,
        dataInicio,
        dataFim,
      ),
      this.planoConciliacaoRepo.obterItensPorPlano(planoConciliacaoId),
    ]);

    // Indexa regras por CFOP
    const mapaRegras = this.indexarRegrasPorCfop(regrasItens);

    // Calcula saldos projetados
    const saldosProjetados = this.calcularSaldosProjetados(
      notasEntrada,
      notasSaida,
      demaisDocumentosFiscal,
      totalDCIP,
      mapaRegras,
    );

    // Gera balancete
    return this.gerarBalancete(arvorePlanoContas, saldosProjetados);
  }

  private indexarRegrasPorCfop(
    regras: ItemPlanoConciliacao[],
  ): Map<number, ItemPlanoConciliacao> {
    const mapa = new Map<number, ItemPlanoConciliacao>();
    regras.forEach((r) => mapa.set(r.cfop, r));
    return mapa;
  }

  /**
   * Calcula saldos projetados baseado nas notas de entrada, saída e demais documentos.
   */
  private calcularSaldosProjetados(
    notasEntrada: any[],
    notasSaida: any[],
    demaisDocumentosFiscal: any[],
    totalDCIP: number,
    mapaRegras: Map<number, ItemPlanoConciliacao>,
  ): MapaSaldoConta {
    const saldos: MapaSaldoConta = new Map();

    // Processa notas fiscais de ENTRADA
    for (const nota of notasEntrada) {
      const regra = mapaRegras.get(nota.CODIGOCFOP);

      if (!regra || !regra.contabiliza) {
        continue;
      }

      this.processarNotaEntrada(nota, regra, saldos);
    }

    // Processa notas fiscais de SAÍDA
    for (const nota of notasSaida) {
      const regra = mapaRegras.get(nota.CODIGOCFOP);

      if (!regra || !regra.contabiliza) {
        continue;
      }

      this.processarNotaSaida(nota, regra, saldos);
    }

    // Processa demais documentos (PIS/COFINS)
    this.processarDemaisDocumentosFiscal(demaisDocumentosFiscal, saldos);

    // Processa DCIP (Código 770)
    if (totalDCIP > 0) {
      adicionarSaldoConta(
        saldos,
        CONTAS_ENTRADA.ICMS_A_RECUPERAR,
        totalDCIP,
        "D",
      );
      adicionarSaldoConta(
        saldos,
        CONTAS_SAIDA.DEDUCOES_RECEITA_BRUTA,
        totalDCIP,
        "C",
      );
    }

    return saldos;
  }

  /**
   * Processa PIS/COFINS de demais documentos (EFDF100DEMAISDOC).
   */
  private processarDemaisDocumentosFiscal(
    documentos: any[],
    saldos: MapaSaldoConta,
  ): void {
    for (const doc of documentos) {
      processarPisCofinsRecuperavel(
        saldos,
        doc.CONTACTB,
        doc.VALORPIS,
        doc.VALORCOFINS,
      );
    }
  }

  // ============= PROCESSAMENTO DE ENTRADA (COMPRAS) =============

  /**
   * Processa nota fiscal de ENTRADA
   * Impostos vão para contas A RECUPERAR (ativo)
   *
   * Lógica:
   * - D: Imposto a Recuperar (aumenta ativo)
   * - C: Conta Principal (reduz custo da compra)
   */
  private processarNotaEntrada(
    nota: any,
    regra: ItemPlanoConciliacao,
    saldos: MapaSaldoConta,
  ): void {
    const rateio = calcularRateioImpostos(nota);
    const valorIcms = nota.VALORIMPOSTO || 0;

    // ICMS A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      valorIcms,
      CONTAS_ENTRADA.ICMS_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // IPI A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      rateio.valorIpiProporcional,
      CONTAS_ENTRADA.IPI_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // PIS A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      nota.VALORPIS || 0,
      CONTAS_ENTRADA.PIS_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // COFINS A Recuperar
    this.processarImpostoRecuperavel(
      saldos,
      nota.VALORCOFINS || 0,
      CONTAS_ENTRADA.COFINS_A_RECUPERAR,
      regra.contasDebito || [],
    );

    // Débito principal (estoque, imobilizado, etc)
    if (regra.contasDebito) {
      regra.contasDebito.forEach((contaId) => {
        adicionarSaldoConta(saldos, contaId, rateio.valorDebitoPrincipal, "D");
      });
    }

    // Crédito principal (fornecedores)
    if (regra.contasCredito) {
      regra.contasCredito.forEach((contaId) => {
        adicionarSaldoConta(saldos, contaId, rateio.valorCreditoPrincipal, "C");
      });
    }

    // Retenções na fonte
    if (rateio.valorRetidos > 0) {
      adicionarSaldoConta(
        saldos,
        CONTAS_ENTRADA.RETIDOS,
        rateio.valorRetidos,
        "C",
      );
    }
  }

  /**
   * Processa imposto recuperável (ENTRADA)
   * D: Imposto a Recuperar
   * C: Conta Principal (reduz custo)
   */
  private processarImpostoRecuperavel(
    saldos: MapaSaldoConta,
    valor: number,
    contaAtivo: number,
    contasPrincipais: number[],
  ): void {
    if (valor <= 0) return;

    // Débito: aumenta o ativo (imposto a recuperar)
    adicionarSaldoConta(saldos, contaAtivo, valor, "D");

    // Crédito: reduz o custo das contas principais
    contasPrincipais.forEach((contaId) => {
      adicionarSaldoConta(saldos, contaId, valor, "C");
    });
  }

  // ============= PROCESSAMENTO DE SAÍDA (VENDAS) =============

  /**
   * Processa nota fiscal de SAÍDA
   * Impostos vão para contas A PAGAR (passivo)
   *
   * Lógica:
   * - D: Deduções da Receita Bruta (2770)
   * - C: Imposto a Pagar (passivo)
   */
  private processarNotaSaida(
    nota: any,
    regra: ItemPlanoConciliacao,
    saldos: MapaSaldoConta,
  ): void {
    const rateio = calcularRateioImpostos(nota);
    const valorIcms = nota.VALORIMPOSTO || 0;

    // ICMS A Pagar
    this.processarImpostoAPagar(saldos, valorIcms, CONTAS_SAIDA.ICMS_A_PAGAR);

    // IPI A Pagar (COMENTADO - verificar se usa)
    // this.processarImpostoAPagar(
    //   saldos,
    //   rateio.valorIpiProporcional,
    //   CONTAS_SAIDA.IPI_A_PAGAR,
    // );

    // PIS A Pagar
    this.processarImpostoAPagar(
      saldos,
      nota.VALORPIS || 0,
      CONTAS_SAIDA.PIS_A_PAGAR,
    );

    // COFINS A Pagar (mesma conta do PIS)
    this.processarImpostoAPagar(
      saldos,
      nota.VALORCOFINS || 0,
      CONTAS_SAIDA.COFINS_A_PAGAR,
    );

    // Débito principal (receita de vendas)
    if (regra.contasDebito) {
      regra.contasDebito.forEach((contaId) => {
        adicionarSaldoConta(saldos, contaId, rateio.valorDebitoPrincipal, "D");
      });
    }

    // Crédito principal (clientes/contas a receber)
    if (regra.contasCredito) {
      regra.contasCredito.forEach((contaId) => {
        adicionarSaldoConta(saldos, contaId, rateio.valorCreditoPrincipal, "C");
      });
    }

    if (rateio.valorRetidos > 0) {
      adicionarSaldoConta(
        saldos,
        CONTAS_SAIDA.RETIDOS_SAIDA,
        rateio.valorRetidos,
        "D",
      );
    }
  }

  /**
   * Processa imposto a pagar (SAÍDA)
   * D: Deduções da Receita Bruta (2770)
   * C: Imposto a Pagar (passivo)
   */
  private processarImpostoAPagar(
    saldos: MapaSaldoConta,
    valor: number,
    contaPassivo: number,
  ): void {
    if (valor <= 0) return;

    // Débito: aumenta deduções da receita bruta (diminui resultado)
    adicionarSaldoConta(
      saldos,
      CONTAS_SAIDA.DEDUCOES_RECEITA_BRUTA,
      valor,
      "D",
    );

    // Crédito: aumenta passivo (imposto a pagar)
    adicionarSaldoConta(saldos, contaPassivo, valor, "C");
  }

  // ============= GERAÇÃO DO BALANCETE =============

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
