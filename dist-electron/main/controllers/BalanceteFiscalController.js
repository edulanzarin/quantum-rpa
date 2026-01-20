"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteFiscalController = void 0;
const BalanceteFiscalService_1 = require("../services/BalanceteFiscalService");
const BaseController_1 = require("./BaseController");
class BalanceteFiscalController extends BaseController_1.BaseController {
    service;
    constructor(service = new BalanceteFiscalService_1.BalanceteFiscalService()) {
        super();
        this.service = service;
    }
    registrarEventos() {
        this.registrarHandler("balancete:gerarProjecaoFiscal", async (_event, codigoEmpresa, dataInicio, dataFim, planoConciliacaoId) => {
            this.log("gerarProjecaoFiscal", {
                codigoEmpresa,
                dataInicio,
                dataFim,
                planoConciliacaoId,
            });
            return await this.service.gerarBalancoPatrimonialFiscal(codigoEmpresa, new Date(dataInicio), new Date(dataFim), planoConciliacaoId);
        });
    }
}
exports.BalanceteFiscalController = BalanceteFiscalController;
