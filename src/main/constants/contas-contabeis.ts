/**
 * Constantes de contas contábeis utilizadas no sistema.
 * IMPORTANTE: Ajuste estes valores conforme o plano de contas da sua empresa.
 */
export const CONTAS_SISTEMA = {
  // Contas de Impostos Retidos
  RETIDOS: 1539,

  // Contas de Impostos a Recuperar (Ativo Circulante)
  ICMS_A_RECUPERAR: 157,
  IPI_A_RECUPERAR: 157,
  PIS_A_RECUPERAR: 157,
  COFINS_A_RECUPERAR: 157,
} as const;

/**
 * Tipos de classificação contábil
 */
export const TIPOS_CLASSIFICACAO = {
  ATIVO: "1",
  PASSIVO: "2",
  RECEITA: "3",
  DESPESA: "4",
} as const;

/**
 * Níveis padrão para exibição de relatórios
 */
export const NIVEIS_RELATORIO = {
  SINTETICO: 3,
  ANALITICO: 4,
  DETALHADO: 5,
} as const;
