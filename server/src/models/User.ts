import { InferSchemaType, Schema, Types, model } from "mongoose";

export const USER_ROLES = ["ADMIN", "SDR"] as const;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "SDR", required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Login email-oda mattum nadakkum, so email globally unique
userSchema.index({ email: 1 }, { unique: true });

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId };
export const User = model("User", userSchema);