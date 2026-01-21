import { executeQuery } from "@database/questorConnection";
import type { DemaisDocumentosFiscal } from "@shared/types/DemaisDocumentosFiscal";
import { BaseRepository } from "./BaseRepository";

export class DemaisDocumentosFiscalRepository extends BaseRepository {
  /**
   * Obtém valores de PIS/COFINS da tabela EFDF100DEMAISDOC.
   * Retorna dados agregados por conta contábil (CONTACTB).
   */
  async obterPisCofinsPorConta(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<DemaisDocumentosFiscal[]> {
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

      const dadosBrutos = (await executeQuery(sql, [
        codigoEmpresa,
        dataInicio,
        dataFim,
      ])) as any[];

      return this.mapearDemaisDocumentos(dadosBrutos);
    }, `obter PIS/COFINS de demais documentos da empresa ${codigoEmpresa}`);
  }

  /**
   * Mapeia dados brutos para o tipo DemaisDocumentosFiscal.
   */
  private mapearDemaisDocumentos(dadosBrutos: any[]): DemaisDocumentosFiscal[] {
    return dadosBrutos.map((row) => ({
      CODIGOEMPRESA: row.CODIGOEMPRESA,
      CONTACTB: Number(row.CONTACTB),
      VALORPIS: Number(row.VALORPIS || 0),
      VALORCOFINS: Number(row.VALORCOFINS || 0),
    }));
  }
}
