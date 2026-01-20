"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceteContabilService = void 0;
const PlanoContaService_1 = require("./PlanoContaService");
const LancamentoContabilService_1 = require("./LancamentoContabilService");
class BalanceteContabilService {
    planoContaService = new PlanoContaService_1.PlanoContaService();
    lancamentoService = new LancamentoContabilService_1.LancamentoContabilService();
    /**
     * Gera o balanço patrimonial de uma empresa em um período específico.
     * Filtra apenas contas patrimoniais (classificações 1 e 2) até o nível 3.
     */
    async gerarBalancoPatrimonial(codigoEmpresa, dataInicio, dataFim, origem) {
        const plano = await this.planoContaService.obterPlanoProcessado(codigoEmpresa);
        const lancamentos = await this.lancamentoService.obterLancamentosContabeisPorOrigem(codigoEmpresa, dataInicio, dataFim, origem);
        const saldosPorConta = this.lancamentoService.somarPorConta(lancamentos);
        const linhas = [];
        for (const raiz of plano) {
            const classificacao = raiz.CLASSIFCONTA?.trim() || "";
            if (classificacao.startsWith("1") || classificacao.startsWith("2")) {
                this.acumularSaldosHierarquicos(raiz, saldosPorConta, linhas, 3);
            }
        }
        const linhasComSaldo = linhas.filter((linha) => linha.debito !== 0 || linha.credito !== 0);
        linhasComSaldo.sort((a, b) => this.compararClassificacao(a.classificacao, b.classificacao));
        return linhasComSaldo;
    }
    /**
     * Método utilitário privado que acumula saldos na hierarquia de contas.
     *
     * Percorre a árvore recursivamente:
     * - Pega o saldo próprio da conta (se houver lançamentos diretos)
     * - Soma os saldos de todos os filhos (recursivamente)
     * - Retorna o saldo total para que o pai possa acumular
     *
     * O nível é calculado pela CLASSIFCONTA (número de partes separadas por ponto):
     * - "1" → nível 1
     * - "1.1" → nível 2
     * - "1.1.01" → nível 3
     * - "1.1.01.001" → nível 4
     *
     * Exemplo de acumulação:
     * - Conta 142 (1.1.02.001) tem débito=200k, crédito=100k
     * - Conta 143 (1.1.02.002) tem débito=150k, crédito=50k
     * - Conta pai 141 (1.1.02) terá débito=350k, crédito=150k (soma dos filhos)
     * - Conta pai 140 (1.1) terá a soma de todos os netos
     * - Conta pai 1 terá a soma de todos os descendentes
     */
    acumularSaldosHierarquicos(node, saldosPorConta, resultado, nivelMaximo) {
        let debito = 0;
        let credito = 0;
        const saldoProprio = saldosPorConta.get(node.CONTACTB);
        if (saldoProprio) {
            debito += saldoProprio.debito;
            credito += saldoProprio.credito;
        }
        for (const filho of node.filhos) {
            const saldoFilho = this.acumularSaldosHierarquicos(filho, saldosPorConta, resultado, nivelMaximo);
            debito += saldoFilho.debito;
            credito += saldoFilho.credito;
        }
        const nivelDaConta = node.CLASSIFCONTA.split(".").length;
        if (nivelDaConta <= nivelMaximo) {
            resultado.push({
                contactb: node.CONTACTB,
                classificacao: node.CLASSIFCONTA,
                descricao: node.DESCRCONTA,
                debito,
                credito,
            });
        }
        return { debito, credito };
    }
    /**
     * Compara duas classificações contábeis para ordenação.
     * Exemplo: "1" < "1.1" < "1.1.001" < "1.2" < "2" < "2.1"
     */
    compararClassificacao(a, b) {
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
}
exports.BalanceteContabilService = BalanceteContabilService;
