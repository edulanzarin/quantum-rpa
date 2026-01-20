import { NaturezaRepository } from "@repositories/NaturezaRepository";
import { BaseService } from "./BaseService";
import { validarNumeroPositivo } from "@utils/validation.utils";
import { ValidationError } from "@errors";

export class NaturezaService extends BaseService {
  constructor(private repository = new NaturezaRepository()) {
    super();
  }

  /**
   * Lista naturezas (CFOPs) com busca opcional.
   */
  async listar(codigoEmpresa: number, termo?: string) {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");

    this.log("listar", { codigoEmpresa, termo });

    return await this.repository.listarNaturezas(codigoEmpresa, termo);
  }

  /**
   * Busca uma CFOP específica pelo código.
   * Lança erro se não encontrada.
   */
  async buscarPeloCodigo(codigoEmpresa: number, cfop: number) {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarNumeroPositivo(cfop, "Código CFOP");

    const natureza = await this.repository.obterPorCodigo(codigoEmpresa, cfop);

    if (!natureza) {
      throw new ValidationError(
        `CFOP ${cfop} não encontrada para a empresa ${codigoEmpresa}`,
      );
    }

    return natureza;
  }
}
