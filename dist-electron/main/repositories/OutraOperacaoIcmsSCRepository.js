"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutraOperacaoIcmsSCRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const BaseRepository_1 = require("./BaseRepository");
class OutraOperacaoIcmsSCRepository extends BaseRepository_1.BaseRepository {
    /**
     * Busca o total de DCIP (Código 770) do período.
     * DCIP = Dedução de Crédito do Imposto Próprio
     */
    async buscarDCIP(codigoEmpresa, dataInicio, dataFim) {
        return this.executarQuery(async () => {
            const sql = `
        SELECT 
          COALESCE(SUM(VALOROUTRAOPERACAOFIS), 0) AS TOTAL_DCIP
        FROM OUTRAOPERACAOICMSSC
        WHERE CODIGOEMPRESA = ?
          AND DATALCTOFIS BETWEEN ? AND ?
          AND CODIGOOPERACAOFIS = 770
      `;
            const resultado = (await (0, questorConnection_1.executeQuery)(sql, [
                codigoEmpresa,
                dataInicio,
                dataFim,
            ]));
            return Number(resultado[0]?.TOTAL_DCIP || 0);
        }, `buscar DCIP da empresa ${codigoEmpresa}`);
    }
}
exports.OutraOperacaoIcmsSCRepository = OutraOperacaoIcmsSCRepository;
