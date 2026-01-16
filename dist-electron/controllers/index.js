"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarTodosEventos = void 0;
const EmpresaController_1 = require("./EmpresaController");
const registrarTodosEventos = () => {
    new EmpresaController_1.EmpresaController().registrarEventos();
};
exports.registrarTodosEventos = registrarTodosEventos;
