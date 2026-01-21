/**
 * Utilitários para cálculos fiscais e tributários.
 * Centraliza lógica de rateio de impostos e retenções.
 */

import type { LancamentoFiscalEntradaUnificado } from "@shared/types/LancamentoFiscalEntrada";
import type { MapaSaldoConta } from "@shared/types/MapaSaldoConta";
import { adicionarSaldoConta } from "./contabilidade.utils";
import { CONTAS_SISTEMA } from "@constants";

/**
 * Resultado do cálculo de rateio de impostos para um item
 */
export interface RateioImpostos {
  valorBasePrincipal: number;
  valorDebitoPrincipal: number;
  valorCreditoPrincipal: number;
  valorRetidos: number;
  valorIpiProporcional: number;
  valorPisProporcional: number;
  valorCofinsProporcional: number;
}

/**
 * Calcula o rateio proporcional de impostos para um item da nota fiscal.
 *
 * A proporção é calculada com base no valor contábil total da nota:
 * proporção = VALORCONTABILIMPOSTO / VALORCONTABIL
 *
 * @param nota - Lançamento fiscal com dados da nota
 * @returns Objeto com todos os valores rateados
 */
export function calcularRateioImpostos(
  nota: LancamentoFiscalEntradaUnificado,
): RateioImpostos {
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
export function contabilizarImpostoRecuperavel(
  saldos: MapaSaldoConta,
  valorImposto: number,
  contaAtivo: number,
  contasPrincipais: number[],
): void {
  if (valorImposto <= 0) return;

  adicionarSaldoConta(saldos, contaAtivo, valorImposto, "D");

  contasPrincipais.forEach((contaId) => {
    adicionarSaldoConta(saldos, contaId, valorImposto, "C");
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
export function contabilizarLancamentoPrincipal(
  saldos: MapaSaldoConta,
  contasDebito: number[],
  contasCredito: number[],
  valorDebito: number,
  valorCredito: number,
): void {
  contasDebito.forEach((contaId) => {
    adicionarSaldoConta(saldos, contaId, valorDebito, "D");
  });

  contasCredito.forEach((contaId) => {
    adicionarSaldoConta(saldos, contaId, valorCredito, "C");
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
export function processarPisCofinsRecuperavel(
  saldos: MapaSaldoConta,
  contaOrigem: number,
  valorPis: number,
  valorCofins: number,
): void {
  if (valorPis > 0) {
    adicionarSaldoConta(saldos, CONTAS_SISTEMA.PIS_A_RECUPERAR, valorPis, "D");

    adicionarSaldoConta(saldos, contaOrigem, valorPis, "C");
  }

  if (valorCofins > 0) {
    adicionarSaldoConta(
      saldos,
      CONTAS_SISTEMA.COFINS_A_RECUPERAR,
      valorCofins,
      "D",
    );

    adicionarSaldoConta(saldos, contaOrigem, valorCofins, "C");
  }
}
