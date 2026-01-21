"use strict";
// @services/BalanceteFiscalService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteFiscalService = void 0;
const PlanoContaService_1 = require("./PlanoContaService");
const LancamentoFiscalEntradaService_1 = require("./LancamentoFiscalEntradaService");
const LancamentoFiscalSaidaService_1 = require("./LancamentoFiscalSaidaService");
const DemaisDocumentosFiscalService_1 = require("./DemaisDocumentosFiscalService");
const OutraOperacaoIcmsSCService_1 = require("./OutraOperacaoIcmsSCService");
const PlanoConciliacaoRepository_1 = require("../repositories/PlanoConciliacaoRepository");
const BaseService_1 = require("./BaseService");
const contabilidade_utils_1 = require("../utils/contabilidade.utils");
const fiscal_utils_1 = require("../utils/fiscal.utils");
const contabilidade_utils_2 = require("../utils/contabilidade.utils");
const _constants_1 = require("../constants");
const validation_utils_1 = require("../utils/validation.utils");
class BalanceteFiscalService extends BaseService_1.BaseService {
    planoContaService;
    fiscalEntradaService;
    fiscalSaidaService;
    demaisDocumentosFiscalService;
    outraOperacaoIcmsSCService;
    planoConciliacaoRepo;
    constructor(planoContaService = new PlanoContaService_1.PlanoContaService(), fiscalEntradaService = new LancamentoFiscalEntradaService_1.LancamentoFiscalEntradaService(), fiscalSaidaService = new LancamentoFiscalSaidaService_1.LancamentoFiscalSaidaService(), demaisDocumentosFiscalService = new DemaisDocumentosFiscalService_1.DemaisDocumentosFiscalService(), outraOperacaoIcmsSCService = new OutraOperacaoIcmsSCService_1.OutraOperacaoIcmsSCService(), planoConciliacaoRepo = new PlanoConciliacaoRepository_1.PlanoConciliacaoRepository()) {
        super();
        this.planoContaService = planoContaService;
        this.fiscalEntradaService = fiscalEntradaService;
        this.fiscalSaidaService = fiscalSaidaService;
        this.demaisDocumentosFiscalService = demaisDocumentosFiscalService;
        this.outraOperacaoIcmsSCService = outraOperacaoIcmsSCService;
        this.planoConciliacaoRepo = planoConciliacaoRepo;
    }
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
        const [arvorePlanoContas, notasEntrada, notasSaida, demaisDocumentosFiscal, totalDCIP, regrasItens,] = await Promise.all([
            this.planoContaService.obterPlanoProcessado(codigoEmpresa),
            this.fiscalEntradaService.buscarLancamentosFiscais(codigoEmpresa, dataInicio, dataFim),
            this.fiscalSaidaService.buscarLancamentosFiscais(codigoEmpresa, dataInicio, dataFim),
            this.demaisDocumentosFiscalService.buscarPisCofinsDemaisDocumentosFiscal(codigoEmpresa, dataInicio, dataFim),
            this.outraOperacaoIcmsSCService.buscarDCIP(codigoEmpresa, dataInicio, dataFim),
            this.planoConciliacaoRepo.obterItensPorPlano(planoConciliacaoId),
        ]);
        // Indexa regras por CFOP
        const mapaRegras = this.indexarRegrasPorCfop(regrasItens);
        // Calcula saldos projetados
        const saldosProjetados = this.calcularSaldosProjetados(notasEntrada, notasSaida, demaisDocumentosFiscal, totalDCIP, mapaRegras);
        // Gera balancete
        return this.gerarBalancete(arvorePlanoContas, saldosProjetados);
    }
    indexarRegrasPorCfop(regras) {
        const mapa = new Map();
        regras.forEach((r) => mapa.set(r.cfop, r));
        return mapa;
    }
    /**
     * Calcula saldos projetados baseado nas notas de entrada, saída e demais documentos.
     */
    calcularSaldosProjetados(notasEntrada, notasSaida, demaisDocumentosFiscal, totalDCIP, mapaRegras) {
        const saldos = new Map();
        // Processa notas fiscais de ENTRADA
        for (const nota of notasEntrada) {
            const regra = mapaRegras.get(nota.CODIGOCFOP);
            if (!regra || !regra.contabiliza) {
                continue;
            }
            this.processarNotaEntrada(nota, regra, saldos);
        }
        // Processa notas fiscais de SAÍDA
        for (const nota of notasSaida) {
            const regra = mapaRegras.get(nota.CODIGOCFOP);
            if (!regra || !regra.contabiliza) {
                continue;
            }
            this.processarNotaSaida(nota, regra, saldos);
        }
        // Processa demais documentos (PIS/COFINS)
        this.processarDemaisDocumentosFiscal(demaisDocumentosFiscal, saldos);
        // Processa DCIP (Código 770)
        if (totalDCIP > 0) {
            (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, _constants_1.CONTAS_ENTRADA.ICMS_A_RECUPERAR, totalDCIP, "D");
            (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, _constants_1.CONTAS_SAIDA.DEDUCOES_RECEITA_BRUTA, totalDCIP, "C");
        }
        return saldos;
    }
    /**
     * Processa PIS/COFINS de demais documentos (EFDF100DEMAISDOC).
     */
    processarDemaisDocumentosFiscal(documentos, saldos) {
        for (const doc of documentos) {
            (0, fiscal_utils_1.processarPisCofinsRecuperavel)(saldos, doc.CONTACTB, doc.VALORPIS, doc.VALORCOFINS);
        }
    }
    // ============= PROCESSAMENTO DE ENTRADA (COMPRAS) =============
    /**
     * Processa nota fiscal de ENTRADA
     * Impostos vão para contas A RECUPERAR (ativo)
     *
     * Lógica:
     * - D: Imposto a Recuperar (aumenta ativo)
     * - C: Conta Principal (reduz custo da compra)
     */
    processarNotaEntrada(nota, regra, saldos) {
        const rateio = (0, fiscal_utils_1.calcularRateioImpostos)(nota);
        const valorIcms = nota.VALORIMPOSTO || 0;
        // ICMS A Recuperar
        this.processarImpostoRecuperavel(saldos, valorIcms, _constants_1.CONTAS_ENTRADA.ICMS_A_RECUPERAR, regra.contasDebito || []);
        // IPI A Recuperar
        this.processarImpostoRecuperavel(saldos, rateio.valorIpiProporcional, _constants_1.CONTAS_ENTRADA.IPI_A_RECUPERAR, regra.contasDebito || []);
        // PIS A Recuperar
        this.processarImpostoRecuperavel(saldos, nota.VALORPIS || 0, _constants_1.CONTAS_ENTRADA.PIS_A_RECUPERAR, regra.contasDebito || []);
        // COFINS A Recuperar
        this.processarImpostoRecuperavel(saldos, nota.VALORCOFINS || 0, _constants_1.CONTAS_ENTRADA.COFINS_A_RECUPERAR, regra.contasDebito || []);
        // Débito principal (estoque, imobilizado, etc)
        if (regra.contasDebito) {
            regra.contasDebito.forEach((contaId) => {
                (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, rateio.valorDebitoPrincipal, "D");
            });
        }
        // Crédito principal (fornecedores)
        if (regra.contasCredito) {
            regra.contasCredito.forEach((contaId) => {
                (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, rateio.valorCreditoPrincipal, "C");
            });
        }
        // Retenções na fonte
        if (rateio.valorRetidos > 0) {
            (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, _constants_1.CONTAS_ENTRADA.RETIDOS, rateio.valorRetidos, "C");
        }
    }
    /**
     * Processa imposto recuperável (ENTRADA)
     * D: Imposto a Recuperar
     * C: Conta Principal (reduz custo)
     */
    processarImpostoRecuperavel(saldos, valor, contaAtivo, contasPrincipais) {
        if (valor <= 0)
            return;
        // Débito: aumenta o ativo (imposto a recuperar)
        (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaAtivo, valor, "D");
        // Crédito: reduz o custo das contas principais
        contasPrincipais.forEach((contaId) => {
            (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, valor, "C");
        });
    }
    // ============= PROCESSAMENTO DE SAÍDA (VENDAS) =============
    /**
     * Processa nota fiscal de SAÍDA
     * Impostos vão para contas A PAGAR (passivo)
     *
     * Lógica:
     * - D: Deduções da Receita Bruta (2770)
     * - C: Imposto a Pagar (passivo)
     */
    processarNotaSaida(nota, regra, saldos) {
        const rateio = (0, fiscal_utils_1.calcularRateioImpostos)(nota);
        const valorIcms = nota.VALORIMPOSTO || 0;
        // ICMS A Pagar
        this.processarImpostoAPagar(saldos, valorIcms, _constants_1.CONTAS_SAIDA.ICMS_A_PAGAR);
        // IPI A Pagar (COMENTADO - verificar se usa)
        // this.processarImpostoAPagar(
        //   saldos,
        //   rateio.valorIpiProporcional,
        //   CONTAS_SAIDA.IPI_A_PAGAR,
        // );
        // PIS A Pagar
        this.processarImpostoAPagar(saldos, nota.VALORPIS || 0, _constants_1.CONTAS_SAIDA.PIS_A_PAGAR);
        // COFINS A Pagar (mesma conta do PIS)
        this.processarImpostoAPagar(saldos, nota.VALORCOFINS || 0, _constants_1.CONTAS_SAIDA.COFINS_A_PAGAR);
        // Débito principal (receita de vendas)
        if (regra.contasDebito) {
            regra.contasDebito.forEach((contaId) => {
                (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, rateio.valorDebitoPrincipal, "D");
            });
        }
        // Crédito principal (clientes/contas a receber)
        if (regra.contasCredito) {
            regra.contasCredito.forEach((contaId) => {
                (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaId, rateio.valorCreditoPrincipal, "C");
            });
        }
        // Retenções (COMENTADO - verificar se tem em saídas)
        // if (rateio.valorRetidos > 0) {
        //   adicionarSaldoConta(
        //     saldos,
        //     CONTAS_SAIDA.RETIDOS_SAIDA,
        //     rateio.valorRetidos,
        //     "D",
        //   );
        // }
    }
    /**
     * Processa imposto a pagar (SAÍDA)
     * D: Deduções da Receita Bruta (2770)
     * C: Imposto a Pagar (passivo)
     */
    processarImpostoAPagar(saldos, valor, contaPassivo) {
        if (valor <= 0)
            return;
        // Débito: aumenta deduções da receita bruta (diminui resultado)
        (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, _constants_1.CONTAS_SAIDA.DEDUCOES_RECEITA_BRUTA, valor, "D");
        // Crédito: aumenta passivo (imposto a pagar)
        (0, contabilidade_utils_2.adicionarSaldoConta)(saldos, contaPassivo, valor, "C");
    }
    // ============= GERAÇÃO DO BALANCETE =============
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
