"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteFiscalService = void 0;
const PlanoContaService_1 = require("./PlanoContaService");
const LancamentoFiscalEntradaService_1 = require("./LancamentoFiscalEntradaService");
const PlanoConciliacaoRepository_1 = require("../repositories/PlanoConciliacaoRepository");
const BaseService_1 = require("./BaseService");
const contabilidade_utils_1 = require("../utils/contabilidade.utils");
const fiscal_utils_1 = require("../utils/fiscal.utils");
const contabilidade_utils_2 = require("../utils/contabilidade.utils");
const _constants_1 = require("../constants");
const validation_utils_1 = require("../utils/validation.utils");
class BalanceteFiscalService extends BaseService_1.BaseService {
    planoContaService;
    fiscalService;
    planoConciliacaoRepo;
    constructor(planoContaService = new PlanoContaService_1.PlanoContaService(), fiscalService = new LancamentoFiscalEntradaService_1.LancamentoFiscalEntradaService(), planoConciliacaoRepo = new PlanoConciliacaoRepository_1.PlanoConciliacaoRepository()) {
        super();
        this.planoContaService = planoContaService;
        this.fiscalService = fiscalService;
        this.planoConciliacaoRepo = planoConciliacaoRepo;
    }
    /**
     * Gera projeção do balanço patrimonial baseado em notas fiscais.
     * Aplica regras de conciliação fiscal definidas no plano.
     */
    async gerarBalancoPatrimonialFiscal(codigoEmpresa, dataInicio, dataFim, planoConciliacaoId) {
        // Validações
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarNumeroPositivo)(planoConciliacaoId, "ID do plano de conciliação");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("gerarBalancoPatrimonialFiscal", {
            codigoEmpresa,
            dataInicio,
            dataFim,
            planoConciliacaoId,
        });
        // Busca dados necessários
        const [arvorePlanoContas, notas, regrasItens] = await Promise.all([
            this.planoContaService.obterPlanoProcessado(codigoEmpresa),
            this.fiscalService.buscarLancamentosFiscais(codigoEmpresa, dataInicio, dataFim),
            this.planoConciliacaoRepo.obterItensPorPlano(planoConciliacaoId),
        ]);
        // Indexa regras por CFOP para acesso O(1)
        const mapaRegras = this.indexarRegrasPorCfop(regrasItens);
        // Calcula saldos projetados
        const saldosProjetados = this.calcularSaldosProjetados(notas, mapaRegras);
        // Gera balancete
        return this.gerarBalancete(arvorePlanoContas, saldosProjetados);
    }
    /**
     * Indexa regras de conciliação por CFOP para busca rápida.
     */
    indexarRegrasPorCfop(regras) {
        const mapa = new Map();
        regras.forEach((r) => mapa.set(r.cfop, r));
        return mapa;
    }
    /**
     * Calcula saldos projetados baseado nas notas e regras.
     */
    calcularSaldosProjetados(notas, mapaRegras) {
        const saldos = new Map();
        for (const nota of notas) {
            const regra = mapaRegras.get(nota.CODIGOCFOP);
            if (!regra || !regra.contabiliza) {
                continue;
            }
            this.processarNota(nota, regra, saldos);
        }
        return saldos;
    }
    /**
     * Processa uma nota fiscal aplicando as regras de conciliação.
     */
    processarNota(nota, regra, saldos) {
        // Calcula rateio de impostos (para IPI e retenções)
        const rateio = (0, fiscal_utils_1.calcularRateioImpostos)(nota);
        const valorIcms = nota.VALORIMPOSTO || 0;
        // ICMS A Recuperar
        this.processarImpostoRecuperavel(saldos, valorIcms, _constants_1.CONTAS_SISTEMA.ICMS_A_RECUPERAR, regra.contasDebito || []);
        // IPI A Recuperar
        this.processarImpostoRecuperavel(saldos, rateio.valorIpiProporcional, _constants_1.CONTAS_SISTEMA.IPI_A_RECUPERAR, regra.contasDebito || []);
        // ← MUDANÇA: Usar valores DIRETOS da nota (já vem correto da query)
        // PIS A Recuperar
        this.processarImpostoRecuperavel(saldos, nota.VALORPIS || 0, // ← Valor correto do CFOP!
        _constants_1.CONTAS_SISTEMA.PIS_A_RECUPERAR, regra.contasDebito || []);
        // COFINS A Recuperar
        this.processarImpostoRecuperavel(saldos, nota.VALORCOFINS || 0, // ← Valor correto do CFOP!
        _constants_1.CONTAS_SISTEMA.COFINS_A_RECUPERAR, regra.contasDebito || []);
        // 1. DÉBITO: Valor cheio (sem descontos)
        if (regra.contasDebito) {
            regra.contasDebito.forEach((contaId) => {
                (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, rateio.valorDebitoPrincipal, "D");
            });
        }
        // 2. CRÉDITO: Valor do fornecedor (já descontado das retenções)
        if (regra.contasCredito) {
            regra.contasCredito.forEach((contaId) => {
                (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, rateio.valorCreditoPrincipal, "C");
            });
        }
        // 3. RETENÇÕES: Apenas lança na conta de retidos
        if (rateio.valorRetidos > 0) {
            (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, _constants_1.CONTAS_SISTEMA.RETIDOS, rateio.valorRetidos, "C");
        }
    }
    /**
     * Processa imposto recuperável.
     * Cria DÉBITO na conta de ativo (A Recuperar) e CRÉDITO na conta principal (reduz custo).
     */
    processarImpostoRecuperavel(saldos, valor, contaAtivo, contasPrincipais) {
        if (valor <= 0)
            return;
        // Débito no Ativo (Impostos A Recuperar)
        (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaAtivo, valor, "D");
        // Crédito na(s) Conta(s) Principal(is) - Reduz o custo
        contasPrincipais.forEach((contaId) => {
            (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, valor, "C");
        });
    }
    /**
     * Gera o balancete a partir dos saldos calculados.
     */
    gerarBalancete(arvore, saldos) {
        const contasPatrimoniais = (0, contabilidade_utils_1.filtrarContasPatrimoniais)(arvore);
        const linhas = [];
        for (const raiz of contasPatrimoniais) {
            (0, contabilidade_utils_1.acumularSaldosHierarquicos)(raiz, saldos, linhas, _constants_1.NIVEIS_RELATORIO.ANALITICO);
        }
        const linhasComSaldo = (0, contabilidade_utils_1.filtrarLinhasComSaldo)(linhas);
        return (0, contabilidade_utils_1.ordenarBalancete)(linhasComSaldo);
    }
}
exports.BalanceteFiscalService = BalanceteFiscalService;
