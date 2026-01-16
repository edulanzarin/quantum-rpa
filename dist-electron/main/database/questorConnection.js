"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = exports.testarConexao = void 0;
const node_firebird_1 = __importDefault(require("node-firebird"));
const dotenv_1 = __importDefault(require("dotenv"));
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
const testarConexao = async () => {
    return new Promise((resolve) => {
        node_firebird_1.default.attach(options, (err, db) => {
            if (err) {
                console.error("Erro ao conectar no Firebird:", err.message);
                resolve(false);
                return;
            }
            console.log("Sucesso! Conectado ao banco Questor.");
            db.detach();
            resolve(true);
        });
    });
};
exports.testarConexao = testarConexao;
const executeQuery = async (query, params = []) => {
    return new Promise((resolve, reject) => {
        node_firebird_1.default.attach(options, (err, db) => {
            if (err)
                return reject(err);
            db.query(query, params, (err, result) => {
                db.detach();
                if (err)
                    return reject(err);
                resolve(result);
            });
        });
    });
};
exports.executeQuery = executeQuery;
