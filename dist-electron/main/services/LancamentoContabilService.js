"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoContabilService = void 0;
const LancamentoContabilRepository_1 = require("../repositories/LancamentoContabilRepository");
const BaseService_1 = require("./BaseService");
const contabilidade_utils_1 = require("../utils/contabilidade.utils");
const validation_utils_1 = require("../utils/validation.utils");
class LancamentoContabilService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new LancamentoContabilRepository_1.LancamentoContabilRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Obtém lançamentos contábeis por origem e período.
     */
    async obterLancamentosContabeisPorOrigem(codigoEmpresa, dataInicio, dataFim, origem) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("obterLancamentosContabeisPorOrigem", {
            codigoEmpresa,
            dataInicio,
            dataFim,
            origem,
        });
        return await this.repository.obterLancamentosContabeisPorOrigem(codigoEmpresa, dataInicio, dataFim, origem);
    }
    /**
     * Soma lançamentos por conta (CONTACTB).
     * Não aplica lógica hierárquica - apenas agrupa por ID.
     */
    somarPorConta(lancamentos) {
        const saldos = new Map();
        for (const lanc of lancamentos) {
            if (lanc.CONTACTBDEB) {
                (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, lanc.CONTACTBDEB, lanc.VALORLCTOCTB, "D");
            }
            if (lanc.CONTACTBCRED) {
                (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, lanc.CONTACTBCRED, lanc.VALORLCTOCTB, "C");
            }
        }
        return saldos;
    }
}
exports.LancamentoContabilService = LancamentoContabilService;
