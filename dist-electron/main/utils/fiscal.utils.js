"use strict";
/**
 * Utilitários para cálculos fiscais e tributários.
 * Centraliza lógica de rateio de impostos e retenções.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularRateioImpostos = calcularRateioImpostos;
exports.contabilizarImpostoRecuperavel = contabilizarImpostoRecuperavel;
exports.contabilizarLancamentoPrincipal = contabilizarLancamentoPrincipal;
exports.processarPisCofinsRecuperavel = processarPisCofinsRecuperavel;
const contabilidade_utils_1 = require("./contabilidade.utils");
const _constants_1 = require("../constants");
/**
 * Calcula o rateio proporcional de impostos para um item da nota fiscal.
 *
 * A proporção é calculada com base no valor contábil total da nota:
 * proporção = VALORCONTABILIMPOSTO / VALORCONTABIL
 *
 * @param nota - Lançamento fiscal com dados da nota
 * @returns Objeto com todos os valores rateados
 */
function calcularRateioImpostos(nota) {
    const valorBase = nota.VALORCONTABILIMPOSTO;
    const valorIpiTotal = nota.VALORIPI || 0;
    const valorPisTotal = nota.VALORPIS || 0;
    const valorCofinsTotal = nota.VALORCOFINS || 0;
    const valorRetidoTotal = nota.TOTAL_RETIDO_NOTA || 0;
    let proporcao = 0;
    if (nota.VALORCONTABIL > 0) {
        proporcao = nota.VALORCONTABILIMPOSTO / nota.VALORCONTABIL;
    }
    const valorRetidos = valorRetidoTotal * proporcao;
    const valorIpiProporcional = valorIpiTotal * proporcao;
    const valorPisProporcional = valorPisTotal * proporcao;
    const valorCofinsProporcional = valorCofinsTotal * proporcao;
    const valorDebitoPrincipal = valorBase;
    const valorCreditoPrincipal = valorBase - valorRetidos;
    return {
        valorBasePrincipal: valorBase,
        valorDebitoPrincipal,
        valorCreditoPrincipal,
        valorRetidos,
        valorIpiProporcional,
        valorPisProporcional,
        valorCofinsProporcional,
    };
}
/**
 * Contabiliza um imposto recuperável no mapa de saldos.
 *
 * Realiza dois lançamentos:
 * 1. Débito na conta de Ativo (A Recuperar)
 * 2. Crédito nas contas principais (reduzindo o custo)
 *
 * @param saldos - Mapa de saldos onde serão lançados os valores
 * @param valorImposto - Valor do imposto a recuperar
 * @param contaAtivo - ID da conta de ativo (impostos a recuperar)
 * @param contasPrincipais - IDs das contas principais para creditar
 */
function contabilizarImpostoRecuperavel(saldos, valorImposto, contaAtivo, contasPrincipais) {
    if (valorImposto <= 0)
        return;
    (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, contaAtivo, valorImposto, "D");
    contasPrincipais.forEach((contaId) => {
        (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, contaId, valorImposto, "C");
    });
}
/**
 * Contabiliza lançamento fiscal principal (débito e crédito).
 *
 * @param saldos - Mapa de saldos
 * @param contasDebito - Contas a debitar
 * @param contasCredito - Contas a creditar
 * @param valorDebito - Valor do débito
 * @param valorCredito - Valor do crédito
 */
function contabilizarLancamentoPrincipal(saldos, contasDebito, contasCredito, valorDebito, valorCredito) {
    contasDebito.forEach((contaId) => {
        (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, contaId, valorDebito, "D");
    });
    contasCredito.forEach((contaId) => {
        (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, contaId, valorCredito, "C");
    });
}
/**
 * Processa lançamentos de PIS e COFINS recuperáveis.
 * Cria DÉBITO na conta de ativo e CRÉDITO na conta de origem.
 *
 * @param saldos - Mapa de saldos contábeis
 * @param contaOrigem - Conta que terá o crédito (reduz custo)
 * @param valorPis - Valor do PIS
 * @param valorCofins - Valor do COFINS
 */
function processarPisCofinsRecuperavel(saldos, contaOrigem, valorPis, valorCofins) {
    if (valorPis > 0) {
        (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, _constants_1.CONTAS_SISTEMA.PIS_A_RECUPERAR, valorPis, "D");
        (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, contaOrigem, valorPis, "C");
    }
    if (valorCofins > 0) {
        (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, _constants_1.CONTAS_SISTEMA.COFINS_A_RECUPERAR, valorCofins, "D");
        (0, contabilidade_utils_1.adicionarSaldoConta)(saldos, contaOrigem, valorCofins, "C");
    }
}
