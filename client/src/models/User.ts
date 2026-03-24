import type { ClientRoleName } from "@/lib/auth";

export interface User {
  id: string;
  tenantId: string;
  tenantName?: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobile: string | null;
  isActive?: boolean | null;
  twoFactorEnabled?: boolean | null;
  twoFactorMethod?: string | null;
  roleId?: string | null;
  roleName?: string | null;
  roleDisplayName?: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: Date | null;
  updatedOn: Date | null;
  userIp: string | null;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  roleId: string;
  roleName?: string | null;
  twoFactorMethod?: string | null;
  tenantId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  roleId?: string;
  roleName?: ClientRoleName;
  twoFactorMethod?: string | null;
  isActive?: boolean;
}

export interface UserResponse extends User {}

export type UserListResponse = User[];