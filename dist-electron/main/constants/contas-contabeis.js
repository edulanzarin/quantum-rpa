"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIVEIS_RELATORIO = exports.TIPOS_CLASSIFICACAO = exports.CONTAS_SAIDA = exports.CONTAS_ENTRADA = exports.CONTAS_SISTEMA = void 0;
/**
 * Constantes de contas contábeis utilizadas no sistema.
 */
exports.CONTAS_SISTEMA = {
    RETIDOS: 1539,
    // Contasde Impostos a Recuperar (Ativo Circulante)
    ICMS_A_RECUPERAR: 157,
    IPI_A_RECUPERAR: 157,
    PIS_A_RECUPERAR: 157,
    COFINS_A_RECUPERAR: 157,
    ICMS_A_RECOLHER: 1539,
    IPI_A_RECOLHER: 1539,
    PIS_A_RECOLHER: 1539,
    COFINS_A_RECOLHER: 1539,
    FORNECEDORES: 1494,
    CLIENTES: 140,
    CONTAS_A_PAGAR: 2002,
    CONTAS_A_RECEBER: 1002,
    ESTOQUE: 502,
    CAIXA: 3,
    BANCOS: 3,
    EMPRESTIMOS_A_PAGAR: 2003,
    SALARIOS_A_PAGAR: 2004,
    ENCARGOS_A_RECOLHER: 2005,
    DEDUCOES_RECEITA_BRUTA: 2770,
};
/**
 * Contas específicas para processamento de ENTRADAS (Compras)
 * Impostos vão para contas A RECUPERAR (ativo)
 */
exports.CONTAS_ENTRADA = {
    ICMS_A_RECUPERAR: exports.CONTAS_SISTEMA.ICMS_A_RECUPERAR,
    IPI_A_RECUPERAR: exports.CONTAS_SISTEMA.IPI_A_RECUPERAR,
    PIS_A_RECUPERAR: exports.CONTAS_SISTEMA.PIS_A_RECUPERAR,
    COFINS_A_RECUPERAR: exports.CONTAS_SISTEMA.COFINS_A_RECUPERAR,
    RETIDOS: exports.CONTAS_SISTEMA.RETIDOS,
};
/**
 * Contas específicas para processamento de SAÍDAS (Vendas)
 * Impostos vão para contas A PAGAR (passivo)
 */
exports.CONTAS_SAIDA = {
    ICMS_A_PAGAR: exports.CONTAS_SISTEMA.ICMS_A_RECOLHER,
    IPI_A_PAGAR: exports.CONTAS_SISTEMA.IPI_A_RECOLHER,
    PIS_A_PAGAR: exports.CONTAS_SISTEMA.PIS_A_RECOLHER,
    COFINS_A_PAGAR: exports.CONTAS_SISTEMA.COFINS_A_RECOLHER,
    DEDUCOES_RECEITA_BRUTA: exports.CONTAS_SISTEMA.DEDUCOES_RECEITA_BRUTA,
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
