import { executeQuery } from "@database/questorConnection";
import type { LancamentoFiscalSaidaUnificado } from "@shared/types/LancamentoFiscalSaida";
import { BaseRepository } from "./BaseRepository";

export class LancamentoFiscalSaidaRepository extends BaseRepository {
  /**
   * Obtém itens fiscais de saída com dados da nota unificados.
   * Inclui valores de PIS/COFINS ESPECÍFICOS de cada CFOP.
   */
  async obterItensPorCfopComDadosDaNota(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<LancamentoFiscalSaidaUnificado[]> {
    return this.executarQuery(async () => {
      const sql = `
        SELECT
          C.CODIGOEMPRESA,
          I.CHAVELCTOFISSAI,
          C.CODIGOPESSOA,
          C.NUMERONF,
          
          C.DATALCTOFIS AS DATA_EFETIVA,
          
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

        FROM LCTOFISSAICFOP I
        
        INNER JOIN LCTOFISSAI C
          ON C.CODIGOEMPRESA = I.CODIGOEMPRESA
          AND C.CHAVELCTOFISSAI = I.CHAVELCTOFISSAI
        
        LEFT JOIN LCTOFISSAIRETIDO R
          ON R.CODIGOEMPRESA = C.CODIGOEMPRESA
          AND R.CHAVELCTOFISSAI = C.CHAVELCTOFISSAI

        LEFT JOIN (
          SELECT 
            PC.CODIGOEMPRESA, 
            PC.CHAVELCTOFISSAI, 
            PC.CODIGOCFOP, 
            SUM(PC.VALORPIS) AS TOTAL_PIS_CFOP, 
            SUM(PC.VALORCOFINS) AS TOTAL_COFINS_CFOP
          FROM LCTOFISSAIPISCOFINS PC
          INNER JOIN LCTOFISSAI C2
            ON C2.CODIGOEMPRESA = PC.CODIGOEMPRESA
            AND C2.CHAVELCTOFISSAI = PC.CHAVELCTOFISSAI
          WHERE C2.CODIGOEMPRESA = ?
            AND C2.DATALCTOFIS BETWEEN ? AND ?
          GROUP BY PC.CODIGOEMPRESA, PC.CHAVELCTOFISSAI, PC.CODIGOCFOP 
        ) P ON P.CODIGOEMPRESA = I.CODIGOEMPRESA 
          AND P.CHAVELCTOFISSAI = I.CHAVELCTOFISSAI
          AND P.CODIGOCFOP = I.CODIGOCFOP  

        WHERE C.CODIGOEMPRESA = ?
          AND C.DATALCTOFIS BETWEEN ? AND ?
        
        -- ← GROUP BY para consolidar múltiplas linhas do mesmo CFOP
        GROUP BY 
          C.CODIGOEMPRESA,
          I.CHAVELCTOFISSAI,
          C.CODIGOPESSOA,
          C.NUMERONF,
          C.DATALCTOFIS,
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
        
        ORDER BY C.DATALCTOFIS, C.NUMERONF, I.CODIGOCFOP
      `;

      const dadosBrutos = (await executeQuery(sql, [
        codigoEmpresa,
        dataInicio,
        dataFim,
        codigoEmpresa,
        dataInicio,
        dataFim,
      ])) as any[];

      return this.mapearLancamentos(dadosBrutos);
    }, `obter lançamentos fiscais de saída da empresa ${codigoEmpresa}`);
  }

  /**
   * Mapeia dados brutos para o tipo LancamentoFiscalSaidaUnificado.
   */
  private mapearLancamentos(
    dadosBrutos: any[],
  ): LancamentoFiscalSaidaUnificado[] {
    return dadosBrutos.map((row) => ({
      CODIGOEMPRESA: row.CODIGOEMPRESA,
      CHAVELCTOFISSAI: row.CHAVELCTOFISSAI,
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
