"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodificarTexto = void 0;
exports.formatarMoeda = formatarMoeda;
exports.formatarData = formatarData;
const iconv_lite_1 = __importDefault(require("iconv-lite"));
/**
 * Decodifica texto vindo do banco Firebird em formato OCTETS.
 * Converte de win1252 para UTF-8.
 */
const decodificarTexto = (valor) => {
    if (!valor)
        return "";
    if (Buffer.isBuffer(valor)) {
        return iconv_lite_1.default.decode(valor, "win1252");
    }
    return iconv_lite_1.default.decode(Buffer.from(String(valor), "binary"), "win1252");
};
exports.decodificarTexto = decodificarTexto;
/**
 * Formata número como moeda brasileira.
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valor);
}
/**
 * Formata data para padrão brasileiro.
 */
function formatarData(data) {
    return new Intl.DateTimeFormat("pt-BR").format(data);
}
