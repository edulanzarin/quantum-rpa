"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    obterEmpresas: () => electron_1.ipcRenderer.invoke("empresa:obterTodas"),
    gerarBalancoPatrimonial: (codigoEmpresa, dataInicio, dataFim, origem) => electron_1.ipcRenderer.invoke("balancete:gerarBalancoPatrimonial", codigoEmpresa, dataInicio, dataFim, origem),
    gerarBalanceteFiscal: (codigoEmpresa, dataInicio, dataFim, planoConciliacaoId) => electron_1.ipcRenderer.invoke("balancete:gerarProjecaoFiscal", codigoEmpresa, dataInicio, dataFim, planoConciliacaoId),
    planos: {
        listar: () => electron_1.ipcRenderer.invoke("plano:listar"),
        obterPorId: (id) => electron_1.ipcRenderer.invoke("plano:obterPorId", id),
        salvar: (plano) => electron_1.ipcRenderer.invoke("plano:salvar", plano),
    },
    naturezas: {
        listar: (empresa, termo) => electron_1.ipcRenderer.invoke("natureza:listar", empresa, termo),
        buscarPorCodigo: (empresa, cfop) => electron_1.ipcRenderer.invoke("natureza:buscarPorCodigo", empresa, cfop),
    },
});
