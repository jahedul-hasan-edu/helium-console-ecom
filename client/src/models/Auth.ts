import type { ClientRoleName, RegistrationMode } from "@/lib/auth";

export interface AuthUser {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  roleName: ClientRoleName;
  twoFactorEnabled: boolean;
}

export interface AuthSuccessResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RequiresTwoFactorResponse {
  requires2FA: true;
  tempToken: string;
  method: string;
}

export type LoginResponse = AuthSuccessResponse | RequiresTwoFactorResponse;

export interface SystemStatus {
  hasSuperAdmin: boolean;
  registrationMode: RegistrationMode;
}

export interface SubscriptionPlanOption {
  id: string;
  name: string | null;
  price: string | null;
  durationDays: number | null;
}

export interface RegisterSuperAdminRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface RegisterTenantAdminRequest extends RegisterSuperAdminRequest {
  planId: string;
}