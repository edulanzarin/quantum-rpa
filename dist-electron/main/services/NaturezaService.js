"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturezaService = void 0;
const NaturezaRepository_1 = require("../repositories/NaturezaRepository");
const BaseService_1 = require("./BaseService");
const validation_utils_1 = require("../utils/validation.utils");
const _errors_1 = require("../errors");
class NaturezaService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new NaturezaRepository_1.NaturezaRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Lista naturezas (CFOPs) com busca opcional.
     */
    async listar(codigoEmpresa, termo) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        this.log("listar", { codigoEmpresa, termo });
        return await this.repository.listarNaturezas(codigoEmpresa, termo);
    }
    /**
     * Busca uma CFOP específica pelo código.
     * Lança erro se não encontrada.
     */
    async buscarPeloCodigo(codigoEmpresa, cfop) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarNumeroPositivo)(cfop, "Código CFOP");
        const natureza = await this.repository.obterPorCodigo(codigoEmpresa, cfop);
        if (!natureza) {
            throw new _errors_1.ValidationError(`CFOP ${cfop} não encontrada para a empresa ${codigoEmpresa}`);
        }
        return natureza;
    }
}
exports.NaturezaService = NaturezaService;
