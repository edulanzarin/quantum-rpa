// @services/DemaisDocumentosFiscalService.ts

import { DemaisDocumentosFiscalRepository } from "@repositories/DemaisDocumentosFiscalRepository";
import type { DemaisDocumentosFiscal } from "@shared/types/DemaisDocumentosFiscal";
import { BaseService } from "./BaseService";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";

export class DemaisDocumentosFiscalService extends BaseService {
  constructor(
    private demaisDocumentosRepo = new DemaisDocumentosFiscalRepository(),
  ) {
    super();
  }

  /**
   * Busca valores de PIS/COFINS de demais documentos.
   */
  async buscarPisCofinsDemaisDocumentosFiscal(
    // ← CORRIGIDO
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<DemaisDocumentosFiscal[]> {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarIntervaloDatas(dataInicio, dataFim);

    this.log("buscarPisCofinsDemaisDocumentosFiscal", {
      codigoEmpresa,
      dataInicio,
      dataFim,
    });

    return this.demaisDocumentosRepo.obterPisCofinsPorConta(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );
  }
}
