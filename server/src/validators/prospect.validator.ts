import { z } from "zod";
import { PROSPECT_STATUSES } from "../models/Prospect";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createProspectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    company: z.string().trim().max(100).optional().default(""),
    title: z.string().trim().max(100).optional().default(""),
    status: z.enum(PROSPECT_STATUSES).optional().default("NEW"),
  }),
});

export const listProspectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    search: z.string().trim().max(100).optional(),
    // frontend empty string anuppina ignore pannidu
    status: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.enum(PROSPECT_STATUSES).optional()
    ),
  }),
});

export const prospectIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export type CreateProspectInput = z.infer<typeof createProspectSchema>["body"];
export type ListProspectsQuery = z.infer<typeof listProspectsSchema>["query"];