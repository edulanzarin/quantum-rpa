"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturezaService = void 0;
const NaturezaRepository_1 = require("../repositories/NaturezaRepository");
class NaturezaService {
    repository = new NaturezaRepository_1.NaturezaRepository();
    async listar(codigoEmpresa, termo) {
        return await this.repository.listarNaturezas(codigoEmpresa, termo);
    }
    async buscarPeloCodigo(codigoEmpresa, cfop) {
        const natureza = await this.repository.obterPorCodigo(codigoEmpresa, cfop);
        if (!natureza) {
            throw new Error(`CFOP ${cfop} não encontrada na empresa ${codigoEmpresa}.`);
        }
        return natureza;
    }
}
exports.NaturezaService = NaturezaService;
