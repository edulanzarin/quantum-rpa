"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteFiscalController = void 0;
const electron_1 = require("electron");
const BalanceteFiscalService_1 = require("../services/BalanceteFiscalService");
class BalanceteFiscalController {
    service;
    constructor() {
        this.service = new BalanceteFiscalService_1.BalanceteFiscalService();
    }
    registrarEventos() {
        /**
         * Gera o "Balancete Sombra" (Projeção Fiscal)
         * Baseado nas Notas de Entrada + Regras do Plano de Conciliação
         */
        electron_1.ipcMain.handle("balancete:gerarProjecaoFiscal", async (_event, codigoEmpresa, dataInicio, dataFim, planoConciliacaoId) => {
            try {
                console.log(`[IPC] Gerando projeção fiscal para empresa ${codigoEmpresa}, Plano ${planoConciliacaoId}...`);
                return await this.service.gerarBalancoPatrimonialFiscal(codigoEmpresa, dataInicio, dataFim, planoConciliacaoId);
            }
            catch (error) {
                console.error("❌ Erro ao gerar projeção fiscal:", error);
                return [];
            }
        });
    }
}
exports.BalanceteFiscalController = BalanceteFiscalController;
