export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message = "Bad request", code = "BAD_REQUEST") {
    return new AppError(message, 400, code);
  }
  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED") {
    return new AppError(message, 401, code);
  }
  static forbidden(message = "Forbidden", code = "FORBIDDEN") {
    return new AppError(message, 403, code);
  }
  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new AppError(message, 404, code);
  }
  static conflict(message = "Conflict", code = "CONFLICT") {
    return new AppError(message, 409, code);
  }
}