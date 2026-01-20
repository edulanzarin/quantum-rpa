import iconv from "iconv-lite";

/**
 * Decodifica texto vindo do banco Firebird em formato OCTETS.
 * Converte de win1252 para UTF-8.
 */
export const decodificarTexto = (valor: any): string => {
  if (!valor) return "";

  if (Buffer.isBuffer(valor)) {
    return iconv.decode(valor, "win1252");
  }

  return iconv.decode(Buffer.from(String(valor), "binary"), "win1252");
};

/**
 * Formata número como moeda brasileira.
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/**
 * Formata data para padrão brasileiro.
 */
export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}
