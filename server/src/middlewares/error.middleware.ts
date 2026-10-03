import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/error";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      code: "VALIDATION_ERROR",
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Mongo duplicate key
  if (typeof err === "object" && err !== null && (err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value for a unique field",
      code: "DUPLICATE_KEY",
    });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : String((err as any)?.message ?? err),
    code: "INTERNAL_ERROR",
  });
}