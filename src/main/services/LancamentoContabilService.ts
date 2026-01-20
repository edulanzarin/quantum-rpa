import { LancamentoContabilRepository } from "@repositories/LancamentoContabilRepository";
import type { LancamentoContabil } from "@shared/types/LancamentoContabil";
import type { MapaSaldoConta } from "@shared/types/MapaSaldoConta";

export class LancamentoContabilService {
  private repository = new LancamentoContabilRepository();

  /**
   * Obtém os lançamentos contábeis de determinada
   * origem e intervalo entre datas.
   */
  async obterLancamentosContabeisPorOrigem(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    origem: string,
  ): Promise<LancamentoContabil[]> {
    return this.repository.obterLancamentosContabeisPorOrigem(
      codigoEmpresa,
      dataInicio,
      dataFim,
      origem,
    );
  }

  /**
   * Soma os lançamentos contábeis puramente pelo ID da conta (CONTACTB).
   * Não realiza lógica de classificação ou hierarquia aqui.
   */
  somarPorConta(lancamentos: LancamentoContabil[]): MapaSaldoConta {
    const saldos = new Map<number, { debito: number; credito: number }>();

    for (const lanc of lancamentos) {
      if (lanc.CONTACTBDEB) {
        this.somar(saldos, lanc.CONTACTBDEB, lanc.VALORLCTOCTB, 0);
      }

      if (lanc.CONTACTBCRED) {
        this.somar(saldos, lanc.CONTACTBCRED, 0, lanc.VALORLCTOCTB);
      }
    }

    return saldos;
  }

  private somar(
    mapa: Map<number, { debito: number; credito: number }>,
    conta: number,
    debito: number,
    credito: number,
  ): void {
    const atual = mapa.get(conta) ?? { debito: 0, credito: 0 };

    mapa.set(conta, {
      debito: atual.debito + debito,
      credito: atual.credito + credito,
    });
  }
}
