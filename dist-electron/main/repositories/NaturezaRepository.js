"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaturezaRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const formatters_1 = require("../utils/formatters");
class NaturezaRepository {
    /**
     * Lista todas as CFOPs de uma empresa (ou geral).
     * Se passar termoBusca, filtra por código ou descrição.
     */
    async listarNaturezas(codigoEmpresa, termoBusca) {
        let sql = `
      SELECT
        CODIGOEMPRESA,
        CODIGOCFOP,
        CAST(DESCRCFOP AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCFOP
      FROM CFOP
      WHERE CODIGOEMPRESA = ?
    `;
        const params = [codigoEmpresa];
        if (termoBusca) {
            sql += ` AND (CAST(CODIGOCFOP AS VARCHAR(10)) LIKE ? OR DESCRCFOP LIKE ?)`;
            params.push(`%${termoBusca}%`);
            params.push(`%${termoBusca}%`);
        }
        sql += ` ORDER BY CODIGOCFOP`;
        const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, params));
        return dadosBrutos.map((row) => ({
            CODIGOEMPRESA: row.CODIGOEMPRESA,
            CODIGOCFOP: row.CODIGOCFOP,
            DESCRCFOP: (0, formatters_1.decodificarTexto)(row.DESCRCFOP),
        }));
    }
    /**
     * Busca uma única CFOP pelo código (útil para validar se o usuário digitar manual)
     */
    async obterPorCodigo(codigoEmpresa, codigoCfop) {
        const sql = `
      SELECT
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
        return {
            CODIGOEMPRESA: dados[0].CODIGOEMPRESA,
            CODIGOCFOP: dados[0].CODIGOCFOP,
            DESCRCFOP: (0, formatters_1.decodificarTexto)(dados[0].DESCRCFOP),
        };
    }
}
exports.NaturezaRepository = NaturezaRepository;
