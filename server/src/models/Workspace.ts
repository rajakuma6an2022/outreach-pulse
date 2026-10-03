import { InferSchemaType, Schema, model } from "mongoose";

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type WorkspaceDoc = InferSchemaType<typeof workspaceSchema>;
export const Workspace = model("Workspace", workspaceSchema);
