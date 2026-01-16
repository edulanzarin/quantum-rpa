import type { ItemPlanoConciliacao } from "./ItemPlanoConciliacao";

export interface PlanoConciliacao {
  id?: number;
  nome: string;
  ativo: boolean;
  itens?: ItemPlanoConciliacao[];
}
