"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaRepository = void 0;
const connection_1 = require("../database/connection");
class EmpresaRepository {
    async listarTodas() {
        const sql = `
      SELECT FIRST 5 
        CODIGOEMPRESA as CODIGO, 
        NOMEEMPRESA as NOME 
      FROM EMPRESA
    `;
        return (await (0, connection_1.executeQuery)(sql));
    }
}
exports.EmpresaRepository = EmpresaRepository;
