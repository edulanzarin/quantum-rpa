import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { DatabaseConnection } from "./DatabaseConnection";
import { DatabaseError } from "@errors";

dotenv.config();

/**
 * Conexão com MySQL local (planos de conciliação).
 */
class LocalConnection extends DatabaseConnection {
  private pool: mysql.Pool;

  constructor() {
    super();
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: Number(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async testarConexao(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      console.log("✅ Conectado ao banco MySQL local");
      connection.release();
      return true;
    } catch (error) {
      console.error("❌ Erro ao conectar no MySQL:", error);
      return false;
    }
  }

  async executarQuery(sql: string, params: any[] = []): Promise<any> {
    return this.executarComRetry(async () => {
      const [result] = await this.pool.execute<any>(sql, params);
      return result;
    }, "executar query no MySQL");
  }

  /**
   * Executa comando de manipulação (INSERT, UPDATE, DELETE).
   */
  async executarComando(
    sql: string,
    params: any[] = [],
  ): Promise<{ id: number; changes: number }> {
    try {
      const result = await this.executarQuery(sql, params);
      return {
        id: result.insertId || 0,
        changes: result.affectedRows || 0,
      };
    } catch (error) {
      throw new DatabaseError("Erro ao executar comando", error as Error);
    }
  }

  async fecharConexao(): Promise<void> {
    await this.pool.end();
    console.log("🔌 Pool MySQL fechado");
  }
}

// Singleton
const localConnection = new LocalConnection();

// Funções legacy para compatibilidade
export const run = async (
  sql: string,
  params: any[] = [],
): Promise<{ id: number; changes: number }> => {
  return localConnection.executarComando(sql, params);
};

export const query = async (
  sql: string,
  params: any[] = [],
): Promise<any[]> => {
  return localConnection.executarQuery(sql, params);
};

export default localConnection;
