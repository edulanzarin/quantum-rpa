/**
 * Utilitários para cálculos fiscais e tributários.
 * Centraliza lógica de rateio de impostos e retenções.
 */

import type { LancamentoFiscalEntradaUnificado } from "@shared/types/LancamentoFiscalEntrada";
import type { MapaSaldoConta } from "@shared/types/MapaSaldoConta";
import { adicionarSaldoConta } from "./contabilidade.utils";

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

  // Calcula proporção deste item em relação ao total da nota
  let proporcao = 0;
  if (nota.VALORCONTABIL > 0) {
    proporcao = nota.VALORCONTABILIMPOSTO / nota.VALORCONTABIL;
  }

  // Rateio de retenções
  const valorRetidos = valorRetidoTotal * proporcao;

  // Rateio de impostos
  const valorIpiProporcional = valorIpiTotal * proporcao;
  const valorPisProporcional = valorPisTotal * proporcao;
  const valorCofinsProporcional = valorCofinsTotal * proporcao;

  // Valor principal para débito (cheio)
  const valorDebitoPrincipal = valorBase;

  // Valor principal para crédito (descontando retenções)
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

  // Débito no Ativo (A Recuperar)
  adicionarSaldoConta(saldos, contaAtivo, valorImposto, "D");

  // Crédito na(s) Conta(s) Principal(is)
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
  // Débitos
  contasDebito.forEach((contaId) => {
    adicionarSaldoConta(saldos, contaId, valorDebito, "D");
  });

  // Créditos
  contasCredito.forEach((contaId) => {
    adicionarSaldoConta(saldos, contaId, valorCredito, "C");
  });
}
