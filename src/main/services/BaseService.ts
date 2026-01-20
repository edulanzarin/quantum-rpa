/**
 * Classe base para services com métodos utilitários comuns.
 */
export abstract class BaseService {
  /**
   * Log padronizado para operações de service.
   */
  protected log(operacao: string, dados?: any): void {
    console.log(`[${this.constructor.name}] ${operacao}`, dados || "");
  }

  /**
   * Log de erro padronizado.
   */
  protected logError(operacao: string, error: Error): void {
    console.error(`[${this.constructor.name}] Erro em ${operacao}:`, error);
  }
}
