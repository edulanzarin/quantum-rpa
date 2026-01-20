"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaController = void 0;
const EmpresaService_1 = require("../services/EmpresaService");
const BaseController_1 = require("./BaseController");
class EmpresaController extends BaseController_1.BaseController {
    service;
    constructor(service = new EmpresaService_1.EmpresaService()) {
        super();
        this.service = service;
    }
    registrarEventos() {
        this.registrarHandler("empresa:obterTodas", async () => {
            this.log("obterTodas");
            return await this.service.obterTodasEmpresas();
        });
    }
}
exports.EmpresaController = EmpresaController;
