import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const stepSchema = z.object({
  order: z.number().int().min(1).max(3),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Body is required").max(5000),
  delayMinutes: z.number().int().min(0).max(43200),
});

export const createCadenceSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    steps: z
      .array(stepSchema)
      .min(1, "At least 1 step is required")
      .max(3, "At most 3 steps are allowed")
      // unordered / gap steps reject pannum: orders must be exactly 1, 2, 3...
      .refine((steps) => steps.every((s, i) => s.order === i + 1), {
        message: "Steps must be ordered 1, 2, 3 without gaps or duplicates",
      }),
  }),
});

export const cadenceIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export type CreateCadenceInput = z.infer<typeof createCadenceSchema>["body"];