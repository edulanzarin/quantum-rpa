"use strict";
// @controllers/DetalhamentoDivergenciaController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalhamentoDivergenciaController = void 0;
const BaseController_1 = require("./BaseController");
const DetalhamentoDivergenciaService_1 = require("../services/DetalhamentoDivergenciaService");
class DetalhamentoDivergenciaController extends BaseController_1.BaseController {
    service = new DetalhamentoDivergenciaService_1.DetalhamentoDivergenciaService();
    registrarEventos() {
        this.registrarHandler("detalhamento:detalharDivergencia", async (event, params) => {
            const { codigoEmpresa, codigoConta, dataInicio, dataFim, planoConciliacaoId, } = params;
            return this.service.detalharDivergenciaConta(codigoEmpresa, codigoConta, new Date(dataInicio), new Date(dataFim), planoConciliacaoId);
        });
    }
}
exports.DetalhamentoDivergenciaController = DetalhamentoDivergenciaController;
