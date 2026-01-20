"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const _errors_1 = require("../errors");
/**
 * Classe base para repositories com tratamento de erro padronizado.
 */
class BaseRepository {
    /**
     * Executa uma query com tratamento de erro padronizado.
     *
     * @param executor - Função que executa a query
     * @param operacao - Descrição da operação para logs
     * @returns Resultado da query
     */
    async executarQuery(executor, operacao) {
        try {
            return await executor();
        }
        catch (error) {
            console.error(`Erro ao ${operacao}:`, error);
            throw new _errors_1.DatabaseError(`Falha ao ${operacao}`, error instanceof Error ? error : undefined);
        }
    }
    /**
     * Log padronizado para repositories.
     */
    log(operacao, dados) {
        console.log(`[${this.constructor.name}] ${operacao}`, dados || "");
    }
}
exports.BaseRepository = BaseRepository;
