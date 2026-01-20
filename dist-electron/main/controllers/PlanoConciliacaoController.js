"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoConciliacaoController = void 0;
const PlanoConciliacaoService_1 = require("../services/PlanoConciliacaoService");
const BaseController_1 = require("./BaseController");
class PlanoConciliacaoController extends BaseController_1.BaseController {
    service;
    constructor(service = new PlanoConciliacaoService_1.PlanoConciliacaoService()) {
        super();
        this.service = service;
    }
    registrarEventos() {
        this.registrarHandler("plano:listar", async () => {
            this.log("listar");
            return await this.service.listarTodosPlanos();
        });
        this.registrarHandler("plano:obterPorId", async (_event, id) => {
            this.log("obterPorId", { id });
            return await this.service.obterPlanoCompleto(id);
        });
        this.registrarHandler("plano:salvar", async (_event, plano) => {
            this.log("salvar", { nome: plano.nome, itens: plano.itens?.length });
            return await this.service.salvarPlano(plano);
        });
    }
}
exports.PlanoConciliacaoController = PlanoConciliacaoController;
