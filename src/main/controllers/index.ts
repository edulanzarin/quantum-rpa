import { BalanceteController } from "./BalanceteController";
import { EmpresaController } from "./EmpresaController";
import { PlanoConciliacaoController } from "./PlanoConciliacaoController";
import { NaturezaController } from "./NaturezaController";

export const registrarTodosEventos = () => {
  new EmpresaController().registrarEventos();
  new BalanceteController().registrarEventos();
  new PlanoConciliacaoController().registrarEventos();
  new NaturezaController().registrarEventos();
};
