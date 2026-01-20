import { executeQuery } from "@database/questorConnection";
import type { PlanoConta } from "@shared/types/PlanoConta";
import { decodificarTexto } from "@utils/formatters";
import { BaseRepository } from "./BaseRepository";

export class PlanoContaRepository extends BaseRepository {
  /**
   * Obtém contas específicas da empresa (PLANOESPEC).
   */
  async obterPlanoEspecifico(codigoEmpresa: number): Promise<PlanoConta[]> {
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

      const dadosBrutos = (await executeQuery(sql, [codigoEmpresa])) as any[];

      return this.mapearContas(dadosBrutos);
    }, `obter plano específico da empresa ${codigoEmpresa}`);
  }

  /**
   * Obtém contas padrão do sistema (PLANOPADRAO).
   */
  async obterPlanoPadrao(): Promise<Omit<PlanoConta, "CODIGOEMPRESA">[]> {
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

      const dadosBrutos = (await executeQuery(sql, [])) as any[];

      return this.mapearContas(dadosBrutos);
    }, "obter plano padrão");
  }

  /**
   * Mapeia dados brutos do banco para o tipo PlanoConta.
   */
  private mapearContas(dadosBrutos: any[]): any[] {
    return dadosBrutos.map((row) => ({
      ...(row.CODIGOEMPRESA && { CODIGOEMPRESA: row.CODIGOEMPRESA }),
      CONTACTB: row.CONTACTB,
      TIPOCONTA: row.TIPOCONTA,
      CLASSIFCONTA: row.CLASSIFCONTA,
      DESCRCONTA: decodificarTexto(row.DESCRCONTA),
      APELIDOCONTA: row.APELIDOCONTA
        ? decodificarTexto(row.APELIDOCONTA)
        : undefined,
    }));
  }
}
