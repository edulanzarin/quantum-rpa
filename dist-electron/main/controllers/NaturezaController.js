"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturezaController = void 0;
const electron_1 = require("electron");
const NaturezaService_1 = require("../services/NaturezaService");
class NaturezaController {
    service = new NaturezaService_1.NaturezaService();
    registrarEventos() {
        electron_1.ipcMain.handle("natureza:listar", async (_, codigoEmpresa, termo) => {
            return await this.service.listar(codigoEmpresa, termo);
        });
        electron_1.ipcMain.handle("natureza:buscarPorCodigo", async (_, codigoEmpresa, cfop) => {
            return await this.service.buscarPeloCodigo(codigoEmpresa, cfop);
        });
    }
}
exports.NaturezaController = NaturezaController;
