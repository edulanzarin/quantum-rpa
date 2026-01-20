"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarTodosEventos = void 0;
const EmpresaController_1 = require("./EmpresaController");
const BalanceteContabilController_1 = require("./BalanceteContabilController");
const BalanceteFiscalController_1 = require("./BalanceteFiscalController");
const PlanoConciliacaoController_1 = require("./PlanoConciliacaoController");
const NaturezaController_1 = require("./NaturezaController");
/**
 * Registra todos os controllers da aplicação.
 * Centraliza a inicialização dos event handlers IPC.
 */
const registrarTodosEventos = () => {
    console.log("🚀 Registrando controllers...");
    const controllers = [
        new EmpresaController_1.EmpresaController(),
        new BalanceteContabilController_1.BalanceteContabilController(),
        new BalanceteFiscalController_1.BalanceteFiscalController(),
        new PlanoConciliacaoController_1.PlanoConciliacaoController(),
        new NaturezaController_1.NaturezaController(),
    ];
    controllers.forEach((controller) => {
        controller.registrarEventos();
    });
    console.log(`✅ ${controllers.length} controllers registrados com sucesso`);
};
exports.registrarTodosEventos = registrarTodosEventos;
