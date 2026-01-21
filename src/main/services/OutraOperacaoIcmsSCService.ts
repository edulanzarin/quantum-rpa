import { OutraOperacaoIcmsSCRepository } from "@repositories/OutraOperacaoIcmsSCRepository";
import { BaseService } from "./BaseService";
import {
  validarNumeroPositivo,
  validarIntervaloDatas,
} from "@utils/validation.utils";

export class OutraOperacaoIcmsSCService extends BaseService {
  constructor(private repository = new OutraOperacaoIcmsSCRepository()) {
    super();
  }

  /**
   * Busca o total de DCIP (Dedução de Crédito do Imposto Próprio) do período.
   * Código 770 = DCIP do ICMS
   */
  async buscarDCIP(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<number> {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");
    validarIntervaloDatas(dataInicio, dataFim);

    this.log("buscarDCIP", {
      codigoEmpresa,
      periodo: `${dataInicio.toISOString()} até ${dataFim.toISOString()}`,
    });

    const totalDCIP = await this.repository.buscarDCIP(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );

    this.log(`DCIP encontrado: R$ ${totalDCIP.toFixed(2)}`);

    return totalDCIP;
  }
}
