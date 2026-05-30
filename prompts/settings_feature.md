Build a new admin feature called User Settings and make it fit this workspace instead of treating it as a greenfield screen.

Goal
Add a new User Settings menu item under the existing Tenant Subscriptions area. This new screen must contain two tabs:
1. Users
2. Permissions

Important workspace context
- Frontend stack in this repo is React + TypeScript + Wouter + TanStack Query + shadcn/ui.
- Existing routes already exist for:
	- /admin/tenant-subscriptions in client/src/App.tsx
	- /admin/users in client/src/App.tsx
	- /admin/page-permissions in client/src/App.tsx
- Tenant scope already exists in client/src/contexts/AuthContext.tsx via selectedTenantId.
- API requests are tenant-scoped automatically by client/src/lib/apiService.ts when a super admin has selected a tenant.
- Navigation is not hardcoded only in the frontend. The sidebar comes from /api/admin/navigation via client/src/hooks/use-Navigation.ts, and the page catalog in client/src/pages/page/Pages.tsx drives navigation and permissions.
- Existing reusable logic already exists for:
	- users management in client/src/pages/user/Users.tsx and hooks in client/src/hooks/use-User.ts
	- role list and role CRUD in client/src/hooks/use-Role.ts
	- page permissions in client/src/hooks/use-PagePermission.ts and client/src/pages/pagePermission/PagePermissions.tsx

Implementation direction
- Do not duplicate the current Users page logic. Extract the reusable users-management content from client/src/pages/user/Users.tsx into a shared component or shared page-section so the existing /admin/users route and the new User Settings > Users tab both use the same behavior.
- Do not remove the existing /admin/users or /admin/page-permissions routes unless explicitly required. The new screen should reuse existing behavior and simplify the permissions experience.
- Add a new route for the new screen under the tenant subscription area. Use a route name that matches the existing route structure, for example /admin/tenant-subscriptions/user-settings.
- Because the sidebar is backend/page-driven, also update the related page catalog/navigation source so User Settings appears under Tenant Subscriptions as a child menu instead of only adding a frontend route.

Tenant gating requirement
- Users and Permissions must only be visible when tenant scope is available.
- For super admin: if selectedTenantId is missing, show a tenant-selection alert state and do not render the tabs content.
- For tenant admin: use the tenant context already available from auth.
- This gating should be consistent with the existing patterns already used in Users.tsx and PagePermissions.tsx.

Users tab requirements
- The Users tab must provide the same feature set currently available on /admin/users.
- Reuse the current search, pagination, sorting, create, edit, delete, and modal behavior.
- Reuse the same tenant-aware rules that already exist in Users.tsx.
- The goal is feature parity, not a second implementation.

Permissions tab requirements
Replace the current page-permissions screen UX with a cleaner permission matrix for this new screen while continuing to use the existing page-permission backend contract.

Data source
- Load roles from the existing role endpoint using the current role hook pattern in client/src/hooks/use-Role.ts.
- Load permissions from the existing page-permission endpoint using the current page-permission hooks in client/src/hooks/use-PagePermission.ts.
- The page-permission payload already contains page title, icon, routePath, and CRUD flags in client/src/models/PagePermission.ts.

Header controls
- At the top-right above the table keep these controls in one row:
	- role dropdown
	- edit button
	- add button
	- save changes button
- Role dropdown must be server-driven, not static.
- Button state rules:
	- if a role is selected: disable Add and enable Edit
	- if no role is selected: enable Add and disable Edit
- Save Changes is only for permission table changes.
- Do not keep unrelated controls from the old permissions screen such as delete role, permission all, or scope picker on this new screen unless they are truly required for the save flow.

Permission table requirements
- Create a graceful, production-quality permission matrix.
- The table must not visually break across rows or columns.
- Use a sticky header.
- Use a layout that stays readable on smaller widths, such as a horizontally scrollable container with stable column widths.
- Required visible columns:
	- Page title with icon
	- View
	- Create
	- Update
	- Delete
- Each row must have a row-level master checkbox inside the first column next to the page icon/title.
- Each permission column header must also have a header checkbox for bulk toggling that column.
- Preserve row alignment and avoid wrapping that causes the matrix to become unreadable.

Permission behavior rules
- The matrix should edit page permission entries for the selected role.
- Save Changes must call the existing update page-permission flow and update successfully.
- The backend payload currently also contains enabled, canPreview, and scopes.
- Since this new UI only exposes View/Create/Update/Delete, do not accidentally break saves:
	- compute enabled from the visible CRUD state for each row
	- preserve canPreview and scopes from the loaded data unless you intentionally redefine that behavior everywhere
- Page icon should come from the existing page-permission/page catalog data when available.
- Keep the table sorted in a stable way using the existing page ordering from the API response.

UX expectations
- Use the existing design system in this repo and keep the result visually polished.
- The permissions table should feel cleaner than the current PagePermissions.tsx implementation.
- The header actions should be aligned neatly to the right.
- Empty, loading, and no-role-selected states must be explicit and graceful.
- Do not introduce a layout that collapses the permission grid into broken card rows.

Suggested files to touch
- client/src/App.tsx
- client/src/pages/tenantSubscription/* or a new adjacent page folder for User Settings
- client/src/pages/user/* if you extract reusable users content
- client/src/pages/pagePermission/* if you extract reusable permission-matrix logic
- client/src/hooks/use-Role.ts and client/src/hooks/use-PagePermission.ts only if small reuse-friendly adjustments are needed
- server-side page/navigation source if required so the menu appears under Tenant Subscriptions

Acceptance criteria
- A new User Settings child menu exists under Tenant Subscriptions.
- Opening it shows two tabs: Users and Permissions.
- Without a selected tenant, the screen blocks usage with a clear tenant-selection message.
- Users tab behaves the same as the current Users screen.
- Permissions tab shows a graceful sticky-header matrix with page icon/title and CRUD columns.
- Role dropdown is server-driven.
- Add/Edit button enabled states follow the selected-role rule exactly.
- Save Changes persists permission changes successfully through the existing endpoint.
- Existing standalone Users and Page Permissions routes continue to work unless explicitly replaced everywhere.


