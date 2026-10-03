import { Cadence, CadenceDoc } from "../models/Cadence";
import { AuthUser } from "../types/express";
import { AppError } from "../utils/error";
import { CreateCadenceInput } from "../validators/cadence.validator";

function toDTO(c: CadenceDoc) {
  return {
    id: c._id.toString(),
    name: c.name,
    steps: c.steps.map((s) => ({
      order: s.order,
      subject: s.subject,
      body: s.body,
      delayMinutes: s.delayMinutes,
    })),
    createdBy: c.createdBy.toString(),
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export async function createCadence(user: AuthUser, input: CreateCadenceInput) {
  const cadence = await Cadence.create({
    name: input.name,
    steps: input.steps,
    workspaceId: user.workspaceId, // JWT la irundhu
    createdBy: user.userId,
  });
  return toDTO(cadence.toObject() as CadenceDoc);
}

export async function listCadences(user: AuthUser) {
  const items = await Cadence.find({ workspaceId: user.workspaceId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean<CadenceDoc[]>();
  return items.map(toDTO);
}

export async function getCadence(user: AuthUser, id: string) {
  const cadence = await Cadence.findOne({
    _id: id,
    workspaceId: user.workspaceId,
  }).lean<CadenceDoc>();

  // Vera workspace cadence na kooda 404
  if (!cadence) throw AppError.notFound("Cadence not found", "CADENCE_NOT_FOUND");
  return toDTO(cadence);
}