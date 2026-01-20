"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
/**
 * Classe base para services com métodos utilitários comuns.
 */
class BaseService {
    /**
     * Log padronizado para operações de service.
     */
    log(operacao, dados) {
        console.log(`[${this.constructor.name}] ${operacao}`, dados || "");
    }
    /**
     * Log de erro padronizado.
     */
    logError(operacao, error) {
        console.error(`[${this.constructor.name}] Erro em ${operacao}:`, error);
    }
}
exports.BaseService = BaseService;
