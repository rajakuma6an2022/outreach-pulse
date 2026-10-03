export interface AuthUser {
  userId: string;
  workspaceId: string;
  role: "ADMIN" | "SDR";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}