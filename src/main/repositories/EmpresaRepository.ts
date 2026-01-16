import { executeQuery } from "@database/questorConnection";
import type { Empresa } from "@shared/types/Empresa";
import { decodificarTexto } from "@utils/formatters";

export class EmpresaRepository {
  async obterEmpresas(): Promise<Empresa[]> {
    const sql = `
      SELECT 
        CODIGOEMPRESA as CODIGO, 
        CAST(NOMEEMPRESA AS VARCHAR(200) CHARACTER SET OCTETS) as NOME 
      FROM EMPRESA
      ORDER BY CODIGOEMPRESA
    `;

    const dadosBrutos = (await executeQuery(sql)) as any[];

    return dadosBrutos.map((empresa) => ({
      CODIGO: empresa.CODIGO,
      NOME: decodificarTexto(empresa.NOME),
    }));
  }
}
