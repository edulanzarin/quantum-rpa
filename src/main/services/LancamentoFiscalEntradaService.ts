import { LancamentoFiscalEntradaRepository } from "@repositories/LancamentoFiscalEntradaRepository";
import type { LancamentoFiscalEntradaUnificado } from "@shared/types/LancamentoFiscalEntrada";

export class LancamentoFiscalEntradaService {
  private repository: LancamentoFiscalEntradaRepository;

  constructor() {
    this.repository = new LancamentoFiscalEntradaRepository();
  }

  /**
   * Busca os lançamentos fiscais de entrada e seus respectivos CFOPs.
   * Retorna uma lista unificada onde os dados da nota se repetem para cada CFOP.
   */
  async buscarLancamentosFiscais(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<LancamentoFiscalEntradaUnificado[]> {
    console.log(
      `[Fiscal] Buscando notas de entrada entre ${dataInicio.toISOString()} e ${dataFim.toISOString()}...`,
    );

    const lancamentos = await this.repository.obterItensPorCfopComDadosDaNota(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );

    console.log(`[Fiscal] ${lancamentos.length} itens (CFOPs) encontrados.`);

    return lancamentos;
  }
}
