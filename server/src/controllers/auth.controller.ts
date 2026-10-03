import { Request, Response } from "express";
import * as authService from "../services/auth.services";
import { clearAuthCookie, setAuthCookie } from "../utils/cookies";

export async function register(req: Request, res: Response) {
  const { token, ...data } = await authService.registerUser(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ success: true, data });
}

export async function login(req: Request, res: Response) {
  const { token, ...data } = await authService.loginUser(req.body);
  setAuthCookie(res, token);
  res.status(200).json({ success: true, data });
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  const { userId, workspaceId } = req.user!;
  const data = await authService.getCurrentUser(userId, workspaceId);
  res.status(200).json({ success: true, data });
}