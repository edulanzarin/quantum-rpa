"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturezaRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const formatters_1 = require("../utils/formatters");
const BaseRepository_1 = require("./BaseRepository");
class NaturezaRepository extends BaseRepository_1.BaseRepository {
    /**
     * Lista CFOPs com filtro opcional por termo de busca.
     * Usa DISTINCT para evitar duplicatas.
     */
    async listarNaturezas(codigoEmpresa, termoBusca) {
        return this.executarQuery(async () => {
            let sql = `
        SELECT DISTINCT
          CODIGOEMPRESA,
          CODIGOCFOP,
          CAST(DESCRCFOP AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCFOP
        FROM CFOP
        WHERE CODIGOEMPRESA = ?
      `;
            const params = [codigoEmpresa];
            if (termoBusca) {
                sql += ` AND (CAST(CODIGOCFOP AS VARCHAR(10)) LIKE ? OR DESCRCFOP LIKE ?)`;
                params.push(`${termoBusca}%`, `%${termoBusca}%`);
            }
            sql += ` ORDER BY CODIGOCFOP`;
            const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, params));
            return this.mapearNaturezas(dadosBrutos);
        }, "listar naturezas");
    }
    /**
     * Busca CFOP específica por código.
     */
    async obterPorCodigo(codigoEmpresa, codigoCfop) {
        return this.executarQuery(async () => {
            const sql = `
        SELECT DISTINCT
          CODIGOEMPRESA,
          CODIGOCFOP,
          CAST(DESCRCFOP AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCFOP
        FROM CFOP
        WHERE CODIGOEMPRESA = ? AND CODIGOCFOP = ?
      `;
            const dados = (await (0, questorConnection_1.executeQuery)(sql, [
                codigoEmpresa,
                codigoCfop,
            ]));
            if (dados.length === 0)
                return null;
            const naturezas = this.mapearNaturezas(dados);
            return naturezas[0];
        }, `buscar CFOP ${codigoCfop}`);
    }
    /**
     * Mapeia dados brutos para o tipo Natureza.
     */
    mapearNaturezas(dadosBrutos) {
        return dadosBrutos.map((row) => ({
            CODIGOEMPRESA: row.CODIGOEMPRESA,
            CODIGOCFOP: row.CODIGOCFOP,
            DESCRCFOP: (0, formatters_1.decodificarTexto)(row.DESCRCFOP),
        }));
    }
}
exports.NaturezaRepository = NaturezaRepository;
