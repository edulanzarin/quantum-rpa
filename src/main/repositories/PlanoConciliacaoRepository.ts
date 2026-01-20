import { ItemPlanoConciliacao } from "@shared/types/ItemPlanoConciliacao";
import { run, query } from "@database/localConnection";
import { BaseRepository } from "./BaseRepository";

export class PlanoConciliacaoRepository extends BaseRepository {
  /**
   * Inicializa tabelas do banco local (MySQL).
   * Deve ser chamado na inicialização da aplicação.
   */
  static async inicializarTabelas(): Promise<void> {
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

    await run(sqlPlano);
    await run(sqlItens);

    console.log("✅ Tabelas de planos de conciliação verificadas");
  }

  /**
   * Cria novo plano de conciliação.
   */
  async criarPlano(nome: string): Promise<number> {
    return this.executarQuery(async () => {
      const resultado = await run(
        "INSERT INTO planos_conciliacao (nome_plano) VALUES (?)",
        [nome],
      );
      return resultado.id;
    }, "criar plano");
  }

  /**
   * Atualiza nome de um plano existente.
   */
  async atualizarNomePlano(id: number, nome: string): Promise<void> {
    return this.executarQuery(async () => {
      await run("UPDATE planos_conciliacao SET nome_plano = ? WHERE id = ?", [
        nome,
        id,
      ]);
    }, `atualizar plano ${id}`);
  }

  /**
   * Busca plano por ID.
   */
  async obterPlanoPorId(id: number): Promise<any> {
    return this.executarQuery(async () => {
      const rows = await query(
        "SELECT * FROM planos_conciliacao WHERE id = ?",
        [id],
      );
      return rows[0] || null;
    }, `obter plano ${id}`);
  }

  /**
   * Lista todos os planos cadastrados.
   */
  async listarTodosPlanos(): Promise<any[]> {
    return this.executarQuery(async () => {
      return await query("SELECT * FROM planos_conciliacao ORDER BY id DESC");
    }, "listar todos os planos");
  }

  /**
   * Exclui todos os itens de um plano (usado antes de recriar).
   */
  async excluirItensDoPlano(planoId: number): Promise<void> {
    return this.executarQuery(async () => {
      await run("DELETE FROM itens_plano_conciliacao WHERE plano_id = ?", [
        planoId,
      ]);
    }, `excluir itens do plano ${planoId}`);
  }

  /**
   * Adiciona item ao plano.
   * Arrays de contas são salvos como JSON.
   */
  async adicionarItem(item: ItemPlanoConciliacao): Promise<void> {
    return this.executarQuery(async () => {
      const debitoJson = JSON.stringify(item.contasDebito || []);
      const creditoJson = JSON.stringify(item.contasCredito || []);

      await run(
        `INSERT INTO itens_plano_conciliacao 
        (plano_id, cfop_codigo, cfop_descricao, contas_debito, contas_credito, contabiliza) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item.planoId,
          item.cfop,
          item.descricao,
          debitoJson,
          creditoJson,
          item.contabiliza ? 1 : 0,
        ],
      );
    }, "adicionar item ao plano");
  }

  /**
   * Busca todos os itens de um plano.
   * Faz parse do JSON de volta para arrays.
   */
  async obterItensPorPlano(planoId: number): Promise<ItemPlanoConciliacao[]> {
    return this.executarQuery(async () => {
      const sql = `
        SELECT * FROM itens_plano_conciliacao 
        WHERE plano_id = ? 
        ORDER BY cfop_codigo ASC
      `;

      const rows = await query(sql, [planoId]);

      return this.mapearItens(rows);
    }, `obter itens do plano ${planoId}`);
  }

  /**
   * Mapeia dados brutos para ItemPlanoConciliacao.
   */
  private mapearItens(rows: any[]): ItemPlanoConciliacao[] {
    return rows.map((row) => {
      let contasDebito: number[] = [];
      let contasCredito: number[] = [];

      try {
        contasDebito = row.contas_debito ? JSON.parse(row.contas_debito) : [];
      } catch (e) {
        console.error("Erro ao parsear contas débito:", e);
      }

      try {
        contasCredito = row.contas_credito
          ? JSON.parse(row.contas_credito)
          : [];
      } catch (e) {
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
