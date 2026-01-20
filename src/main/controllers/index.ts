import { BalanceteContabilController } from "./BalanceteContabilController";
import { BalanceteFiscalController } from "./BalanceteFiscalController";
import { EmpresaController } from "./EmpresaController";
import { PlanoConciliacaoController } from "./PlanoConciliacaoController";
import { NaturezaController } from "./NaturezaController";

export const registrarTodosEventos = () => {
  new EmpresaController().registrarEventos();
  new BalanceteContabilController().registrarEventos();
  new BalanceteFiscalController().registrarEventos();
  new PlanoConciliacaoController().registrarEventos();
  new NaturezaController().registrarEventos();
};
