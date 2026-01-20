import { EmpresaRepository } from "@repositories/EmpresaRepository";
import type { Empresa } from "@shared/types/Empresa";
import { BaseService } from "./BaseService";

export class EmpresaService extends BaseService {
  constructor(private repository = new EmpresaRepository()) {
    super();
  }

  /**
   * Obtém todas as empresas cadastradas no sistema.
   */
  async obterTodasEmpresas(): Promise<Empresa[]> {
    this.log("obterTodasEmpresas");
    return await this.repository.obterEmpresas();
  }
}
