import { ipcMain } from "electron";
import { PlanoConciliacaoService } from "../services/PlanoConciliacaoService";
import type { PlanoConciliacao } from "@shared/types/PlanoConciliacao";

export class PlanoConciliacaoController {
  private service = new PlanoConciliacaoService();

  registrarEventos() {
    ipcMain.handle("plano:listar", async () => {
      try {
        return await this.service.listarTodosPlanos();
      } catch (error: any) {
        console.error("Erro ao listar planos:", error);
        throw error;
      }
    });

    ipcMain.handle("plano:obterPorId", async (_, id: number) => {
      return await this.service.obterPlanoCompleto(id);
    });

    ipcMain.handle("plano:salvar", async (_, plano: PlanoConciliacao) => {
      return await this.service.salvarPlano(plano);
    });
  }
}
