"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoContabilService = void 0;
const LancamentoContabilRepository_1 = require("../repositories/LancamentoContabilRepository");
class LancamentoContabilService {
    repository = new LancamentoContabilRepository_1.LancamentoContabilRepository();
    /**
     * Obtém os lançamentos contábeis de determinada
     * origem e intervalo entre datas.
     */
    async obterLancamentosContabeisPorOrigem(codigoEmpresa, dataInicio, dataFim, origem) {
        return this.repository.obterLancamentosContabeisPorOrigem(codigoEmpresa, dataInicio, dataFim, origem);
    }
    /**
     * Soma os lançamentos contábeis puramente pelo ID da conta (CONTACTB).
     * Não realiza lógica de classificação ou hierarquia aqui.
     */
    somarPorConta(lancamentos) {
        const saldos = new Map();
        for (const lanc of lancamentos) {
            if (lanc.CONTACTBDEB) {
                this.somar(saldos, lanc.CONTACTBDEB, lanc.VALORLCTOCTB, 0);
            }
            if (lanc.CONTACTBCRED) {
                this.somar(saldos, lanc.CONTACTBCRED, 0, lanc.VALORLCTOCTB);
            }
        }
        return saldos;
    }
    somar(mapa, conta, debito, credito) {
        const atual = mapa.get(conta) ?? { debito: 0, credito: 0 };
        mapa.set(conta, {
            debito: atual.debito + debito,
            credito: atual.credito + credito,
        });
    }
}
exports.LancamentoContabilService = LancamentoContabilService;
