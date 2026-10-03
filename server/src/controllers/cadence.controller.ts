import { Request, Response } from "express";
import * as cadenceService from "../services/cadence.services";

export async function create(req: Request, res: Response) {
  const data = await cadenceService.createCadence(req.user!, req.body);
  res.status(201).json({ success: true, data });
}

export async function list(req: Request, res: Response) {
  const data = await cadenceService.listCadences(req.user!);
  res.status(200).json({ success: true, data });
}

export async function getOne(req: Request, res: Response) {
  const data = await cadenceService.getCadence(req.user!, req.params.id);
  res.status(200).json({ success: true, data });
}