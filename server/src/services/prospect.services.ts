import {  Types } from "mongoose";
import { Prospect, ProspectDoc } from "../models/Prospect";
import { AuthUser } from "../types/express";
import { AppError } from "../utils/error";
import { escapeRegex } from "../utils/regex";
import { CreateProspectInput, ListProspectsQuery } from "../validators/prospect.validator";
import { deleteEnrollmentsForProspect } from "./enrollment.services";

function toDTO(p: ProspectDoc) {
  return {
    id: p._id.toString(),
    name: p.name,
    email: p.email,
    company: p.company,
    title: p.title,
    status: p.status,
    ownerId: p.ownerId.toString(),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function createProspect(user: AuthUser, input: CreateProspectInput) {
  try {
    const prospect = await Prospect.create({
      ...input,
      ownerId: user.userId,
      workspaceId: user.workspaceId, // JWT-la irundhu, body la irundhu illa
    });
    return toDTO(prospect.toObject() as ProspectDoc);
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw AppError.conflict("A prospect with this email already exists", "PROSPECT_EXISTS");
    }
    throw err;
  }
}

// export async function listProspects(user: AuthUser, query: ListProspectsQuery) {
//   const { page, limit, search, status } = query;

//   const filter = {
//     workspaceId: new Types.ObjectId(user.workspaceId),
//   };

//   if (status) filter.status = status;

//   if (search) {
//     const rx = new RegExp(escapeRegex(search), "i");
//     filter.$or = [{ name: rx }, { email: rx }, { company: rx }];
//   }

//   const [items, total] = await Promise.all([
//     Prospect.find(filter)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .lean<ProspectDoc[]>(),
//     Prospect.countDocuments(filter),
//   ]);

//   return {
//     items: items.map(toDTO),
//     pagination: {
//       page,
//       limit,
//       total,
//       totalPages: Math.max(1, Math.ceil(total / limit)),
//     },
//   };
// }

export async function listProspects(
  user: AuthUser,
  query: ListProspectsQuery
) {
  const { page, limit, search, status } = query;

  const filter: Record<string, unknown> = {
    workspaceId: new Types.ObjectId(user.workspaceId),
  };

  if (status) {
    filter.status = status;
  }

  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { name: rx },
      { email: rx },
      { company: rx },
    ];
  }

  const [items, total] = await Promise.all([
    Prospect.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<ProspectDoc[]>(),

    Prospect.countDocuments(filter),
  ]);

  return {
    items: items.map(toDTO),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getProspect(user: AuthUser, id: string) {
  const prospect = await Prospect.findOne({
    _id: id,
    workspaceId: user.workspaceId,
  }).lean<ProspectDoc>();

  // Vera workspace-oda prospect na kooda 404 (existence reveal pannakoodadhu)
  if (!prospect) throw AppError.notFound("Prospect not found", "PROSPECT_NOT_FOUND");
  return toDTO(prospect);
}



export async function deleteProspect(user: AuthUser, id: string) {
  const deleted = await Prospect.findOneAndDelete({
    _id: id,
    workspaceId: user.workspaceId,
  });
  if (!deleted) throw AppError.notFound("Prospect not found", "PROSPECT_NOT_FOUND");

  // Indha prospect-oda enrollments and pending email jobs-um clean pannidu
  await deleteEnrollmentsForProspect(user.workspaceId, id);
}