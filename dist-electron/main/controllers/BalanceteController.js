"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteController = void 0;
const electron_1 = require("electron");
const BalanceteService_1 = require("../services/BalanceteService");
class BalanceteController {
    service;
    constructor() {
        this.service = new BalanceteService_1.BalanceteService();
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
exports.BalanceteController = BalanceteController;
