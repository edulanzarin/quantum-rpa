/**
 * Estrutura padronizada de resposta da API.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * Helper para criar resposta de sucesso.
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper para criar resposta de erro.
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: any,
): ApiResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}
