import { ValidationError } from "@errors/ValidationError";

/**
 * Valida se uma data é válida.
 */
export function validarData(data: any, nomeCampo: string): Date {
  const dataConvertida = new Date(data);

  if (isNaN(dataConvertida.getTime())) {
    throw new ValidationError(`${nomeCampo} inválida`);
  }

  return dataConvertida;
}

/**
 * Valida se um número é positivo.
 */
export function validarNumeroPositivo(valor: any, nomeCampo: string): number {
  const numero = Number(valor);

  if (isNaN(numero) || numero <= 0) {
    throw new ValidationError(`${nomeCampo} deve ser um número positivo`);
  }

  return numero;
}

/**
 * Valida intervalo de datas.
 */
export function validarIntervaloDatas(dataInicio: Date, dataFim: Date): void {
  if (dataInicio > dataFim) {
    throw new ValidationError(
      "Data de início não pode ser maior que data de fim",
    );
  }
}

/**
 * Valida se um valor não é nulo/undefined.
 */
export function validarObrigatorio<T>(
  valor: T | null | undefined,
  nomeCampo: string,
): T {
  if (valor === null || valor === undefined) {
    throw new ValidationError(`${nomeCampo} é obrigatório`);
  }

  return valor;
}
