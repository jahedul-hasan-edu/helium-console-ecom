export const CLIENT_ROLE_NAME = {
  SUPER_ADMIN: "super_admin",
  TENANT_ADMIN: "tenant_admin",
  USER: "user",
} as const;

export type ClientRoleName = (typeof CLIENT_ROLE_NAME)[keyof typeof CLIENT_ROLE_NAME];

export const REGISTRATION_MODE = {
  BOOTSTRAP: "bootstrap",
  TENANT_REGISTER: "tenant_register",
} as const;

export type RegistrationMode = (typeof REGISTRATION_MODE)[keyof typeof REGISTRATION_MODE];

export const TWO_FACTOR_METHOD = {
  APP: "app",
  EMAIL: "email",
} as const;

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  AUTH_USER: "authUser",
  SELECTED_TENANT_ID: "selectedTenantId",
  PENDING_TWO_FACTOR: "pending2fa",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  TWO_FACTOR_VERIFY: "/2fa-verify",
  ADMIN_HOME: "/admin",
} as const;