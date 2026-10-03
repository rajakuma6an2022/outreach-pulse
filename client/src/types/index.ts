export type Role = "ADMIN" | "SDR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface Session {
  user: AuthUser;
  workspace: Workspace | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const PROSPECT_STATUSES = ["NEW", "CONTACTED", "REPLIED", "UNQUALIFIED"] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

export interface Prospect {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  status: ProspectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProspectList {
  items: Prospect[];
  pagination: Pagination;
}

export interface ListProspectsArgs {
  page: number;
  limit: number;
  search?: string;
  status?: ProspectStatus;
}

export interface CreateProspectBody {
  name: string;
  email: string;
  company?: string;
  title?: string;
}