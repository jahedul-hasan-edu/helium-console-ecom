# Generic CRUD Feature Creation Prompt - WITHOUT TENANT_ID

## Overview
You are creating a new CRUD feature following the established pattern from the User feature. This prompt is for features that do NOT store tenant_id in the entity.

## Feature Details
**Feature Name**: [Tenant]
**SQL Schema**:
```sql
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text unique,
  is_active boolean default true,

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

## Backend Implementation Structure

### 1. Database Schema File
**Path**: `server/db/schemas/[featureName].ts`
- Generate Drizzle ORM schema matching SQL definition
- Use proper field types and constraints
- Include timestamps (created_on, updated_on) if present
- Add indexes for frequently queried fields

### 2. DTOs File
**Path**: `server/shared/dtos/[FeatureName].ts`
Create interfaces for:
- `Create[FeatureName]DTO`: Required fields only (for create operations)
- `Update[FeatureName]DTO`: All fields optional (for update operations)
- `[FeatureName]ResponseDTO`: All fields including system fields (id, timestamps)
- Query/Filter options: `Get[FeatureName]Options`
- List response: `Get[FeatureName]Response`

### 3. Repository File
**Path**: `server/service/repos/[featureName]_repo.ts`
Implement methods:
- `get[FeatureName]s(options)`: Get list with pagination, sorting, searching
  - Support sorting by configurable fields
  - Support filtering/search on text fields
  - Return paginated response with total count
- `get[FeatureName](id)`: Get single record by id
- `create[FeatureName](data)`: Create new record
- `update[FeatureName](id, data)`: Update existing record
- `delete[FeatureName](id)`: Delete record

Use Drizzle ORM with proper SQL operators for pagination, sorting, filtering.

### 4. Service File
**Path**: `server/service/[featureName]_service.ts`
Implement methods:
- `get[FeatureName]s(req)`: Extract pagination/sort/search from request, call repository
- `get[FeatureName](id)`: Get single record
- `create[FeatureName](req)`: Validate request body, extract userIp, call repository
- `update[FeatureName](id, req)`: Extract userIp, call repository
- `delete[FeatureName](id)`: Delete record

### 5. Controller File
**Path**: `server/api/controllers/[featureName].ts`
Implement Express routes:
- `GET /api/admin/[featurePlural]`: List with pagination/sort/filter
  - Response: `ResponseHandler.paginated()`
  - Message from constants
- `POST /api/admin/[featurePlural]`: Create record
  - Response: `ResponseHandler.success()` with HTTP 201
- `GET /api/admin/[featurePlural]/:id`: Get single record
  - Response: `ResponseHandler.success()` with HTTP 200
  - Handle 404 if not found
- `PATCH /api/admin/[featurePlural]/:id`: Update record
  - Response: `ResponseHandler.success()` with HTTP 200
- `DELETE /api/admin/[featurePlural]/:id`: Delete record
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

### 2. Hook for API Integration
**Path**: `client/src/hooks/use-[FeatureName].ts`
Create React Query hooks:
- `use[FeaturePlural](params)`: Query list with pagination/sort/filter
- `use[FeatureName](id)`: Query single record
- `useCreate[FeatureName]()`: Mutation for create
- `useUpdate[FeatureName]()`: Mutation for update
- `useDelete[FeatureName]()`: Mutation for delete

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
- Custom validations as needed

### 4. Modal Components
Create three modal components in `client/src/pages/[featureName]/`:

**Create[FeatureName]Modal.tsx**:
- Form with all required + optional fields
- Form validation using FormValidator
- Error display with icons
- Submit button (disabled during loading)
- Loading state

**Edit[FeatureName]Modal.tsx**:
- Load existing record data
- Update form with all fields
- Read-only system fields (id, timestamps, created_by)
- Form validation
- Error display
- Submit button

**Delete[FeatureName]Modal.tsx**:
- Confirmation dialog
- Display record details
- Cancel/Confirm buttons
- Loading state

### 5. Main Feature Component
**Path**: `client/src/pages/[featureName]/[FeaturePlural].tsx`

Structure:
- State: searchTerm, currentPage, pageSize, sortBy, sortOrder, modal states, selectedId
- Use hooks: use[FeaturePlural], useGet[FeatureName], useMutation hooks
- Handle functions: Search, Edit, Delete, Create, Update, DeleteConfirm, Sort
- Columns definition from constants
- renderActions using ActionButtons component
- Return layout with:
  - Header (title, subtitle, Add button)
  - Search input
  - PaginatedDataTable component
  - Modal components

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

**Pagination**:
- Use PaginatedDataTable component
- Handle page size changes
- Reset to page 1 on search/sort

## Checklist Before Implementation

Backend:
- [ ] SQL schema script analyzed
- [ ] Field nullability determined
- [ ] DTOs created with correct types
- [ ] Repository methods with pagination/sort/filter
- [ ] Service layer calls repository
- [ ] Controller routes with proper error handling
- [ ] Static messages in constants/feature
- [ ] Routes registered in routes.ts
- [ ] Proper use of ResponseHandler

Frontend:
- [ ] Constants file with all static strings
- [ ] Type definitions for sort/filter
- [ ] React Query hooks for API
- [ ] Form validation rules
- [ ] Modal components (Create, Edit, Delete)
- [ ] Main feature component with all handlers
- [ ] ActionButtons component used
- [ ] PaginatedDataTable used
- [ ] Sorting 3-click cycle implemented
- [ ] No magic strings in components
- [ ] Each feature has separate form validator


CAUTION: 
Don't modify components, lib folders in the client
Don't modify shared>utils in the server
Don't modify db.ts in the server
