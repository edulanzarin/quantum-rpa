"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = void 0;
const _errors_1 = require("../errors");
/**
 * Gerenciador abstrato de conexão com retry automático.
 */
class DatabaseConnection {
    maxRetries = 3;
    retryDelay = 1000; // ms
    /**
     * Executa query com retry automático em caso de falha.
     */
    async executarComRetry(executor, operacao) {
        let ultimoErro;
        for (let tentativa = 1; tentativa <= this.maxRetries; tentativa++) {
            try {
                return await executor();
            }
            catch (error) {
                ultimoErro = error;
                if (tentativa < this.maxRetries) {
                    console.warn(`Tentativa ${tentativa}/${this.maxRetries} falhou para ${operacao}. Retentando...`);
                    await this.aguardar(this.retryDelay * tentativa);
                }
            }
        }
        throw new _errors_1.DatabaseError(`Falha ao ${operacao} após ${this.maxRetries} tentativas`, ultimoErro);
    }
    /**
     * Aguarda um tempo antes de retry.
     */
    aguardar(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.DatabaseConnection = DatabaseConnection;
