import "module-alias/register";

import { app, BrowserWindow } from "electron";
import path from "path";
import { testarConexao as testarConexaoQuestor } from "@database/questorConnection";
import localConnection from "@database/localConnection";
import { PlanoConciliacaoRepository } from "@repositories/PlanoConciliacaoRepository";
import { registrarTodosEventos } from "./controllers";

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.js"),
    },
    autoHideMenuBar: true,
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
};

/**
 * Inicializa conexões com bancos de dados.
 */
async function inicializarBancos(): Promise<void> {
  console.log("🔌 Testando conexões com bancos de dados...");

  // Testa conexão com Questor (Firebird)
  const questorOk = await testarConexaoQuestor();

  // Testa conexão com MySQL local
  const mysqlOk = await localConnection.testarConexao();

  if (!questorOk) {
    console.warn(
      "⚠️  Questor indisponível. Algumas funcionalidades podem não funcionar.",
    );
  }

  if (!mysqlOk) {
    console.warn(
      "⚠️  MySQL indisponível. Planos de conciliação podem não funcionar.",
    );
  }

  // Inicializa tabelas do banco local
  if (mysqlOk) {
    try {
      await PlanoConciliacaoRepository.inicializarTabelas();
    } catch (error) {
      console.error("❌ Erro ao inicializar tabelas:", error);
    }
  }
}

app.whenReady().then(async () => {
  console.log("🚀 Iniciando Quantum RPA...");

  // Inicializa bancos
  await inicializarBancos();

  // Registra handlers IPC
  registrarTodosEventos();

  // Cria janela
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Cleanup ao fechar
app.on("before-quit", async () => {
  console.log("🔌 Fechando conexões...");
  try {
    await localConnection.fecharConexao();
  } catch (error) {
    console.error("Erro ao fechar conexões:", error);
  }
});
