"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const electron_1 = require("electron");
const AppError_1 = require("../errors/AppError");
const api_response_1 = require("../../shared/types/api-response");
class BaseController {
    registrarHandler(channel, handler) {
        electron_1.ipcMain.handle(channel, async (event, ...args) => {
            try {
                const resultado = await handler(event, ...args);
                return (0, api_response_1.createSuccessResponse)(resultado);
            }
            catch (error) {
                return this.tratarErro(error, channel);
            }
        });
    }
    tratarErro(error, channel) {
        console.error(`[${channel}] Erro:`, error);
        if (error instanceof AppError_1.AppError) {
            return (0, api_response_1.createErrorResponse)(error.message, error.name, {
                statusCode: error.statusCode,
            });
        }
        if (error instanceof Error) {
            return (0, api_response_1.createErrorResponse)(error.message, error.name);
        }
        return (0, api_response_1.createErrorResponse)("Erro desconhecido", "UNKNOWN_ERROR");
    }
    log(operacao, dados) {
        console.log(`[${this.constructor.name}] ${operacao}`, dados || "");
    }
}
exports.BaseController = BaseController;
