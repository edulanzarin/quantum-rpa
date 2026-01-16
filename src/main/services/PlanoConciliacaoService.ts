import { PlanoConciliacaoRepository } from "../repositories/PlanoConciliacaoRepository";
import type { PlanoConciliacao } from "@shared/types/PlanoConciliacao";

export class PlanoConciliacaoService {
  private repository = new PlanoConciliacaoRepository();

  /**
   * Salva um plano de conciliação.
   * * Lógica aplicada:
   * 1. Valida campos obrigatórios.
   * 2. Se for edição: Atualiza nome e REFAZ os itens (Delete + Insert).
   * 3. Se for criação: Gera o ID e insere os itens.
   */
  async salvarPlano(plano: PlanoConciliacao): Promise<number> {
    if (!plano.nome || plano.nome.trim() === "") {
      throw new Error("O nome do plano é obrigatório.");
    }

    if (!plano.itens || plano.itens.length === 0) {
      throw new Error("O plano precisa ter pelo menos um item configurado.");
    }

    let idPlano = plano.id;

    if (idPlano) {
      await this.repository.atualizarNomePlano(idPlano, plano.nome);

      await this.repository.excluirItensDoPlano(idPlano);
    } else {
      idPlano = await this.repository.criarPlano(plano.nome);
    }

    const promessasItens = plano.itens.map((item) => {
      return this.repository.adicionarItem({
        ...item,
        planoId: idPlano,
      });
    });

    await Promise.all(promessasItens);

    return idPlano!;
  }

  /**
   * Carrega o plano completo (Cabeçalho + Itens) para edição.
   * Útil para preencher o formulário quando o usuário clica em "Editar".
   */
  async obterPlanoCompleto(id: number): Promise<PlanoConciliacao | null> {
    const header = await this.repository.obterPlanoPorId(id);
    if (!header) return null;

    const itens = await this.repository.obterItensPorPlano(id);

    return {
      id: header.id,
      nome: header.nome_plano,
      ativo: header.ativo === 1,
      itens: itens,
    };
  }

  /**
   * Retorna apenas a lista de cabeçalhos dos planos.
   * Útil para listar em Grids ou Selects onde não precisamos dos detalhes dos itens.
   */
  async listarTodosPlanos() {
    return await this.repository.listarTodosPlanos();
  }
}
