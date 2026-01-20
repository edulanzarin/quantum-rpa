import { ipcMain } from "electron";
import { BalanceteContabilService } from "@services/BalanceteContabilService";

export class BalanceteContabilController {
  private service: BalanceteContabilService;

  constructor() {
    this.service = new BalanceteContabilService();
  }

  registrarEventos() {
    /**
     * Gera o balancete contábil de uma empresa
     * para um período e origem específicos.
     */
    ipcMain.handle(
      "balancete:gerarBalancoPatrimonial",
      async (
        _event,
        codigoEmpresa: number,
        dataInicio: Date,
        dataFim: Date,
        origem: string,
      ) => {
        try {
          return await this.service.gerarBalancoPatrimonial(
            codigoEmpresa,
            dataInicio,
            dataFim,
            origem,
          );
        } catch (error) {
          console.error("Erro ao gerar balancete", error);
          return [];
        }
      },
    );
  }
}
