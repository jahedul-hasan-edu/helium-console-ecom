# Generic CRUD Feature Creation Prompt - WITH TENANT_ID

## Overview
You are creating a new CRUD feature following the established pattern from the User feature. This prompt is for features that store tenant_id in the entity (multi-tenant support).

## Feature Details
**Feature Name**: [Sub Sub Category]
**SQL Schema**:
```sql
create table sub_sub_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  sub_category_id uuid references sub_categories(id), /required
  name text, /required
  slug text, /required

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
  - Server automatically filters by current tenant
- `use[FeatureName](id)`: Query single record
  - Server verifies tenant ownership
- `useCreate[FeatureName]()`: Mutation for create
  - Server automatically assigns tenant_id
- `useUpdate[FeatureName]()`: Mutation for update
  - Server verifies tenant ownership
- `useDelete[FeatureName]()`: Mutation for delete
  - Server verifies tenant ownership

All hooks should use the API route constants and handle pagination params.

### 3. Form Validation
**Path**: `client/src/lib/formValidator.ts` (extend existing)
Add methods:
- `validateCreate[FeatureName](data)`: Validate create form
- `validateUpdate[FeatureName](data)`: Validate update form

Validation rules:
- Required fields: Check non-null DB fields
- Text fields: Min/max length validation
- Email fields: Email format validation
- Phone fields: Phone format validation
- Numeric fields: Min/max validation
- Custom validations as needed

**Note**: Do NOT include tenant_id in form validation - it's handled server-side

### 4. Modal Components
Create three modal components in `client/src/pages/[featureName]/`:

**Create[FeatureName]Modal.tsx**:
- Form with all required + optional fields
- **Exclude**: tenant_id, id, timestamps, created_by
- Form validation using FormValidator
- Error display with icons
- Submit button (disabled during loading/validation)
- Loading state

**Edit[FeatureName]Modal.tsx**:
- Load existing record data
- Update form with visible fields only
- Read-only system fields (id, timestamps, created_by, tenant_id)
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
- State: searchTerm, currentPage, pageSize, sortBy, sortOrder, modal states, selectedId
- Use hooks: use[FeaturePlural], useGet[FeatureName], useMutation hooks
- Handle functions: Search, Edit, Delete, Create, Update, DeleteConfirm, Sort
- Columns definition from constants (excluding tenant_id)
- renderActions using ActionButtons component
- Return layout with:
  - Header (title, subtitle, Add button)
  - Search input
  - PaginatedDataTable component
  - Modal components

**Note**: All API calls automatically include tenant filtering server-side

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
- [ ] All queries filter by tenant_id
- [ ] get/update/delete verify tenant ownership
- [ ] Service passes tenantId from request
- [ ] Controller extracts tenantId from auth
- [ ] No data leakage between tenants

Frontend:
- [ ] tenant_id NOT displayed in columns
- [ ] tenant_id NOT in form fields
- [ ] API hooks handle tenant filtering (server-side)
- [ ] No manual tenant_id manipulation in UI

## Checklist Before Implementation

Backend:
- [ ] SQL schema analyzed with tenant_id field
- [ ] Field nullability determined
- [ ] DTOs exclude tenant_id from create/update input
- [ ] Repository has tenant_id filters on all queries
- [ ] Service extracts tenantId from request
- [ ] Controller extracts tenantId from auth
- [ ] All get/update/delete verify tenant ownership
- [ ] Static messages in constants/feature
- [ ] Routes registered in routes.ts
- [ ] Proper use of ResponseHandler

Frontend:
- [ ] Constants file with all static strings
- [ ] Type definitions for sort/filter
- [ ] React Query hooks for API
- [ ] Form validation rules (no tenant_id field)
- [ ] Modal components (Create, Edit, Delete)
- [ ] Main feature component with all handlers
- [ ] ActionButtons component used
- [ ] PaginatedDataTable used
- [ ] Sorting 3-click cycle implemented
- [ ] No magic strings in components
- [ ] tenant_id NOT exposed in UI
- [ ] tenant_id NOT in forms
- [ ] Each feature has separate form validator

## Important: Tenant Data Isolation

The server automatically:
- Filters all queries by current user's tenant_id
- Assigns tenant_id on record creation
- Verifies tenant_id on read/update/delete
- Prevents cross-tenant data access

The frontend:
- Should never manually manage tenant_id
- Should trust server-side tenant filtering
- Should not expose tenant_id in UI
- Should assume all data returned is from current tenant


///Special Changes for Sub Sub category feature
for sub_category_id field
you have to populate a dropdown where you have to load list of sub cateogory these dropdown can serverside user can search/select category from the dropdown because my  sub category get api has pagination.
user can stored/update sub_category_id
