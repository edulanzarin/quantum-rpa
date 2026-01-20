"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LancamentoFiscalEntradaRepository = void 0;
const questorConnection_1 = require("../database/questorConnection");
const BaseRepository_1 = require("./BaseRepository");
class LancamentoFiscalEntradaRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtém itens fiscais com dados da nota unificados.
     * Inclui valores de PIS/COFINS ESPECÍFICOS de cada CFOP.
     */
    async obterItensPorCfopComDadosDaNota(codigoEmpresa, dataInicio, dataFim) {
        return this.executarQuery(async () => {
            const sql = `
        SELECT
          C.CODIGOEMPRESA,
          I.CHAVELCTOFISENT,
          C.CODIGOPESSOA,
          C.NUMERONF,
          
          COALESCE(C.DATALCTOFIS, C.DATAENTRADA) AS DATA_EFETIVA,
          
          C.VALORCONTABIL, 
          I.CODIGOCFOP,
          
          -- ← SOMA valores por CFOP (pode ter múltiplas linhas)
          SUM(I.VALORCONTABILIMPOSTO) AS VALORCONTABILIMPOSTO,
          SUM(I.VALORIMPOSTO) AS VALORIMPOSTO,
          C.VALORIPI,
          
          COALESCE(P.TOTAL_PIS_CFOP, 0) AS VALORPIS,
          COALESCE(P.TOTAL_COFINS_CFOP, 0) AS VALORCOFINS,

          MAX(I.CODIGOTABCTBFIS) AS CODIGOTABCTBFIS,

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

        LEFT JOIN (
          SELECT 
            PC.CODIGOEMPRESA, 
            PC.CHAVELCTOFISENT, 
            PC.CODIGOCFOP, 
            SUM(PC.VALORPIS) AS TOTAL_PIS_CFOP, 
            SUM(PC.VALORCOFINS) AS TOTAL_COFINS_CFOP
          FROM LCTOFISENTPISCOFINS PC
          INNER JOIN LCTOFISENT C2
            ON C2.CODIGOEMPRESA = PC.CODIGOEMPRESA
            AND C2.CHAVELCTOFISENT = PC.CHAVELCTOFISENT
          WHERE C2.CODIGOEMPRESA = ?
            AND COALESCE(C2.DATALCTOFIS, C2.DATAENTRADA) BETWEEN ? AND ?
          GROUP BY PC.CODIGOEMPRESA, PC.CHAVELCTOFISENT, PC.CODIGOCFOP 
        ) P ON P.CODIGOEMPRESA = I.CODIGOEMPRESA 
          AND P.CHAVELCTOFISENT = I.CHAVELCTOFISENT
          AND P.CODIGOCFOP = I.CODIGOCFOP  

        WHERE C.CODIGOEMPRESA = ?
          AND COALESCE(C.DATALCTOFIS, C.DATAENTRADA) BETWEEN ? AND ?
        
        -- ← GROUP BY para consolidar múltiplas linhas do mesmo CFOP
        GROUP BY 
          C.CODIGOEMPRESA,
          I.CHAVELCTOFISENT,
          C.CODIGOPESSOA,
          C.NUMERONF,
          C.DATALCTOFIS,
          C.DATAENTRADA,
          C.VALORCONTABIL,
          I.CODIGOCFOP,
          C.VALORIPI,
          P.TOTAL_PIS_CFOP,
          P.TOTAL_COFINS_CFOP,
          R.VALORINSS,
          R.VALORISSQN,
          R.VALORIRPJ,
          R.VALORIRRF,
          R.TOTALPISCOFINSCSLL
        
        ORDER BY COALESCE(C.DATALCTOFIS, C.DATAENTRADA), C.NUMERONF, I.CODIGOCFOP
      `;
            const dadosBrutos = (await (0, questorConnection_1.executeQuery)(sql, [
                codigoEmpresa,
                dataInicio,
                dataFim,
                codigoEmpresa,
                dataInicio,
                dataFim,
            ]));
            return this.mapearLancamentos(dadosBrutos);
        }, `obter lançamentos fiscais da empresa ${codigoEmpresa}`);
    }
    /**
     * Mapeia dados brutos para o tipo LancamentoFiscalEntradaUnificado.
     */
    mapearLancamentos(dadosBrutos) {
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
