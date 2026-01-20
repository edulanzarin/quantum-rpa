import { PlanoConciliacaoRepository } from "@repositories/PlanoConciliacaoRepository";
import type { PlanoConciliacao } from "@shared/types/PlanoConciliacao";
import { BaseService } from "./BaseService";
import { ValidationError } from "@errors";

export class PlanoConciliacaoService extends BaseService {
  constructor(private repository = new PlanoConciliacaoRepository()) {
    super();
  }

  /**
   * Salva um plano de conciliação (criação ou atualização).
   *
   * Fluxo:
   * 1. Valida dados obrigatórios
   * 2. Se for edição: atualiza nome e refaz itens
   * 3. Se for criação: cria novo plano e insere itens
   */
  async salvarPlano(plano: PlanoConciliacao): Promise<number> {
    this.validarPlano(plano);

    this.log("salvarPlano", {
      id: plano.id,
      nome: plano.nome,
      qtdItens: plano.itens?.length,
    });

    let idPlano = plano.id;

    if (idPlano) {
      // Atualização
      await this.repository.atualizarNomePlano(idPlano, plano.nome);
      await this.repository.excluirItensDoPlano(idPlano);
    } else {
      // Criação
      idPlano = await this.repository.criarPlano(plano.nome);
    }

    // Insere todos os itens
    await this.salvarItens(idPlano, plano.itens!);

    this.log(`Plano ${idPlano} salvo com sucesso`);

    return idPlano;
  }

  /**
   * Obtém plano completo com todos os itens.
   */
  async obterPlanoCompleto(id: number): Promise<PlanoConciliacao | null> {
    const header = await this.repository.obterPlanoPorId(id);

    if (!header) {
      return null;
    }

    const itens = await this.repository.obterItensPorPlano(id);

    return {
      id: header.id,
      nome: header.nome_plano,
      ativo: header.ativo === 1,
      itens,
    };
  }

  /**
   * Lista todos os planos (apenas cabeçalhos).
   */
  async listarTodosPlanos() {
    return await this.repository.listarTodosPlanos();
  }

  /**
   * Valida dados do plano antes de salvar.
   */
  private validarPlano(plano: PlanoConciliacao): void {
    if (!plano.nome || plano.nome.trim() === "") {
      throw new ValidationError("O nome do plano é obrigatório");
    }

    if (!plano.itens || plano.itens.length === 0) {
      throw new ValidationError(
        "O plano precisa ter pelo menos um item configurado",
      );
    }
  }

  /**
   * Salva todos os itens de um plano em paralelo.
   */
  private async salvarItens(planoId: number, itens: any[]): Promise<void> {
    const promessas = itens.map((item) =>
      this.repository.adicionarItem({
        ...item,
        planoId,
      }),
    );

    await Promise.all(promessas);
  }
}
