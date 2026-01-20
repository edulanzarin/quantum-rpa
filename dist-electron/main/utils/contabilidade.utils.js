"use strict";
/**
 * Utilitários para operações contábeis reutilizáveis em todo o sistema.
 * Centraliza lógica de classificação, ordenação e manipulação de saldos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compararClassificacao = compararClassificacao;
exports.calcularNivel = calcularNivel;
exports.adicionarSaldoConta = adicionarSaldoConta;
exports.acumularSaldosHierarquicos = acumularSaldosHierarquicos;
exports.filtrarContasPatrimoniais = filtrarContasPatrimoniais;
exports.filtrarLinhasComSaldo = filtrarLinhasComSaldo;
exports.ordenarBalancete = ordenarBalancete;
/**
 * Compara duas classificações contábeis para ordenação.
 * Exemplo: "1" < "1.1" < "1.1.001" < "1.2" < "2" < "2.1"
 *
 * Esta função é utilizada em múltiplos contextos:
 * - Ordenação do plano de contas
 * - Ordenação de balancetes
 * - Ordenação de relatórios
 */
function compararClassificacao(a, b) {
    const partesA = a.split(".").map((p) => parseInt(p) || 0);
    const partesB = b.split(".").map((p) => parseInt(p) || 0);
    const maxLength = Math.max(partesA.length, partesB.length);
    for (let i = 0; i < maxLength; i++) {
        const valorA = partesA[i] || 0;
        const valorB = partesB[i] || 0;
        if (valorA !== valorB) {
            return valorA - valorB;
        }
    }
    return 0;
}
/**
 * Calcula o nível hierárquico de uma classificação contábil.
 * Exemplo: "1" = 1, "1.1" = 2, "1.1.01" = 3
 */
function calcularNivel(classificacao) {
    return classificacao.split(".").length;
}
/**
 * Adiciona ou incrementa saldo em um mapa de contas.
 * Função reutilizável para evitar duplicação de lógica.
 *
 * @param mapa - Mapa de saldos por conta
 * @param contaId - ID da conta contábil
 * @param valor - Valor a ser adicionado
 * @param tipo - Tipo do lançamento: "D" (débito) ou "C" (crédito)
 */
function adicionarSaldoConta(mapa, contaId, valor, tipo) {
    const saldoAtual = mapa.get(contaId) ?? { debito: 0, credito: 0 };
    if (tipo === "D") {
        saldoAtual.debito += valor;
    }
    else {
        saldoAtual.credito += valor;
    }
    mapa.set(contaId, saldoAtual);
}
/**
 * Acumula saldos hierarquicamente em uma árvore de contas.
 *
 * Percorre recursivamente a árvore do plano de contas:
 * 1. Pega o saldo próprio da conta
 * 2. Soma recursivamente os saldos de todos os filhos
 * 3. Adiciona ao resultado se estiver dentro do nível máximo
 * 4. Retorna o saldo total para o pai acumular
 *
 * @param node - Nó atual da árvore
 * @param saldosPorConta - Mapa com saldos por ID de conta
 * @param resultado - Array onde serão adicionadas as linhas do balancete
 * @param nivelMaximo - Nível máximo a ser incluído no resultado
 * @returns Saldo acumulado (débito e crédito)
 */
function acumularSaldosHierarquicos(node, saldosPorConta, resultado, nivelMaximo) {
    let debito = 0;
    let credito = 0;
    // 1. Saldo próprio da conta
    const saldoProprio = saldosPorConta.get(node.CONTACTB);
    if (saldoProprio) {
        debito += saldoProprio.debito;
        credito += saldoProprio.credito;
    }
    // 2. Acumula saldos dos filhos recursivamente
    for (const filho of node.filhos) {
        const saldoFilho = acumularSaldosHierarquicos(filho, saldosPorConta, resultado, nivelMaximo);
        debito += saldoFilho.debito;
        credito += saldoFilho.credito;
    }
    // 3. Adiciona ao resultado se dentro do nível máximo
    const nivelDaConta = calcularNivel(node.CLASSIFCONTA);
    if (nivelDaConta <= nivelMaximo) {
        resultado.push({
            contactb: node.CONTACTB,
            classificacao: node.CLASSIFCONTA,
            descricao: node.DESCRCONTA,
            debito: parseFloat(debito.toFixed(2)),
            credito: parseFloat(credito.toFixed(2)),
        });
    }
    return { debito, credito };
}
/**
 * Filtra contas patrimoniais (Ativo e Passivo) de uma árvore.
 * Retorna apenas as raízes que começam com "1" ou "2".
 */
function filtrarContasPatrimoniais(arvore) {
    return arvore.filter((raiz) => {
        const classificacao = raiz.CLASSIFCONTA?.trim() || "";
        return classificacao.startsWith("1") || classificacao.startsWith("2");
    });
}
/**
 * Remove linhas com saldo zero de um balancete.
 */
function filtrarLinhasComSaldo(linhas) {
    return linhas.filter((linha) => linha.debito !== 0 || linha.credito !== 0);
}
/**
 * Ordena linhas de balancete por classificação contábil.
 */
function ordenarBalancete(linhas) {
    return linhas.sort((a, b) => compararClassificacao(a.classificacao, b.classificacao));
}
