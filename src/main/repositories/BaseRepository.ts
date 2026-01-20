import { DatabaseError } from "@errors";

/**
 * Classe base para repositories com tratamento de erro padronizado.
 */
export abstract class BaseRepository {
  /**
   * Executa uma query com tratamento de erro padronizado.
   *
   * @param executor - Função que executa a query
   * @param operacao - Descrição da operação para logs
   * @returns Resultado da query
   */
  protected async executarQuery<T>(
    executor: () => Promise<T>,
    operacao: string,
  ): Promise<T> {
    try {
      return await executor();
    } catch (error) {
      console.error(`Erro ao ${operacao}:`, error);
      throw new DatabaseError(
        `Falha ao ${operacao}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Log padronizado para repositories.
   */
  protected log(operacao: string, dados?: any): void {
    console.log(`[${this.constructor.name}] ${operacao}`, dados || "");
  }
}
