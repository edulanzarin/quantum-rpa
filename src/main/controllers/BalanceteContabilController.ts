import { BalanceteContabilService } from "@services/BalanceteContabilService";
import { BaseController } from "./BaseController";

export class BalanceteContabilController extends BaseController {
  constructor(private service = new BalanceteContabilService()) {
    super();
  }

  registrarEventos(): void {
    this.registrarHandler(
      "balancete:gerarBalancoPatrimonial",
      async (
        _event,
        codigoEmpresa: number,
        dataInicio: Date,
        dataFim: Date,
        origem: string,
      ) => {
        this.log("gerarBalancoPatrimonial", {
          codigoEmpresa,
          dataInicio,
          dataFim,
          origem,
        });

        return await this.service.gerarBalancoPatrimonial(
          codigoEmpresa,
          new Date(dataInicio),
          new Date(dataFim),
          origem,
        );
      },
    );
  }
}
