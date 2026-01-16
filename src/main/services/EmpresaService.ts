import { EmpresaRepository } from "@repositories/EmpresaRepository";
import type { Empresa } from "@shared/types/Empresa";

export class EmpresaService {
  private repository: EmpresaRepository;

  constructor() {
    this.repository = new EmpresaRepository();
  }

  async obterTodasEmpresas(): Promise<Empresa[]> {
    return this.repository.obterEmpresas();
  }
}
