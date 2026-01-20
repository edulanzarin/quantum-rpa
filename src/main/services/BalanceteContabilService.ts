import { PlanoContaService } from "./PlanoContaService";
import { LancamentoContabilService } from "./LancamentoContabilService";
import type { BalanceteLinha } from "@shared/types/BalanceteLinha";
import { BaseService } from "./BaseService";
import {
  acumularSaldosHierarquicos,
  filtrarContasPatrimoniais,
  filtrarLinhasComSaldo,
  ordenarBalancete,
} from "@utils/contabilidade.utils";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";
import { NIVEIS_RELATORIO } from "@constants";

export class BalanceteContabilService extends BaseService {
  constructor(
    private planoContaService = new PlanoContaService(),
    private lancamentoService = new LancamentoContabilService(),
  ) {
    super();
  }

  /**
   * Gera balanço patrimonial contábil (contas 1 e 2) até o nível 3.
   */
  async gerarBalancoPatrimonial(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    origem: string,
  ): Promise<BalanceteLinha[]> {
    // Validações
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarIntervaloDatas(dataInicio, dataFim);

    this.log("gerarBalancoPatrimonial", {
      codigoEmpresa,
      dataInicio,
      dataFim,
      origem,
    });

    // Busca dados
    const [plano, lancamentos] = await Promise.all([
      this.planoContaService.obterPlanoProcessado(codigoEmpresa),
      this.lancamentoService.obterLancamentosContabeisPorOrigem(
        codigoEmpresa,
        dataInicio,
        dataFim,
        origem,
      ),
    ]);

    const saldosPorConta = this.lancamentoService.somarPorConta(lancamentos);

    // Processa apenas contas patrimoniais (1 e 2)
    const contasPatrimoniais = filtrarContasPatrimoniais(plano);
    const linhas: BalanceteLinha[] = [];

    for (const raiz of contasPatrimoniais) {
      acumularSaldosHierarquicos(
        raiz,
        saldosPorConta,
        linhas,
        NIVEIS_RELATORIO.SINTETICO,
      );
    }

    // Filtra e ordena
    const linhasComSaldo = filtrarLinhasComSaldo(linhas);
    return ordenarBalancete(linhasComSaldo);
  }
}
