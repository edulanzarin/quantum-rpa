import { executeQuery } from "@database/questorConnection";
import type { LancamentoContabil } from "@shared/types/LancamentoContabil";
import { BaseRepository } from "./BaseRepository";

export class LancamentoContabilRepository extends BaseRepository {
  /**
   * Obtém lançamentos contábeis por origem e período.
   */
  async obterLancamentosContabeisPorOrigem(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    origem: string,
  ): Promise<LancamentoContabil[]> {
    return this.executarQuery(async () => {
      const sql = `
        SELECT
          CODIGOEMPRESA,
          CHAVELCTOCTB,
          DATALCTOCTB,
          CODIGOORIGLCTOCTB,
          CONTACTBDEB,
          CONTACTBCRED,
          VALORLCTOCTB,
          CHAVEORIGEM,
          TRANSCTB
        FROM LCTOCTB
        WHERE CODIGOEMPRESA = ?
          AND DATALCTOCTB BETWEEN ? AND ?
          AND CODIGOORIGLCTOCTB = ?
        ORDER BY DATALCTOCTB, CHAVELCTOCTB
      `;

      const dadosBrutos = (await executeQuery(sql, [
        codigoEmpresa,
        dataInicio,
        dataFim,
        origem,
      ])) as any[];

      return dadosBrutos.map((row) => ({
        CODIGOEMPRESA: row.CODIGOEMPRESA,
        CHAVELCTOCTB: row.CHAVELCTOCTB,
        DATALCTOCTB: row.DATALCTOCTB,
        CODIGOORIGLCTOCTB: row.CODIGOORIGLCTOCTB,
        CONTACTBDEB: row.CONTACTBDEB,
        CONTACTBCRED: row.CONTACTBCRED,
        VALORLCTOCTB: row.VALORLCTOCTB,
        CHAVEORIGEM: row.CHAVEORIGEM,
        TRANSCTB: row.TRANSCTB,
      }));
    }, `obter lançamentos contábeis da empresa ${codigoEmpresa}`);
  }
}
