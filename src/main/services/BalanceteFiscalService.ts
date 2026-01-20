import { PlanoContaService } from "@services/PlanoContaService";
import { LancamentoFiscalEntradaService } from "@services/LancamentoFiscalEntradaService";
import { PlanoConciliacaoRepository } from "@repositories/PlanoConciliacaoRepository";
import type { PlanoContaNode } from "@shared/types/PlanoContaNode";
import type { BalanceteLinha } from "@shared/types/BalanceteLinha";
import type { ItemPlanoConciliacao } from "@shared/types/ItemPlanoConciliacao";

export class BalanceteFiscalService {
  private planoContaService = new PlanoContaService();
  private fiscalService = new LancamentoFiscalEntradaService();
  private planoConciliacaoRepo = new PlanoConciliacaoRepository();

  async gerarBalancoPatrimonialFiscal(
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    planoConciliacaoId: number,
  ): Promise<BalanceteLinha[]> {
    const arvorePlanoContas =
      await this.planoContaService.obterPlanoProcessado(codigoEmpresa);

    const notas = await this.fiscalService.buscarLancamentosFiscais(
      codigoEmpresa,
      dataInicio,
      dataFim,
    );

    const regrasItens =
      await this.planoConciliacaoRepo.obterItensPorPlano(planoConciliacaoId);

    const mapaRegras = new Map<number, ItemPlanoConciliacao>();
    regrasItens.forEach((r) => mapaRegras.set(r.cfop, r));

    const saldosProjetados = new Map<
      number,
      { debito: number; credito: number }
    >();

    const CONTA_RETIDOS = 1539;

    // Contas de Recuperar (Pode ajustar os IDs conforme seu plano)
    const CONTA_ICMS_RECUPERAR = 200;
    const CONTA_IPI_RECUPERAR = 221; // Ou 158
    const CONTA_PIS_RECUPERAR = 158; // Ou conta específica de PIS
    const CONTA_COFINS_RECUPERAR = 159; // Ou conta específica de COFINS

    for (const nota of notas) {
      const regra = mapaRegras.get(nota.CODIGOCFOP);

      if (regra && regra.contabiliza) {
        const valorBaseItem = nota.VALORCONTABILIMPOSTO;

        // Impostos Totais
        const valorIcms = nota.VALORIMPOSTO || 0;
        const valorIpiTotalNota = nota.VALORIPI || 0;
        const valorPisTotalNota = nota.VALORPIS || 0; // <--- NOVO
        const valorCofinsTotalNota = nota.VALORCOFINS || 0; // <--- NOVO

        let valorParaCreditoPrincipal = valorBaseItem;
        const valorParaDebitoPrincipal = valorBaseItem; // Cheio

        let valorParaContaRetidos = 0;

        // Variáveis proporcionais
        let valorIpiProporcional = 0;
        let valorPisProporcional = 0;
        let valorCofinsProporcional = 0;

        // --- CÁLCULO DA PROPORÇÃO ---
        let proporcao = 0;
        if (nota.VALORCONTABIL > 0) {
          proporcao = nota.VALORCONTABILIMPOSTO / nota.VALORCONTABIL;
        }

        // 1. Rateio Retenções
        if (nota.TOTAL_RETIDO_NOTA > 0) {
          const retidoProporcional = nota.TOTAL_RETIDO_NOTA * proporcao;
          valorParaContaRetidos = retidoProporcional;
          valorParaCreditoPrincipal -= retidoProporcional;
        }

        // 2. Rateio Impostos (IPI, PIS, COFINS)
        if (valorIpiTotalNota > 0)
          valorIpiProporcional = valorIpiTotalNota * proporcao;
        if (valorPisTotalNota > 0)
          valorPisProporcional = valorPisTotalNota * proporcao;
        if (valorCofinsTotalNota > 0)
          valorCofinsProporcional = valorCofinsTotalNota * proporcao;

        // --- CONTABILIZAÇÃO DOS IMPOSTOS RECUPERÁVEIS ---

        // Função auxiliar para lançar o imposto (Refatoração para limpar o código)
        const processarImpostoRecuperavel = (
          valor: number,
          contaAtivo: number,
        ) => {
          if (valor > 0) {
            // A: Debita no Ativo (A Recuperar)
            this.adicionarSaldo(saldosProjetados, contaAtivo, valor, "D");

            // B: Credita na Conta Principal (Reduzindo o Custo)
            if (regra.contasDebito) {
              regra.contasDebito.forEach((contaId) => {
                this.adicionarSaldo(saldosProjetados, contaId, valor, "C");
              });
            }
          }
        };

        // Aplica para todos os impostos
        // processarImpostoRecuperavel(valorIcms, CONTA_ICMS_RECUPERAR);
        // processarImpostoRecuperavel(valorIpiProporcional, CONTA_IPI_RECUPERAR);
        processarImpostoRecuperavel(valorPisProporcional, CONTA_PIS_RECUPERAR);
        processarImpostoRecuperavel(
          valorCofinsProporcional,
          CONTA_COFINS_RECUPERAR,
        );

        // 3. Lança DÉBITO PRINCIPAL (Valor Cheio)
        if (regra.contasDebito) {
          regra.contasDebito.forEach((contaId) => {
            this.adicionarSaldo(
              saldosProjetados,
              contaId,
              valorParaDebitoPrincipal,
              "D",
            );
          });
        }

        // 4. Lança CRÉDITO PRINCIPAL (Fornecedor)
        if (regra.contasCredito) {
          regra.contasCredito.forEach((contaId) => {
            this.adicionarSaldo(
              saldosProjetados,
              contaId,
              valorParaCreditoPrincipal,
              "C",
            );
          });
        }

        // 5. Lança CRÉDITO RETIDOS
        if (valorParaContaRetidos > 0) {
          this.adicionarSaldo(
            saldosProjetados,
            CONTA_RETIDOS,
            valorParaContaRetidos,
            "C",
          );
        }
      }
    }

    // --- GERAÇÃO FINAL ---
    const linhas: BalanceteLinha[] = [];
    for (const raiz of arvorePlanoContas) {
      if (
        raiz.CLASSIFCONTA.startsWith("1") ||
        raiz.CLASSIFCONTA.startsWith("2")
      ) {
        this.acumularSaldosHierarquicos(raiz, saldosProjetados, linhas, 4);
      }
    }

    const linhasComSaldo = linhas.filter(
      (linha) => linha.debito !== 0 || linha.credito !== 0,
    );

    linhasComSaldo.sort((a, b) =>
      this.compararClassificacao(a.classificacao, b.classificacao),
    );

    return linhasComSaldo;
  }

  // Métodos auxiliares permanecem iguais...
  private adicionarSaldo(
    mapa: Map<number, { debito: number; credito: number }>,
    contaId: number,
    valor: number,
    tipo: "D" | "C",
  ) {
    const atual = mapa.get(contaId) || { debito: 0, credito: 0 };
    if (tipo === "D") atual.debito += valor;
    else atual.credito += valor;
    mapa.set(contaId, atual);
  }

  private acumularSaldosHierarquicos(
    node: PlanoContaNode,
    saldosMap: Map<number, { debito: number; credito: number }>,
    resultado: BalanceteLinha[],
    nivelMaximo: number,
  ): { debito: number; credito: number } {
    let debito = 0;
    let credito = 0;
    const saldoProprio = saldosMap.get(node.CONTACTB);
    if (saldoProprio) {
      debito += saldoProprio.debito;
      credito += saldoProprio.credito;
    }
    for (const filho of node.filhos) {
      const saldoFilho = this.acumularSaldosHierarquicos(
        filho,
        saldosMap,
        resultado,
        nivelMaximo,
      );
      debito += saldoFilho.debito;
      credito += saldoFilho.credito;
    }
    const nivelDaConta = node.CLASSIFCONTA.split(".").length;
    if (nivelDaConta <= nivelMaximo) {
      resultado.push({
        contactb: node.CONTACTB,
        classificacao: node.CLASSIFCONTA,
        descricao: node.DESCRCONTA,
        debito: parseFloat(debito.toFixed(2)),
        credito: parseFloat(credito.toFixed(2)),
      });
    }
    return { debito, credito };
  }

  private compararClassificacao(a: string, b: string): number {
    const partesA = a.split(".").map((p) => parseInt(p) || 0);
    const partesB = b.split(".").map((p) => parseInt(p) || 0);
    const maxLength = Math.max(partesA.length, partesB.length);
    for (let i = 0; i < maxLength; i++) {
      const valorA = partesA[i] || 0;
      const valorB = partesB[i] || 0;
      if (valorA !== valorB) return valorA - valorB;
    }
    return 0;
  }
}
