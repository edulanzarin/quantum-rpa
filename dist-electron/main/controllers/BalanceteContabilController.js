"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteContabilController = void 0;
const electron_1 = require("electron");
const BalanceteContabilService_1 = require("../services/BalanceteContabilService");
class BalanceteContabilController {
    service;
    constructor() {
        this.service = new BalanceteContabilService_1.BalanceteContabilService();
    }
    registrarEventos() {
        /**
         * Gera o balancete contábil de uma empresa
         * para um período e origem específicos.
         */
        electron_1.ipcMain.handle("balancete:gerarBalancoPatrimonial", async (_event, codigoEmpresa, dataInicio, dataFim, origem) => {
            try {
                return await this.service.gerarBalancoPatrimonial(codigoEmpresa, dataInicio, dataFim, origem);
            }
            catch (error) {
                console.error("Erro ao gerar balancete", error);
                return [];
            }
        });
    }
}
exports.BalanceteContabilController = BalanceteContabilController;
