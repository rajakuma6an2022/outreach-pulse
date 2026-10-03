import { InferSchemaType, Schema, Types, model } from "mongoose";

export const EMAIL_EVENT_TYPES = ["SENT", "OPENED", "CLICKED", "FAILED"] as const;

const emailEventSchema = new Schema(
  {
    enrollmentId: { type: Schema.Types.ObjectId, ref: "Enrollment", required: true },
    prospectId: { type: Schema.Types.ObjectId, ref: "Prospect", required: true },
    stepIndex: { type: Number, required: true, min: 0 },
    type: { type: String, enum: EMAIL_EVENT_TYPES, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    token: { type: String }, // optional open-tracking ku (Step 8 optional)
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Dashboard aggregation ku
emailEventSchema.index({ workspaceId: 1, type: 1, createdAt: -1 });

// IDEMPOTENCY: oru enrollment-oda oru step-ku SENT event oru thadavai mattum
emailEventSchema.index(
  { enrollmentId: 1, stepIndex: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: "SENT" } }
);

export type EmailEventDoc = InferSchemaType<typeof emailEventSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};
export const EmailEvent = model("EmailEvent", emailEventSchema);