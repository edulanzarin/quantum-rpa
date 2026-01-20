import { PlanoContaRepository } from "@repositories/PlanoContaRepository";
import type { PlanoConta } from "@shared/types/PlanoConta";
import type { PlanoContaNode } from "@shared/types/PlanoContaNode";
import {
  compararClassificacao,
  calcularNivel,
} from "@utils/contabilidade.utils";
import { BaseService } from "./BaseService";
import { validarNumeroPositivo } from "@utils/validation.utils";

export class PlanoContaService extends BaseService {
  constructor(private repository = new PlanoContaRepository()) {
    super();
  }

  /**
   * Obtém o plano de contas processado de uma empresa.
   *
   * Mescla PLANOPADRAO (sistema) com PLANOESPEC (específicas),
   * prevalecendo as específicas em caso de conflito.
   */
  async obterPlanoProcessado(codigoEmpresa: number): Promise<PlanoContaNode[]> {
    validarNumeroPositivo(codigoEmpresa, "Código da empresa");

    this.log("obterPlanoProcessado", { codigoEmpresa });

    const [contasPadrao, contasEspecificas] = await Promise.all([
      this.repository.obterPlanoPadrao(),
      this.repository.obterPlanoEspecifico(codigoEmpresa),
    ]);

    const contasMescladas = this.mesclarContas(
      contasPadrao,
      contasEspecificas,
      codigoEmpresa,
    );

    return this.montarArvore(contasMescladas);
  }

  /**
   * Mescla contas padrão com específicas.
   * Contas específicas sobrescrevem as padrão (mesmo CONTACTB).
   */
  private mesclarContas(
    contasPadrao: Omit<PlanoConta, "CODIGOEMPRESA">[],
    contasEspecificas: PlanoConta[],
    codigoEmpresa: number,
  ): PlanoConta[] {
    const mapa = new Map<number, PlanoConta>();

    for (const conta of contasPadrao) {
      mapa.set(conta.CONTACTB, {
        ...conta,
        CODIGOEMPRESA: codigoEmpresa,
      });
    }

    for (const conta of contasEspecificas) {
      mapa.set(conta.CONTACTB, conta);
    }

    const resultado = Array.from(mapa.values());
    resultado.sort((a, b) =>
      compararClassificacao(a.CLASSIFCONTA, b.CLASSIFCONTA),
    );

    return resultado;
  }

  /**
   * Constrói árvore hierárquica do plano de contas.
   *
   * Utiliza CONTACTB como chave única (múltiplas contas podem ter mesma CLASSIFCONTA).
   * Busca ancestral mais próximo existente na hierarquia.
   */
  private montarArvore(contas: PlanoConta[]): PlanoContaNode[] {
    const mapaPorContactb = new Map<number, PlanoContaNode>();
    const mapaPorClassif = new Map<string, PlanoContaNode[]>();
    const raizes: PlanoContaNode[] = [];

    for (const conta of contas) {
      const node: PlanoContaNode = {
        ...conta,
        nivel: calcularNivel(conta.CLASSIFCONTA),
        filhos: [],
      };

      mapaPorContactb.set(conta.CONTACTB, node);

      const lista = mapaPorClassif.get(conta.CLASSIFCONTA) || [];
      lista.push(node);
      mapaPorClassif.set(conta.CLASSIFCONTA, lista);
    }

    for (const node of mapaPorContactb.values()) {
      const partes = node.CLASSIFCONTA.split(".");

      if (partes.length === 1) {
        raizes.push(node);
        continue;
      }

      const pai = this.buscarPaiMaisProximo(partes, mapaPorClassif);

      if (pai) {
        node.pai = pai;
        pai.filhos.push(node);
      } else {
        raizes.push(node);
      }
    }

    return raizes;
  }

  /**
   * Busca o pai mais próximo na hierarquia.
   * Tenta classificações progressivamente mais curtas até encontrar.
   */
  private buscarPaiMaisProximo(
    partes: string[],
    mapaPorClassif: Map<string, PlanoContaNode[]>,
  ): PlanoContaNode | undefined {
    for (let i = partes.length - 1; i > 0; i--) {
      const classifPai = partes.slice(0, i).join(".");
      const candidatos = mapaPorClassif.get(classifPai);

      if (candidatos && candidatos.length > 0) {
        return candidatos[0];
      }
    }

    return undefined;
  }
}
