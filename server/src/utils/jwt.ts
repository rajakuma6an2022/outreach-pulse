import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../types/express";

const ONE_DAY_SECONDS = 60 * 60 * 24;

export function signAccessToken(payload: AuthUser): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ONE_DAY_SECONDS });
}

export function verifyAccessToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
  return {
    userId: decoded.userId,
    workspaceId: decoded.workspaceId,
    role: decoded.role,
  };
}