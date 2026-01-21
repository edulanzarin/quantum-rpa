"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutraOperacaoIcmsSCService = void 0;
const OutraOperacaoIcmsSCRepository_1 = require("../repositories/OutraOperacaoIcmsSCRepository");
const BaseService_1 = require("./BaseService");
const validation_utils_1 = require("../utils/validation.utils");
class OutraOperacaoIcmsSCService extends BaseService_1.BaseService {
    repository;
    constructor(repository = new OutraOperacaoIcmsSCRepository_1.OutraOperacaoIcmsSCRepository()) {
        super();
        this.repository = repository;
    }
    /**
     * Busca o total de DCIP (Dedução de Crédito do Imposto Próprio) do período.
     * Código 770 = DCIP do ICMS
     */
    async buscarDCIP(codigoEmpresa, dataInicio, dataFim) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("buscarDCIP", {
            codigoEmpresa,
            periodo: `${dataInicio.toISOString()} até ${dataFim.toISOString()}`,
        });
        const totalDCIP = await this.repository.buscarDCIP(codigoEmpresa, dataInicio, dataFim);
        this.log(`DCIP encontrado: R$ ${totalDCIP.toFixed(2)}`);
        return totalDCIP;
    }
}
exports.OutraOperacaoIcmsSCService = OutraOperacaoIcmsSCService;
