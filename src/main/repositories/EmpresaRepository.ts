import { executeQuery } from "@database/questorConnection";
import type { Empresa } from "@shared/types/Empresa";
import { decodificarTexto } from "@utils/formatters";
import { BaseRepository } from "./BaseRepository";

export class EmpresaRepository extends BaseRepository {
  /**
   * Obtém todas as empresas cadastradas.
   */
  async obterEmpresas(): Promise<Empresa[]> {
    return this.executarQuery(async () => {
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
    }, "obter empresas");
  }
}
