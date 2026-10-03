import { Request, Response } from "express";
import * as prospectService from "../services/prospect.services";
import { ListProspectsQuery } from "../validators/prospect.validator";

export async function create(req: Request, res: Response) {
  const data = await prospectService.createProspect(req.user!, req.body);
  res.status(201).json({ success: true, data });
}

export async function list(req: Request, res: Response) {
  // validate middleware already coerce pannitu
  const query = req.query as unknown as ListProspectsQuery;
  const { items, pagination } = await prospectService.listProspects(req.user!, query);
  res.status(200).json({ success: true, data: items, pagination });
}

export async function getOne(req: Request, res: Response) {
  const data = await prospectService.getProspect(req.user!, req.params.id);
  res.status(200).json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  await prospectService.deleteProspect(req.user!, req.params.id);
  res.status(200).json({ success: true, message: "Prospect deleted" });
}