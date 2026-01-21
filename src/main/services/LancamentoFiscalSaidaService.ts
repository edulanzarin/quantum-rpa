import { LancamentoFiscalSaidaRepository } from "@repositories/LancamentoFiscalSaidaRepository";
import type { LancamentoFiscalSaidaUnificado } from "@shared/types/LancamentoFiscalSaida";
import { BaseService } from "./BaseService";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";

export class LancamentoFiscalSaidaService extends BaseService {
  constructor(private repository = new LancamentoFiscalSaidaRepository()) {
    super();
  }

  /**
   * Busca lançamentos fiscais de saída com dados unificados da nota.
   * Retorna lista onde cada item representa um CFOP da nota.
   */
  async buscarLancamentosFiscais(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<LancamentoFiscalSaidaUnificado[]> {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarIntervaloDatas(dataInicio, dataFim);

    this.log("buscarLancamentosFiscais [SAÍDA]", {
      codigoEmpresa,
      periodo: `${dataInicio.toISOString()} até ${dataFim.toISOString()}`,
    });

    const lancamentos = await this.repository.obterItensPorCfopComDadosDaNota(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );

    this.log(`${lancamentos.length} itens fiscais de saída encontrados`);

    return lancamentos;
  }
}
