"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIVEIS_RELATORIO = exports.TIPOS_CLASSIFICACAO = exports.CONTAS_SISTEMA = void 0;
/**
 * Constantes de contas contábeis utilizadas no sistema.
 * IMPORTANTE: Ajuste estes valores conforme o plano de contas da sua empresa.
 */
exports.CONTAS_SISTEMA = {
    // Contas de Impostos Retidos
    RETIDOS: 1539,
    // Contas de Impostos a Recuperar (Ativo Circulante)
    ICMS_A_RECUPERAR: 359,
    IPI_A_RECUPERAR: 265,
    PIS_A_RECUPERAR: 311,
    COFINS_A_RECUPERAR: 337,
};
/**
 * Tipos de classificação contábil
 */
exports.TIPOS_CLASSIFICACAO = {
    ATIVO: "1",
    PASSIVO: "2",
    RECEITA: "3",
    DESPESA: "4",
};
/**
 * Níveis padrão para exibição de relatórios
 */
exports.NIVEIS_RELATORIO = {
    SINTETICO: 3,
    ANALITICO: 4,
    DETALHADO: 5,
};
