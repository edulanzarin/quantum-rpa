/**
 * Mapa de saldos por conta contábil.
 *
 * A chave é o CONTACTB.
 * O valor contém os totais acumulados de débito e crédito.
 */
export type MapaSaldoConta = Map<
  number,
  {
    debito: number;
    credito: number;
  }
>;
