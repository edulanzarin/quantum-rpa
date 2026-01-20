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
    termoBusca?: string,
  ): Promise<Natureza[]> {
    // ADICIONADO "DISTINCT" PARA REMOVER DUPLICADAS
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
      // Verifica se é número (busca exata ou inicio do código) ou texto
      const termoNumerico = parseInt(termoBusca);

      // Ajustei a lógica de busca para ser mais precisa
      sql += ` AND (CAST(CODIGOCFOP AS VARCHAR(10)) LIKE ? OR DESCRCFOP LIKE ?)`;
      params.push(`${termoBusca}%`); // Código começa com...
      params.push(`%${termoBusca}%`); // Descrição contém...
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
    codigoCfop: number,
  ): Promise<Natureza | null> {
    // ADICIONADO "DISTINCT" AQUI TAMBÉM POR SEGURANÇA
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

    return {
      CODIGOEMPRESA: dados[0].CODIGOEMPRESA,
      CODIGOCFOP: dados[0].CODIGOCFOP,
      DESCRCFOP: decodificarTexto(dados[0].DESCRCFOP),
    };
  }
}
