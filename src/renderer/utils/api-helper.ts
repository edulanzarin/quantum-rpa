import type { ApiResponse } from "@shared/types/api-response";

/**
 * Desempacota resposta da API com tratamento de erro.
 * Lança exception se houver erro na resposta.
 *
 * @param promise - Promise que retorna ApiResponse
 * @returns Dados desempacotados
 * @throws Error se response.success for false
 */
export async function unwrap<T>(promise: Promise<ApiResponse<T>>): Promise<T> {
  const response = await promise;

  if (
    !response.success ||
    response.data === undefined ||
    response.data === null
  ) {
    const errorMsg = response.error?.message || "Erro desconhecido na API";
    throw new Error(errorMsg);
  }

  return response.data;
}

/**
 * Versão síncrona do unwrap para quando já tem a response.
 */
export function unwrapSync<T>(response: ApiResponse<T>): T {
  if (
    !response.success ||
    response.data === undefined ||
    response.data === null
  ) {
    const errorMsg = response.error?.message || "Erro desconhecido na API";
    throw new Error(errorMsg);
  }

  return response.data;
}
