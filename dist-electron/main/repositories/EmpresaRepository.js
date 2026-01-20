"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpresaRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const formatters_1 = require("../utils/formatters");
const BaseRepository_1 = require("./BaseRepository");
class EmpresaRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtém todas as empresas cadastradas.
     */
    async obterEmpresas() {
        return this.executarQuery(async () => {
            const sql = `
        SELECT 
          CODIGOEMPRESA as CODIGO, 
          CAST(NOMEEMPRESA AS VARCHAR(200) CHARACTER SET OCTETS) as NOME 
        FROM EMPRESA
        ORDER BY CODIGOEMPRESA
      `;
            const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql));
            return dadosBrutos.map((empresa) => ({
                CODIGO: empresa.CODIGO,
                NOME: (0, formatters_1.decodificarTexto)(empresa.NOME),
            }));
        }, "obter empresas");
    }
}
exports.EmpresaRepository = EmpresaRepository;
