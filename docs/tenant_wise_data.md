# Tenant-Wise Admin Data: Workspace-Specific Implementation Prompt

Use this prompt when implementing tenant-aware admin behavior in `d:/helium-console-ecom`.

## Objective

Improve the existing multi-tenant admin behavior in this workspace so that:

1. Super admin selects tenant scope from the top navigation bar.
2. Tenant-scoped features require tenant selection before data retrieval and before create/update actions.
3. Tenant admin and other non-super-admin roles are always restricted to their own tenant.
4. Expired tenant subscriptions block access for tenant-bound users.
5. Forms use a consistent sticky header/footer layout.
6. Role records support tenant scoping with a nullable `tenant_id` column.

## Existing Workspace Facts

### Client-side tenant scope

- Top navigation tenant selector already exists in `client/src/components/Layout.tsx`.
- Selected tenant is stored as `selectedTenantId` in `client/src/contexts/AuthContext.tsx`.
- `client/src/lib/apiService.ts` already auto-appends `tenantId` to `/api/admin/*` requests for super admin when `selectedTenantId` is set.

### Server-side tenant scope

- `server/shared/middleware/authMiddleware.ts` already injects `tenantId` into `req.query` and `req.body` for non-super-admin users.
- `authMiddleware.ts` already blocks non-super-admin users when `subscriptionExpiresAt` is expired, but the implementation must be reviewed so the restriction is consistently enforced on login/session refresh paths as well.

### Navigation and page model

- Sidebar navigation comes from `server/service/navigation_service.ts` through `client/src/hooks/use-Navigation.ts`.
- Global admin pages are defined in the page catalog and seeded auth page definitions.
- `client/src/pages/page/Pages.tsx` drives navigation and permission assignment.
- `server/service/navigation_service.ts` is the correct place for hiding items from navigation.

### Roles schema

- Roles table currently lives in `server/db/schemas/roles.ts`.
- It does not currently contain `tenant_id`.

## Business Rules To Implement

### A. Super Admin Behavior

1. Super admin must be able to select tenant from the top navigation bar.
2. For tenant-scoped features, no tenant selection means:
	- list data should not load,
	- create buttons should be disabled initially,
	- create/update/delete actions should not proceed.
3. The following features are global exceptions and must remain usable without selecting a tenant:
	- Subscription Plan
	- Tenants
	- Tenant Subscription
4. Remove tenant dropdowns from feature forms because tenant is chosen from the top nav.
5. The only allowed form-level tenant picker is `Tenant Subscription` if still required by that feature's UX.
6. All form headers and footers should remain sticky in create/edit dialogs.

### B. Tenant Admin / Other Tenant-Bound Roles

1. Logged-in user must always have a valid `tenant_id`.
2. Logged-in user must not be able to continue if tenant subscription is expired.
3. Non-super-admin users must not see these features:
	- Subscription Plan
	- Tenants
	- Tenant Subscription
	- Pages
4. All feature data retrieval and create/update/delete operations must be restricted to the logged-in tenant.

### C. Roles Table

1. Add nullable `tenant_id` column to `roles`.
2. Update all related DTOs, schema exports, service/repository logic, and any role creation/update flows that need tenant-aware behavior.
3. Include a migration or DB push step consistent with this repo.

## Important Repo-Specific Clarifications

### 1. Tenant selection should be enforced at feature level, not by duplicating tenant dropdowns

Use the existing top-nav selector in `client/src/components/Layout.tsx` and the state in `client/src/contexts/AuthContext.tsx`.

### 2. Super-admin API scoping is already automatic

Because `client/src/lib/apiService.ts` auto-appends `tenantId`, tenant-scoped features should consume that behavior instead of manually duplicating tenant-selection logic in every form.

### 3. Some global endpoints must explicitly ignore tenantId

Global admin surfaces such as Tenants, Subscription Plans, Tenant Subscriptions, and possibly Pages may still receive an auto-appended `tenantId`. Those endpoints must either explicitly ignore that field or accept it safely.

### 4. Pages are ambiguous in this repo and must be handled carefully

The current workspace uses the global page catalog for navigation and permission assignment. That means `Pages` is not just another tenant-scoped CRUD screen.

When implementing this requirement:

- hide the `Pages` feature from tenant-bound roles,
- keep page records globally managed unless the business requirement explicitly demands tenant-specific page records,
- if tenant-specific visibility is needed, use existing tenant/page permission structures such as `tenant_pages`, `tenant_role_pages`, and `tenant_role_page_permissions` instead of duplicating global page definitions.

## Files To Review / Likely Touch

### Tenant selection and client scope

- `client/src/components/Layout.tsx`
- `client/src/contexts/AuthContext.tsx`
- `client/src/lib/apiService.ts`

### Navigation / visibility

- `server/service/navigation_service.ts`
- `client/src/hooks/use-Navigation.ts`
- `client/src/App.tsx`

### Auth / subscription enforcement

- `server/shared/middleware/authMiddleware.ts`
- `server/service/auth_service.ts`
- auth controller/session refresh code if needed

### Role schema / services

- `server/db/schemas/roles.ts`
- related role DTOs, services, repositories, and controllers

### Tenant-scoped feature patterns

- feature hooks in `client/src/hooks/`
- feature pages in `client/src/pages/`
- admin services/controllers/repos in `server/service/` and `server/api/controllers/`

### Forms with sticky header/footer requirement

- modal/dialog-based create/edit components in `client/src/pages/**`

## Implementation Requirements

1. Reuse existing tenant propagation where possible.
2. Do not keep tenant dropdowns inside forms except `Tenant Subscription`.
3. Disable create buttons for tenant-scoped super-admin features when no tenant is selected.
4. Prevent tenant-scoped data loading when no tenant is selected for super admin.
5. Keep non-super-admin flows automatically bound to `req.user.tenantId`.
6. Hide restricted features from navigation and block backend access where applicable.
7. If DB schema changes are required, update the schema and the live migration path consistently.
8. Preserve existing global features that are intentionally not tenant-scoped.

## Acceptance Criteria

### Super admin

- Tenant selector is visible in top navigation.
- Tenant-scoped pages do not load data until a tenant is selected.
- Tenant-scoped create buttons are disabled until a tenant is selected.
- Feature forms do not contain tenant dropdowns, except `Tenant Subscription`.
- Global features still work without tenant selection.

### Tenant admin / tenant-bound user

- Login/session is rejected or terminated when tenant subscription is expired.
- Restricted features are not visible.
- CRUD operations only affect records for the logged-in tenant.

### Roles

- `roles` table has nullable `tenant_id`.
- Role-related flows handle tenant-aware records correctly.

### UI behavior

- Form headers and footers are sticky across modal-based forms.

### Validation

- Run `npm run check`.
- If schema changes are introduced, include the required migration / `drizzle-kit push` instructions or execution.

## Expected Output From The Implementer

1. Update the codebase to satisfy the rules above.
2. Keep changes aligned with the current workspace architecture.
3. Mention any feature that is intentionally kept global.
4. Report validation steps performed.



