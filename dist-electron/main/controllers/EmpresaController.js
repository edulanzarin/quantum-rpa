"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaController = void 0;
const electron_1 = require("electron");
const EmpresaService_1 = require("../services/EmpresaService");
class EmpresaController {
    service;
    constructor() {
        this.service = new EmpresaService_1.EmpresaService();
    }
    registrarEventos() {
        electron_1.ipcMain.handle("empresa:obterTodas", async () => {
            try {
                return await this.service.obterTodasEmpresas();
            }
            catch (error) {
                console.error("Erro no Controller", error);
                return [];
            }
        });
    }
}
exports.EmpresaController = EmpresaController;
