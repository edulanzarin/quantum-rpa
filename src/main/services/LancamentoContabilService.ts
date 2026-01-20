import { LancamentoContabilRepository } from "@repositories/LancamentoContabilRepository";
import type { LancamentoContabil } from "@shared/types/LancamentoContabil";
import type { MapaSaldoConta } from "@shared/types/MapaSaldoConta";
import { BaseService } from "./BaseService";
import { adicionarSaldoConta } from "@utils/contabilidade.utils";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";

export class LancamentoContabilService extends BaseService {
  constructor(private repository = new LancamentoContabilRepository()) {
    super();
  }

  /**
   * Obtém lançamentos contábeis por origem e período.
   */
  async obterLancamentosContabeisPorOrigem(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    origem: string,
  ): Promise<LancamentoContabil[]> {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarIntervaloDatas(dataInicio, dataFim);

    this.log("obterLancamentosContabeisPorOrigem", {
      codigoEmpresa,
      dataInicio,
      dataFim,
      origem,
    });

    return await this.repository.obterLancamentosContabeisPorOrigem(
      codigoEmpresa,
      dataInicio,
      dataFim,
      origem,
    );
  }

  /**
   * Soma lançamentos por conta (CONTACTB).
   * Não aplica lógica hierárquica - apenas agrupa por ID.
   */
  somarPorConta(lancamentos: LancamentoContabil[]): MapaSaldoConta {
    const saldos: MapaSaldoConta = new Map();

    for (const lanc of lancamentos) {
      if (lanc.CONTACTBDEB) {
        adicionarSaldoConta(saldos, lanc.CONTACTBDEB, lanc.VALORLCTOCTB, "D");
      }

      if (lanc.CONTACTBCRED) {
        adicionarSaldoConta(saldos, lanc.CONTACTBCRED, lanc.VALORLCTOCTB, "C");
      }
    }

    return saldos;
  }
}
