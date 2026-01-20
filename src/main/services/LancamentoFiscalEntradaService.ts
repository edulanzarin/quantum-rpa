import { LancamentoFiscalEntradaRepository } from "@repositories/LancamentoFiscalEntradaRepository";
import type { LancamentoFiscalEntradaUnificado } from "@shared/types/LancamentoFiscalEntrada";
import { BaseService } from "./BaseService";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";

export class LancamentoFiscalEntradaService extends BaseService {
  constructor(private repository = new LancamentoFiscalEntradaRepository()) {
    super();
  }

  /**
   * Busca lançamentos fiscais de entrada com dados unificados da nota.
   * Retorna lista onde cada item representa um CFOP da nota.
   */
  async buscarLancamentosFiscais(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<LancamentoFiscalEntradaUnificado[]> {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarIntervaloDatas(dataInicio, dataFim);

    this.log("buscarLancamentosFiscais", {
      codigoEmpresa,
      periodo: `${dataInicio.toISOString()} até ${dataFim.toISOString()}`,
    });

    const lancamentos = await this.repository.obterItensPorCfopComDadosDaNota(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );

    this.log(`${lancamentos.length} itens fiscais encontrados`);

    return lancamentos;
  }
}
