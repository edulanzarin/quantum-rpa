"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = exports.testarConexao = void 0;
const node_firebird_1 = __importDefault(require("node-firebird"));
const dotenv_1 = __importDefault(require("dotenv"));
const DatabaseConnection_1 = require("./DatabaseConnection");
const _errors_1 = require("../errors");
dotenv_1.default.config();
const options = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    lowercase_keys: false,
    role: undefined,
    pageSize: 4096,
    charset: "OCTETS",
    retryConnectionInterval: 1000,
};
/**
 * Conexão com banco Firebird (Questor).
 */
class QuestorConnection extends DatabaseConnection_1.DatabaseConnection {
    async testarConexao() {
        return new Promise((resolve) => {
            node_firebird_1.default.attach(options, (err, db) => {
                if (err) {
                    console.error("❌ Erro ao conectar no Firebird:", err.message);
                    resolve(false);
                    return;
                }
                console.log("✅ Conectado ao banco Questor (Firebird)");
                db.detach();
                resolve(true);
            });
        });
    }
    async executarQuery(query, params = []) {
        return this.executarComRetry(async () => {
            return new Promise((resolve, reject) => {
                node_firebird_1.default.attach(options, (err, db) => {
                    if (err) {
                        reject(new _errors_1.DatabaseError("Erro ao conectar no Firebird", err));
                        return;
                    }
                    db.query(query, params, (err, result) => {
                        db.detach();
                        if (err) {
                            reject(new _errors_1.DatabaseError("Erro ao executar query", err));
                            return;
                        }
                        resolve(result);
                    });
                });
            });
        }, "executar query no Firebird");
    }
}
// Singleton
const questorConnection = new QuestorConnection();
// Função legacy para compatibilidade
const testarConexao = () => questorConnection.testarConexao();
exports.testarConexao = testarConexao;
const executeQuery = (query, params) => questorConnection.executarQuery(query, params);
exports.executeQuery = executeQuery;
exports.default = questorConnection;
