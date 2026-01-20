import { EmpresaController } from "./EmpresaController";
import { BalanceteContabilController } from "./BalanceteContabilController";
import { BalanceteFiscalController } from "./BalanceteFiscalController";
import { PlanoConciliacaoController } from "./PlanoConciliacaoController";
import { NaturezaController } from "./NaturezaController";

/**
 * Registra todos os controllers da aplicação.
 * Centraliza a inicialização dos event handlers IPC.
 */
export const registrarTodosEventos = (): void => {
  console.log("🚀 Registrando controllers...");

  const controllers = [
    new EmpresaController(),
    new BalanceteContabilController(),
    new BalanceteFiscalController(),
    new PlanoConciliacaoController(),
    new NaturezaController(),
  ];

  controllers.forEach((controller) => {
    controller.registrarEventos();
  });

  console.log(`✅ ${controllers.length} controllers registrados com sucesso`);
};
