"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoFiscalEntradaService = void 0;
const LancamentoFiscalEntradaRepository_1 = require("../repositories/LancamentoFiscalEntradaRepository");
const BaseService_1 = require("./BaseService");
const validation_utils_1 = require("../utils/validation.utils");
class LancamentoFiscalEntradaService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new LancamentoFiscalEntradaRepository_1.LancamentoFiscalEntradaRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Busca lançamentos fiscais de entrada com dados unificados da nota.
     * Retorna lista onde cada item representa um CFOP da nota.
     */
    async buscarLancamentosFiscais(codigoEmpresa, dataInicio, dataFim) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("buscarLancamentosFiscais", {
            codigoEmpresa,
            periodo: `${dataInicio.toISOString()} até ${dataFim.toISOString()}`,
        });
        const lancamentos = await this.repository.obterItensPorCfopComDadosDaNota(codigoEmpresa, dataInicio, dataFim);
        this.log(`${lancamentos.length} itens fiscais encontrados`);
        return lancamentos;
    }
}
exports.LancamentoFiscalEntradaService = LancamentoFiscalEntradaService;
