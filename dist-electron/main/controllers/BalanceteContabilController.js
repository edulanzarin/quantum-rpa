"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteContabilController = void 0;
const BalanceteContabilService_1 = require("../services/BalanceteContabilService");
const BaseController_1 = require("./BaseController");
class BalanceteContabilController extends BaseController_1.BaseController {
    service;
    constructor(service = new BalanceteContabilService_1.BalanceteContabilService()) {
        super();
        this.service = service;
    }
    registrarEventos() {
        this.registrarHandler("balancete:gerarBalancoPatrimonial", async (_event, codigoEmpresa, dataInicio, dataFim, origem) => {
            this.log("gerarBalancoPatrimonial", {
                codigoEmpresa,
                dataInicio,
                dataFim,
                origem,
            });
            return await this.service.gerarBalancoPatrimonial(codigoEmpresa, new Date(dataInicio), new Date(dataFim), origem);
        });
    }
}
exports.BalanceteContabilController = BalanceteContabilController;
