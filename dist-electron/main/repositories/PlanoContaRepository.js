"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanoContaRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const formatters_1 = require("../utils/formatters");
const BaseRepository_1 = require("./BaseRepository");
class PlanoContaRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtém contas específicas da empresa (PLANOESPEC).
     */
    async obterPlanoEspecifico(codigoEmpresa) {
        return this.executarQuery(async () => {
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
            return this.mapearContas(dadosBrutos);
        }, `obter plano específico da empresa ${codigoEmpresa}`);
    }
    /**
     * Obtém contas padrão do sistema (PLANOPADRAO).
     */
    async obterPlanoPadrao() {
        return this.executarQuery(async () => {
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
            return this.mapearContas(dadosBrutos);
        }, "obter plano padrão");
    }
    /**
     * Mapeia dados brutos do banco para o tipo PlanoConta.
     */
    mapearContas(dadosBrutos) {
        return dadosBrutos.map((row) => ({
            ...(row.CODIGOEMPRESA && { CODIGOEMPRESA: row.CODIGOEMPRESA }),
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
