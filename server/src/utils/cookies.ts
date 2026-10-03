import { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const ACCESS_COOKIE = "accessToken";

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseOptions,
    maxAge: 1000 * 60 * 60 * 24,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(ACCESS_COOKIE, baseOptions);
}