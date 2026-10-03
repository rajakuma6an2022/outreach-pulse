import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { User } from "../models/User";
import { Workspace } from "../models/Workspace";
import { AppError } from "../utils/error";
import { signAccessToken } from "../utils/jwt";
import { LoginInput, RegisterInput } from "../validators/auth.validator";

const BCRYPT_ROUNDS = 10;

// User doesn't exist na kooda same time edukka, timing difference avoid panna
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS);

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SDR";
  workspaceId: string;
}

function toSafeUser(user: {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
  workspaceId: Types.ObjectId;
}): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as "ADMIN" | "SDR",
    workspaceId: user.workspaceId.toString(),
  };
}

function issueToken(user: SafeUser) {
  return signAccessToken({
    userId: user.id,
    workspaceId: user.workspaceId,
    role: user.role,
  });
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.exists({ email: input.email });
  if (existing) throw AppError.conflict("Email already registered", "EMAIL_TAKEN");

  const workspace = await Workspace.create({ name: input.workspaceName });

  try {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "ADMIN", // first user of a workspace = ADMIN
      workspaceId: workspace._id,
    });

    const safeUser = toSafeUser(user);
    return {
      user: safeUser,
      workspace: { id: workspace._id.toString(), name: workspace.name },
      token: issueToken(safeUser),
    };
  } catch (err) {
    // user create fail aana orphan workspace delete pannidu
    await Workspace.deleteOne({ _id: workspace._id });
    throw err;
  }
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");

  const hash = user?.passwordHash ?? DUMMY_HASH;
  const ok = await bcrypt.compare(input.password, hash);

  if (!user || !ok) {
    throw AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const safeUser = toSafeUser(user);
  const workspace = await Workspace.findById(user.workspaceId);

  return {
    user: safeUser,
    workspace: workspace ? { id: workspace._id.toString(), name: workspace.name } : null,
    token: issueToken(safeUser),
  };
}

export async function getCurrentUser(userId: string, workspaceId: string) {
  const user = await User.findOne({ _id: userId, workspaceId });
  if (!user) throw AppError.unauthorized("User no longer exists", "USER_NOT_FOUND");

  const workspace = await Workspace.findById(workspaceId);

  return {
    user: toSafeUser(user),
    workspace: workspace ? { id: workspace._id.toString(), name: workspace.name } : null,
  };
}