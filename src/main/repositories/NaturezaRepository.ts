import { executeQuery } from "@database/questorConnection";
import { decodificarTexto } from "@utils/formatters";
import type { Natureza } from "@shared/types/Natureza";
import { BaseRepository } from "./BaseRepository";

export class NaturezaRepository extends BaseRepository {
  /**
   * Lista CFOPs com filtro opcional por termo de busca.
   * Usa DISTINCT para evitar duplicatas.
   */
  async listarNaturezas(
    codigoEmpresa: number,
    termoBusca?: string,
  ): Promise<Natureza[]> {
    return this.executarQuery(async () => {
      let sql = `
        SELECT DISTINCT
          CODIGOEMPRESA,
          CODIGOCFOP,
          CAST(DESCRCFOP AS VARCHAR(200) CHARACTER SET OCTETS) as DESCRCFOP
        FROM CFOP
        WHERE CODIGOEMPRESA = ?
      `;

      const params: any[] = [codigoEmpresa];

      if (termoBusca) {
        sql += ` AND (CAST(CODIGOCFOP AS VARCHAR(10)) LIKE ? OR DESCRCFOP LIKE ?)`;
        params.push(`${termoBusca}%`, `%${termoBusca}%`);
      }

      sql += ` ORDER BY CODIGOCFOP`;

      const dadosBrutos = (await executeQuery(sql, params)) as any[];

      return this.mapearNaturezas(dadosBrutos);
    }, "listar naturezas");
  }

  /**
   * Busca CFOP específica por código.
   */
  async obterPorCodigo(
    codigoEmpresa: number,
    codigoCfop: number,
  ): Promise<Natureza | null> {
    return this.executarQuery(async () => {
      const sql = `
        SELECT DISTINCT
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

      const naturezas = this.mapearNaturezas(dados);
      return naturezas[0];
    }, `buscar CFOP ${codigoCfop}`);
  }

  /**
   * Mapeia dados brutos para o tipo Natureza.
   */
  private mapearNaturezas(dadosBrutos: any[]): Natureza[] {
    return dadosBrutos.map((row) => ({
      CODIGOEMPRESA: row.CODIGOEMPRESA,
      CODIGOCFOP: row.CODIGOCFOP,
      DESCRCFOP: decodificarTexto(row.DESCRCFOP),
    }));
  }
}
