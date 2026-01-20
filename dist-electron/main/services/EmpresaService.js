"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaService = void 0;
const EmpresaRepository_1 = require("../repositories/EmpresaRepository");
const BaseService_1 = require("./BaseService");
class EmpresaService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new EmpresaRepository_1.EmpresaRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Obtém todas as empresas cadastradas no sistema.
     */
    async obterTodasEmpresas() {
        this.log("obterTodasEmpresas");
        return await this.repository.obterEmpresas();
    }
}
exports.EmpresaService = EmpresaService;
