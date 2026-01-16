# Category CRUD Feature Implementation

## Overview
Complete implementation of Category CRUD feature with tenant isolation and searchable main category dropdown.

## Feature Requirements
- **Entity**: Category
- **Multi-tenancy**: WITH tenant_id (tenant-scoped data)
- **Required Fields**: mainCategoryId, name, slug
- **Special Feature**: Searchable dropdown for main_category_id with server-side pagination support

## Database Schema
```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  main_category_id uuid references main_categories(id), -- required
  name text, -- required
  slug text, -- required
  created_by uuid null,
  updated_by uuid null,
  created_on timestamptz null,
  updated_on timestamptz null,
  user_ip inet null
);
```

## Backend Files Created

### 1. DTOs and Validation
- **File**: `server/shared/dtos/Category.ts`
- **Purpose**: Data transfer objects with Zod validation
- **Key Schemas**:
  - `createCategorySchema`: Requires mainCategoryId, name, slug (all required)
  - `updateCategorySchema`: Optional fields for partial updates
  - `categoryResponseSchema`: Full category response structure
- **Exports**: CreateCategoryDTO, UpdateCategoryDTO, CategoryResponseDTO, GetCategoriesOptions

### 2. Repository Layer
- **File**: `server/service/repos/category_repo.ts`
- **Purpose**: Database operations with tenant isolation
- **Key Methods**:
  - `getCategories(tenantId, options)`: Paginated list with search/sort, filters by tenant_id
  - `getCategory(id, tenantId)`: Get single category with tenant verification
  - `getCategoryBySlug(slug, tenantId)`: Check slug uniqueness within tenant
  - `createCategory(data)`: Create with tenant_id
  - `updateCategory(id, tenantId, updates)`: Update with tenant verification
  - `deleteCategory(id, tenantId)`: Delete with tenant verification
- **Tenant Isolation**: All queries use `and(eq(categories.id, id), eq(categories.tenantId, tenantId))`
- **Search**: ILIKE search on name and slug fields
- **Sorting**: Supports name, slug, createdOn

### 3. Service Layer
- **File**: `server/service/category_service.ts`
- **Purpose**: Business logic bridge between controller and repository
- **Key Features**:
  - Extracts tenant_id from request (currently uses DEFAULT_TENANT_ID)
  - Handles pagination parameters from query string
  - Adds user IP tracking
  - Manages tenant context for all operations

### 4. Controller Layer
- **File**: `server/api/controllers/categories.ts`
- **Purpose**: HTTP route handlers with async error handling
- **Routes**:
  - `GET /api/admin/categories` - List with pagination/search/sort
  - `GET /api/admin/categories/check-slug?slug=xxx` - Check slug uniqueness
  - `POST /api/admin/categories` - Create new category
  - `GET /api/admin/categories/:id` - Get single category
  - `PATCH /api/admin/categories/:id` - Update category
  - `DELETE /api/admin/categories/:id` - Delete category
- **Tenant Verification**: All operations verify tenant_id matches

### 5. API Route Definitions
- **File**: `server/api/routes/categoryRoute.ts`
- **Purpose**: Type-safe route definitions with Zod schemas
- **Exports**: `api.categories` object with method, path, input, and response schemas

### 6. Feature Messages
- **File**: `server/shared/constants/feature/categoryMessages.ts`
- **Purpose**: Centralized success/error messages
- **Exports**: CATEGORY_MESSAGES, CATEGORY_SORT_FIELDS

### 7. Registration
- **Updated Files**:
  - `server/routes.ts`: Registered `registerCategoryRoutes(app)`
  - `server/shared/constants/feature/index.ts`: Exported categoryMessages

## Frontend Files Created

### 1. Constants
- **File**: `client/src/pages/category/index.ts`
- **Purpose**: Feature-wide constants
- **Exports**:
  - CATEGORY_PAGE_SIZE_OPTIONS: [5, 10, 20, 30, 40, 50]
  - CATEGORY_SORT_FIELDS: name, slug, createdOn
  - CATEGORY_COLUMNS: Column definitions
  - CATEGORY_FEATURE_TITLE, CATEGORY_FEATURE_DESCRIPTION

### 2. TypeScript Models
- **File**: `client/src/models/Category.ts`
- **Purpose**: Type definitions for Category entity
- **Interfaces**:
  - `Category`: Full category object
  - `CreateCategoryRequest`: mainCategoryId, name, slug (all required)
  - `UpdateCategoryRequest`: Optional fields
  - `GetCategoriesParams`: Query parameters
  - `GetCategoriesResponse`: Paginated response

### 3. API Route Definitions
- **File**: `client/src/routes/categoryRoute.ts`
- **Purpose**: Frontend API endpoint paths
- **Exports**: categoryRoute object with list, create, get, update, delete, checkSlug

### 4. React Query Hooks
- **File**: `client/src/hooks/use-Category.ts`
- **Purpose**: Data fetching and mutation hooks
- **Hooks**:
  - `useCategories(params)`: Paginated list with search/sort
  - `useCategory(id)`: Single category
  - `useCheckCategorySlug()`: Slug uniqueness check
  - `useCreateCategory()`: Create mutation with toast
  - `useUpdateCategory()`: Update mutation with toast
  - `useDeleteCategory()`: Delete mutation with toast
- **Features**: Automatic query invalidation, toast notifications, error handling

### 5. Form Validation
- **File**: `client/src/lib/formValidator.ts`
- **Updated**: Added Category validation methods
- **Methods**:
  - `validateCreateCategory(data)`: Checks mainCategoryId, name, slug are required
  - `validateUpdateCategory(data)`: Validates partial updates (fields can't be empty if provided)
- **Returns**: ValidationResult with isValid flag and errors array

### 6. API Service Methods
- **File**: `client/src/lib/apiService.ts`
- **Updated**: Added Category-specific wrapper methods
- **Methods**:
  - `getCategories(params)`: GET with query string building
  - `getCategory(id)`: GET single
  - `createCategory(data)`: POST
  - `updateCategory(id, data)`: PATCH
  - `deleteCategory(id)`: DELETE
  - `checkCategorySlug(slug)`: GET slug check
- **Features**: Toast disabled for background checks, query param handling

### 7. Create Modal Component
- **File**: `client/src/pages/category/CreateCategoryModal.tsx`
- **Purpose**: Create new category with searchable dropdown
- **Special Features**:
  - **Searchable Main Category Dropdown**: Uses shadcn/ui Combobox component
  - Server-side search: Fetches main categories with search parameter
  - Pagination support: Configurable pageSize (50)
  - Real-time validation with error icons
  - Slug uniqueness checking on blur
  - All fields marked as required with asterisks
- **Components Used**: Dialog, Command, CommandInput, CommandList, Popover, Button, Input
- **Validation**: Real-time field-level validation with AlertCircle icons

### 8. Edit Modal Component
- **File**: `client/src/pages/category/EditCategoryModal.tsx`
- **Purpose**: Edit existing category
- **Features**:
  - Pre-populates form with existing data
  - Searchable main category dropdown (same as create)
  - Loads selected main category name from ID
  - Slug checking skips original slug
  - Real-time validation
  - Updates all fields on submit

### 9. Delete Modal Component
- **File**: `client/src/pages/category/DeleteCategoryModal.tsx`
- **Purpose**: Confirmation dialog for category deletion
- **Features**: AlertDialog with category name, destructive styling, loading state

### 10. Main Categories Component
- **File**: `client/src/pages/category/Categories.tsx`
- **Purpose**: Main page with table, search, and CRUD operations
- **Features**:
  - PaginatedDataTable with configurable columns
  - Search by name/slug
  - 3-click sort cycle (asc → desc → clear)
  - Main category name lookup from ID in table
  - Create/Edit/Delete modal management
  - Pagination controls
  - Loading states
- **Special Logic**: Fetches all main categories (pageSize: 1000) for display name lookup in table

## Key Implementation Patterns

### 1. Tenant Isolation
- All database queries filter by `tenant_id` using `and(condition, eq(categories.tenantId, tenantId))`
- Service layer extracts tenant_id from request context
- Repository methods require tenant_id parameter
- No cross-tenant data leakage

### 2. Searchable Dropdown Implementation
```tsx
// Uses shadcn/ui Command component with Popover
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox">
      {selected ? selectedName : "Select..."}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Command>
      <CommandInput
        value={search}
        onValueChange={setSearch} // Triggers API refetch
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {items.map(item => (
            <CommandItem onSelect={() => handleSelect(item)}>
              {item.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

### 3. Server-Side Search
- `useMainCategories` hook accepts search parameter
- Search value bound to CommandInput
- React Query automatically refetches when search changes
- Pagination limits results (pageSize: 50 in dropdown)

### 4. Validation Flow
1. Real-time validation on field change
2. Error icons appear immediately (AlertCircle)
3. Submit button disabled until all validations pass
4. Slug uniqueness checked on blur
5. Toast notifications on success/error

### 5. Sort Cycle Implementation
```tsx
const handleSort = (field: string) => {
  if (sortBy === field) {
    if (sortOrder === "asc") setSortOrder("desc");
    else if (sortOrder === "desc") {
      setSortBy(undefined);
      setSortOrder(undefined);
    }
  } else {
    setSortBy(field);
    setSortOrder("asc");
  }
};
```

## API Endpoints

### GET /api/admin/categories
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 10)
- `search` (string): Search term for name/slug
- `sortBy` (string): Field to sort by (name, slug, createdOn)
- `sortOrder` (string): asc or desc

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "items": [{ ...category }],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### POST /api/admin/categories
**Body:**
```json
{
  "mainCategoryId": "uuid",
  "name": "Electronics",
  "slug": "electronics"
}
```

### PATCH /api/admin/categories/:id
**Body:**
```json
{
  "mainCategoryId": "uuid", // optional
  "name": "Updated Name", // optional
  "slug": "updated-slug" // optional
}
```

### DELETE /api/admin/categories/:id
**Response:** Success message

### GET /api/admin/categories/check-slug?slug=xxx
**Response:**
```json
{
  "success": true,
  "data": {
    "exists": false,
    "category": null
  }
}
```

## Testing Checklist

### Backend
- [ ] Create category with valid data
- [ ] Create category with duplicate slug (should fail)
- [ ] Create category with invalid tenant_id
- [ ] Get paginated list
- [ ] Search categories by name/slug
- [ ] Sort by each sortable field (asc/desc)
- [ ] Update category fields
- [ ] Delete category
- [ ] Verify tenant isolation (can't access other tenant's data)

### Frontend
- [ ] Open create modal and fill form
- [ ] Search for main category in dropdown
- [ ] Select main category from dropdown
- [ ] Validate required fields show errors
- [ ] Check slug uniqueness indicator works
- [ ] Create category successfully
- [ ] View categories in table with main category name
- [ ] Search categories
- [ ] Sort by name, slug, createdOn (3-click cycle)
- [ ] Edit category and change main category
- [ ] Delete category with confirmation
- [ ] Verify pagination works
- [ ] Change page size

## Next Steps
1. Replace `DEFAULT_TENANT_ID` with actual user tenant extraction from auth token
2. Add authentication middleware
3. Add authorization checks (role-based access)
4. Add main category name/slug to API response to avoid frontend lookup
5. Consider adding main category caching in frontend
6. Add category icon/image upload
7. Add bulk operations (multi-select delete)
8. Add export functionality (CSV/Excel)

## Notes
- Main category dropdown fetches 50 items at a time with search
- Table fetches all main categories (pageSize: 1000) for name lookup
- Consider optimizing by including main category data in category API response
- Slug checking is case-sensitive (as per ILIKE in Postgres)
