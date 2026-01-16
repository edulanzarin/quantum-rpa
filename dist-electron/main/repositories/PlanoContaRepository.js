"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoContaRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const formatters_1 = require("../utils/formatters");
class PlanoContaRepository {
    /**
     * Obtém as contas específicas da empresa (PLANOESPEC).
     * Estas são contas personalizadas/customizadas.
     */
    async obterPlanoEspecifico(codigoEmpresa) {
        const sql = `
      SELECT
        CODIGOEMPRESA,
        CONTACTB,
        TIPOCONTA,
        CLASSIFCONTA,
        CAST(DESCRCONTA AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCONTA,
        CAST(APELIDOCONTA AS VARCHAR(50) CHARACTER SET OCTETS) as APELIDOCONTA
      FROM PLANOESPEC
      WHERE CODIGOEMPRESA = ?
      ORDER BY CLASSIFCONTA
    `;
        const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, [codigoEmpresa]));
        return dadosBrutos.map((row) => ({
            CODIGOEMPRESA: row.CODIGOEMPRESA,
            CONTACTB: row.CONTACTB,
            TIPOCONTA: row.TIPOCONTA,
            CLASSIFCONTA: row.CLASSIFCONTA,
            DESCRCONTA: (0, formatters_1.decodificarTexto)(row.DESCRCONTA),
            APELIDOCONTA: row.APELIDOCONTA
                ? (0, formatters_1.decodificarTexto)(row.APELIDOCONTA)
                : undefined,
        }));
    }
    /**
     * Obtém as contas padrão do sistema (PLANOPADRAO).
     * Estas são as contas padrão que todas as empresas têm.
     */
    async obterPlanoPadrao() {
        const sql = `
      SELECT
        CONTACTB,
        TIPOCONTA,
        CLASSIFCONTA,
        CAST(DESCRCONTA AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCONTA,
        CAST(APELIDOCONTA AS VARCHAR(50) CHARACTER SET OCTETS) as APELIDOCONTA
      FROM PLANOPADRAO
      ORDER BY CLASSIFCONTA
    `;
        const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, []));
        return dadosBrutos.map((row) => ({
            CONTACTB: row.CONTACTB,
            TIPOCONTA: row.TIPOCONTA,
            CLASSIFCONTA: row.CLASSIFCONTA,
            DESCRCONTA: (0, formatters_1.decodificarTexto)(row.DESCRCONTA),
            APELIDOCONTA: row.APELIDOCONTA
                ? (0, formatters_1.decodificarTexto)(row.APELIDOCONTA)
                : undefined,
        }));
    }
}
exports.PlanoContaRepository = PlanoContaRepository;
