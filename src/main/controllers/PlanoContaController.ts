import { PlanoContaService } from "@services/PlanoContaService";
import { BaseController } from "./BaseController";

/**
 * Controller para operações com plano de contas.
 * Atualmente não exposto ao frontend, mas pode ser usado futuramente.
 */
export class PlanoContaController extends BaseController {
  constructor(private service = new PlanoContaService()) {
    super();
  }

  registrarEventos(): void {
    this.registrarHandler(
      "planocontas:obterProcessado",
      async (_event, codigoEmpresa: number) => {
        this.log("obterProcessado", { codigoEmpresa });
        return await this.service.obterPlanoProcessado(codigoEmpresa);
      },
    );
  }
}
