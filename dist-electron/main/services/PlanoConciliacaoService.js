"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoConciliacaoService = void 0;
const PlanoConciliacaoRepository_1 = require("../repositories/PlanoConciliacaoRepository");
const BaseService_1 = require("./BaseService");
const _errors_1 = require("../errors");
class PlanoConciliacaoService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new PlanoConciliacaoRepository_1.PlanoConciliacaoRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Salva um plano de conciliação (criação ou atualização).
     *
     * Fluxo:
     * 1. Valida dados obrigatórios
     * 2. Se for edição: atualiza nome e refaz itens
     * 3. Se for criação: cria novo plano e insere itens
     */
    async salvarPlano(plano) {
        this.validarPlano(plano);
        this.log("salvarPlano", {
            id: plano.id,
            nome: plano.nome,
            qtdItens: plano.itens?.length,
        });
        let idPlano = plano.id;
        if (idPlano) {
            // Atualização
            await this.repository.atualizarNomePlano(idPlano, plano.nome);
            await this.repository.excluirItensDoPlano(idPlano);
        }
        else {
            // Criação
            idPlano = await this.repository.criarPlano(plano.nome);
        }
        // Insere todos os itens
        await this.salvarItens(idPlano, plano.itens);
        this.log(`Plano ${idPlano} salvo com sucesso`);
        return idPlano;
    }
    /**
     * Obtém plano completo com todos os itens.
     */
    async obterPlanoCompleto(id) {
        const header = await this.repository.obterPlanoPorId(id);
        if (!header) {
            return null;
        }
        const itens = await this.repository.obterItensPorPlano(id);
        return {
            id: header.id,
            nome: header.nome_plano,
            ativo: header.ativo === 1,
            itens,
        };
    }
    /**
     * Lista todos os planos (apenas cabeçalhos).
     */
    async listarTodosPlanos() {
        return await this.repository.listarTodosPlanos();
    }
    /**
     * Valida dados do plano antes de salvar.
     */
    validarPlano(plano) {
        if (!plano.nome || plano.nome.trim() === "") {
            throw new _errors_1.ValidationError("O nome do plano é obrigatório");
        }
        if (!plano.itens || plano.itens.length === 0) {
            throw new _errors_1.ValidationError("O plano precisa ter pelo menos um item configurado");
        }
    }
    /**
     * Salva todos os itens de um plano em paralelo.
     */
    async salvarItens(planoId, itens) {
        const promessas = itens.map((item) => this.repository.adicionarItem({
            ...item,
            planoId,
        }));
        await Promise.all(promessas);
    }
}
exports.PlanoConciliacaoService = PlanoConciliacaoService;
