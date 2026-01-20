"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoConciliacaoRepository = void 0;
const localConnection_1 = require("../database/localConnection");
const BaseRepository_1 = require("./BaseRepository");
class PlanoConciliacaoRepository extends BaseRepository_1.BaseRepository {
    /**
     * Inicializa tabelas do banco local (MySQL).
     * Deve ser chamado na inicialização da aplicação.
     */
    static async inicializarTabelas() {
        const sqlPlano = `
      CREATE TABLE IF NOT EXISTS planos_conciliacao (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        nome_plano VARCHAR(255) NOT NULL,
        ativo TINYINT DEFAULT 1
      );
    `;
        const sqlItens = `
      CREATE TABLE IF NOT EXISTS itens_plano_conciliacao (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plano_id INT NOT NULL,
        cfop_codigo INT NOT NULL,
        cfop_descricao VARCHAR(255),
        contas_debito TEXT,  
        contas_credito TEXT, 
        contabiliza TINYINT DEFAULT 1,
        FOREIGN KEY (plano_id) REFERENCES planos_conciliacao(id) ON DELETE CASCADE
      );
    `;
        await (0, localConnection_1.run)(sqlPlano);
        await (0, localConnection_1.run)(sqlItens);
        console.log("✅ Tabelas de planos de conciliação verificadas");
    }
    /**
     * Cria novo plano de conciliação.
     */
    async criarPlano(nome) {
        return this.executarQuery(async () => {
            const resultado = await (0, localConnection_1.run)("INSERT INTO planos_conciliacao (nome_plano) VALUES (?)", [nome]);
            return resultado.id;
        }, "criar plano");
    }
    /**
     * Atualiza nome de um plano existente.
     */
    async atualizarNomePlano(id, nome) {
        return this.executarQuery(async () => {
            await (0, localConnection_1.run)("UPDATE planos_conciliacao SET nome_plano = ? WHERE id = ?", [
                nome,
                id,
            ]);
        }, `atualizar plano ${id}`);
    }
    /**
     * Busca plano por ID.
     */
    async obterPlanoPorId(id) {
        return this.executarQuery(async () => {
            const rows = await (0, localConnection_1.query)("SELECT * FROM planos_conciliacao WHERE id = ?", [id]);
            return rows[0] || null;
        }, `obter plano ${id}`);
    }
    /**
     * Lista todos os planos cadastrados.
     */
    async listarTodosPlanos() {
        return this.executarQuery(async () => {
            return await (0, localConnection_1.query)("SELECT * FROM planos_conciliacao ORDER BY id DESC");
        }, "listar todos os planos");
    }
    /**
     * Exclui todos os itens de um plano (usado antes de recriar).
     */
    async excluirItensDoPlano(planoId) {
        return this.executarQuery(async () => {
            await (0, localConnection_1.run)("DELETE FROM itens_plano_conciliacao WHERE plano_id = ?", [
                planoId,
            ]);
        }, `excluir itens do plano ${planoId}`);
    }
    /**
     * Adiciona item ao plano.
     * Arrays de contas são salvos como JSON.
     */
    async adicionarItem(item) {
        return this.executarQuery(async () => {
            const debitoJson = JSON.stringify(item.contasDebito || []);
            const creditoJson = JSON.stringify(item.contasCredito || []);
            await (0, localConnection_1.run)(`INSERT INTO itens_plano_conciliacao 
        (plano_id, cfop_codigo, cfop_descricao, contas_debito, contas_credito, contabiliza) 
        VALUES (?, ?, ?, ?, ?, ?)`, [
                item.planoId,
                item.cfop,
                item.descricao,
                debitoJson,
                creditoJson,
                item.contabiliza ? 1 : 0,
            ]);
        }, "adicionar item ao plano");
    }
    /**
     * Busca todos os itens de um plano.
     * Faz parse do JSON de volta para arrays.
     */
    async obterItensPorPlano(planoId) {
        return this.executarQuery(async () => {
            const sql = `
        SELECT * FROM itens_plano_conciliacao 
        WHERE plano_id = ? 
        ORDER BY cfop_codigo ASC
      `;
            const rows = await (0, localConnection_1.query)(sql, [planoId]);
            return this.mapearItens(rows);
        }, `obter itens do plano ${planoId}`);
    }
    /**
     * Mapeia dados brutos para ItemPlanoConciliacao.
     */
    mapearItens(rows) {
        return rows.map((row) => {
            let contasDebito = [];
            let contasCredito = [];
            try {
                contasDebito = row.contas_debito ? JSON.parse(row.contas_debito) : [];
            }
            catch (e) {
                console.error("Erro ao parsear contas débito:", e);
            }
            try {
                contasCredito = row.contas_credito
                    ? JSON.parse(row.contas_credito)
                    : [];
            }
            catch (e) {
                console.error("Erro ao parsear contas crédito:", e);
            }
            return {
                id: row.id,
                planoId: row.plano_id,
                cfop: row.cfop_codigo,
                descricao: row.cfop_descricao,
                contasDebito,
                contasCredito,
                contabiliza: row.contabiliza === 1,
            };
        });
    }
}
exports.PlanoConciliacaoRepository = PlanoConciliacaoRepository;
