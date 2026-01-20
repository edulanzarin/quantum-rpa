import { LancamentoContabilService } from "@services/LancamentoContabilService";
import { BaseController } from "./BaseController";

/**
 * Controller para lançamentos contábeis.
 * Pode ser usado futuramente para funcionalidades adicionais.
 */
export class LancamentoContabilController extends BaseController {
  constructor(private service = new LancamentoContabilService()) {
    super();
  }

  registrarEventos(): void {
    this.registrarHandler(
      "lancamentos:obterPorOrigem",
      async (
        _event,
        codigoEmpresa: number,
        dataInicio: Date,
        dataFim: Date,
        origem: string,
      ) => {
        this.log("obterPorOrigem", { codigoEmpresa, origem });

        return await this.service.obterLancamentosContabeisPorOrigem(
          codigoEmpresa,
          new Date(dataInicio),
          new Date(dataFim),
          origem,
        );
      },
    );
  }
}
