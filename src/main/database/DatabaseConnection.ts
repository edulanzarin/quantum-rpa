import { DatabaseError } from "@errors";

/**
 * Interface para gerenciadores de conexão de banco.
 */
export interface IDatabaseConnection {
  testarConexao(): Promise<boolean>;
  executarQuery(sql: string, params?: any[]): Promise<any>;
  fecharConexao?(): Promise<void>;
}

/**
 * Gerenciador abstrato de conexão com retry automático.
 */
export abstract class DatabaseConnection implements IDatabaseConnection {
  protected maxRetries: number = 3;
  protected retryDelay: number = 1000; // ms

  abstract testarConexao(): Promise<boolean>;
  abstract executarQuery(sql: string, params?: any[]): Promise<any>;

  /**
   * Executa query com retry automático em caso de falha.
   */
  protected async executarComRetry<T>(
    executor: () => Promise<T>,
    operacao: string,
  ): Promise<T> {
    let ultimoErro: Error | undefined;

    for (let tentativa = 1; tentativa <= this.maxRetries; tentativa++) {
      try {
        return await executor();
      } catch (error) {
        ultimoErro = error as Error;

        if (tentativa < this.maxRetries) {
          console.warn(
            `Tentativa ${tentativa}/${this.maxRetries} falhou para ${operacao}. Retentando...`,
          );
          await this.aguardar(this.retryDelay * tentativa);
        }
      }
    }

    throw new DatabaseError(
      `Falha ao ${operacao} após ${this.maxRetries} tentativas`,
      ultimoErro,
    );
  }

  /**
   * Aguarda um tempo antes de retry.
   */
  private aguardar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
