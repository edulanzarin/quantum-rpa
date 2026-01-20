"use strict";
/**
 * Constantes de contas contábeis utilizadas no sistema.
 * Centraliza os IDs das contas para facilitar manutenção.
 *
 * IMPORTANTE: Ajuste estes valores conforme o plano de contas da sua empresa.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIVEIS_RELATORIO = exports.TIPOS_CLASSIFICACAO = exports.CONTAS_SISTEMA = void 0;
exports.CONTAS_SISTEMA = {
    // Contas de Impostos Retidos
    RETIDOS: 1539,
    // Contas de Impostos a Recuperar (Ativo Circulante)
    ICMS_A_RECUPERAR: 200,
    IPI_A_RECUPERAR: 221,
    PIS_A_RECUPERAR: 158,
    COFINS_A_RECUPERAR: 159,
};
/**
 * Tipos de classificação contábil
 */
exports.TIPOS_CLASSIFICACAO = {
    ATIVO: "1",
    PASSIVO: "2",
    RECEITA: "4",
    DESPESA: "5",
};
/**
 * Níveis padrão para exibição de relatórios
 */
exports.NIVEIS_RELATORIO = {
    SINTETICO: 3,
    ANALITICO: 4,
    DETALHADO: 5,
};
