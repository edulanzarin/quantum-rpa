import type { IpcMainInvokeEvent } from "electron";
import { ipcMain } from "electron";
import { AppError } from "@errors/AppError";
import {
  createSuccessResponse,
  createErrorResponse,
  type ApiResponse,
} from "@shared/types/api-response";

export abstract class BaseController {
  abstract registrarEventos(): void;

  protected registrarHandler<T>(
    channel: string,
    handler: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<T> | T,
  ): void {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        const resultado = await handler(event, ...args);
        return createSuccessResponse(resultado);
      } catch (error) {
        return this.tratarErro(error, channel);
      }
    });
  }

  private tratarErro(error: unknown, channel: string): ApiResponse {
    console.error(`[${channel}] Erro:`, error);

    if (error instanceof AppError) {
      return createErrorResponse(error.message, error.name, {
        statusCode: error.statusCode,
      });
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, error.name);
    }

    return createErrorResponse("Erro desconhecido", "UNKNOWN_ERROR");
  }

  protected log(operacao: string, dados?: any): void {
    console.log(`[${this.constructor.name}] ${operacao}`, dados || "");
  }
}
