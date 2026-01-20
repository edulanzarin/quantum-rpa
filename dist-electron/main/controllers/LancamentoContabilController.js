"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoContabilController = void 0;
const LancamentoContabilService_1 = require("../services/LancamentoContabilService");
const BaseController_1 = require("./BaseController");
/**
 * Controller para lançamentos contábeis.
 * Pode ser usado futuramente para funcionalidades adicionais.
 */
class LancamentoContabilController extends BaseController_1.BaseController {
    service;
    constructor(service = new LancamentoContabilService_1.LancamentoContabilService()) {
        super();
        this.service = service;
    }
    registrarEventos() {
        this.registrarHandler("lancamentos:obterPorOrigem", async (_event, codigoEmpresa, dataInicio, dataFim, origem) => {
            this.log("obterPorOrigem", { codigoEmpresa, origem });
            return await this.service.obterLancamentosContabeisPorOrigem(codigoEmpresa, new Date(dataInicio), new Date(dataFim), origem);
        });
    }
}
exports.LancamentoContabilController = LancamentoContabilController;
