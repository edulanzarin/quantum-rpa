"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarTodosEventos = void 0;
const BalanceteController_1 = require("./BalanceteController");
const EmpresaController_1 = require("./EmpresaController");
const PlanoConciliacaoController_1 = require("./PlanoConciliacaoController");
const NaturezaController_1 = require("./NaturezaController");
const registrarTodosEventos = () => {
    new EmpresaController_1.EmpresaController().registrarEventos();
    new BalanceteController_1.BalanceteController().registrarEventos();
    new PlanoConciliacaoController_1.PlanoConciliacaoController().registrarEventos();
    new NaturezaController_1.NaturezaController().registrarEventos();
};
exports.registrarTodosEventos = registrarTodosEventos;
