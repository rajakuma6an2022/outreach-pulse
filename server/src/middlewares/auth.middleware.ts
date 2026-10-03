import { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE } from "../utils/cookies";
import { AppError } from "../utils/error";
import { verifyAccessToken } from "../utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return next(AppError.unauthorized("Authentication required"));

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired session", "INVALID_TOKEN"));
  }
}

export const authorize =
  (...roles: Array<"ADMIN" | "SDR">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("You do not have permission to do this"));
    }
    next();
  };