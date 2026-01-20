import { NaturezaService } from "@services/NaturezaService";
import { BaseController } from "./BaseController";

export class NaturezaController extends BaseController {
  constructor(private service = new NaturezaService()) {
    super();
  }

  registrarEventos(): void {
    this.registrarHandler(
      "natureza:listar",
      async (_event, codigoEmpresa: number, termo?: string) => {
        this.log("listar", { codigoEmpresa, termo });
        return await this.service.listar(codigoEmpresa, termo);
      },
    );

    this.registrarHandler(
      "natureza:buscarPorCodigo",
      async (_event, codigoEmpresa: number, cfop: number) => {
        this.log("buscarPorCodigo", { codigoEmpresa, cfop });
        return await this.service.buscarPeloCodigo(codigoEmpresa, cfop);
      },
    );
  }
}
