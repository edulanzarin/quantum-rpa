"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoContaController = void 0;
const PlanoContaService_1 = require("../services/PlanoContaService");
const BaseController_1 = require("./BaseController");
/**
 * Controller para operações com plano de contas.
 * Atualmente não exposto ao frontend, mas pode ser usado futuramente.
 */
class PlanoContaController extends BaseController_1.BaseController {
    service;
    constructor(service = new PlanoContaService_1.PlanoContaService()) {
        super();
        this.service = service;
    }
    registrarEventos() {
        this.registrarHandler("planocontas:obterProcessado", async (_event, codigoEmpresa) => {
            this.log("obterProcessado", { codigoEmpresa });
            return await this.service.obterPlanoProcessado(codigoEmpresa);
        });
    }
}
exports.PlanoContaController = PlanoContaController;
