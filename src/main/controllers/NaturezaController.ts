import { ipcMain } from "electron";
import { NaturezaService } from "../services/NaturezaService";

export class NaturezaController {
  private service = new NaturezaService();

  registrarEventos() {
    ipcMain.handle(
      "natureza:listar",
      async (_, codigoEmpresa: number, termo?: string) => {
        return await this.service.listar(codigoEmpresa, termo);
      }
    );

    ipcMain.handle(
      "natureza:buscarPorCodigo",
      async (_, codigoEmpresa: number, cfop: number) => {
        return await this.service.buscarPeloCodigo(codigoEmpresa, cfop);
      }
    );
  }
}
