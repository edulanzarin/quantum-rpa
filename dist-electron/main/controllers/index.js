"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarTodosEventos = void 0;
const BalanceteContabilController_1 = require("./BalanceteContabilController");
const BalanceteFiscalController_1 = require("./BalanceteFiscalController");
const EmpresaController_1 = require("./EmpresaController");
const PlanoConciliacaoController_1 = require("./PlanoConciliacaoController");
const NaturezaController_1 = require("./NaturezaController");
const registrarTodosEventos = () => {
    new EmpresaController_1.EmpresaController().registrarEventos();
    new BalanceteContabilController_1.BalanceteContabilController().registrarEventos();
    new BalanceteFiscalController_1.BalanceteFiscalController().registrarEventos();
    new PlanoConciliacaoController_1.PlanoConciliacaoController().registrarEventos();
    new NaturezaController_1.NaturezaController().registrarEventos();
};
exports.registrarTodosEventos = registrarTodosEventos;
