// ─── Identity & Access Management Models ──────────────────────────────────────
// Mirrors: src/modules/identity-management/types/ in React project

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface IamUser {
  ItemId: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  roles: string[];
  permissions: string[];
  active: boolean;
  isVarified: boolean;
  profileImageUrl?: string;
  isMfaVerified: boolean;
  mfaEnabled: boolean;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  /** IdP `createdDate` (ISO) */
  createdDate?: string;
  /** IdP `lastLoggedInTime` (ISO) */
  lastLoggedInTime?: string;
}

/** Request body for `POST /idp/v1/Iam/GetUsers` (same as React `GetUsersPayload`) */
export interface GetUsersPayload {
  page: number;
  pageSize: number;
  filter?: { email?: string; name?: string };
}

export interface IamUserFilter {
  search?: string;
  role?: string;
  active?: boolean;
  pageNo: number;
  pageSize: number;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  permissions?: string[];
  phoneNumber?: string;
}

export type UpdateUserInput = Partial<CreateUserInput & { active: boolean }>;

export interface Role {
  roleId: string;
  name: string;
  description?: string;
  permissions: string[];
}
