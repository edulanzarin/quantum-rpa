import { contextBridge, ipcRenderer } from "electron";
import type { ApiResponse } from "@shared/types/api-response";
import type { Empresa } from "@shared/types/Empresa";
import type { BalanceteLinha } from "@shared/types/BalanceteLinha";
import type { PlanoConciliacao } from "@shared/types/PlanoConciliacao";
import type { Natureza } from "@shared/types/Natureza";

/**
 * Interface do objeto API exposto ao renderer.
 * Define todos os métodos disponíveis para o frontend.
 */
export interface ElectronAPI {
  // Empresas
  obterEmpresas: () => Promise<ApiResponse<Empresa[]>>;

  // Balancetes
  gerarBalancoPatrimonial: (
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    origem: string,
  ) => Promise<ApiResponse<BalanceteLinha[]>>;

  gerarBalanceteFiscal: (
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    planoConciliacaoId: number,
  ) => Promise<ApiResponse<BalanceteLinha[]>>;

  // Planos de Conciliação
  planos: {
    listar: () => Promise<ApiResponse<any[]>>;
    obterPorId: (id: number) => Promise<ApiResponse<PlanoConciliacao | null>>;
    salvar: (plano: PlanoConciliacao) => Promise<ApiResponse<number>>;
  };

  // Naturezas (CFOPs)
  naturezas: {
    listar: (
      empresa: number,
      termo?: string,
    ) => Promise<ApiResponse<Natureza[]>>;
    buscarPorCodigo: (
      empresa: number,
      cfop: number,
    ) => Promise<ApiResponse<Natureza>>;
  };
}

const api: ElectronAPI = {
  obterEmpresas: () => ipcRenderer.invoke("empresa:obterTodas"),

  gerarBalancoPatrimonial: (
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    origem: string,
  ) =>
    ipcRenderer.invoke(
      "balancete:gerarBalancoPatrimonial",
      codigoEmpresa,
      dataInicio,
      dataFim,
      origem,
    ),

  gerarBalanceteFiscal: (
    codigoEmpresa: number,
    dataInicio: Date,
    dataFim: Date,
    planoConciliacaoId: number,
  ) =>
    ipcRenderer.invoke(
      "balancete:gerarProjecaoFiscal",
      codigoEmpresa,
      dataInicio,
      dataFim,
      planoConciliacaoId,
    ),

  planos: {
    listar: () => ipcRenderer.invoke("plano:listar"),
    obterPorId: (id: number) => ipcRenderer.invoke("plano:obterPorId", id),
    salvar: (plano: PlanoConciliacao) =>
      ipcRenderer.invoke("plano:salvar", plano),
  },

  naturezas: {
    listar: (empresa: number, termo?: string) =>
      ipcRenderer.invoke("natureza:listar", empresa, termo),
    buscarPorCodigo: (empresa: number, cfop: number) =>
      ipcRenderer.invoke("natureza:buscarPorCodigo", empresa, cfop),
  },
};

contextBridge.exposeInMainWorld("api", api);
