import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Executa comandos de manipulação (INSERT, UPDATE, DELETE).
 * Retorna o ID gerado e quantas linhas foram afetadas.
 */
export const run = async (
  sql: string,
  params: any[] = []
): Promise<{ id: number; changes: number }> => {
  try {
    const [result] = await pool.execute<any>(sql, params);

    return {
      id: result.insertId,
      changes: result.affectedRows,
    };
  } catch (error) {
    console.error("Erro no RUN (MySQL):", sql, error);
    throw error;
  }
};

/**
 * Executa comandos de consulta (SELECT).
 * Retorna um array com os resultados.
 */
export const query = async (
  sql: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    const [rows] = await pool.execute<any>(sql, params);
    return rows;
  } catch (error) {
    console.error("Erro na QUERY (MySQL):", sql, error);
    throw error;
  }
};
