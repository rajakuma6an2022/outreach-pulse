import { InferSchemaType, Schema, Types, model } from "mongoose";

const stepSchema = new Schema(
  {
    order: { type: Number, required: true, min: 1, max: 3 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    // Demo ku 0, 1, 2 minutes. Production la delayDays use pannuvom
    delayMinutes: { type: Number, required: true, min: 0, max: 43200 },
  },
  { _id: false }
);

const cadenceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    steps: {
      type: [stepSchema],
      validate: {
        validator: (v: unknown[]) => v.length >= 1 && v.length <= 3,
        message: "A cadence must have between 1 and 3 steps",
      },
    },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

cadenceSchema.index({ workspaceId: 1, createdAt: -1 });

export type CadenceDoc = InferSchemaType<typeof cadenceSchema> & { _id: Types.ObjectId };
export const Cadence = model("Cadence", cadenceSchema);