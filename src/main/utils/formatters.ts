import iconv from "iconv-lite";

export const decodificarTexto = (valor: any): string => {
  if (!valor) return "";

  if (Buffer.isBuffer(valor)) {
    return iconv.decode(valor, "win1252");
  }

  return iconv.decode(Buffer.from(String(valor), "binary"), "win1252");
};
