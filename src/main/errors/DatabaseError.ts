import { AppError } from "./AppError";

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(message, 500, true);
    this.name = "DatabaseError";

    if (originalError) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
}
