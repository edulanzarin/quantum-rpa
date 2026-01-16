"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoConciliacaoController = void 0;
const electron_1 = require("electron");
const PlanoConciliacaoService_1 = require("../services/PlanoConciliacaoService");
class PlanoConciliacaoController {
    service = new PlanoConciliacaoService_1.PlanoConciliacaoService();
    registrarEventos() {
        electron_1.ipcMain.handle("plano:listar", async () => {
            try {
                return await this.service.listarTodosPlanos();
            }
            catch (error) {
                console.error("Erro ao listar planos:", error);
                throw error;
            }
        });
        electron_1.ipcMain.handle("plano:obterPorId", async (_, id) => {
            return await this.service.obterPlanoCompleto(id);
        });
        electron_1.ipcMain.handle("plano:salvar", async (_, plano) => {
            return await this.service.salvarPlano(plano);
        });
    }
}
exports.PlanoConciliacaoController = PlanoConciliacaoController;
