import { executeQuery } from "../database/questorConnection";
import { decodificarTexto } from "../utils/formatters";
import { Natureza } from "@shared/types/Natureza";

export class NaturezaRepository {
  /**
   * Lista todas as CFOPs de uma empresa (ou geral).
   * Se passar termoBusca, filtra por código ou descrição.
   */
  async listarNaturezas(
    codigoEmpresa: number,
    termoBusca?: string
  ): Promise<Natureza[]> {
    let sql = `
      SELECT
        CODIGOEMPRESA,
        CODIGOCFOP,
        CAST(DESCRCFOP AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCFOP
      FROM CFOP
      WHERE CODIGOEMPRESA = ?
    `;

    const params: any[] = [codigoEmpresa];

    if (termoBusca) {
      sql += ` AND (CAST(CODIGOCFOP AS VARCHAR(10)) LIKE ? OR DESCRCFOP LIKE ?)`;
      params.push(`%${termoBusca}%`);
      params.push(`%${termoBusca}%`);
    }

    sql += ` ORDER BY CODIGOCFOP`;

    const dadosBrutos = (await executeQuery(sql, params)) as any[];

    return dadosBrutos.map((row) => ({
      CODIGOEMPRESA: row.CODIGOEMPRESA,
      CODIGOCFOP: row.CODIGOCFOP,
      DESCRCFOP: decodificarTexto(row.DESCRCFOP),
    }));
  }

  /**
   * Busca uma única CFOP pelo código (útil para validar se o usuário digitar manual)
   */
  async obterPorCodigo(
    codigoEmpresa: number,
    codigoCfop: number
  ): Promise<Natureza | null> {
    const sql = `
      SELECT
        CODIGOEMPRESA,
        CODIGOCFOP,
        CAST(DESCRCFOP AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCFOP
      FROM CFOP
      WHERE CODIGOEMPRESA = ? AND CODIGOCFOP = ?
    `;

    const dados = (await executeQuery(sql, [
      codigoEmpresa,
      codigoCfop,
    ])) as any[];

    if (dados.length === 0) return null;

    return {
      CODIGOEMPRESA: dados[0].CODIGOEMPRESA,
      CODIGOCFOP: dados[0].CODIGOCFOP,
      DESCRCFOP: decodificarTexto(dados[0].DESCRCFOP),
    };
  }
}
