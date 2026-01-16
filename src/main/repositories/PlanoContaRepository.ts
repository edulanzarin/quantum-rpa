import { executeQuery } from "@database/questorConnection";
import type { PlanoConta } from "@shared/types/PlanoConta";
import { decodificarTexto } from "@utils/formatters";

export class PlanoContaRepository {
  /**
   * Obtém as contas específicas da empresa (PLANOESPEC).
   * Estas são contas personalizadas/customizadas.
   */
  async obterPlanoEspecifico(codigoEmpresa: number): Promise<PlanoConta[]> {
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

    return dadosBrutos.map((row) => ({
      CODIGOEMPRESA: row.CODIGOEMPRESA,
      CONTACTB: row.CONTACTB,
      TIPOCONTA: row.TIPOCONTA,
      CLASSIFCONTA: row.CLASSIFCONTA,
      DESCRCONTA: decodificarTexto(row.DESCRCONTA),
      APELIDOCONTA: row.APELIDOCONTA
        ? decodificarTexto(row.APELIDOCONTA)
        : undefined,
    }));
  }

  /**
   * Obtém as contas padrão do sistema (PLANOPADRAO).
   * Estas são as contas padrão que todas as empresas têm.
   */
  async obterPlanoPadrao(): Promise<Omit<PlanoConta, "CODIGOEMPRESA">[]> {
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

    return dadosBrutos.map((row) => ({
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
