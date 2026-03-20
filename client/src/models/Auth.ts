export interface AuthUser {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  roleName: string;
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