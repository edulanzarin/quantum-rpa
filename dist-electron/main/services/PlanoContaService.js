"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoContaService = void 0;
const PlanoContaRepository_1 = require("../repositories/PlanoContaRepository");
const contabilidade_utils_1 = require("../utils/contabilidade.utils");
const BaseService_1 = require("./BaseService");
const validation_utils_1 = require("../utils/validation.utils");
class PlanoContaService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new PlanoContaRepository_1.PlanoContaRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Obtém o plano de contas processado de uma empresa.
     *
     * Mescla PLANOPADRAO (sistema) com PLANOESPEC (específicas),
     * prevalecendo as específicas em caso de conflito.
     */
    async obterPlanoProcessado(codigoEmpresa) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        this.log("obterPlanoProcessado", { codigoEmpresa });
        const [contasPadrao, contasEspecificas] = await Promise.all([
            this.repository.obterPlanoPadrao(),
            this.repository.obterPlanoEspecifico(codigoEmpresa),
        ]);
        const contasMescladas = this.mesclarContas(contasPadrao, contasEspecificas, codigoEmpresa);
        return this.montarArvore(contasMescladas);
    }
    /**
     * Mescla contas padrão com específicas.
     * Contas específicas sobrescrevem as padrão (mesmo CONTACTB).
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
        resultado.sort((a, b) => (0, contabilidade_utils_1.compararClassificacao)(a.CLASSIFCONTA, b.CLASSIFCONTA));
        return resultado;
    }
    /**
     * Constrói árvore hierárquica do plano de contas.
     *
     * Utiliza CONTACTB como chave única (múltiplas contas podem ter mesma CLASSIFCONTA).
     * Busca ancestral mais próximo existente na hierarquia.
     */
    montarArvore(contas) {
        const mapaPorContactb = new Map();
        const mapaPorClassif = new Map();
        const raizes = [];
        for (const conta of contas) {
            const node = {
                ...conta,
                nivel: (0, contabilidade_utils_1.calcularNivel)(conta.CLASSIFCONTA),
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
            const pai = this.buscarPaiMaisProximo(partes, mapaPorClassif);
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
     * Busca o pai mais próximo na hierarquia.
     * Tenta classificações progressivamente mais curtas até encontrar.
     */
    buscarPaiMaisProximo(partes, mapaPorClassif) {
        for (let i = partes.length - 1; i > 0; i--) {
            const classifPai = partes.slice(0, i).join(".");
            const candidatos = mapaPorClassif.get(classifPai);
            if (candidatos && candidatos.length > 0) {
                return candidatos[0];
            }
        }
        return undefined;
    }
}
exports.PlanoContaService = PlanoContaService;
