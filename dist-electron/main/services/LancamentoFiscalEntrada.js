"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoFiscalEntradaService = void 0;
const LancamentoFiscalEntradaRepository_1 = require("../repositories/LancamentoFiscalEntradaRepository");
class LancamentoFiscalEntradaService {
    repository;
    constructor() {
        this.repository = new LancamentoFiscalEntradaRepository_1.LancamentoFiscalEntradaRepository();
    }
    /**
     * Busca os lançamentos fiscais de entrada e seus respectivos CFOPs.
     * Retorna uma lista unificada onde os dados da nota se repetem para cada CFOP.
     */
    async buscarLancamentosFiscais(codigoEmpresa, dataInicio, dataFim) {
        console.log(`[Fiscal] Buscando notas de entrada entre ${dataInicio.toISOString()} e ${dataFim.toISOString()}...`);
        const lancamentos = await this.repository.obterItensPorCfopComDadosDaNota(codigoEmpresa, dataInicio, dataFim);
        console.log(`[Fiscal] ${lancamentos.length} itens (CFOPs) encontrados.`);
        return lancamentos;
    }
}
exports.LancamentoFiscalEntradaService = LancamentoFiscalEntradaService;
