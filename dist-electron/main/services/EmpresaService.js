"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaService = void 0;
const EmpresaRepository_1 = require("../repositories/EmpresaRepository");
class EmpresaService {
    repository;
    constructor() {
        this.repository = new EmpresaRepository_1.EmpresaRepository();
    }
    async obterTodasEmpresas() {
        return this.repository.obterEmpresas();
    }
}
exports.EmpresaService = EmpresaService;
