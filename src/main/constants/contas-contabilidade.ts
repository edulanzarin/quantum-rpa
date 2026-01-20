/**
 * Constantes de contas contábeis utilizadas no sistema.
 * Centraliza os IDs das contas para facilitar manutenção.
 *
 * IMPORTANTE: Ajuste estes valores conforme o plano de contas da sua empresa.
 */

export const CONTAS_SISTEMA = {
  // Contas de Impostos Retidos
  RETIDOS: 1539,

  // Contas de Impostos a Recuperar (Ativo Circulante)
  ICMS_A_RECUPERAR: 200,
  IPI_A_RECUPERAR: 221,
  PIS_A_RECUPERAR: 158,
  COFINS_A_RECUPERAR: 159,
} as const;

/**
 * Tipos de classificação contábil
 */
export const TIPOS_CLASSIFICACAO = {
  ATIVO: "1",
  PASSIVO: "2",
  RECEITA: "4",
  DESPESA: "5",
} as const;

/**
 * Níveis padrão para exibição de relatórios
 */
export const NIVEIS_RELATORIO = {
  SINTETICO: 3,
  ANALITICO: 4,
  DETALHADO: 5,
} as const;
