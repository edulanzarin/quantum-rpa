"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
/**
 * Helper para criar resposta de sucesso.
 */
function createSuccessResponse(data) {
    return {
        success: true,
        data,
    };
}
/**
 * Helper para criar resposta de erro.
 */
function createErrorResponse(message, code, details) {
    return {
        success: false,
        error: {
            message,
            code,
            details,
        },
    };
}
