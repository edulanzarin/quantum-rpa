"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturezaController = void 0;
const NaturezaService_1 = require("../services/NaturezaService");
const BaseController_1 = require("./BaseController");
class NaturezaController extends BaseController_1.BaseController {
    service;
    constructor(service = new NaturezaService_1.NaturezaService()) {
        super();
        this.service = service;
    }
    registrarEventos() {
        this.registrarHandler("natureza:listar", async (_event, codigoEmpresa, termo) => {
            this.log("listar", { codigoEmpresa, termo });
            return await this.service.listar(codigoEmpresa, termo);
        });
        this.registrarHandler("natureza:buscarPorCodigo", async (_event, codigoEmpresa, cfop) => {
            this.log("buscarPorCodigo", { codigoEmpresa, cfop });
            return await this.service.buscarPeloCodigo(codigoEmpresa, cfop);
        });
    }
}
exports.NaturezaController = NaturezaController;
