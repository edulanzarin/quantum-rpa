import { executeQuery } from "@database/questorConnection";
import { BaseRepository } from "./BaseRepository";

export interface OutraOperacaoIcmsSC {
  CODIGOEMPRESA: number;
  DATALCTOFIS: Date;
  VALOROUTRAOPERACAOFIS: number;
}

export class OutraOperacaoIcmsSCRepository extends BaseRepository {
  /**
   * Busca o total de DCIP (Código 770) do período.
   * DCIP = Dedução de Crédito do Imposto Próprio
   */
  async buscarDCIP(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<number> {
    return this.executarQuery(async () => {
      const sql = `
        SELECT 
          COALESCE(SUM(VALOROUTRAOPERACAOFIS), 0) AS TOTAL_DCIP
        FROM OUTRAOPERACAOICMSSC
        WHERE CODIGOEMPRESA = ?
          AND DATALCTOFIS BETWEEN ? AND ?
          AND CODIGOOPERACAOFIS = 770
      `;

      const resultado = (await executeQuery(sql, [
        codigoEmpresa,
        dataInicio,
        dataFim,
      ])) as any[];

      return Number(resultado[0]?.TOTAL_DCIP || 0);
    }, `buscar DCIP da empresa ${codigoEmpresa}`);
  }
}
