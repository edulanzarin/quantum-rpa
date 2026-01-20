/**
 * Códigos de origem de lançamentos contábeis.
 * Centraliza os códigos utilizados no sistema.
 */

export const ORIGENS_LANCAMENTO = {
  FISCAL_ENTRADA: "1",
  FISCAL_SAIDA: "2",
  FINANCEIRO: "3",
  FOLHA_PAGAMENTO: "4",
  ESTOQUE: "5",
  MANUAL: "9",
} as const;

export type OrigemLancamento =
  (typeof ORIGENS_LANCAMENTO)[keyof typeof ORIGENS_LANCAMENTO];
