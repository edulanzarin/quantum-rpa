"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoContaService = void 0;
const PlanoContaRepository_1 = require("../repositories/PlanoContaRepository");
class PlanoContaService {
    repository = new PlanoContaRepository_1.PlanoContaRepository();
    /**
     * Obtém o plano de contas de uma empresa e retorna a estrutura
     * hierárquica já processada em formato de árvore.
     *
     * Mescla contas do PLANOPADRAO (padrão do sistema) com PLANOESPEC (específicas da empresa).
     * Se uma conta existe em ambas as tabelas, a versão do PLANOESPEC prevalece.
     */
    async obterPlanoProcessado(codigoEmpresa) {
        const [contasPadrao, contasEspecificas] = await Promise.all([
            this.repository.obterPlanoPadrao(),
            this.repository.obterPlanoEspecifico(codigoEmpresa),
        ]);
        const contasMescladas = this.mesclarContas(contasPadrao, contasEspecificas, codigoEmpresa);
        return this.montarArvore(contasMescladas);
    }
    /**
     * Mescla contas padrão com contas específicas.
     *
     * Regras:
     * - Contas do PLANOESPEC sobrescrevem contas do PLANOPADRAO (mesmo CONTACTB)
     * - Todas as contas padrão que não foram sobrescritas são incluídas
     * - Resultado final ordenado por CLASSIFCONTA
     */
    mesclarContas(contasPadrao, contasEspecificas, codigoEmpresa) {
        const mapa = new Map();
        for (const conta of contasPadrao) {
            mapa.set(conta.CONTACTB, {
                ...conta,
                CODIGOEMPRESA: codigoEmpresa,
            });
        }
        for (const conta of contasEspecificas) {
            mapa.set(conta.CONTACTB, conta);
        }
        const resultado = Array.from(mapa.values());
        resultado.sort((a, b) => this.compararClassificacao(a.CLASSIFCONTA, b.CLASSIFCONTA));
        return resultado;
    }
    /**
     * Constrói a árvore do plano de contas a partir de uma lista plana.
     *
     * IMPORTANTE: Múltiplas contas podem ter a mesma CLASSIFCONTA,
     * por isso usamos CONTACTB como chave única.
     *
     * A relação pai-filho busca o ancestral mais próximo que existe:
     * - Se existe 1.01.02.04.05 mas não existe 1.01.02.04, busca 1.01.02
     * - Se 1.01.02 não existe, busca 1.01
     * - E assim por diante até encontrar ou virar raiz
     *
     * Exemplo:
     * - 1           → raiz
     * - 1.1         → filho de 1
     * - 1.1.01      → filho de 1.1
     * - 1.1.01.001  → filho de 1.1.01 (se existir) ou 1.1.01 ou 1.1 ou 1
     */
    montarArvore(contas) {
        const mapaPorContactb = new Map();
        const mapaPorClassif = new Map();
        const raizes = [];
        for (const conta of contas) {
            const nivel = conta.CLASSIFCONTA.split(".").length;
            const node = {
                ...conta,
                nivel,
                filhos: [],
            };
            mapaPorContactb.set(conta.CONTACTB, node);
            const lista = mapaPorClassif.get(conta.CLASSIFCONTA) || [];
            lista.push(node);
            mapaPorClassif.set(conta.CLASSIFCONTA, lista);
        }
        for (const node of mapaPorContactb.values()) {
            const partes = node.CLASSIFCONTA.split(".");
            if (partes.length === 1) {
                raizes.push(node);
                continue;
            }
            let pai;
            for (let i = partes.length - 1; i > 0; i--) {
                const classifPai = partes.slice(0, i).join(".");
                const candidatos = mapaPorClassif.get(classifPai);
                if (candidatos && candidatos.length > 0) {
                    pai = candidatos[0];
                    break;
                }
            }
            if (pai) {
                node.pai = pai;
                pai.filhos.push(node);
            }
            else {
                raizes.push(node);
            }
        }
        return raizes;
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
exports.PlanoContaService = PlanoContaService;
