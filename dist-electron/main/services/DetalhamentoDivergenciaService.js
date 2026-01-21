"use strict";
// @services/DetalhamentoDivergenciaService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetalhamentoDivergenciaService = void 0;
const BaseService_1 = require("./BaseService");
const LancamentoContabilRepository_1 = require("../repositories/LancamentoContabilRepository");
const LancamentoFiscalEntradaRepository_1 = require("../repositories/LancamentoFiscalEntradaRepository");
const DemaisDocumentosFiscalRepository_1 = require("../repositories/DemaisDocumentosFiscalRepository");
const PlanoConciliacaoRepository_1 = require("../repositories/PlanoConciliacaoRepository");
const PlanoContaService_1 = require("./PlanoContaService");
const fiscal_utils_1 = require("../utils/fiscal.utils");
const _constants_1 = require("../constants");
const validation_utils_1 = require("../utils/validation.utils");
class DetalhamentoDivergenciaService extends BaseService_1.BaseService {
    contabilRepo;
    fiscalRepo;
    demaisDocRepo;
    planoConciliacaoRepo;
    planoContaService;
    constructor(contabilRepo = new LancamentoContabilRepository_1.LancamentoContabilRepository(), fiscalRepo = new LancamentoFiscalEntradaRepository_1.LancamentoFiscalEntradaRepository(), demaisDocRepo = new DemaisDocumentosFiscalRepository_1.DemaisDocumentosFiscalRepository(), planoConciliacaoRepo = new PlanoConciliacaoRepository_1.PlanoConciliacaoRepository(), planoContaService = new PlanoContaService_1.PlanoContaService()) {
        super();
        this.contabilRepo = contabilRepo;
        this.fiscalRepo = fiscalRepo;
        this.demaisDocRepo = demaisDocRepo;
        this.planoConciliacaoRepo = planoConciliacaoRepo;
        this.planoContaService = planoContaService;
    }
    /**
     * Detalha divergências de uma conta específica.
     */
    async detalharDivergenciaConta(codigoEmpresa, codigoConta, dataInicio, dataFim, planoConciliacaoId) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarNumeroPositivo)(codigoConta, "Código da conta");
        (0, validation_utils_1.validarNumeroPositivo)(planoConciliacaoId, "ID do plano de conciliação");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("detalharDivergenciaConta", {
            codigoEmpresa,
            codigoConta,
            dataInicio,
            dataFim,
        });
        // Busca dados COM LOGS
        console.log("🔍 [1/5] Buscando conta...");
        const conta = await this.planoContaService.obterContaPorCodigo(codigoEmpresa, codigoConta);
        console.log("✅ [1/5] Conta encontrada:", conta?.DESCRCONTA);
        console.log("🔍 [2/5] Buscando lançamentos contábeis...");
        const lancamentosReais = await this.contabilRepo.obterLancamentosPorConta(codigoEmpresa, codigoConta, dataInicio, dataFim);
        console.log("✅ [2/5] Lançamentos reais:", lancamentosReais.length);
        console.log("🔍 [3/5] Buscando notas fiscais...");
        const notasFiscais = await this.fiscalRepo.obterDetalhesNotasPorConta(codigoEmpresa, codigoConta, dataInicio, dataFim, planoConciliacaoId);
        console.log("✅ [3/5] Notas fiscais:", notasFiscais.length);
        console.log("🔍 [4/5] Buscando demais documentos...");
        const demaisDocumentos = await this.demaisDocRepo.obterPisCofinsPorConta(codigoEmpresa, dataInicio, dataFim);
        console.log("✅ [4/5] Demais documentos:", demaisDocumentos.length);
        console.log("🔍 [5/5] Buscando regras...");
        const regras = await this.planoConciliacaoRepo.obterItensPorPlano(planoConciliacaoId);
        console.log("✅ [5/5] Regras:", regras.length);
        console.log("🔄 Processando lançamentos fiscais...");
        const lancamentosFiscais = this.processarLancamentosFiscais(notasFiscais, demaisDocumentos, regras, codigoConta);
        console.log("✅ Lançamentos fiscais processados:", lancamentosFiscais.length);
        // Calcula divergência
        const saldoReal = this.calcularSaldo(lancamentosReais);
        const saldoFiscal = this.calcularSaldo(lancamentosFiscais);
        return {
            conta: {
                codigo: codigoConta,
                descricao: conta?.DESCRCONTA || "Conta não encontrada",
            },
            divergencia: {
                debito: saldoFiscal.debito - saldoReal.debito,
                credito: saldoFiscal.credito - saldoReal.credito,
            },
            lancamentosReais,
            lancamentosFiscais,
        };
    }
    /**
     * Processa notas fiscais e demais documentos,
     * filtrando apenas os que afetam a conta específica.
     */
    processarLancamentosFiscais(notas, demaisDocumentos, regras, codigoConta) {
        const lancamentos = [];
        const mapaRegras = new Map(regras.map((r) => [r.cfop, r]));
        // Processa notas fiscais
        for (const nota of notas) {
            const regra = mapaRegras.get(nota.CODIGOCFOP);
            if (!regra?.contabiliza)
                continue;
            const rateio = (0, fiscal_utils_1.calcularRateioImpostos)(nota);
            // Verifica se esta nota afeta a conta
            const afetaConta = this.notaAfetaConta(nota, regra, rateio, codigoConta);
            if (afetaConta) {
                lancamentos.push({
                    data: nota.DATA_EFETIVA,
                    numeroNF: nota.NUMERONF,
                    fornecedor: nota.NOMEPESSOA || "Não informado",
                    cfop: nota.CODIGOCFOP,
                    descricaoCfop: nota.DESCRICAO_CFOP || "",
                    valorNota: nota.VALORCONTABIL,
                    valorContabilizado: nota.VALORCONTABILIMPOSTO,
                    impostos: {
                        icms: nota.VALORICMS || 0,
                        ipi: rateio.valorIpiProporcional,
                        pis: nota.VALORPIS || 0,
                        cofins: nota.VALORCOFINS || 0,
                    },
                    tipo: "Entrada",
                    debito: afetaConta.debito,
                    credito: afetaConta.credito,
                });
            }
        }
        // Processa demais documentos (PIS/COFINS)
        for (const doc of demaisDocumentos) {
            if (doc.CONTACTB === codigoConta) {
                // PIS
                if (doc.VALORPIS > 0) {
                    lancamentos.push({
                        data: new Date(), // Ajustar se tiver data no documento
                        numeroNF: "Demais Documentos",
                        fornecedor: "PIS/COFINS",
                        cfop: 0,
                        descricaoCfop: "Crédito PIS",
                        valorNota: 0,
                        valorContabilizado: doc.VALORPIS,
                        impostos: { icms: 0, ipi: 0, pis: doc.VALORPIS, cofins: 0 },
                        tipo: "DemaisDocumentos",
                        debito: 0,
                        credito: doc.VALORPIS,
                    });
                }
                // COFINS
                if (doc.VALORCOFINS > 0) {
                    lancamentos.push({
                        data: new Date(),
                        numeroNF: "Demais Documentos",
                        fornecedor: "PIS/COFINS",
                        cfop: 0,
                        descricaoCfop: "Crédito COFINS",
                        valorNota: 0,
                        valorContabilizado: doc.VALORCOFINS,
                        impostos: { icms: 0, ipi: 0, pis: 0, cofins: doc.VALORCOFINS },
                        tipo: "DemaisDocumentos",
                        debito: 0,
                        credito: doc.VALORCOFINS,
                    });
                }
            }
            // Verifica se é conta de PIS/COFINS A Recuperar
            if (codigoConta === _constants_1.CONTAS_SISTEMA.PIS_A_RECUPERAR && doc.VALORPIS > 0) {
                lancamentos.push({
                    data: new Date(),
                    numeroNF: "Demais Documentos",
                    fornecedor: "PIS A Recuperar",
                    cfop: 0,
                    descricaoCfop: "PIS A Recuperar",
                    valorNota: 0,
                    valorContabilizado: doc.VALORPIS,
                    impostos: { icms: 0, ipi: 0, pis: doc.VALORPIS, cofins: 0 },
                    tipo: "DemaisDocumentos",
                    debito: doc.VALORPIS,
                    credito: 0,
                });
            }
            if (codigoConta === _constants_1.CONTAS_SISTEMA.COFINS_A_RECUPERAR &&
                doc.VALORCOFINS > 0) {
                lancamentos.push({
                    data: new Date(),
                    numeroNF: "Demais Documentos",
                    fornecedor: "COFINS A Recuperar",
                    cfop: 0,
                    descricaoCfop: "COFINS A Recuperar",
                    valorNota: 0,
                    valorContabilizado: doc.VALORCOFINS,
                    impostos: { icms: 0, ipi: 0, pis: 0, cofins: doc.VALORCOFINS },
                    tipo: "DemaisDocumentos",
                    debito: doc.VALORCOFINS,
                    credito: 0,
                });
            }
        }
        return lancamentos;
    }
    /**
     * Verifica se uma nota afeta a conta e retorna os valores de débito/crédito.
     */
    notaAfetaConta(nota, regra, rateio, codigoConta) {
        // Contas de débito principal
        if (regra.contasDebito?.includes(codigoConta)) {
            return { debito: rateio.valorDebitoPrincipal, credito: 0 };
        }
        // Contas de crédito principal
        if (regra.contasCredito?.includes(codigoConta)) {
            return { debito: 0, credito: rateio.valorCreditoPrincipal };
        }
        // Contas de impostos recuperáveis
        const valorIcms = nota.VALORIMPOSTO || 0;
        if (codigoConta === _constants_1.CONTAS_SISTEMA.ICMS_A_RECUPERAR && valorIcms > 0) {
            return { debito: valorIcms, credito: 0 };
        }
        if (codigoConta === _constants_1.CONTAS_SISTEMA.IPI_A_RECUPERAR &&
            rateio.valorIpiProporcional > 0) {
            return { debito: rateio.valorIpiProporcional, credito: 0 };
        }
        if (codigoConta === _constants_1.CONTAS_SISTEMA.PIS_A_RECUPERAR &&
            (nota.VALORPIS || 0) > 0) {
            return { debito: nota.VALORPIS || 0, credito: 0 };
        }
        if (codigoConta === _constants_1.CONTAS_SISTEMA.COFINS_A_RECUPERAR &&
            (nota.VALORCOFINS || 0) > 0) {
            return { debito: nota.VALORCOFINS || 0, credito: 0 };
        }
        // Conta de retenções
        if (codigoConta === _constants_1.CONTAS_SISTEMA.RETIDOS && rateio.valorRetidos > 0) {
            return { debito: 0, credito: rateio.valorRetidos };
        }
        return null;
    }
    /**
     * Calcula saldo total de uma lista de lançamentos.
     */
    calcularSaldo(lancamentos) {
        return lancamentos.reduce((acc, lanc) => ({
            debito: acc.debito + (lanc.debito || 0),
            credito: acc.credito + (lanc.credito || 0),
        }), { debito: 0, credito: 0 });
    }
}
exports.DetalhamentoDivergenciaService = DetalhamentoDivergenciaService;
