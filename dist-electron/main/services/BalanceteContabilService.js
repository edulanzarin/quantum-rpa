"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteContabilService = void 0;
const PlanoContaService_1 = require("./PlanoContaService");
const LancamentoContabilService_1 = require("./LancamentoContabilService");
const BaseService_1 = require("./BaseService");
const contabilidade_utils_1 = require("../utils/contabilidade.utils");
const validation_utils_1 = require("../utils/validation.utils");
const _constants_1 = require("../constants");
class BalanceteContabilService extends BaseService_1.BaseService {
    planoContaService;
    lancamentoService;
    constructor(planoContaService = new PlanoContaService_1.PlanoContaService(), lancamentoService = new LancamentoContabilService_1.LancamentoContabilService()) {
        super();
        this.planoContaService = planoContaService;
        this.lancamentoService = lancamentoService;
    }
    /**
     * Gera balanço patrimonial contábil (contas 1 e 2) até o nível 3.
     */
    async gerarBalancoPatrimonial(codigoEmpresa, dataInicio, dataFim, origem) {
        // Validações
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("gerarBalancoPatrimonial", {
            codigoEmpresa,
            dataInicio,
            dataFim,
            origem,
        });
        // Busca dados
        const [plano, lancamentos] = await Promise.all([
            this.planoContaService.obterPlanoProcessado(codigoEmpresa),
            this.lancamentoService.obterLancamentosContabeisPorOrigem(codigoEmpresa, dataInicio, dataFim, origem),
        ]);
        const saldosPorConta = this.lancamentoService.somarPorConta(lancamentos);
        // Processa apenas contas patrimoniais (1 e 2)
        const contasPatrimoniais = (0, contabilidade_utils_1.filtrarContasPatrimoniais)(plano);
        const linhas = [];
        for (const raiz of contasPatrimoniais) {
            (0, contabilidade_utils_1.acumularSaldosHierarquicos)(raiz, saldosPorConta, linhas, _constants_1.NIVEIS_RELATORIO.SINTETICO);
        }
        // Filtra e ordena
        const linhasComSaldo = (0, contabilidade_utils_1.filtrarLinhasComSaldo)(linhas);
        return (0, contabilidade_utils_1.ordenarBalancete)(linhasComSaldo);
    }
}
exports.BalanceteContabilService = BalanceteContabilService;
