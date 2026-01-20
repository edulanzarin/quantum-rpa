"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.run = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const DatabaseConnection_1 = require("./DatabaseConnection");
const _errors_1 = require("../errors");
dotenv_1.default.config();
/**
 * Conexão com MySQL local (planos de conciliação).
 */
class LocalConnection extends DatabaseConnection_1.DatabaseConnection {
    pool;
    constructor() {
        super();
        this.pool = promise_1.default.createPool({
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
    async testarConexao() {
        try {
            const connection = await this.pool.getConnection();
            console.log("✅ Conectado ao banco MySQL local");
            connection.release();
            return true;
        }
        catch (error) {
            console.error("❌ Erro ao conectar no MySQL:", error);
            return false;
        }
    }
    async executarQuery(sql, params = []) {
        return this.executarComRetry(async () => {
            const [result] = await this.pool.execute(sql, params);
            return result;
        }, "executar query no MySQL");
    }
    /**
     * Executa comando de manipulação (INSERT, UPDATE, DELETE).
     */
    async executarComando(sql, params = []) {
        try {
            const result = await this.executarQuery(sql, params);
            return {
                id: result.insertId || 0,
                changes: result.affectedRows || 0,
            };
        }
        catch (error) {
            throw new _errors_1.DatabaseError("Erro ao executar comando", error);
        }
    }
    async fecharConexao() {
        await this.pool.end();
        console.log("🔌 Pool MySQL fechado");
    }
}
// Singleton
const localConnection = new LocalConnection();
// Funções legacy para compatibilidade
const run = async (sql, params = []) => {
    return localConnection.executarComando(sql, params);
};
exports.run = run;
const query = async (sql, params = []) => {
    return localConnection.executarQuery(sql, params);
};
exports.query = query;
exports.default = localConnection;
