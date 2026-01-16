import { ItemPlanoConciliacao } from "@shared/types/ItemPlanoConciliacao";
import { run, query } from "../database/localConnection";

export class PlanoConciliacaoRepository {
  /**
   * Verifica e cria as tabelas.
   * Agora com sintaxe compatível com MySQL/MariaDB.
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

    await run(sqlPlano);
    await run(sqlItens);
    console.log("Tabelas de Plano verificadas (MySQL).");
  }

  async criarPlano(nome: string): Promise<number> {
    const resultado = await run(
      "INSERT INTO planos_conciliacao (nome_plano) VALUES (?)",
      [nome]
    );
    return resultado.id;
  }

  async atualizarNomePlano(id: number, nome: string) {
    return await run(
      "UPDATE planos_conciliacao SET nome_plano = ? WHERE id = ?",
      [nome, id]
    );
  }

  async obterPlanoPorId(id: number) {
    const rows = await query("SELECT * FROM planos_conciliacao WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  }

  async listarTodosPlanos() {
    return await query("SELECT * FROM planos_conciliacao");
  }

  async excluirItensDoPlano(planoId: number) {
    return await run("DELETE FROM itens_plano_conciliacao WHERE plano_id = ?", [
      planoId,
    ]);
  }

  /**
   * Adiciona um item convertendo os arrays de contas para JSON String.
   */
  async adicionarItem(item: ItemPlanoConciliacao) {
    const debitoJson = JSON.stringify(item.contasDebito || []);
    const creditoJson = JSON.stringify(item.contasCredito || []);

    return await run(
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
      ]
    );
  }

  /**
   * Busca os itens e faz o parse do JSON de volta para Array numérico.
   */
  async obterItensPorPlano(planoId: number): Promise<ItemPlanoConciliacao[]> {
    const sql = `
      SELECT * FROM itens_plano_conciliacao 
      WHERE plano_id = ? 
      ORDER BY cfop_codigo ASC
    `;

    const rows = await query(sql, [planoId]);

    return rows.map((row: any) => {
      let contasDebito: number[] = [];
      let contasCredito: number[] = [];

      try {
        contasDebito = row.contas_debito ? JSON.parse(row.contas_debito) : [];
      } catch (e) {
        console.error("Erro parse débito", e);
      }

      try {
        contasCredito = row.contas_credito
          ? JSON.parse(row.contas_credito)
          : [];
      } catch (e) {
        console.error("Erro parse crédito", e);
      }

      return {
        id: row.id,
        planoId: row.plano_id,
        cfop: row.cfop_codigo,
        descricao: row.cfop_descricao,
        contasDebito: contasDebito,
        contasCredito: contasCredito,
        contabiliza: row.contabiliza === 1,
      };
    });
  }
}
