import { ipcMain } from "electron";
import { BalanceteFiscalService } from "@services/BalanceteFiscalService";

export class BalanceteFiscalController {
  private service: BalanceteFiscalService;

  constructor() {
    this.service = new BalanceteFiscalService();
  }

  registrarEventos() {
    /**
     * Gera o "Balancete Sombra" (Projeção Fiscal)
     * Baseado nas Notas de Entrada + Regras do Plano de Conciliação
     */
    ipcMain.handle(
      "balancete:gerarProjecaoFiscal",
      async (
        _event,
        codigoEmpresa: number,
        dataInicio: Date,
        dataFim: Date,
        planoConciliacaoId: number,
      ) => {
        try {
          console.log(
            `[IPC] Gerando projeção fiscal para empresa ${codigoEmpresa}, Plano ${planoConciliacaoId}...`,
          );

          return await this.service.gerarBalancoPatrimonialFiscal(
            codigoEmpresa,
            dataInicio,
            dataFim,
            planoConciliacaoId,
          );
        } catch (error) {
          console.error("❌ Erro ao gerar projeção fiscal:", error);
          return [];
        }
      },
    );
  }
}
