import { type PlanoConta } from "@shared/types/PlanoConta";

export interface PlanoContaNode extends PlanoConta {
  nivel: number;
  pai?: PlanoContaNode;
  filhos: PlanoContaNode[];
}
