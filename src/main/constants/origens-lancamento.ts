/**
 * Códigos de origem de lançamentos contábeis.
 * Sistema usa códigos de 2 letras.
 */
export const ORIGENS_LANCAMENTO = {
  FISCAL: "FI",
  IMPORTACAO: "IP",
} as const;

export type OrigemLancamento =
  (typeof ORIGENS_LANCAMENTO)[keyof typeof ORIGENS_LANCAMENTO];
