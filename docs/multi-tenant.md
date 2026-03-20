# Multi-Tenant RBAC, Authentication & Authorization — Implementation Prompt

## Goal

Implement a complete multi-tenant system with role-based access control (RBAC), JWT authentication (access + refresh tokens), two-factor authentication (2FA), subscription-based expiry enforcement, and dynamic permission-driven navigation. Every feature must integrate cleanly with the existing codebase patterns described below.

---

## Existing Codebase Context (READ BEFORE IMPLEMENTING)

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + Express.js (ESM, `"type": "module"`) |
| DB ORM | Drizzle ORM (`drizzle-orm` + `postgres` driver) |
| Validation | Zod + `drizzle-zod` |
| Client Framework | React 18 + Wouter (routing) |
| State / Fetching | TanStack Query v5 (`@tanstack/react-query`) |
| UI | Shadcn/ui (Radix primitives) + Tailwind CSS |
| Forms | React Hook Form + `@hookform/resolvers/zod` |
| Language | TypeScript (strict mode) throughout |

### Architecture Layers (follow exactly)

```
Controller (server/api/controllers/)   → HTTP handling, asyncHandler wrapper, ResponseHandler
     ↓
Service   (server/service/)            → Business logic, request parsing, IP extraction
     ↓
Repository (server/service/repos/)     → Drizzle queries, multi-tenant WHERE clauses
```

### Key Conventions Already in Place

1. **Schema files** → `server/db/schemas/<entity>.ts` — Drizzle `pgTable` definitions with `createInsertSchema` from `drizzle-zod`.
2. **DTO files** → `server/shared/dtos/<Entity>.ts` — Zod schemas for `create`, `update`, `response`; TypeScript interfaces for `GetOptions`, `GetResponse`.
3. **Repo pattern** → Interface `IStorage<Entity>` + class `Storage<Entity>` implementing it; exported singleton (`export const storage<Entity> = new Storage<Entity>()`).
4. **Multi-tenant queries** → All read/write queries include `eq(table.tenantId, tenantId)` combined with `and()`. Update/delete verify tenant ownership.
5. **Service pattern** → Class with methods that accept Express `Request`, extract query params / body / IP, delegate to repo. Exported singleton.
6. **Controller pattern** → `registerXxxRoutes(app: Express)` function; each route uses `asyncHandler`, calls service, returns via `ResponseHandler.success()` / `.paginated()` / `.error()`.
7. **Route definitions** → `server/api/routes/<entity>Route.ts` — `api` object with `list`, `create`, `get`, `update`, `delete` keys each having `method`, `path`, Zod `input`/`responses`.
8. **Constants** → `server/shared/constants/feature/<entity>Messages.ts` — MESSAGES, SORT_FIELDS constants.
9. **Shared utils** → `ResponseHandler`, `asyncHandler`, `PasswordUtil` (PBKDF2, 100 000 iterations, SHA-256).
10. **Client hooks** → `client/src/hooks/use-<Entity>.ts` — `useQuery` for reads, `useMutation` + `invalidateQueries` for writes.
11. **Client models** → `client/src/models/<Entity>.ts` — TypeScript interfaces for the entity, `Create*Request`, `Update*Request`.
12. **Client pages** → `client/src/pages/<entity>/<Entity>s.tsx` — state for search/page/sort/modals; `PaginatedDataTable` + `ActionButtons`; Create/Edit/Delete modal sub-components.
13. **API service** → `client/src/lib/apiService.ts` — `ApiService` class with `get/post/patch/delete/postFormData`; auto-attaches `Bearer` token from `localStorage.getItem("authToken")`.
14. **Layout** → `client/src/components/Layout.tsx` — hardcoded navigation array; responsive sidebar + header.
15. **DB connection** → `server/db/db.ts` — `export const db = drizzle(client)` using `postgres(process.env.DATABASE_URL)`.
16. **Existing tables referenced** → `users` (has `tenantId`, `email`, `password`), `tenants` (has `domain`, `isActive`), `subscription_plans` (has `durationDays`, `price`), `tenant_subscriptions` (has `tenantId`, `planId`, `startDate`, `endDate`, `isActive`), `sessions`, `refresh_tokens`.
17. **Password hashing** → `PasswordUtil.hashPassword()` / `PasswordUtil.verifyPassword()` already in `server/shared/utils/passwordUtil.ts`.
18. **DEFAULT_TENANT_ID** is hardcoded in `user_service.ts` — must be removed once auth context provides tenant.
19. **Audit columns** on every table: `created_by uuid`, `updated_by uuid`, `created_on timestamptz`, `updated_on timestamptz`, `user_ip text`.

---

## PHASE 1 — New Database Tables

Create Drizzle schema files in `server/db/schemas/`. Follow the exact same style as existing schemas (e.g., `tenants.ts`, `users.ts`). Every table includes the standard audit columns.

### 1.1 `roles` table — `server/db/schemas/roles.ts`

```sql
CREATE TABLE roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,       -- 'super_admin', 'tenant_admin', 'user'
  display_name  TEXT NOT NULL,              -- 'Super Admin', 'Tenant Admin', 'User'
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID,
  updated_by    UUID,
  created_on    TIMESTAMPTZ DEFAULT NOW(),
  updated_on    TIMESTAMPTZ,
  user_ip       TEXT
);
```

**Seed data** (insert on first migration or via a seed script):

| name | display_name | description |
|------|-------------|-------------|
| `super_admin` | Super Admin | Full system control — all tenants, subscriptions, pages |
| `tenant_admin` | Tenant Admin | Full control of their own tenant |
| `user` | User | Access based on permissions assigned by Tenant Admin |

### 1.2 `user_roles` table — `server/db/schemas/userRoles.ts`

```sql
CREATE TABLE user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  updated_by UUID,
  created_on TIMESTAMPTZ DEFAULT NOW(),
  updated_on TIMESTAMPTZ,
  user_ip    TEXT,
  UNIQUE(user_id, role_id, tenant_id)
);
```

**Rules**:
- A user can have exactly ONE role per tenant (enforce at service layer; unique constraint helps at DB level).
- `super_admin` role has a special system-level tenant (or `NULL` tenant) — decide convention and be consistent.

### 1.3 `pages` table — `server/db/schemas/pages.ts`

```sql
CREATE TABLE pages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,          -- e.g. 'users', 'orders', 'products'
  icon       TEXT,                          -- Lucide icon name string
  parent_id  UUID REFERENCES pages(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  route_path TEXT NOT NULL,                 -- e.g. '/admin/users'
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  updated_by UUID,
  created_on TIMESTAMPTZ DEFAULT NOW(),
  updated_on TIMESTAMPTZ,
  user_ip    TEXT
);
```

**Seed data** — one row per existing page in the sidebar navigation:

| title | slug | icon | route_path | parent_id | sort_order |
|-------|------|------|------------|-----------|------------|
| Dashboard | dashboard | LayoutDashboard | /admin | NULL | 1 |
| Subscription Plans | subscription-plans | Package | /admin/subscription-plans | NULL | 2 |
| Tenants | tenants | Building2 | /admin/tenants | NULL | 3 |
| Tenant Subscriptions | tenant-subscriptions | Briefcase | /admin/tenant-subscriptions | NULL | 4 |
| Users | users | Users | /admin/users | NULL | 5 |
| Organizations | organizations | Building | /admin/organizations | NULL | 6 |
| Main Categories | main-categories | Layers | /admin/main-categories | NULL | 7 |
| Categories | categories | FolderTree | /admin/categories | NULL | 8 |
| Sub Categories | sub-categories | FolderOpen | /admin/sub-categories | NULL | 9 |
| Sub Sub Categories | sub-sub-categories | FolderClosed | /admin/sub-sub-categories | NULL | 10 |
| Products | products | ShoppingBag | /admin/products | NULL | 11 |
| Orders | orders | ShoppingCart | /admin/orders | NULL | 12 |
| FAQs | faqs | HelpCircle | /admin/faqs | NULL | 13 |
| Home Settings | home-settings | Home | /admin/home-settings | NULL | 14 |
| Popup Ads | popup-ads | Megaphone | /admin/popup-ads | NULL | 15 |
| Roles | roles | Shield | /admin/roles | NULL | 16 |
| Pages | pages-mgmt | FileText | /admin/pages | NULL | 17 |

### 1.4 `tenant_pages` table — `server/db/schemas/tenantPages.ts`

```sql
CREATE TABLE tenant_pages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  page_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  updated_by UUID,
  created_on TIMESTAMPTZ DEFAULT NOW(),
  updated_on TIMESTAMPTZ,
  user_ip    TEXT,
  UNIQUE(tenant_id, page_id)
);
```

**Purpose**: Super Admin assigns which pages a tenant can access. If a page is not in this table (or `is_active = false`) for a tenant, the tenant admin and their users cannot see or access it.

### 1.5 `tenant_role_pages` table — `server/db/schemas/tenantRolePages.ts`

```sql
CREATE TABLE tenant_role_pages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  page_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID,
  updated_by UUID,
  created_on TIMESTAMPTZ DEFAULT NOW(),
  updated_on TIMESTAMPTZ,
  user_ip    TEXT,
  UNIQUE(tenant_id, role_id, page_id)
);
```

**Purpose**: Tenant Admin assigns which pages a specific role within their tenant can access. Must be a subset of `tenant_pages` for that tenant.

### 1.6 `tenant_role_page_permissions` table — `server/db/schemas/tenantRolePagePermissions.ts`

```sql
CREATE TABLE tenant_role_page_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  page_id     UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  can_view    BOOLEAN NOT NULL DEFAULT FALSE,
  can_create  BOOLEAN NOT NULL DEFAULT FALSE,
  can_update  BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete  BOOLEAN NOT NULL DEFAULT FALSE,
  can_preview BOOLEAN NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID,
  updated_by  UUID,
  created_on  TIMESTAMPTZ DEFAULT NOW(),
  updated_on  TIMESTAMPTZ,
  user_ip     TEXT,
  UNIQUE(tenant_id, role_id, page_id)
);
```

**Purpose**: Fine-grained CRUD permissions per page per role per tenant. Tenant Admin sets these for the `user` role. Tenant Admin themselves bypass permission checks (full access to their tenant's pages).

### 1.7 Modify existing `users` table — `server/db/schemas/users.ts`

Add the following columns to the existing `users` schema:

```sql
ALTER TABLE users ADD COLUMN is_active             BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN two_factor_enabled     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_secret      TEXT;           -- TOTP secret for authenticator app
ALTER TABLE users ADD COLUMN two_factor_method      TEXT;           -- 'email' | 'app' | NULL
ALTER TABLE users ADD COLUMN email_otp_code         TEXT;           -- temporary OTP for email 2FA
ALTER TABLE users ADD COLUMN email_otp_expires_at   TIMESTAMPTZ;   -- expiry for email OTP
ALTER TABLE users ADD COLUMN last_login_at          TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN failed_login_attempts  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until           TIMESTAMPTZ;   -- account lockout
```

**Important**: Do NOT add a `role` column to users. Roles are managed through the `user_roles` join table.

### 1.8 Modify existing `tenant_subscriptions` table

Ensure the existing table includes:
- `start_date DATE NOT NULL`
- `end_date DATE NOT NULL`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`

These already exist. No changes needed if current schema matches.

### 1.9 Modify existing `sessions` table — `server/db/schemas/sessions.ts`

Add column:
```sql
ALTER TABLE sessions ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
```

### 1.10 Modify existing `refresh_tokens` table

Already has: `token_hash`, `expires_on`, `revoked_on`, `session_id` (FK to sessions with `ON DELETE CASCADE`). No changes needed.

### Index Strategy

Add indexes for query performance:

```sql
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_tenant_pages_tenant_id ON tenant_pages(tenant_id);
CREATE INDEX idx_tenant_role_pages_tenant_role ON tenant_role_pages(tenant_id, role_id);
CREATE INDEX idx_tenant_role_page_permissions_lookup ON tenant_role_page_permissions(tenant_id, role_id, page_id);
CREATE INDEX idx_sessions_user_tenant ON sessions(user_id, tenant_id);
CREATE INDEX idx_refresh_tokens_session ON refresh_tokens(session_id);
CREATE INDEX idx_pages_parent ON pages(parent_id);
CREATE INDEX idx_pages_slug ON pages(slug);
```

After creating/updating all schemas, run `npm run db:push` to apply via Drizzle Kit.

---

## PHASE 2 — Authentication System (JWT Access + Refresh Tokens)

### 2.1 Install Dependencies

```bash
npm install jsonwebtoken @types/jsonwebtoken otplib qrcode @types/qrcode
```

- `jsonwebtoken` — JWT signing/verification
- `otplib` — TOTP generation/verification for 2FA authenticator app
- `qrcode` — QR code generation for authenticator app setup

### 2.2 JWT Configuration — `server/shared/utils/jwtUtil.ts`

Create a utility class:

```
JwtUtil:
  - ACCESS_TOKEN_EXPIRY  = '15m'
  - REFRESH_TOKEN_EXPIRY = '7d'
  - JWT_SECRET           = process.env.JWT_SECRET (MUST exist, throw on startup if missing)
  - REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET (MUST exist)

  Methods:
  - generateAccessToken(payload: AccessTokenPayload): string
  - generateRefreshToken(payload: RefreshTokenPayload): string
  - verifyAccessToken(token: string): AccessTokenPayload
  - verifyRefreshToken(token: string): RefreshTokenPayload
```

**AccessTokenPayload** — embedded in every JWT:
```typescript
interface AccessTokenPayload {
  userId: string;
  tenantId: string;
  roleId: string;
  roleName: string;          // 'super_admin' | 'tenant_admin' | 'user'
  sessionId: string;
  subscriptionExpiresAt?: string;  // ISO date string — NULL for super_admin
}
```

**RefreshTokenPayload**:
```typescript
interface RefreshTokenPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
}
```

### 2.3 Auth Controller — `server/api/controllers/auth.ts`

Create endpoints:

#### `POST /api/auth/login`

**Request body**: `{ email: string, password: string }`

**Flow**:
1. Find user by email (`storageUser.getUserByEmail()`). If not found → 401 "Invalid credentials".
2. Check `user.is_active`. If false → 403 "Account is deactivated".
3. Check `user.locked_until`. If locked → 429 "Account temporarily locked".
4. Verify password via `PasswordUtil.verifyPassword()`. If wrong:
   - Increment `failed_login_attempts`.
   - If attempts >= 5, set `locked_until = NOW() + 15 minutes`.
   - Return 401 "Invalid credentials".
5. Reset `failed_login_attempts` to 0 on success.
6. Look up the user's role via `user_roles` table (JOIN `roles`). If no active role → 403 "No role assigned".
7. For **tenant_admin** and **user** roles: Check `tenant_subscriptions` for the user's `tenantId`:
   - Find the active subscription where `is_active = true`.
   - If `end_date < NOW()` → 403 "Subscription expired. Contact your administrator."
   - Store `end_date` as `subscriptionExpiresAt` in the token payload.
8. Check if user has 2FA enabled (`two_factor_enabled = true`):
   - If YES → return `{ requires2FA: true, tempToken: <short-lived token (5min)>, method: user.two_factor_method }`. Do NOT issue access/refresh tokens yet.
   - If NO → proceed to step 9.
9. Create a session in `sessions` table with `userId`, `tenantId`, `expiresOn`, `userIp`, `userAgent`, `is_active = true`.
10. Generate access token + refresh token.
11. Hash the refresh token (`crypto.createHash('sha256').update(token).digest('hex')`) and store in `refresh_tokens` table linked to the session.
12. Update `user.last_login_at`.
13. Return:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "tenantId": "...",
    "roleName": "...",
    "roleId": "..."
  }
}
```

#### `POST /api/auth/verify-2fa`

**Request body**: `{ tempToken: string, code: string }`

**Flow**:
1. Verify `tempToken` (short-lived JWT containing `userId`).
2. Fetch user. Check `two_factor_method`:
   - If `'app'` → verify TOTP code using `otplib.authenticator.verify({ token: code, secret: user.two_factor_secret })`.
   - If `'email'` → verify `code === user.email_otp_code` AND `email_otp_expires_at > NOW()`.
3. If invalid → 401 "Invalid 2FA code".
4. If valid → clear `email_otp_code`/`email_otp_expires_at`, then proceed to create session + tokens (same as login step 9-13).

#### `POST /api/auth/refresh`

**Request body**: `{ refreshToken: string }`

**Flow**:
1. Hash the incoming refresh token.
2. Find the matching row in `refresh_tokens` by `token_hash` where `revoked_on IS NULL` and `expires_on > NOW()`.
3. If not found → 401 "Invalid or expired refresh token".
4. Fetch the associated session. If session `revoked_on IS NOT NULL` or `is_active = false` → 401.
5. Fetch the user. If `is_active = false` → 401.
6. For tenant_admin/user: re-check `tenant_subscriptions.end_date`. If expired:
   - Revoke the session (`revoked_on = NOW()`, `is_active = false`).
   - Revoke the refresh token (`revoked_on = NOW()`).
   - Return 403 "Subscription expired".
7. **Rotate the refresh token** (security best practice):
   - Revoke old refresh token (`revoked_on = NOW()`, `replaced_by_token_id = newTokenId`).
   - Generate new refresh token, hash & insert into `refresh_tokens`.
8. Generate a new access token with fresh `subscriptionExpiresAt`.
9. Return `{ accessToken, refreshToken }`.

#### `POST /api/auth/logout`

**Request body**: `{ refreshToken?: string }` (or use session from JWT)

**Flow**:
1. Extract `sessionId` from the current access token.
2. Revoke all refresh tokens for that session (`revoked_on = NOW()`).
3. Revoke the session (`revoked_on = NOW()`, `is_active = false`).
4. Return 200 "Logged out successfully".

#### `POST /api/auth/logout-all-sessions`

**Purpose**: Force logout from all devices.

**Flow**:
1. Extract `userId` and `tenantId` from JWT.
2. Revoke ALL active sessions for that user.
3. Revoke ALL non-revoked refresh tokens for those sessions.
4. Return 200.

### 2.4 Auth Middleware — `server/shared/middleware/authMiddleware.ts`

Create an Express middleware that runs on ALL `/api/admin/*` routes:

```typescript
function authMiddleware(req: Request, res: Response, next: NextFunction): void
```

**Flow**:
1. Extract `Authorization: Bearer <token>` header. If missing → 401.
2. Verify JWT via `JwtUtil.verifyAccessToken()`. If invalid/expired → 401.
3. Check `subscriptionExpiresAt` from the token payload (skip for `super_admin`):
   - Parse the date. If `subscriptionExpiresAt < NOW()` → 403 "Subscription expired".
4. Attach decoded payload to `req.user`:
   ```typescript
   // Extend Express Request type
   declare global {
     namespace Express {
       interface Request {
         user?: AccessTokenPayload;
       }
     }
   }
   ```
5. Call `next()`.

**Apply middleware**: In `server/routes.ts`, add `app.use('/api/admin', authMiddleware)` BEFORE registering feature routes. Auth routes (`/api/auth/*`) must NOT require this middleware.

### 2.5 Tenant Context Extraction

After `authMiddleware` validates the JWT, every service method must use `req.user.tenantId` instead of the hardcoded `DEFAULT_TENANT_ID`.

**Changes required in ALL existing services**:
- `user_service.ts` → remove `DEFAULT_TENANT_ID`, use `req.user!.tenantId`
- `organization_service.ts`, `order_service.ts`, `product_service.ts`, `category_service.ts`, `mainCategory_service.ts`, `subCategory_service.ts`, `subSubCategory_service.ts`, `faq_service.ts`, `homeSetting_service.ts`, `popupAd_service.ts` → all must read `tenantId` from `req.user!.tenantId` for tenant_admin/user roles.
- For `super_admin`: When a super admin passes `?tenantId=<uuid>` query param, use that. Otherwise omit tenant filter (return all). Add a helper:

```typescript
function extractTenantId(req: Request): string | null {
  const { roleName, tenantId } = req.user!;
  if (roleName === 'super_admin') {
    return (req.query.tenantId as string) || null;  // null = all tenants
  }
  return tenantId;  // always scoped for tenant_admin/user
}
```

**For super_admin queries without tenantId filter**: Repos need an overload that omits the `tenantId` WHERE clause. Add optional `tenantId` parameter:
```typescript
async getProducts(tenantId: string | null, options): Promise<GetProductsResponse> {
  const whereConditions = tenantId
    ? and(eq(products.tenantId, tenantId), ...searchConditions)
    : searchConditions.length > 0 ? or(...searchConditions) : undefined;
  // ...
}
```

---

## PHASE 3 — Role-Based Access Control (Authorization)

### 3.1 Permission Middleware — `server/shared/middleware/permissionMiddleware.ts`

Create a middleware factory:

```typescript
function requirePermission(pageSlug: string, permission: 'can_view' | 'can_create' | 'can_update' | 'can_delete' | 'can_preview') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { roleName, tenantId, roleId } = req.user!;

    // Super Admin — full access to everything
    if (roleName === 'super_admin') return next();

    // Tenant Admin — full access to their tenant's assigned pages
    if (roleName === 'tenant_admin') {
      const tenantPage = await db.select()
        .from(tenantPages)
        .innerJoin(pages, eq(tenantPages.pageId, pages.id))
        .where(and(
          eq(tenantPages.tenantId, tenantId),
          eq(pages.slug, pageSlug),
          eq(tenantPages.isActive, true),
          eq(pages.isActive, true)
        ))
        .limit(1);

      if (tenantPage.length === 0) {
        return ResponseHandler.error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
      }
      return next();
    }

    // Regular User — check specific permission
    const permissionRow = await db.select()
      .from(tenantRolePagePermissions)
      .innerJoin(pages, eq(tenantRolePagePermissions.pageId, pages.id))
      .where(and(
        eq(tenantRolePagePermissions.tenantId, tenantId),
        eq(tenantRolePagePermissions.roleId, roleId),
        eq(pages.slug, pageSlug),
        eq(tenantRolePagePermissions.isActive, true),
        eq(pages.isActive, true)
      ))
      .limit(1);

    if (permissionRow.length === 0 || !permissionRow[0].tenant_role_page_permissions[permission]) {
      return ResponseHandler.error(res, 'Access denied', HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
}
```

### 3.2 Apply Permission Middleware to Controllers

Update each controller to use permission checks. Example for products:

```typescript
// In server/api/controllers/products.ts
app.get(api.products.list.path, requirePermission('products', 'can_view'), asyncHandler(async (req, res) => { ... }));
app.post(api.products.create.path, requirePermission('products', 'can_create'), asyncHandler(async (req, res) => { ... }));
app.patch(api.products.update.path, requirePermission('products', 'can_update'), asyncHandler(async (req, res) => { ... }));
app.delete(api.products.delete.path, requirePermission('products', 'can_delete'), asyncHandler(async (req, res) => { ... }));
```

**Page slug mapping** for every feature controller:

| Controller | Page Slug |
|-----------|-----------|
| users | users |
| tenants | tenants |
| subscriptionPlans | subscription-plans |
| tenantSubscriptions | tenant-subscriptions |
| organizations | organizations |
| mainCategories | main-categories |
| categories | categories |
| subCategories | sub-categories |
| subSubCategories | sub-sub-categories |
| products | products |
| orders | orders |
| faqs | faqs |
| homeSettings | home-settings |
| popupAds | popup-ads |

### 3.3 Role Hierarchy Enforcement Rules

| Action | Super Admin | Tenant Admin | User |
|--------|-------------|-------------|------|
| Manage subscription plans | YES | NO | NO |
| Manage tenants | YES | NO | NO |
| Manage tenant subscriptions | YES | NO | NO |
| Manage roles | YES (system roles) | NO | NO |
| Manage pages (master list) | YES | NO | NO |
| Assign pages to tenants (tenant_pages) | YES | NO | NO |
| Assign pages to roles in tenant (tenant_role_pages) | YES | YES (own tenant) | NO |
| Set permissions (tenant_role_page_permissions) | YES | YES (own tenant) | NO |
| Manage users | YES (any tenant) | YES (own tenant only) | NO |
| View/manage tenant data (orders, products, etc.) | YES (any or all) | YES (own tenant) | Based on permissions |
| Access tenant dropdown filter | YES | NO (auto-scoped) | NO (auto-scoped) |
| Enable/disable 2FA for users | YES | YES (own tenant) | Self only |

### 3.4 Specific Authorization Rules (enforce in service/controller layer)

1. **Tenant admin cannot create another tenant admin** — when creating a user, if the creator's role is `tenant_admin`, the assigned role must be `user` only.
2. **Super admin can assign any role** including `tenant_admin` and `super_admin`.
3. **Users cannot manage other users** — user management endpoints require `super_admin` or `tenant_admin` role (enforce via role check, not page permission).
4. **Tenant admin auto-scoping** — `tenantId` is ALWAYS taken from JWT, never from request body/query for tenant_admin/user.
5. **Cross-tenant access prevention** — if `roleName !== 'super_admin'` and the requested resource's `tenantId !== req.user.tenantId`, return 403.

---

## PHASE 4 — Two-Factor Authentication (2FA)

### 4.1 2FA Setup Endpoints — add to `server/api/controllers/auth.ts`

#### `POST /api/auth/2fa/setup` (requires auth)

**Request body**: `{ method: 'email' | 'app' }`

**Flow for `'app'`**:
1. Generate TOTP secret via `otplib.authenticator.generateSecret()`.
2. Generate `otpauth://` URI: `otplib.authenticator.keyuri(user.email, 'HeliumConsole', secret)`.
3. Generate QR code as base64 data URI via `qrcode.toDataURL(otpauthUrl)`.
4. Store `two_factor_secret` on user (encrypted at rest ideally, or at minimum not returned in API responses).
5. Return `{ qrCode: <base64>, secret: <for manual entry>, method: 'app' }`.

**Flow for `'email'`**:
1. Generate 6-digit OTP: `Math.floor(100000 + Math.random() * 900000).toString()`.
2. Store `email_otp_code` and `email_otp_expires_at = NOW() + 10 minutes` on user.
3. Send OTP to user's email (use an email service — create a placeholder `EmailService` class that logs to console if no email provider is configured).
4. Return `{ method: 'email', message: 'OTP sent to email' }`.

#### `POST /api/auth/2fa/verify-setup` (requires auth)

**Request body**: `{ code: string }`

**Flow**:
1. Verify the code against the user's `two_factor_secret` (for app) or `email_otp_code` (for email).
2. If valid → set `two_factor_enabled = true`, `two_factor_method = method`.
3. Return 200 with success message.

#### `POST /api/auth/2fa/disable` (requires auth)

**Request body**: `{ code: string }` (must verify current 2FA code to disable)

**Flow**:
1. Verify the code.
2. Set `two_factor_enabled = false`, `two_factor_secret = NULL`, `two_factor_method = NULL`, clear OTP fields.
3. Return 200.

### 4.2 2FA During Login

Already described in Phase 2.3 login flow (step 8). When `two_factor_enabled = true`:
- For `'app'` method: Client shows a TOTP input screen.
- For `'email'` method: Backend sends an OTP email, client shows OTP input screen.

---

## PHASE 5 — Subscription Expiry Enforcement

### 5.1 Access Token Check (fast, every request)

In `authMiddleware`, the `subscriptionExpiresAt` is embedded in the JWT. Check:
```typescript
if (decoded.subscriptionExpiresAt) {
  const expiresAt = new Date(decoded.subscriptionExpiresAt);
  if (expiresAt < new Date()) {
    return ResponseHandler.error(res, 'Subscription expired', HTTP_STATUS.FORBIDDEN);
  }
}
```
This provides a fast check without DB query on every request.

### 5.2 Refresh Token Check (revalidates against DB)

In `POST /api/auth/refresh`, perform a live DB query:
```typescript
const subscription = await db.select()
  .from(tenantSubscriptions)
  .where(and(
    eq(tenantSubscriptions.tenantId, decoded.tenantId),
    eq(tenantSubscriptions.isActive, true)
  ))
  .orderBy(desc(tenantSubscriptions.endDate))
  .limit(1);

if (!subscription.length || new Date(subscription[0].endDate) < new Date()) {
  // Revoke session + all refresh tokens for this user
  // Return 403 "Subscription expired"
}
```

### 5.3 Login Check

Already described in Phase 2.3 login flow (step 7).

### 5.4 Client-Side Forced Logout

In `client/src/lib/apiService.ts`, update `handleResponse`:
```typescript
if (response.status === 403) {
  const data = await response.json();
  if (data.message?.includes('Subscription expired')) {
    // Clear local storage tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    // Show toast notification
    toast({ title: 'Session Expired', description: 'Your subscription has expired.', variant: 'destructive' });
    // Redirect to login
    window.location.href = '/login';
    return;
  }
}
```

### 5.5 Client-Side Token Refresh Interceptor

Add automatic token refresh logic to `apiService.ts`:
```typescript
private async handleResponse<T>(response: Response, options: ApiRequestOptions = {}): Promise<T> {
  if (response.status === 401) {
    // Attempt to refresh the token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          localStorage.setItem('authToken', tokens.data.accessToken);
          localStorage.setItem('refreshToken', tokens.data.refreshToken);
          // Retry the original request with new token
          const retryResponse = await fetch(response.url, {
            ...originalRequestOptions,
            headers: { ...headers, Authorization: `Bearer ${tokens.data.accessToken}` },
          });
          return this.handleResponse<T>(retryResponse, { ...options, _isRetry: true });
        }
      } catch (e) {
        // Refresh failed — force logout
      }
    }
    // No refresh token or refresh failed
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  // ... existing handling
}
```

**Important**: Prevent infinite retry loops — use a `_isRetry` flag.

---

## PHASE 6 — Dynamic Navigation (Permission-Based Sidebar)

### 6.1 Navigation API — `GET /api/admin/navigation`

**Response**: Array of page objects the current user can access, in tree structure.

**Controller**: `server/api/controllers/navigation.ts`

**Logic**:

For **super_admin**:
```sql
SELECT * FROM pages WHERE is_active = true ORDER BY sort_order ASC;
```
(All pages)

For **tenant_admin**:
```sql
SELECT p.* FROM pages p
  INNER JOIN tenant_pages tp ON p.id = tp.page_id
  WHERE tp.tenant_id = :tenantId
    AND tp.is_active = true
    AND p.is_active = true
  ORDER BY p.sort_order ASC;
```

For **user**:
```sql
SELECT p.*, trpp.can_view, trpp.can_create, trpp.can_update, trpp.can_delete, trpp.can_preview
  FROM pages p
  INNER JOIN tenant_role_pages trp ON p.id = trp.page_id
  INNER JOIN tenant_role_page_permissions trpp ON p.id = trpp.page_id
    AND trp.tenant_id = trpp.tenant_id
    AND trp.role_id = trpp.role_id
  WHERE trp.tenant_id = :tenantId
    AND trp.role_id = :roleId
    AND trp.is_active = true
    AND trpp.is_active = true
    AND trpp.can_view = true
    AND p.is_active = true
  ORDER BY p.sort_order ASC;
```

**Response shape**:
```typescript
interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  icon: string;
  routePath: string;
  parentId: string | null;
  sortOrder: number;
  permissions?: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canPreview: boolean;
  };
  children?: NavigationItem[];
}
```

Build the tree structure from flat results using `parentId`. Return nested array.

### 6.2 Client Navigation Hook — `client/src/hooks/use-Navigation.ts`

```typescript
export function useNavigation() {
  return useQuery({
    queryKey: ['navigation'],
    queryFn: () => apiService.get<NavigationItem[]>('/api/admin/navigation', { showSuccessToast: false }),
    staleTime: 5 * 60 * 1000,  // cache for 5 minutes
  });
}
```

### 6.3 Update Layout Component — `client/src/components/Layout.tsx`

**Remove** the hardcoded `navigation` array. Replace with dynamic data:

```typescript
export function Layout({ children }: { children: React.ReactNode }) {
  const { data: navigation, isLoading: navLoading } = useNavigation();

  // Map icon string to Lucide component
  const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard, Package, Building2, Briefcase, Users, Building, Layers,
    FolderTree, FolderOpen, FolderClosed, ShoppingBag, ShoppingCart,
    HelpCircle, Home, Megaphone, Shield, FileText,
  };

  // Build sidebar items from navigation data
  const sidebarItems = (navigation || []).map(item => ({
    name: item.title,
    href: item.routePath,
    icon: iconMap[item.icon] || FileText,
    children: item.children?.map(child => ({
      name: child.title,
      href: child.routePath,
      icon: iconMap[child.icon] || FileText,
    })),
  }));

  // ... rest of layout
}
```

### 6.4 Client-Side Permission Context

Create `client/src/contexts/AuthContext.tsx`:

```typescript
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  permissions: Map<string, PagePermissions>;  // slug → permissions
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  hasPermission: (pageSlug: string, permission: keyof PagePermissions) => boolean;
}
```

**`hasPermission` logic**:
- `super_admin` → always `true`
- `tenant_admin` → `true` if page exists in their navigation
- `user` → check the specific permission flag from navigation data

Use this context in page components to conditionally show/hide Create buttons, Edit/Delete action buttons, etc.:
```typescript
const { hasPermission } = useAuth();

// In Users page
{hasPermission('users', 'canCreate') && (
  <Button onClick={() => setShowCreateModal(true)}>Add User</Button>
)}
```

---

## PHASE 7 — Client-Side Auth Flow

### 7.1 Login Page — `client/src/pages/auth/Login.tsx`

**UI**: Centered card with email + password form, "Login" button, link to "Forgot Password" (future).

**Flow**:
1. Call `POST /api/auth/login`.
2. If response has `requires2FA: true`:
   - Store `tempToken` in memory (NOT localStorage).
   - Navigate to 2FA verification screen.
3. If response has `accessToken`:
   - Store `accessToken` in `localStorage` as `authToken`.
   - Store `refreshToken` in `localStorage` as `refreshToken`.
   - Store user info in auth context.
   - Navigate to `/admin`.

### 7.2 Two-Factor Verification Page — `client/src/pages/auth/TwoFactorVerify.tsx`

**UI**: OTP input (6 digits) using the `input-otp` Shadcn component.

**Flow**:
1. User enters 6-digit code.
2. Call `POST /api/auth/verify-2fa` with `{ tempToken, code }`.
3. On success → store tokens, navigate to `/admin`.

### 7.3 2FA Setup Page — `client/src/pages/auth/TwoFactorSetup.tsx`

**UI**: Card with option to choose email or authenticator app. For app: show QR code + manual entry key. For email: show "Send OTP" button. Then verification input.

### 7.4 Route Protection — `client/src/components/ProtectedRoute.tsx`

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
}
```

### 7.5 Update App.tsx Routes

```typescript
// Public routes (no auth required)
<Route path="/login" component={Login} />
<Route path="/2fa-verify" component={TwoFactorVerify} />

// Protected routes (wrapped with ProtectedRoute + Layout)
<Route path="/admin">
  <ProtectedRoute>
    <Layout><Dashboard /></Layout>
  </ProtectedRoute>
</Route>
// ... all other /admin/* routes wrapped similarly
```

### 7.6 Tenant Dropdown (Super Admin Only)

In the Layout header area, show a tenant selector dropdown ONLY when `isSuperAdmin` is true:

```typescript
{isSuperAdmin && (
  <TenantSelector
    selectedTenantId={selectedTenantId}
    onSelect={(tenantId) => setSelectedTenantId(tenantId)}
  />
)}
```

This `selectedTenantId` is passed as a query param `?tenantId=xxx` on all API calls when a super admin filters by tenant. Store in a React context or URL search params.

For `tenant_admin` and `user`: do NOT show this dropdown. Their `tenantId` is always derived from the JWT.

---

## PHASE 8 — CRUD Endpoints for New Entities

Create full CRUD stacks (schema → DTO → repo → service → controller → route → constants → client model → client hook → client page) for these new entities, following the exact patterns of existing features:

### 8.1 Roles Management (Super Admin only)

- **Server**: `roles` schema (already created), `Role` DTOs, `role_repo.ts`, `role_service.ts`, `roles.ts` controller, `roleRoute.ts`, `roleMessages.ts`.
- **Client**: `Role.ts` model, `use-Role.ts` hook, `pages/role/Roles.tsx` page with CRUD modals.
- **Access**: Only Super Admin can CRUD roles. Apply `requirePermission('roles', 'can_*')` but also add a role check guard for extra safety.

### 8.2 Pages Management (Super Admin only)

- **Server**: `pages` schema (already created), `Page` DTOs, `page_repo.ts`, `page_service.ts`, `pages.ts` controller, `pageRoute.ts`, `pageMessages.ts`.
- **Client**: `Page.ts` model, `use-Page.ts` hook, `pages/page/Pages.tsx` page with tree view for parent-child display.
- **Note**: Show `parent_id` as a dropdown of existing pages (self-referencing FK).

### 8.3 Tenant Pages Assignment (Super Admin only)

- **Server + Client**: UI to assign/unassign pages to a specific tenant. Could be a sub-page or modal within Tenant detail.
- **Endpoint**: `GET /api/admin/tenants/:tenantId/pages` — list pages assigned to tenant.
- **Endpoint**: `PUT /api/admin/tenants/:tenantId/pages` — bulk update (send array of `{ pageId, isActive }`).
- **UI**: Checklist of all pages with toggles for active/inactive per tenant.

### 8.4 Tenant Role Page Assignment (Tenant Admin)

- **Server + Client**: UI for tenant admin to assign pages to roles within their tenant.
- **Endpoint**: `GET /api/admin/tenant-role-pages?roleId=xxx` — list pages assigned to a role in the current tenant.
- **Endpoint**: `PUT /api/admin/tenant-role-pages` — bulk update `{ roleId, pages: [{ pageId, isActive }] }`.
- **Constraint**: Can only assign pages that exist in `tenant_pages` for their tenant.

### 8.5 Permission Management (Tenant Admin)

- **Server + Client**: UI for tenant admin to set CRUD permissions per role per page.
- **Endpoint**: `GET /api/admin/permissions?roleId=xxx` — list all permissions for a role.
- **Endpoint**: `PUT /api/admin/permissions` — bulk update `{ roleId, permissions: [{ pageId, canView, canCreate, canUpdate, canDelete, canPreview }] }`.
- **UI**: Matrix/grid where rows = pages, columns = permission flags. Checkboxes for each cell.
- **Constraint**: Can only set permissions for pages in `tenant_role_pages`.

### 8.6 User Management Updates

Modify the existing User CRUD:

- **Create User form**: Add role dropdown (for super_admin: all roles; for tenant_admin: only `user` role).
- **Create User form**: For super_admin, show tenant dropdown. For tenant_admin, auto-set `tenantId` from JWT.
- **User list**: Add role display column.
- **User creation service**: After creating user, also insert into `user_roles`.
- **User update**: Allow changing role assignment.
- **2FA column**: Show 2FA status in user list (enabled/disabled badge). Allow tenant_admin to force-disable 2FA for their users.

---

## PHASE 9 — Modify Existing Feature Services for Auth Integration

### Changes Required in EVERY Existing Service

For each existing service file (`organization_service.ts`, `order_service.ts`, `product_service.ts`, `category_service.ts`, `mainCategory_service.ts`, `subCategory_service.ts`, `subSubCategory_service.ts`, `faq_service.ts`, `homeSetting_service.ts`, `popupAd_service.ts`, `tenant_service.ts`, `subscriptionPlan_service.ts`, `tenantSubscription_service.ts`, `user_service.ts`):

1. **Remove hardcoded `DEFAULT_TENANT_ID`** from `user_service.ts`.
2. **Extract `tenantId` from `req.user!.tenantId`** (or from query param for super_admin via `extractTenantId()` helper).
3. **Set `createdBy`/`updatedBy`** from `req.user!.userId` in create/update operations.
4. **Set `userIp`** from `req.headers['x-forwarded-for']` or `req.socket.remoteAddress`.

### Service Helper — `server/shared/utils/requestContext.ts`

```typescript
export function getRequestContext(req: Request) {
  return {
    userId: req.user!.userId,
    tenantId: req.user!.tenantId,
    roleName: req.user!.roleName,
    userIp: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown',
  };
}

export function extractTenantId(req: Request): string | null {
  const { roleName, tenantId } = req.user!;
  if (roleName === 'super_admin') {
    return (req.query.tenantId as string) || null;
  }
  return tenantId;
}
```

---

## PHASE 10 — Environment Variables

Add to `.env`:

```
JWT_SECRET=<random-64-char-hex-string>
REFRESH_TOKEN_SECRET=<different-random-64-char-hex-string>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
TWO_FA_EMAIL_FROM=noreply@yourdomain.com
```

**Startup validation** in `server/index.ts`:
```typescript
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_TOKEN_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
```

---

## Implementation Order (Recommended Sequence)

Implement in this exact order to avoid broken dependencies:

1. **Phase 1** — Create all new DB schemas + modify existing ones. Run `npm run db:push`. Seed roles and pages data.
2. **Phase 2.2** — `JwtUtil` utility.
3. **Phase 2.4** — `authMiddleware`.
4. **Phase 2.3** — Auth controller (login, refresh, logout) — initially WITHOUT 2FA (skip step 8 in login).
5. **Phase 9** — Update all existing services to use `req.user` context instead of hardcoded values.
6. **Phase 3** — Permission middleware + apply to all controllers.
7. **Phase 6** — Dynamic navigation API + client layout update.
8. **Phase 7** — Client auth flow (login page, protected routes, auth context, tenant dropdown).
9. **Phase 8** — CRUD for new entities (roles, pages, tenant-pages, permissions).
10. **Phase 4** — 2FA implementation (setup endpoints + login integration).
11. **Phase 5** — Subscription expiry enforcement (token check + client interceptor).

---

## Testing Checklist

After implementation, verify each scenario:

### Authentication
- [ ] User can log in with valid email + password and receives access + refresh tokens.
- [ ] Invalid credentials return 401 with generic "Invalid credentials" message (no info leakage).
- [ ] Account locks after 5 failed attempts; unlocks after 15 minutes.
- [ ] Inactive user (`is_active = false`) cannot log in.
- [ ] Access token expires after 15 minutes; API returns 401.
- [ ] Refresh token endpoint issues new access + refresh tokens (rotation works).
- [ ] Using a revoked refresh token returns 401.
- [ ] Logout revokes session and refresh tokens.
- [ ] Logout-all-sessions revokes everything for that user.

### 2FA
- [ ] User can enable 2FA via authenticator app (QR code displayed, TOTP verification works).
- [ ] User can enable 2FA via email (OTP sent, verification works).
- [ ] Login with 2FA enabled returns `requires2FA: true` without issuing tokens.
- [ ] Valid 2FA code completes login and issues tokens.
- [ ] Invalid 2FA code returns 401.
- [ ] User can disable 2FA (requires current code verification).

### Role-Based Access
- [ ] Super Admin can access all endpoints and all tenants' data.
- [ ] Tenant Admin can only access their own tenant's data.
- [ ] Tenant Admin can manage users within their tenant only.
- [ ] Tenant Admin cannot assign `tenant_admin` or `super_admin` role.
- [ ] Regular User can only access pages with `can_view` permission.
- [ ] Regular User cannot create/update/delete without corresponding permission flags.
- [ ] Attempting to access unauthorized page returns 403.

### Tenant Isolation
- [ ] Tenant Admin API calls always filter by their `tenantId` from JWT (never from request body).
- [ ] Super Admin can filter by `?tenantId=xxx` query param.
- [ ] Super Admin with no tenant filter sees all data.
- [ ] Tenant Admin/User cannot access resources belonging to another tenant (even by guessing UUIDs).

### Subscription Enforcement
- [ ] Tenant with expired subscription: users cannot log in (403 "Subscription expired").
- [ ] Tenant with expired subscription: existing sessions fail on token refresh (403).
- [ ] Tenant with expired subscription: access token check in middleware catches expiry.
- [ ] Super Admin is unaffected by subscription checks.
- [ ] Client-side: expired subscription triggers forced logout + redirect to login.

### Navigation
- [ ] Super Admin sees all pages in sidebar.
- [ ] Tenant Admin sees only pages assigned via `tenant_pages`.
- [ ] Regular User sees only pages assigned via `tenant_role_pages` with `can_view = true`.
- [ ] Navigation updates after permission changes (after cache invalidation or page refresh).
- [ ] Pages with `is_active = false` never appear in navigation.

### UI/UX
- [ ] Login page is clean with email + password fields.
- [ ] 2FA verification screen shows OTP input with proper formatting.
- [ ] Tenant dropdown only visible to Super Admin in the header.
- [ ] Create/Edit/Delete buttons hidden when user lacks corresponding permission.
- [ ] Appropriate error toasts shown for 401/403 responses.
- [ ] Loading states shown during auth operations.

---

## Security Considerations

1. **Never return password hashes** in API responses. Exclude `password`, `two_factor_secret`, `email_otp_code` from all response DTOs.
2. **Rate limit** login and 2FA endpoints to prevent brute force (use `express-rate-limit` on `/api/auth/*`).
3. **Refresh token rotation** — always revoke the old token when issuing a new one. If a revoked token is reused, revoke the entire session (token theft detection).
4. **TOTP secrets** — store securely. Consider encrypting at rest in the database.
5. **Parameterized queries only** — Drizzle ORM handles this, but never use raw SQL string interpolation.
6. **CORS** — configure properly for production: only allow your domain origin.
7. **Secure headers** — add `helmet` middleware for HTTP security headers.
8. **Token storage** — `localStorage` is used for simplicity. For production, consider `httpOnly` cookies for refresh tokens.
9. **Subscription check on every refresh** — even if the access token hasn't expired, the refresh endpoint re-validates subscription status against the DB.
10. **Audit trail** — all operations record `created_by`, `updated_by` (from JWT `userId`) and `user_ip`.


