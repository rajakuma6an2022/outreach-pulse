import { InferSchemaType, Schema, Types, model } from "mongoose";

export const PROSPECT_STATUSES = ["NEW", "CONTACTED", "REPLIED", "UNQUALIFIED"] as const;

const prospectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true, maxlength: 100, default: "" },
    title: { type: String, trim: true, maxlength: 100, default: "" },
    status: { type: String, enum: PROSPECT_STATUSES, default: "NEW", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  },
  { timestamps: true }
);

// Email unique PER WORKSPACE (global illa)
prospectSchema.index({ workspaceId: 1, email: 1 }, { unique: true });
prospectSchema.index({ workspaceId: 1, status: 1 });
prospectSchema.index({ workspaceId: 1, createdAt: -1 });

export type ProspectDoc = InferSchemaType<typeof prospectSchema> & { _id: Types.ObjectId };
export const Prospect = model("Prospect", prospectSchema);