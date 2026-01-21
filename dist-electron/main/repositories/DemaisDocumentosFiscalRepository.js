"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemaisDocumentosFiscalRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const BaseRepository_1 = require("./BaseRepository");
class DemaisDocumentosFiscalRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtém valores de PIS/COFINS da tabela EFDF100DEMAISDOC.
     * Retorna dados agregados por conta contábil (CONTACTB).
     */
    async obterPisCofinsPorConta(codigoEmpresa, dataInicio, dataFim) {
        return this.executarQuery(async () => {
            const sql = `
        SELECT
          CODIGOEMPRESA,
          CONTACTB,
          SUM(COALESCE(VALORPIS, 0)) AS VALORPIS,
          SUM(COALESCE(VALORCOFINS, 0)) AS VALORCOFINS
        FROM EFDF100DEMAISDOC
        WHERE CODIGOEMPRESA = ?
          AND DATALCTOFIS BETWEEN ? AND ?
          AND CONTACTB IS NOT NULL
        GROUP BY 
          CODIGOEMPRESA,
          CONTACTB
        ORDER BY CONTACTB
      `;
            const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, [
                codigoEmpresa,
                dataInicio,
                dataFim,
            ]));
            return this.mapearDemaisDocumentos(dadosBrutos);
        }, `obter PIS/COFINS de demais documentos da empresa ${codigoEmpresa}`);
    }
    /**
     * Mapeia dados brutos para o tipo DemaisDocumentosFiscal.
     */
    mapearDemaisDocumentos(dadosBrutos) {
        return dadosBrutos.map((row) => ({
            CODIGOEMPRESA: row.CODIGOEMPRESA,
            CONTACTB: Number(row.CONTACTB),
            VALORPIS: Number(row.VALORPIS || 0),
            VALORCOFINS: Number(row.VALORCOFINS || 0),
        }));
    }
}
exports.DemaisDocumentosFiscalRepository = DemaisDocumentosFiscalRepository;
