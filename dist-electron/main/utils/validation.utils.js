"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarData = validarData;
exports.validarNumeroPositivo = validarNumeroPositivo;
exports.validarIntervaloDatas = validarIntervaloDatas;
exports.validarObrigatorio = validarObrigatorio;
const ValidationError_1 = require("../errors/ValidationError");
/**
 * Valida se uma data é válida.
 */
function validarData(data, nomeCampo) {
    const dataConvertida = new Date(data);
    if (isNaN(dataConvertida.getTime())) {
        throw new ValidationError_1.ValidationError(`${nomeCampo} inválida`);
    }
    return dataConvertida;
}
/**
 * Valida se um número é positivo.
 */
function validarNumeroPositivo(valor, nomeCampo) {
    const numero = Number(valor);
    if (isNaN(numero) || numero <= 0) {
        throw new ValidationError_1.ValidationError(`${nomeCampo} deve ser um número positivo`);
    }
    return numero;
}
/**
 * Valida intervalo de datas.
 */
function validarIntervaloDatas(dataInicio, dataFim) {
    if (dataInicio > dataFim) {
        throw new ValidationError_1.ValidationError("Data de início não pode ser maior que data de fim");
    }
}
/**
 * Valida se um valor não é nulo/undefined.
 */
function validarObrigatorio(valor, nomeCampo) {
    if (valor === null || valor === undefined) {
        throw new ValidationError_1.ValidationError(`${nomeCampo} é obrigatório`);
    }
    return valor;
}
