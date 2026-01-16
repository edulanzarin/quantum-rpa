"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.run = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = promise_1.default.createPool({
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
const run = async (sql, params = []) => {
    try {
        const [result] = await pool.execute(sql, params);
        return {
            id: result.insertId,
            changes: result.affectedRows,
        };
    }
    catch (error) {
        console.error("Erro no RUN (MySQL):", sql, error);
        throw error;
    }
};
exports.run = run;
/**
 * Executa comandos de consulta (SELECT).
 * Retorna um array com os resultados.
 */
const query = async (sql, params = []) => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    }
    catch (error) {
        console.error("Erro na QUERY (MySQL):", sql, error);
        throw error;
    }
};
exports.query = query;
