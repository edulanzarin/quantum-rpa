"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodificarTexto = void 0;
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const decodificarTexto = (valor) => {
    if (!valor)
        return "";
    if (Buffer.isBuffer(valor)) {
        return iconv_lite_1.default.decode(valor, "win1252");
    }
    return iconv_lite_1.default.decode(Buffer.from(String(valor), "binary"), "win1252");
};
exports.decodificarTexto = decodificarTexto;
