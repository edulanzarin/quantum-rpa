"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoFiscalSaidaService = void 0;
const LancamentoFiscalSaidaRepository_1 = require("../repositories/LancamentoFiscalSaidaRepository");
const BaseService_1 = require("./BaseService");
const validation_utils_1 = require("../utils/validation.utils");
class LancamentoFiscalSaidaService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new LancamentoFiscalSaidaRepository_1.LancamentoFiscalSaidaRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Busca lançamentos fiscais de saída com dados unificados da nota.
     * Retorna lista onde cada item representa um CFOP da nota.
     */
    async buscarLancamentosFiscais(codigoEmpresa, dataInicio, dataFim) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("buscarLancamentosFiscais [SAÍDA]", {
            codigoEmpresa,
            periodo: `${dataInicio.toISOString()} até ${dataFim.toISOString()}`,
        });
        const lancamentos = await this.repository.obterItensPorCfopComDadosDaNota(codigoEmpresa, dataInicio, dataFim);
        this.log(`${lancamentos.length} itens fiscais de saída encontrados`);
        return lancamentos;
    }
}
exports.LancamentoFiscalSaidaService = LancamentoFiscalSaidaService;
