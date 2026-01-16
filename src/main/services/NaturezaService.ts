import { NaturezaRepository } from "../repositories/NaturezaRepository";

export class NaturezaService {
  private repository = new NaturezaRepository();

  async listar(codigoEmpresa: number, termo?: string) {
    return await this.repository.listarNaturezas(codigoEmpresa, termo);
  }

  async buscarPeloCodigo(codigoEmpresa: number, cfop: number) {
    const natureza = await this.repository.obterPorCodigo(codigoEmpresa, cfop);
    if (!natureza) {
      throw new Error(
        `CFOP ${cfop} não encontrada na empresa ${codigoEmpresa}.`
      );
    }
    return natureza;
  }
}
