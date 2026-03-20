# Multi-Tenant Improvement — Registration, Login & Seed Data

## Goal

Add self-service registration, improve Login/Register UX, run database migrations, seed initial data, and wire everything end-to-end so the application is usable without manual SQL. The app title is **"Helium Easy Ecom"**.

> **Rule**: Use proper enums, DTOs, interfaces, and constants for every string literal. Zero magic strings anywhere — role names, storage keys, route paths, messages, HTTP status codes, page slugs, etc.

---

## Already Implemented (DO NOT RECREATE)

The following are already in the codebase and working (TypeScript compiles clean). Read them — do **not** rewrite or duplicate them.

### Backend (server/)

| Area | File(s) | What exists |
|------|---------|-------------|
| **DB Schemas** | `server/db/schemas/roles.ts`, `userRoles.ts`, `pages.ts`, `tenantPages.ts`, `tenantRolePages.ts`, `tenantRolePagePermissions.ts`, `sessions.ts`, `refreshTokens.ts`, `users.ts`, `tenants.ts`, `subscriptionPlans.ts`, `tenantSubscriptions.ts` | All tables defined with Drizzle `pgTable`, audit columns, indexes, insert schemas, types |
| **Auth Service** | `server/service/auth_service.ts` | Full `AuthService` static class — `login()`, `refresh()`, `logout()`, `logoutAll()`, `setupTwoFactor()`, `verifyTwoFactor()`, `verifyTwoFactorSetup()`, `disableTwoFactor()`, `getCurrentUser()`, `ensureSystemSeedData()`, `resolveRole()`, `ensureUserRoleAssignment()` |
| **Auth Controller** | `server/api/controllers/auth.ts` | Routes: `POST /api/auth/login`, `POST /api/auth/verify-2fa`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/logout-all-sessions`, `GET /api/auth/me`, `POST /api/auth/2fa/setup`, `POST /api/auth/2fa/verify-setup`, `POST /api/auth/2fa/disable`. Rate-limited (50 req/15 min on login/refresh/verify). |
| **JWT Utility** | `server/shared/utils/jwtUtil.ts` | `JwtUtil` class — `generateAccessToken()`, `generateRefreshToken()`, `generateTwoFactorTempToken()`, `verifyAccessToken()`, `verifyRefreshToken()`, `verifyTwoFactorTempToken()`. Access: 15m, Refresh: 7d, 2FA temp: 5m. |
| **Request Context** | `server/shared/utils/requestContext.ts` | `AuthenticatedRequest` type, `extractTenantId()`, `getUserIp()`, `getRequestContext()` |
| **Auth Middleware** | `server/shared/middleware/authMiddleware.ts` | JWT validation, session check, user active check, subscription expiry check, tenant auto-injection for non-superadmins, `x-tenant-id` header for superadmins |
| **Authorization Middleware** | `server/shared/middleware/authorizationMiddleware.ts` | Page-level RBAC: super_admin bypasses, tenant_admin checks `tenantPages`, user checks `tenantRolePagePermissions` with HTTP method → permission mapping |
| **Navigation Service** | `server/service/navigation_service.ts` | `getNavigation(req)` — role-based navigation tree, falls back to `STATIC_PAGE_DEFINITIONS` if no pages in DB |
| **Navigation Controller** | `server/api/controllers/navigation.ts` | `GET /api/admin/navigation` |
| **Static Page Defs** | `server/shared/utils/authPages.ts` | `STATIC_PAGE_DEFINITIONS[]` (15 pages), `ADMIN_ROUTE_PAGE_MAP`, `HTTP_METHOD_PERMISSION_MAP`, `PermissionKey` type |
| **Password Utility** | `server/shared/utils/passwordUtil.ts` | `PasswordUtil.hashPassword()` / `PasswordUtil.verifyPassword()` (PBKDF2-SHA256, 100k iterations) |
| **Response Utility** | `server/shared/utils/ResponseHandler.ts` | `ResponseHandler.success()`, `.paginated()`, `.error()` |
| **HTTP Constants** | `server/shared/constants/httpStatus.ts` | `HTTP_STATUS` object (OK, CREATED, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, etc.) |
| **All Feature Services** | `server/service/<feature>_service.ts` (12 services) | All use `extractTenantId(req as AuthenticatedRequest)` — no hardcoded `DEFAULT_TENANT_ID` |
| **All Feature Controllers** | `server/api/controllers/<feature>.ts` (14 controllers) | All have tenant guard checks returning 400 if missing |
| **DTOs** | `server/shared/dtos/<Entity>.ts` (16 files) | Zod create/update/response schemas, pagination types for every entity |
| **Routes Config** | `server/routes.ts` | `/api/auth/*` mounted publicly, `/api/admin/*` protected with `authMiddleware` + `authorizationMiddleware` |
| **Express Type Extension** | `server/shared/types/express.d.ts` | Global `Express.Request` augmentation with `user?`, `tenantId?`, `userId?` |

### Frontend (client/)

| Area | File(s) | What exists |
|------|---------|-------------|
| **Auth Context** | `client/src/contexts/AuthContext.tsx` | `AuthProvider` + `useAuth()` — login, verifyTwoFactor, logout, tenant selection (super_admin), session sync via `/api/auth/me`, forced logout event |
| **API Service** | `client/src/lib/apiService.ts` | `ApiService` class — auto token refresh on 401, tenant scope injection for super_admin, forced logout on subscription expired (403), `setTokens()` / `clearTokens()` / `getAccessToken()` |
| **Login Page** | `client/src/pages/auth/Login.tsx` | Email/password form, redirects to `/2fa-verify` if 2FA required, else stores tokens and navigates to `/admin` |
| **2FA Verify Page** | `client/src/pages/auth/TwoFactorVerify.tsx` | 6-digit OTP input using shadcn `InputOTP` |
| **Protected Route** | `client/src/components/ProtectedRoute.tsx` | Redirects to `/login` if not authenticated |
| **Auth Shell** | `client/src/components/AuthShell.tsx` | Wraps `Layout` + `ProtectedRoute` |
| **Layout** | `client/src/components/Layout.tsx` | Dynamic navigation from backend, icon map, tenant selector for super_admin, user dropdown with logout |
| **Navigation Hook** | `client/src/hooks/use-Navigation.ts` | `useNavigation()` — queries `/api/admin/navigation`, 5-min stale time |
| **Auth Models** | `client/src/models/Auth.ts` | `AuthUser`, `AuthSuccessResponse`, `RequiresTwoFactorResponse`, `LoginResponse` interfaces |
| **Navigation Models** | `client/src/models/Navigation.ts` | `PagePermissions`, `NavigationItem` interfaces |
| **App Router** | `client/src/App.tsx` | `AuthProvider` wrapping, `/login`, `/2fa-verify`, all `/admin/*` routes in `AuthShell`, `RootRedirect` |

### Existing DB Schema Columns (for reference)

**users table** — `id`, `tenantId`, `firstName`, `lastName`, `email`, `mobile`, `password`, `isActive`, `twoFactorEnabled`, `twoFactorSecret`, `twoFactorMethod`, `emailOtpCode`, `emailOtpExpiresAt`, `lastLoginAt`, `failedLoginAttempts`, `lockedUntil`, + audit columns

**roles table** — `id`, `name` (unique), `displayName`, `description`, `isActive`, + audit columns

**userRoles table** — `id`, `userId` (FK→users CASCADE), `roleId` (FK→roles CASCADE), `tenantId` (FK→tenants CASCADE), `isActive`, + audit columns. Unique on `(userId, tenantId)`.

**pages table** — `id`, `title`, `slug` (unique), `icon`, `parentId`, `sortOrder`, `routePath`, `isActive`, + audit columns

**tenantPages table** — `id`, `tenantId` (FK→tenants CASCADE), `pageId` (FK→pages CASCADE), `isActive`, + audit columns. Unique on `(tenantId, pageId)`.

**tenantRolePages table** — `id`, `tenantId` (FK→tenants CASCADE), `roleId` (FK→roles CASCADE), `pageId` (FK→pages CASCADE), `isActive`, + audit columns. Unique on `(tenantId, roleId, pageId)`.

**tenantRolePagePermissions table** — `id`, `tenantId` (FK), `roleId` (FK), `pageId` (FK), `canView`, `canCreate`, `canUpdate`, `canDelete`, `canPreview`, `isActive`, + audit columns. Unique on `(tenantId, roleId, pageId)`.

**sessions table** — `id`, `userId` (FK→users CASCADE), `tenantId`, `isActive`, `createdOn`, `lastActiveOn`, `expiresOn`, `revokedOn`, `userIp`, `userAgent`

**refreshTokens table** — `id`, `sessionId` (FK→sessions CASCADE), `tokenHash`, `createdOn`, `expiresOn`, `revokedOn`, `replacedByTokenId`, `userIp`, `userAgent`

**tenants table** — `id`, `name`, `domain` (unique), `isActive`, + audit columns

**subscriptionPlans table** — `id`, `name`, `price` (numeric), `durationDays` (integer), + audit columns

**tenantSubscriptions table** — `id`, `tenantId` (FK→tenants), `planId` (FK→subscriptionPlans), `startDate` (date), `endDate` (date), `isActive`, + audit columns

---

## PHASE 1 — Enums & Shared Constants (No Magic Strings)

### 1.1 Role Name Enum — `server/shared/constants/enums.ts`

Create a single enums file used by both server services and DTOs:

```typescript
export enum RoleName {
  SUPER_ADMIN = "super_admin",
  TENANT_ADMIN = "tenant_admin",
  USER = "user",
}

export enum TwoFactorMethod {
  APP = "app",
  EMAIL = "email",
}

export enum RegistrationMode {
  SUPER_ADMIN_BOOTSTRAP = "bootstrap",    // first user in system → becomes super_admin
  TENANT_ADMIN_REGISTER = "tenant_register", // subsequent users → choose subscription → become tenant_admin
}
```

### 1.2 Auth Constants — `server/shared/constants/feature/authMessages.ts`

Follow the same pattern as existing `categoryMessages.ts`, `userMessages.ts`, etc.:

```typescript
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGIN_INVALID_CREDENTIALS: "Invalid email or password",
  LOGIN_ACCOUNT_DEACTIVATED: "Account is deactivated",
  LOGIN_ACCOUNT_LOCKED: "Account temporarily locked. Please try again later.",
  LOGIN_NO_ROLE: "No role assigned to this account",
  LOGIN_SUBSCRIPTION_EXPIRED: "Subscription expired. Contact your administrator.",
  LOGOUT_SUCCESS: "Logged out successfully",
  LOGOUT_ALL_SUCCESS: "All sessions logged out",
  REFRESH_SUCCESS: "Token refreshed",
  REFRESH_INVALID: "Invalid or expired refresh token",
  SESSION_INACTIVE: "Session is no longer active",
  USER_INACTIVE: "User is inactive",
  TOKEN_REQUIRED: "Authentication required",
  TOKEN_INVALID: "Invalid or expired access token",
  ACCESS_DENIED: "Access denied",
  TWO_FACTOR_REQUIRED: "Two-factor verification required",
  TWO_FACTOR_INVALID_CODE: "Invalid 2FA code",
  TWO_FACTOR_SETUP_SUCCESS: "Two-factor authentication enabled",
  TWO_FACTOR_DISABLED: "Two-factor authentication disabled",
  TWO_FACTOR_OTP_SENT: "OTP sent to your email",
  REGISTER_SUCCESS: "Registration successful",
  REGISTER_EMAIL_EXISTS: "A user with this email already exists",
  REGISTER_PLAN_NOT_FOUND: "Selected subscription plan not found",
  REGISTER_PLAN_INACTIVE: "Selected subscription plan is no longer available",
  SUPER_ADMIN_EXISTS: "System already has a super admin",
  SUPER_ADMIN_BOOTSTRAP_SUCCESS: "Super admin account created successfully",
} as const;

export type AuthMessageKey = keyof typeof AUTH_MESSAGES;
```

### 1.3 Registration DTO — `server/shared/dtos/Auth.ts`

Create a new DTO file dedicated to auth/registration:

```typescript
import { z } from "zod";
import { RoleName } from "../constants/enums";

// === CHECK SYSTEM STATUS (public endpoint) ===
export const systemStatusResponseSchema = z.object({
  hasSuperAdmin: z.boolean(),
  registrationMode: z.enum(["bootstrap", "tenant_register"]),
});
export type SystemStatusResponseDTO = z.infer<typeof systemStatusResponseSchema>;

// === LOGIN DTO ===
export const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
}).strict();
export type LoginDTO = z.infer<typeof loginSchema>;

// === VERIFY 2FA DTO ===
export const verify2FASchema = z.object({
  tempToken: z.string().min(1, "Temp token is required"),
  code: z.string().length(6, "Code must be 6 digits"),
}).strict();
export type Verify2FADTO = z.infer<typeof verify2FASchema>;

// === REFRESH TOKEN DTO ===
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
}).strict();
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

// === SUPER ADMIN BOOTSTRAP REGISTRATION ===
export const registerSuperAdminSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Valid email is required"),
  mobile: z.string().trim().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).strict().refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type RegisterSuperAdminDTO = z.infer<typeof registerSuperAdminSchema>;

// === TENANT ADMIN REGISTRATION (with subscription) ===
export const registerTenantAdminSchema = z.object({
  // Step 1 — Subscription
  planId: z.string().uuid("Invalid subscription plan"),
  // Step 2 — Personal Info
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Valid email is required"),
  mobile: z.string().trim().min(1, "Phone number is required"),
  // Step 3 — Password
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).strict().refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export type RegisterTenantAdminDTO = z.infer<typeof registerTenantAdminSchema>;
```

### 1.4 Client-Side Auth Models — update `client/src/models/Auth.ts`

Add the registration-related types alongside the existing `AuthUser`, `LoginResponse` etc.:

```typescript
// --- EXISTING (keep as-is) ---
export interface AuthUser { ... }
export interface AuthSuccessResponse { ... }
export interface RequiresTwoFactorResponse { ... }
export type LoginResponse = AuthSuccessResponse | RequiresTwoFactorResponse;

// --- NEW ---
export interface SystemStatus {
  hasSuperAdmin: boolean;
  registrationMode: "bootstrap" | "tenant_register";
}

export interface SubscriptionPlanOption {
  id: string;
  name: string;
  price: string;
  durationDays: number;
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

export interface RegisterTenantAdminRequest {
  planId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
```

### 1.5 Update Existing Constants Index — `server/shared/constants/index.ts`

Export the new enum and auth messages alongside existing exports. Make sure `RoleName` is importable everywhere.

---

## PHASE 2 — Registration Backend

### 2.1 Public Endpoints — add to `server/api/controllers/auth.ts`

Add three new **public** endpoints (no auth middleware):

#### `GET /api/auth/system-status`

Returns whether the system has a super admin yet, so the client knows which registration form to show.

**Logic**:
1. Query `user_roles` table joined with `roles` table.
2. Check if any row has `roles.name = RoleName.SUPER_ADMIN` and `userRoles.isActive = true`.
3. Return `{ hasSuperAdmin: boolean, registrationMode: hasSuperAdmin ? RegistrationMode.TENANT_ADMIN_REGISTER : RegistrationMode.SUPER_ADMIN_BOOTSTRAP }`.

#### `GET /api/auth/subscription-plans`

Returns active subscription plans for the registration form (public, no auth).

**Logic**:
1. Query `subscription_plans` table.
2. Return array of `{ id, name, price, durationDays }` ordered by `price ASC`.
3. Only return plans (do not filter by is_active since the table doesn't have that column — return all plans).

#### `POST /api/auth/register`

Handles both registration modes based on system status.

**Request body**: Either `RegisterSuperAdminDTO` or `RegisterTenantAdminDTO` — determine which by checking system status at processing time (do NOT trust client-side mode flag — always re-check on server).

**Flow A — Super Admin Bootstrap** (no super admin exists):

1. Re-verify no super admin exists (race condition guard).
2. Validate body against `registerSuperAdminSchema`.
3. Check email uniqueness in `users` table. If exists → 409 with `AUTH_MESSAGES.REGISTER_EMAIL_EXISTS`.
4. Hash password via `PasswordUtil.hashPassword()`.
5. **In a single transaction** (`db.transaction()`):
   a. Create a system tenant (name: "System", domain: "system", isActive: true). This is the super admin's "home" tenant.
   b. Insert user with `tenantId = systemTenant.id`, `isActive = true`.
   c. Look up the `super_admin` role by name (ensure seed data ran via `AuthService.ensureSystemSeedData()`).
   d. Insert `user_roles` row: `userId`, `roleId` (super_admin), `tenantId = systemTenant.id`, `isActive = true`.
   e. **Do NOT** create tenant_pages, tenant_role_pages, or tenant_role_page_permissions — super admin bypasses all permission checks.
6. Auto-login: create session, generate tokens (same as login flow steps 9–13 in existing `AuthService.login()`).
7. Return `AuthSuccessResponse` with tokens and user info.

**Flow B — Tenant Admin Registration** (super admin already exists):

1. Re-verify super admin exists (if not, reject — force bootstrap first).
2. Validate body against `registerTenantAdminSchema`.
3. Check email uniqueness. If exists → 409.
4. Validate `planId` — look up in `subscription_plans`. If not found → 404 with `AUTH_MESSAGES.REGISTER_PLAN_NOT_FOUND`.
5. Hash password.
6. **In a single transaction**:
   a. Create a new tenant (name: `"${firstName} ${lastName}'s Store"`, domain: generate from email or null, isActive: true).
   b. Create tenant subscription: `tenantId`, `planId`, `startDate = today`, `endDate = today + plan.durationDays`, `isActive = true`.
   c. Insert user with `tenantId = newTenant.id`, `isActive = true`.
   d. Look up the `tenant_admin` role by name.
   e. Insert `user_roles`: `userId`, `roleId` (tenant_admin), `tenantId = newTenant.id`, `isActive = true`.
   f. Seed all pages for this tenant:
      - For each page in `STATIC_PAGE_DEFINITIONS` (from `server/shared/utils/authPages.ts`) that is relevant to tenant_admin (exclude super-admin-only pages: `subscription-plans`, `tenants`, `tenant-subscriptions`):
        - Insert into `tenant_pages` (tenantId, pageId, isActive: true).
        - Insert into `tenant_role_pages` for the `tenant_admin` role (tenantId, roleId, pageId, isActive: true).
        - Insert into `tenant_role_page_permissions` for the `tenant_admin` role with all permissions true (canView, canCreate, canUpdate, canDelete, canPreview = true).
   g. To identify which pages are super-admin-only, define a constant:
      ```typescript
      export const SUPER_ADMIN_ONLY_PAGE_SLUGS: string[] = [
        "subscription-plans",
        "tenants",
        "tenant-subscriptions",
      ];
      ```
      Put this in `server/shared/utils/authPages.ts` alongside existing constants.
7. Auto-login: create session, generate tokens with `subscriptionExpiresAt` from the new subscription's `endDate`.
8. Return `AuthSuccessResponse`.

### 2.2 Registration Service — add methods to `server/service/auth_service.ts`

Add these static methods to the existing `AuthService` class:

```typescript
static async getSystemStatus(): Promise<SystemStatusResponseDTO> { ... }
static async getPublicSubscriptionPlans(): Promise<SubscriptionPlanOption[]> { ... }
static async register(req: Request): Promise<AuthSuccessResponse> { ... }
```

The `register()` method internally calls `getSystemStatus()` to decide which flow to execute.

### 2.3 Rate Limiting

Apply the same rate limiter used on `/api/auth/login` to `/api/auth/register` (50 req/15 min). Apply lighter rate limiting (100 req/15 min) to `/api/auth/system-status` and `/api/auth/subscription-plans` since they're GET endpoints.

---

## PHASE 3 — Registration Frontend

### 3.1 System Status Hook — `client/src/hooks/use-Auth.ts`

Create a hook for registration-related queries:

```typescript
export function useSystemStatus() {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: () => apiService.get<SystemStatus>("/api/auth/system-status", { showSuccessToast: false, showErrorToast: false }),
    staleTime: 30_000,  // re-check every 30 seconds
  });
}

export function usePublicSubscriptionPlans() {
  return useQuery({
    queryKey: ["public-subscription-plans"],
    queryFn: () => apiService.get<SubscriptionPlanOption[]>("/api/auth/subscription-plans", { showSuccessToast: false }),
    staleTime: 5 * 60_000,
  });
}
```

### 3.2 Register Page — `client/src/pages/auth/Register.tsx`

A fancy, user-friendly page matching the Login page's visual style. The app title **"Helium Easy Ecom"** should appear on this page and the Login page.

**Behavior**:
1. On mount, call `useSystemStatus()` to determine registration mode.
2. While loading, show a centered loading spinner.

**Mode A — Super Admin Bootstrap** (`!hasSuperAdmin`):

Simple single-step form (or minimal steps) — no subscription selection needed.

Form fields:
- First Name, Last Name
- Email, Phone
- Password, Confirm Password
- "I accept the terms and conditions" checkbox
- "Create Super Admin Account" button

Show a notice banner: _"You're creating the first admin account for Helium Easy Ecom. This account will have full system access."_

**Mode B — Tenant Admin Registration** (`hasSuperAdmin`):

Step wizard with 3 steps, smooth transitions (use shadcn `Card` or custom stepper UI):

**Step 1 — Choose Subscription Plan**:
- Title: "Choose Your Plan"
- Fetch plans via `usePublicSubscriptionPlans()`.
- Display each plan as a selectable card with: plan name, price (formatted as currency), duration (e.g. "30 days", "365 days").
- Highlight selected plan. "Next" button enabled only when a plan is selected.
- If no plans are available, show a message: "No subscription plans available. Please contact the administrator."

**Step 2 — Personal Information**:
- Title: "Your Details"
- Fields: First Name, Last Name, Email, Phone
- All required. Email validated.
- "Back" and "Next" buttons.

**Step 3 — Set Password**:
- Title: "Secure Your Account"
- Fields: Password, Confirm Password
- Password strength indicator (optional but nice-to-have).
- "I accept the terms and conditions" checkbox.
- "Back" and "Create Account" buttons. Submit button disabled until checkbox is checked and passwords match.

**On Submit**:
- Call `POST /api/auth/register` with all collected data.
- On success: auto-login (store tokens from response), navigate to `/admin`.
- On error: show toast with error message, stay on current step.

### 3.3 UI Requirements for Login and Register Pages

Both pages should share a consistent visual theme:

- **Background**: Gradient or subtle pattern (orange/amber theme to match existing).
- **App title**: "Helium Easy Ecom" displayed prominently (logo area or header text).
- **Card-based layout**: Centered card(s) on the page.
- **Navigation between pages**: Login page has "Don't have an account? Register" link. Register page has "Already have an account? Login" link.
- **Responsive**: Works well on mobile and desktop.
- **Loading states**: Spinner on buttons during submission.
- **Error states**: Inline field validation errors (use `react-hook-form` + zod resolver). Toast for server errors.
- **Use shadcn/ui components**: `Card`, `Button`, `Input`, `Label`, `Checkbox`, `Form` (react-hook-form integration), etc.

### 3.4 Update Login Page — `client/src/pages/auth/Login.tsx`

Modify the existing Login page:
1. Add "Helium Easy Ecom" title/branding above the login card.
2. Add "Don't have an account? Register" link below the login form, linking to `/register`.
3. Keep existing login logic intact.

### 3.5 Update App Router — `client/src/App.tsx`

Add the new register route:

```tsx
<Route path="/register" component={Register} />
```

This is a public route (no auth required), alongside `/login` and `/2fa-verify`.

### 3.6 Update Root Redirect — in `client/src/App.tsx`

The `RootRedirect` component should redirect:
- Authenticated users → `/admin`
- Unauthenticated users → `/login`

(This already exists. Just confirm it works correctly.)

---

## PHASE 4 — Database Migration & Seed Data

### 4.1 Generate and Apply Migrations

Run Drizzle Kit to generate migration SQL and apply it:

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

Or use `npm run db:push` if that script exists.

### 4.2 Automatic Seed on Server Start

The existing `AuthService.ensureSystemSeedData()` method seeds roles and pages. Make sure it runs on server startup (in `server/index.ts` or wherever the Express app initializes):

```typescript
// After DB connection is ready
await AuthService.ensureSystemSeedData();
```

**What `ensureSystemSeedData()` must seed** (update if needed):

1. **Roles** — Insert 3 roles if they don't exist:
   - `{ name: "super_admin", displayName: "Super Admin", description: "Full system control" }`
   - `{ name: "tenant_admin", displayName: "Tenant Admin", description: "Full control of their own tenant" }`
   - `{ name: "user", displayName: "User", description: "Access based on permissions" }`

2. **Pages** — Insert all entries from `STATIC_PAGE_DEFINITIONS` if they don't exist (match by `slug`).

Do **not** seed any users — that happens through the registration flow.

### 4.3 Verify Seed Idempotency

`ensureSystemSeedData()` must be **idempotent** — safe to call multiple times without creating duplicates. Use upsert or check-before-insert pattern.

---

## PHASE 5 — Cleanup & Integration Checks

### 5.1 Replace All Magic Strings

Audit the following files and replace any raw string literals with constants from the new enums:

- `server/service/auth_service.ts` — Replace `"super_admin"`, `"tenant_admin"`, `"user"` with `RoleName.SUPER_ADMIN`, `RoleName.TENANT_ADMIN`, `RoleName.USER`.
- `server/shared/middleware/authMiddleware.ts` — Replace `"super_admin"` with `RoleName.SUPER_ADMIN`.
- `server/shared/middleware/authorizationMiddleware.ts` — Replace `"super_admin"`, `"tenant_admin"` with enum values.
- `server/service/navigation_service.ts` — Replace role name strings with enum values.
- `server/service/user_service.ts` — Replace any role name strings.
- `client/src/contexts/AuthContext.tsx` — Replace `"super_admin"` / `"tenant_admin"` string comparisons with imported constants (create a shared `client/src/lib/enums.ts` mirroring the server enum if needed, or export from a shared location).

### 5.2 Validate TypeScript Compilation

After all changes, run:

```bash
npm run check
```

Fix all TypeScript errors. The build must pass with exit code 0.

### 5.3 Verify Existing Features Still Work

Ensure all existing CRUD features (categories, products, orders, etc.) still compile and their services correctly use `extractTenantId()` from the auth context.

---

## Summary of New/Modified Files

### New Files to Create

| File | Purpose |
|------|---------|
| `server/shared/constants/enums.ts` | `RoleName`, `TwoFactorMethod`, `RegistrationMode` enums |
| `server/shared/constants/feature/authMessages.ts` | `AUTH_MESSAGES` constant object |
| `server/shared/dtos/Auth.ts` | Zod schemas for login, register, 2FA, system-status |
| `client/src/pages/auth/Register.tsx` | Step wizard registration page |
| `client/src/hooks/use-Auth.ts` | `useSystemStatus()`, `usePublicSubscriptionPlans()` hooks |

### Files to Modify

| File | Changes |
|------|---------|
| `server/service/auth_service.ts` | Add `getSystemStatus()`, `getPublicSubscriptionPlans()`, `register()` methods; replace magic strings with enums |
| `server/api/controllers/auth.ts` | Add `GET /api/auth/system-status`, `GET /api/auth/subscription-plans`, `POST /api/auth/register` routes |
| `server/shared/utils/authPages.ts` | Add `SUPER_ADMIN_ONLY_PAGE_SLUGS` constant |
| `server/shared/constants/index.ts` | Export new enums and auth messages |
| `server/shared/middleware/authMiddleware.ts` | Replace `"super_admin"` with `RoleName.SUPER_ADMIN` |
| `server/shared/middleware/authorizationMiddleware.ts` | Replace role name strings with enum values |
| `server/service/navigation_service.ts` | Replace role name strings with enum values |
| `server/service/user_service.ts` | Replace role name strings with enum values |
| `client/src/models/Auth.ts` | Add `SystemStatus`, `SubscriptionPlanOption`, `RegisterSuperAdminRequest`, `RegisterTenantAdminRequest` interfaces |
| `client/src/pages/auth/Login.tsx` | Add "Helium Easy Ecom" branding, "Register" link |
| `client/src/App.tsx` | Add `/register` route |
| `client/src/contexts/AuthContext.tsx` | Replace role name magic strings with constants |

---

## Architecture Rules (MUST follow)

1. **Controller → Service → Repository** — never query DB directly from controller.
2. **All public auth endpoints** go under `/api/auth/*` — no auth middleware.
3. **All admin endpoints** go under `/api/admin/*` — protected by auth + authorization middleware.
4. **Transaction safety** — registration creates multiple records; wrap in `db.transaction()`.
5. **Zod validation** — validate all request bodies with Zod schemas before processing.
6. **Audit columns** — set `createdBy`, `createdOn`, `userIp` on all new records.
7. **No hardcoded UUIDs** — look up role IDs and plan IDs by name/reference at runtime.
8. **Idempotent seed** — `ensureSystemSeedData()` must not create duplicates on restart.
9. **No breaking changes** — existing CRUD screens and their service calls must continue working.
10. **Client constants** — mirror `RoleName` enum or equivalent on client side for type-safe role comparisons.