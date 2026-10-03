import { Request, Response } from "express";
import * as enrollmentService from "../services/enrollment.services";

export async function create(req: Request, res: Response) {
  const data = await enrollmentService.createEnrollment(req.user!, req.body);
  res.status(201).json({ success: true, data });
}

export async function list(req: Request, res: Response) {
  const data = await enrollmentService.listEnrollments(req.user!);
  res.status(200).json({ success: true, data });
}