import { InferSchemaType, Schema, Types, model } from "mongoose";

export const ENROLLMENT_STATUSES = ["ACTIVE", "COMPLETED", "FAILED"] as const;

const enrollmentSchema = new Schema(
  {
    prospectId: { type: Schema.Types.ObjectId, ref: "Prospect", required: true },
    cadenceId: { type: Schema.Types.ObjectId, ref: "Cadence", required: true },
    currentStep: { type: Number, default: 0, min: 0 }, // sent steps count
    status: { type: String, enum: ENROLLMENT_STATUSES, default: "ACTIVE", required: true },
    nextRunAt: { type: Date, default: null }, // scheduling source of truth
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

// Oru prospect, oru cadence la oru thadavai mattum
enrollmentSchema.index({ workspaceId: 1, prospectId: 1, cadenceId: 1 }, { unique: true });
enrollmentSchema.index({ workspaceId: 1, nextRunAt: 1 });
enrollmentSchema.index({ workspaceId: 1, status: 1 });

export type EnrollmentDoc = InferSchemaType<typeof enrollmentSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
export const Enrollment = model("Enrollment", enrollmentSchema);