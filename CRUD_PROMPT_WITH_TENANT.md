# Generic CRUD Feature Creation Prompt - WITH TENANT_ID

## Overview
You are creating a new CRUD feature following the established pattern from the User feature. This prompt is for features that store tenant_id in the entity (multi-tenant support).

## Feature Details
**Feature Name**: [Home Setting]
**SQL Schema**:
```sql
create table home_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id), 
  title text,
  sub_title text,
  is_active boolean,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);

create table home_setting_images (
  id uuid primary key default gen_random_uuid(),
  home_setting_id uuid references home_settings(id), 
  image_url text,

  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);





```

## Database Schema Analysis
Based on the SQL script above:
- Identify all columns
- Fields with `null` = optional fields
- Fields without `null` = required fields
- Extract field types (text, integer, uuid, timestamptz, json, etc.)
- Note relationships/foreign keys
- **Important**: Identify tenant_id column - this is used for multi-tenancy

## Backend Implementation Structure

### 1. Database Schema File
**Path**: `server/db/schemas/[featureName].ts`
- Generate Drizzle ORM schema matching SQL definition
- Use proper field types and constraints
- Include tenant_id field (usually uuid, non-nullable, foreign key to tenants table)
- Include timestamps (created_on, updated_on) if present
- Include audit fields (created_by, updated_by) if present
- Add indexes including tenant_id for multi-tenant queries

### 2. DTOs File
**Path**: `server/shared/dtos/[FeatureName].ts`
Create interfaces for:
- `Create[FeatureName]DTO`: Required fields only (excluding tenant_id - added in service)
- `Update[FeatureName]DTO`: All fields optional (excluding tenant_id, id, timestamps)
- `[FeatureName]ResponseDTO`: All fields including system fields (id, tenant_id, timestamps)
- Query/Filter options: `Get[FeatureName]Options`
- List response: `Get[FeatureName]Response`

### 3. Repository File
**Path**: `server/service/repos/[featureName]_repo.ts`
Implement methods:
- `get[FeatureName]s(options)`: Get list with pagination, sorting, searching
  - **IMPORTANT**: Always filter by tenant_id
  - Support sorting by configurable fields
  - Support filtering/search on text fields
  - Return paginated response with total count
- `get[FeatureName](id, tenantId)`: Get single record by id AND tenant_id
  - **Security**: Must verify tenant_id ownership
- `create[FeatureName](data)`: Create new record with tenant_id
  - **IMPORTANT**: data must include tenantId
- `update[FeatureName](id, tenantId, data)`: Update record with tenant verification
  - **Security**: Must verify tenant_id ownership before update
- `delete[FeatureName](id, tenantId)`: Delete record with tenant verification
  - **Security**: Must verify tenant_id ownership before delete

Use Drizzle ORM with proper SQL operators:
- Pagination: LIMIT/OFFSET
- Sorting: ORDER BY
- Filtering: WHERE with tenant_id AND search conditions

### 4. Service File
**Path**: `server/service/[featureName]_service.ts`
Implement methods:
- `get[FeatureName]s(req)`: 
  - Extract pagination/sort/search from request
  - Extract tenantId (from auth/context - adjust based on auth implementation)
  - Call repository with tenantId filter
- `get[FeatureName](id, tenantId)`: Get single record with tenant verification
- `create[FeatureName](req)`: 
  - Validate request body
  - Extract tenantId from request context
  - Extract userIp
  - Call repository with tenantId
- `update[FeatureName](id, req)`: 
  - Extract tenantId from request context
  - Extract userIp
  - Call repository with tenantId verification
- `delete[FeatureName](id, tenantId)`: Delete with tenant verification

**Security Note**: Always pass tenantId to repository methods for verification.

### 5. Controller File
**Path**: `server/api/controllers/[featureName].ts`
Implement Express routes:
- `GET /api/admin/[featurePlural]`: List with pagination/sort/filter
  - Extract tenantId from request (auth)
  - Response: `ResponseHandler.paginated()`
  - Message from constants
- `POST /api/admin/[featurePlural]`: Create record
  - Extract tenantId from request
  - Response: `ResponseHandler.success()` with HTTP 201
- `GET /api/admin/[featurePlural]/:id`: Get single record
  - Extract tenantId from request
  - Response: `ResponseHandler.success()` with HTTP 200
  - Handle 404 if not found or tenant mismatch
- `PATCH /api/admin/[featurePlural]/:id`: Update record
  - Extract tenantId from request
  - Response: `ResponseHandler.success()` with HTTP 200
- `DELETE /api/admin/[featurePlural]/:id`: Delete record
  - Extract tenantId from request
  - Response: `ResponseHandler.success()` with HTTP 200

All routes should use `asyncHandler` wrapper.

### 6. Routes Registration
**Path**: `server/api/routes/[featureName]Route.ts`
Create API route object:
```typescript
export const api = {
  [featurePlural]: {
    list: { method: 'GET', path: '/api/admin/[featurePlural]' },
    create: { method: 'POST', path: '/api/admin/[featurePlural]' },
    get: { method: 'GET', path: '/api/admin/[featurePlural]/:id' },
    update: { method: 'PATCH', path: '/api/admin/[featurePlural]/:id' },
    delete: { method: 'DELETE', path: '/api/admin/[featurePlural]/:id' },
  },
};
```

### 7. Constants/Messages File
**Path**: `server/shared/constants/feature/[featureName]Messages.ts`
Define static messages:
- Record retrieved successfully
- Records retrieved successfully
- Record created successfully
- Record updated successfully
- Record deleted successfully
- Record not found
- Validation errors
- Sort fields constant

### 8. Update Main Routes
**Path**: `server/routes.ts`
- Import controller
- Register routes: `registerFeatureRoutes(app)`

## Frontend Implementation Structure

### 1. Constants File
**Path**: `client/src/pages/[featureName]/index.ts`
Define constants:
- `[FEATURE_NAME]_PAGE`: title, subtitle, search placeholder, empty message
- `BUTTON_LABELS`: action labels
- `ERROR_MESSAGES`: error strings
- `COLUMNS`: Column configuration array with labels
- `SORTABLE_FIELDS`: Sort field type and constants
- `SORT_CONFIG`: Sort order constants (ASC, DESC)
- `ACTION_BUTTONS`: Button configuration
- `[FEATURE_NAME]_FORM`: Form field labels, validation messages

**Note**: Do NOT expose tenant_id in UI columns - it's handled server-side

### 2. Hook for API Integration
**Path**: `client/src/hooks/use-[FeatureName].ts`
Create React Query hooks:
- `use[FeaturePlural](params)`: Query list with pagination/sort/filter
  - Supports `tenantId` parameter for filtering by tenant
  - Server filters tenant_id based on parameter
- `use[FeatureName](id)`: Query single record
  - Server verifies tenant ownership
- `useCreate[FeatureName]()`: Mutation for create
  - Accepts `tenantId` in request body
  - Server validates tenant_id ownership
- `useUpdate[FeatureName]()`: Mutation for update
  - Accepts optional `tenantId` in request body
  - Server verifies tenant ownership
- `useDelete[FeatureName]()`: Mutation for delete
  - Server verifies tenant ownership

All hooks should use the API route constants and handle pagination params.

### 3. Form Validation
**Path**: `client/src/pages/[featureName]/formValidator.ts`
Add methods:
- `validateCreate[FeatureName](data)`: Validate create form
  - **Required**: Validate tenantId is selected
  - Check non-null DB fields
  - Text fields: Min/max length validation
  - Email fields: Email format validation
  - Phone fields: Phone format validation
  - Numeric fields: Min/max validation
- `validateUpdate[FeatureName](data)`: Validate update form
  - **Optional**: TenantId can optionally be changed
  - Validate tenantId if provided
  - Validate other fields as required

**Note**: TenantId is now required in create forms and optional in update forms

### 4. Modal Components
Create three modal components in `client/src/pages/[featureName]/`:

**Create[FeatureName]Modal.tsx**:
- **New**: Tenant dropdown field at the top (required)
  - Load tenants from `useTenants()` hook
  - Display format: `<SelectItem value={tenant.id}>{tenant.name}</SelectItem>`
  - Placeholder: "Select a tenant"
  - Show validation error if not selected
- Form with all required + optional fields
- **Exclude**: id, timestamps, created_by
- Form validation using FormValidator
- Error display with icons
- Submit button (disabled during loading/validation)
- Loading state

**Edit[FeatureName]Modal.tsx**:
- **New**: Tenant dropdown field (optional editable)
  - Allow user to change tenant if needed
  - Load tenants from `useTenants()` hook
  - Pre-populate with current feature tenant
- Load existing record data
- Update form with visible fields only
- Read-only system fields (id, timestamps, created_by)
- Form validation
- Error display
- Submit button

**Delete[FeatureName]Modal.tsx**:
- Confirmation dialog
- Display record details (without sensitive tenant info)
- Cancel/Confirm buttons
- Loading state

### 5. Main Feature Component
**Path**: `client/src/pages/[featureName]/[FeaturePlural].tsx`

Structure:
- State: searchTerm, **selectedTenantId**, currentPage, pageSize, sortBy, sortOrder, modal states, selectedId
- Use hooks: use[FeaturePlural], useGet[FeatureName], useMutation hooks, **useTenants**
- Handle functions: **handleTenantChange**, Search, Edit, Delete, Create, Update, DeleteConfirm, Sort
- Columns definition from constants (excluding tenant_id)
- renderActions using ActionButtons component
- Return layout with:
  - Header (title, subtitle, Add button)
  - **Tenant filter dropdown (above search)**
    - Load tenants from `useTenants()` hook
    - Default option: "All Tenants" (empty string)
    - Display: `<SelectItem value={tenant.id}>{tenant.name}</SelectItem>`
    - onChange: Reset to page 1
  - Search input
  - PaginatedDataTable component
  - Modal components

**Parameters passed to use[Feature]s**:
```typescript
const { data: [feature]Data } = use[Feature]s({
  page: currentPage,
  pageSize,
  search: searchTerm,
  sortBy,
  sortOrder,
  tenantId: selectedTenantId, // NEW: Pass selected tenant filter
});
```

**Note**: All API calls include tenant filtering

### 6. UI Patterns to Follow

**Constants Usage**:
```typescript
import { [FEATURE_NAME]_PAGE, COLUMNS, SORTABLE_FIELDS, SORT_CONFIG, BUTTON_LABELS, ACTION_BUTTONS } from '@/pages/[featureName]';
```

**Types**:
```typescript
export type SortField = 'field1' | 'field2' | 'field3';
export type SortOrder = 'asc' | 'desc';
```

**State Management**:
```typescript
const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);
```

**Sorting Cycle** (3-click cycle):
- Click 1: Ascending
- Click 2: Descending
- Click 3: Clear sort
- Repeat

**Action Buttons**:
Use reusable `ActionButtons` component with Edit/Delete buttons

**Forms**:
- Real-time validation on field change
- Error messages below fields with icons
- Disabled submit when validation fails
- Loading state during submission
- **Do NOT show tenant_id field in forms**

**Pagination**:
- Use PaginatedDataTable component
- Handle page size changes
- Reset to page 1 on search/sort

## Multi-Tenancy Security Checklist

Backend:
- [ ] tenant_id included in schema
- [ ] All queries filter by tenant_id (support filtering parameter)
- [ ] get/update/delete verify tenant ownership
- [ ] Service passes tenantId from request and filters
- [ ] Controller extracts tenantId from auth
- [ ] No data leakage between tenants
- [ ] **NEW**: Implement uniqueness validation (title + tenant_id combination)
- [ ] **NEW**: Check for duplicates before create/update operations

Frontend:
- [ ] tenant_id NOT displayed in columns
- [ ] **NEW**: Tenant dropdown in create modal (required)
- [ ] **NEW**: Tenant dropdown in edit modal (optional editable)
- [ ] **NEW**: Tenant filter dropdown on main page (above table)
- [ ] Tenant dropdown populated from `useTenants()` hook
- [ ] Tenant ID included in create/update request body
- [ ] API hooks handle tenant filtering parameter
- [ ] No manual tenant_id manipulation in UI

## Checklist Before Implementation

Backend:
- [ ] SQL schema analyzed with tenant_id field
- [ ] Field nullability determined
- [ ] DTOs include tenantId in create/update DTO
- [ ] Repository has tenant_id filters on all queries
- [ ] **NEW**: Repository has `checkDuplicate[Feature]()` method for uniqueness validation
- [ ] Service extracts tenantId from request
- [ ] Service validates duplicates before create/update
- [ ] Controller extracts tenantId from auth
- [ ] All get/update/delete verify tenant ownership
- [ ] Static messages in constants/feature (include duplicate message)
- [ ] Routes registered in routes.ts
- [ ] Proper use of ResponseHandler

Frontend:
- [ ] Constants file with tenant form labels and filter placeholder
- [ ] Type definitions for sort/filter
- [ ] React Query hooks for API (support tenantId param)
- [ ] Form validation rules (validate tenantId required in create, optional in update)
- [ ] **NEW**: Modal components include tenant dropdown
- [ ] Modal Create: Tenant dropdown (required field)
- [ ] Modal Edit: Tenant dropdown (optional editable field)
- [ ] Main feature component with all handlers
- [ ] **NEW**: Main page has tenant filter dropdown above table
- [ ] **NEW**: handleTenantChange function implemented
- [ ] **NEW**: selectedTenantId state added
- [ ] **NEW**: useTenants hook used in components
- [ ] ActionButtons component used
- [ ] PaginatedDataTable used
- [ ] Sorting 3-click cycle implemented
- [ ] No magic strings in components
- [ ] Tenant filter dropdown populated from database
- [ ] Tenant dropdowns in forms populated from database
- [ ] Each feature has separate form validator (with tenantId validation)

## Important: Tenant Data Isolation

The server automatically:
- Filters all queries by tenant_id parameter
- Assigns tenant_id from request body on record creation
- Verifies tenant_id on read/update/delete
- Prevents cross-tenant data access
- **NEW**: Validates uniqueness of records per tenant (e.g., same title cannot exist twice for same tenant)

The frontend:
- Provides tenant dropdown selector on main page for filtering
- Provides tenant dropdown in create/edit forms
- Includes tenantId in all create/update requests
- Trusts server-side tenant filtering and validation
- Does not expose tenant_id in table columns
- Allows filtering data by selected tenant

## Tenant Dropdown Implementation Details

### Backend Changes
1. **Service Layer**:
   - Update `get[Feature]s()` to accept optional `tenantId` query parameter for filtering
   - Add `checkDuplicate()` method to repository for uniqueness validation
   - Validate duplicates in create/update operations
   - Return appropriate error message if duplicate found

2. **Repository Layer**:
   - Implement `checkDuplicate(title, tenantId, excludeId?)` method
   - Filter queries by tenantId when provided
   - Support case-insensitive matching for uniqueness check

### Frontend Changes
1. **Main Page (List Component)**:
   - Add tenant dropdown filter above the table
   - Load tenants using `useTenants()` hook
   - Default option "All Tenants" (empty string value)
   - Filter list when tenant is selected
   - Reset pagination to page 1 when filter changes

2. **Create Modal**:
   - Add required tenant dropdown field
   - Load tenants using `useTenants()` hook
   - Show validation error if not selected
   - Include tenantId in create request

3. **Edit Modal**:
   - Add optional tenant dropdown field
   - Load tenants using `useTenants()` hook
   - Pre-populate with current feature tenant
   - Allow changing tenant if needed
   - Include tenantId in update request (if changed)

4. **Form Validator**:
   - Require tenantId in create form validation
   - Optionally validate tenantId in update form validation
   - Show appropriate error messages

Important more Changes
1. User can able to create/edit upload multiple images like product.
2. Once home settings delete associated home settings image also be deleted accordingly.
3. Upload image functionality exactly same as the product feature how it's create/update images