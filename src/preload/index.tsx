import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
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
    salvar: (plano: any) => ipcRenderer.invoke("plano:salvar", plano),
  },

  naturezas: {
    listar: (empresa: number, termo?: string) =>
      ipcRenderer.invoke("natureza:listar", empresa, termo),
    buscarPorCodigo: (empresa: number, cfop: number) =>
      ipcRenderer.invoke("natureza:buscarPorCodigo", empresa, cfop),
  },
});
