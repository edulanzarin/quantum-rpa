"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoFiscalEntradaRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
class LancamentoFiscalEntradaRepository {
    async obterItensPorCfopComDadosDaNota(codigoEmpresa, dataInicio, dataFim) {
        const sql = `
      SELECT
        C.CODIGOEMPRESA,
        C.CHAVELCTOFISENT,
        C.CODIGOPESSOA,
        C.NUMERONF,
        
        COALESCE(C.DATALCTOFIS, C.DATAENTRADA) AS DATA_EFETIVA,
        
        C.VALORCONTABIL, 
        I.CODIGOCFOP,
        I.VALORCONTABILIMPOSTO,
        I.VALORIMPOSTO,
        C.VALORIPI,
        
        COALESCE(P.TOTAL_PIS, 0) AS VALORPIS,
        COALESCE(P.TOTAL_COFINS, 0) AS VALORCOFINS,

        I.CODIGOTABCTBFIS,

        (
          COALESCE(R.VALORINSS, 0) + 
          COALESCE(R.VALORISSQN, 0) + 
          COALESCE(R.VALORIRPJ, 0) + 
          COALESCE(R.VALORIRRF, 0) + 
          COALESCE(R.TOTALPISCOFINSCSLL, 0)
        ) AS TOTAL_RETIDO_NOTA

      FROM LCTOFISENTCFOP I
      
      INNER JOIN LCTOFISENT C
        ON C.CODIGOEMPRESA = I.CODIGOEMPRESA
        AND C.CHAVELCTOFISENT = I.CHAVELCTOFISENT
      
      LEFT JOIN LCTOFISENTRETIDO R
        ON R.CODIGOEMPRESA = C.CODIGOEMPRESA
        AND R.CHAVELCTOFISENT = C.CHAVELCTOFISENT

      -- SUBQUERY: Soma PIS e COFINS de todos os produtos da nota
      LEFT JOIN (
        SELECT 
            CODIGOEMPRESA, 
            CHAVELCTOFISENT, 
            SUM(VALORPIS) AS TOTAL_PIS, 
            SUM(VALORCOFINS) AS TOTAL_COFINS
        FROM LCTOFISENTPISCOFINS
        GROUP BY CODIGOEMPRESA, CHAVELCTOFISENT
      ) P ON P.CODIGOEMPRESA = C.CODIGOEMPRESA 
         AND P.CHAVELCTOFISENT = C.CHAVELCTOFISENT

      WHERE C.CODIGOEMPRESA = ?
        AND COALESCE(C.DATALCTOFIS, C.DATAENTRADA) BETWEEN ? AND ?
      
      ORDER BY COALESCE(C.DATALCTOFIS, C.DATAENTRADA), C.NUMERONF, I.CODIGOCFOP
    `;
        const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, [
            codigoEmpresa,
            dataInicio,
            dataFim,
        ]));
        return dadosBrutos.map((row) => ({
            CODIGOEMPRESA: row.CODIGOEMPRESA,
            CHAVELCTOFISENT: row.CHAVELCTOFISENT,
            CODIGOPESSOA: row.CODIGOPESSOA,
            NUMERONF: row.NUMERONF,
            DATALCTOFIS: row.DATA_EFETIVA,
            VALORCONTABIL: Number(row.VALORCONTABIL),
            VALORCONTABILIMPOSTO: Number(row.VALORCONTABILIMPOSTO),
            CODIGOCFOP: Number(row.CODIGOCFOP),
            VALORIMPOSTO: Number(row.VALORIMPOSTO || 0),
            VALORIPI: Number(row.VALORIPI || 0),
            VALORPIS: Number(row.VALORPIS || 0),
            VALORCOFINS: Number(row.VALORCOFINS || 0),
            CODIGOTABCTBFIS: row.CODIGOTABCTBFIS,
            TOTAL_RETIDO_NOTA: Number(row.TOTAL_RETIDO_NOTA || 0),
        }));
    }
}
exports.LancamentoFiscalEntradaRepository = LancamentoFiscalEntradaRepository;
