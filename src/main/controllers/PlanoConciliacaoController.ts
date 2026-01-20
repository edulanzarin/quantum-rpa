import { PlanoConciliacaoService } from "@services/PlanoConciliacaoService";
import { BaseController } from "./BaseController";
import type { PlanoConciliacao } from "@shared/types/PlanoConciliacao";

export class PlanoConciliacaoController extends BaseController {
  constructor(private service = new PlanoConciliacaoService()) {
    super();
  }

  registrarEventos(): void {
    this.registrarHandler("plano:listar", async () => {
      this.log("listar");
      return await this.service.listarTodosPlanos();
    });

    this.registrarHandler("plano:obterPorId", async (_event, id: number) => {
      this.log("obterPorId", { id });
      return await this.service.obterPlanoCompleto(id);
    });

    this.registrarHandler(
      "plano:salvar",
      async (_event, plano: PlanoConciliacao) => {
        this.log("salvar", { nome: plano.nome, itens: plano.itens?.length });
        return await this.service.salvarPlano(plano);
      },
    );
  }
}
