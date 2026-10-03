import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createEnrollmentSchema = z.object({
  body: z.object({
    prospectId: objectId,
    cadenceId: objectId,
  }),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>["body"];