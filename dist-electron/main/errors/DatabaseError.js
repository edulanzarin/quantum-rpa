"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = void 0;
const AppError_1 = require("./AppError");
class DatabaseError extends AppError_1.AppError {
    constructor(message, originalError) {
        super(message, 500, true);
        this.name = "DatabaseError";
        if (originalError) {
            this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
        }
    }
}
exports.DatabaseError = DatabaseError;
