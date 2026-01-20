import { EmpresaService } from "@services/EmpresaService";
import { BaseController } from "./BaseController";

export class EmpresaController extends BaseController {
  constructor(private service = new EmpresaService()) {
    super();
  }

  registrarEventos(): void {
    this.registrarHandler("empresa:obterTodas", async () => {
      this.log("obterTodas");
      return await this.service.obterTodasEmpresas();
    });
  }
}
