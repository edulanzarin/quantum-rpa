"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const questorConnection_1 = require("./database/questorConnection");
const localConnection_1 = __importDefault(require("./database/localConnection"));
const PlanoConciliacaoRepository_1 = require("./repositories/PlanoConciliacaoRepository");
const controllers_1 = require("./controllers");
let mainWindow = null;
const createWindow = () => {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, "../preload/index.js"),
        },
        autoHideMenuBar: true,
    });
    if (process.env.NODE_ENV === "development") {
        mainWindow.loadURL("http://localhost:5173");
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, "../renderer/index.html"));
    }
};
/**
 * Inicializa conexões com bancos de dados.
 */
async function inicializarBancos() {
    console.log("🔌 Testando conexões com bancos de dados...");
    // Testa conexão com Questor (Firebird)
    const questorOk = await (0, questorConnection_1.testarConexao)();
    // Testa conexão com MySQL local
    const mysqlOk = await localConnection_1.default.testarConexao();
    if (!questorOk) {
        console.warn("⚠️  Questor indisponível. Algumas funcionalidades podem não funcionar.");
    }
    if (!mysqlOk) {
        console.warn("⚠️  MySQL indisponível. Planos de conciliação podem não funcionar.");
    }
    // Inicializa tabelas do banco local
    if (mysqlOk) {
        try {
            await PlanoConciliacaoRepository_1.PlanoConciliacaoRepository.inicializarTabelas();
        }
        catch (error) {
            console.error("❌ Erro ao inicializar tabelas:", error);
        }
    }
}
electron_1.app.whenReady().then(async () => {
    console.log("🚀 Iniciando Quantum RPA...");
    // Inicializa bancos
    await inicializarBancos();
    // Registra handlers IPC
    (0, controllers_1.registrarTodosEventos)();
    // Cria janela
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
// Cleanup ao fechar
electron_1.app.on("before-quit", async () => {
    console.log("🔌 Fechando conexões...");
    try {
        await localConnection_1.default.fecharConexao();
    }
    catch (error) {
        console.error("Erro ao fechar conexões:", error);
    }
});
