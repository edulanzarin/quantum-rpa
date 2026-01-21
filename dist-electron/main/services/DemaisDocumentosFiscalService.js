"use strict";
// @services/DemaisDocumentosFiscalService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemaisDocumentosFiscalService = void 0;
const DemaisDocumentosFiscalRepository_1 = require("../repositories/DemaisDocumentosFiscalRepository");
const BaseService_1 = require("./BaseService");
const validation_utils_1 = require("../utils/validation.utils");
class DemaisDocumentosFiscalService extends BaseService_1.BaseService {
    demaisDocumentosRepo;
    constructor(demaisDocumentosRepo = new DemaisDocumentosFiscalRepository_1.DemaisDocumentosFiscalRepository()) {
        super();
        this.demaisDocumentosRepo = demaisDocumentosRepo;
    }
    /**
     * Busca valores de PIS/COFINS de demais documentos.
     */
    async buscarPisCofinsDemaisDocumentosFiscal(
    // ← CORRIGIDO
    codigoEmpresa, dataInicio, dataFim) {
        (0, validation_utils_1.validarNumeroPositivo)(codigoEmpresa, "Código da empresa");
        (0, validation_utils_1.validarIntervaloDatas)(dataInicio, dataFim);
        this.log("buscarPisCofinsDemaisDocumentosFiscal", {
            codigoEmpresa,
            dataInicio,
            dataFim,
        });
        return this.demaisDocumentosRepo.obterPisCofinsPorConta(codigoEmpresa, dataInicio, dataFim);
    }
}
exports.DemaisDocumentosFiscalService = DemaisDocumentosFiscalService;
