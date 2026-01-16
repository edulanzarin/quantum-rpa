import { ipcMain } from "electron";
import { EmpresaService } from "@services/EmpresaService";

export class EmpresaController {
  private service: EmpresaService;

  constructor() {
    this.service = new EmpresaService();
  }

  registrarEventos() {
    ipcMain.handle("empresa:obterTodas", async () => {
      try {
        return await this.service.obterTodasEmpresas();
      } catch (error) {
        console.error("Erro no Controller", error);
        return [];
      }
    });
  }
}
