import { BalanceteFiscalService } from "@services/BalanceteFiscalService";
import { BaseController } from "./BaseController";

export class BalanceteFiscalController extends BaseController {
  constructor(private service = new BalanceteFiscalService()) {
    super();
  }

  registrarEventos(): void {
    this.registrarHandler(
      "balancete:gerarProjecaoFiscal",
      async (
        _event,
        codigoEmpresa: number,
        dataInicio: Date,
        dataFim: Date,
        planoConciliacaoId: number,
      ) => {
        this.log("gerarProjecaoFiscal", {
          codigoEmpresa,
          dataInicio,
          dataFim,
          planoConciliacaoId,
        });

        return await this.service.gerarBalancoPatrimonialFiscal(
          codigoEmpresa,
          new Date(dataInicio),
          new Date(dataFim),
          planoConciliacaoId,
        );
      },
    );
  }
}
