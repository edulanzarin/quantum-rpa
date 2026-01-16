export interface ItemPlanoConciliacao {
  id?: number;
  planoId?: number;
  cfop: number;
  descricao: string;
  contasDebito: number[];
  contasCredito: number[];
  contabiliza: boolean;
}
