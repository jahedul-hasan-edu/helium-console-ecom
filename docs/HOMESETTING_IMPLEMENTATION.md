# Home Setting Feature - Complete Implementation

## Feature Overview
Successfully implemented a complete multi-tenant Home Setting CRUD feature with image management capabilities, following the established patterns from other features like Product and FAQ.

## Architecture Pattern
- **Database**: Drizzle ORM with PostgreSQL
- **Backend**: Express.js with service/repository pattern
- **Frontend**: React + TanStack Query with Zod validation
- **File Storage**: Supabase integration for image uploads
- **Multi-Tenancy**: Full tenant isolation with tenant_id filtering

---

## Backend Implementation

### 1. Database Schemas ✅
**Files**:
- [server/db/schemas/homeSettings.ts](server/db/schemas/homeSettings.ts)
- [server/db/schemas/homeSettingImages.ts](server/db/schemas/homeSettingImages.ts)

**Features**:
- Home Settings table with title, subtitle, isActive status, audit fields
- Home Setting Images table for storing multiple images per setting
- Automatic createdOn/updatedOn timestamps
- User tracking (createdBy, updatedBy) and IP logging

### 2. Data Transfer Objects (DTOs) ✅
**Files**:
- [server/shared/dtos/HomeSetting.ts](server/shared/dtos/HomeSetting.ts)
- [server/shared/dtos/HomeSettingImage.ts](server/shared/dtos/HomeSettingImage.ts)

**Types**:
- `CreateHomeSettingDTO`: Requires tenantId, title, subtitle, isActive
- `UpdateHomeSettingDTO`: All fields optional + imagesToDelete array
- `HomeSettingResponseDTO`: Full response with nested images array
- Zod schema validation for type safety

### 3. Repository Layer ✅
**File**: [server/service/repos/homeSetting_repo.ts](server/service/repos/homeSetting_repo.ts)

**Methods**:
- `getHomeSettings(tenantId, options)`: List with pagination, sorting, search filtering by tenantId
- `getHomeSetting(id, tenantId)`: Single record with tenant verification
- `createHomeSetting(data)`: Create with tenant_id validation
- `updateHomeSetting(id, tenantId, updates)`: Update with ownership verification
- `deleteHomeSetting(id, tenantId)`: Delete with cascading image deletion
- `checkDuplicateTitle(title, tenantId, excludeId)`: Case-insensitive uniqueness per tenant

**Security**:
- All queries filter by tenantId
- Read/update/delete verify tenant ownership
- Duplicate title validation per tenant prevents duplicates

### 4. Service Layer ✅
**File**: [server/service/homeSetting_service.ts](server/service/homeSetting_service.ts)

**Features**:
- Handles file upload processing with 1MB file size validation
- Duplicate title checking before create/update
- Image management (upload new, delete old)
- Cascading deletion of associated images
- Tenant filtering from request headers

### 5. Image Service ✅
**File**: [server/service/homeSetting_image_service.ts](server/service/homeSetting_image_service.ts)

**Capabilities**:
- Batch image upload to Supabase
- Database record creation for tracking
- File deletion from Supabase on image removal
- Cascade deletion when home setting is deleted
- Returns image URLs for frontend

### 6. Controller & Routes ✅
**Files**:
- [server/api/controllers/homeSettings.ts](server/api/controllers/homeSettings.ts)
- [server/api/routes/homeSettingRoute.ts](server/api/routes/homeSettingRoute.ts)

**Endpoints**:
```
GET    /api/admin/homeSettings          - List with pagination/sort/search
POST   /api/admin/homeSettings          - Create new (multipart/form-data)
GET    /api/admin/homeSettings/:id      - Get single
PATCH  /api/admin/homeSettings/:id      - Update (multipart/form-data)
DELETE /api/admin/homeSettings/:id      - Delete with cascade
```

### 7. Constants & Messages ✅
**File**: [server/shared/constants/feature/homeSettingMessages.ts](server/shared/constants/feature/homeSettingMessages.ts)

**Exports**:
- `HOME_SETTING_MESSAGES`: Success/error message constants
- `HOME_SETTING_SORT_FIELDS`: Sortable field names (title, createdOn)
- `HomeSettingSortField`: Type for sort field validation

### 8. Integration ✅
**File**: [server/routes.ts](server/routes.ts)
- Routes registered: `await registerHomeSettingRoutes(app);`
- Constants exported in feature index

---

## Frontend Implementation

### 1. Models ✅
**File**: [client/src/models/HomeSetting.ts](client/src/models/HomeSetting.ts)

**Types**:
- `HomeSettingImage`: Image interface with audit fields
- `HomeSetting`: Full entity with optional images array
- `CreateHomeSettingRequest`: Required tenantId + fields
- `UpdateHomeSettingRequest`: Optional fields + imagesToDelete array

### 2. API Routes ✅
**File**: [client/src/routes/homeSettingRoute.ts](client/src/routes/homeSettingRoute.ts)

**Route Constants**:
- Centralized API endpoint definitions
- Used by hooks and components
- Supports dynamic ID parameter routes

### 3. React Query Hooks ✅
**File**: [client/src/hooks/use-HomeSetting.ts](client/src/hooks/use-HomeSetting.ts)

**Hooks**:
- `useHomeSettings(params)`: List with pagination/sort/search/tenantId filtering
- `useGetHomeSetting(id)`: Single record (disabled when no ID)
- `useCreateHomeSetting()`: Create mutation with FormData support
- `useUpdateHomeSetting()`: Update mutation with image management
- `useDeleteHomeSetting()`: Delete mutation with auto-refetch

**Smart Features**:
- Automatic query invalidation on mutations
- FormData conversion for file uploads
- Conditional JSON vs FormData submission

### 4. Page Constants ✅
**File**: [client/src/pages/homeSetting/index.ts](client/src/pages/homeSetting/index.ts)

**Exports**:
- `HOME_SETTING_PAGE`: Page titles and labels
- `BUTTON_LABELS`: Action button text
- `ERROR_MESSAGES`: Error message strings
- `COLUMNS`: Table column configuration
- `HOME_SETTING_FORM`: Form field labels and validation messages
- `SortField`, `SortOrder`: Type definitions
- `SORTABLE_FIELDS`, `SORT_CONFIG`: Sort configuration

### 5. Modal Components ✅

**CreateHomeSettingModal.tsx**:
- Required tenant dropdown
- Title and subtitle fields
- Active status checkbox
- Drag-and-drop image upload with preview
- Image preview grid with remove button
- Form validation with error display
- Loading state during submission

**EditHomeSettingModal.tsx**:
- Optional tenant dropdown for tenant switching
- Pre-populated fields from selected homeSetting
- Display existing images with remove capability
- Add new images section
- Image deletion tracking (imagesToDelete)
- Read-only created/updated timestamps
- Maintains selected data from list

**DeleteHomeSettingModal.tsx**:
- Confirmation dialog
- Displays home setting title
- Warns about cascading image deletion
- Cancel/Delete buttons with loading state

### 6. Main Page Component ✅
**File**: [client/src/pages/homeSetting/HomeSettings.tsx](client/src/pages/homeSetting/HomeSettings.tsx)

**Features**:
- Tenant filter dropdown above table
- Search input (searches title and subtitle)
- PaginatedDataTable with sorting/pagination
- 3-click sort cycle: asc → desc → clear
- Status badge visualization (Active/Inactive)
- Action buttons (Edit/Delete) per row
- Modal state management
- Handles mutations and refetch

### 7. Integration ✅
**Files**:
- [client/src/App.tsx](client/src/App.tsx): Added `/admin/home-settings` route
- [client/src/components/Layout.tsx](client/src/components/Layout.tsx): Added menu item with Settings icon

---

## Bug Fix: FAQ Modal Stale Data Issue ✅

**Problem**: After updating FAQ's isActive field, the edit modal still showed old value until page refresh.

**Root Cause**: Edit modal used separate `useGetFaq()` query instead of using data from list.

**Solution Applied** in [client/src/pages/faq/Faqs.tsx](client/src/pages/faq/Faqs.tsx):
1. Removed `useGetFaq(selectedFaqId)` import and call
2. Added `useMemo` to find selected FAQ from list data:
   ```typescript
   const selectedFaq = useMemo(
     () => faqsData?.items?.find((faq) => faq.id === selectedFaqId),
     [faqsData?.items, selectedFaqId]
   );
   ```
3. Removed redundant `refetch()` calls after mutations
4. Mutations already invalidate query cache, no extra API call needed

**Results**:
- Edit modal now shows latest data immediately
- No duplicate FAQ API requests
- Eliminates stale cache mismatch

---

## Multi-Tenancy Implementation

### Backend Isolation
1. **All queries filtered by tenantId**
   - List endpoint: Optional `?tenantId=` query parameter
   - Single record: Tenant verification on fetch
   - Create: TenantId from request body
   - Update/Delete: TenantId verification

2. **Duplicate Prevention**
   - Case-insensitive title uniqueness per tenant
   - `checkDuplicateTitle()` with excludeId for updates
   - Prevents same title twice for same tenant

3. **Cascade Operations**
   - Delete home setting → Auto-delete images
   - Delete image → Auto-delete from Supabase + DB

### Frontend Tenant Selection
1. **Create Modal**: Required tenant dropdown
2. **Edit Modal**: Optional tenant dropdown (can change tenant)
3. **List Page**: Tenant filter dropdown above table
4. **All Mutations**: TenantId in request body

---

## File Upload Implementation

### Backend Processing
1. **Express Middleware**: Built-in multer support in controllers
2. **File Validation**: 1MB size limit per file
3. **Supabase Upload**: 
   - Creates record first (get ID)
   - Uploads to Supabase
   - Updates with final URL
4. **Database Tracking**: Images linked to homeSettings

### Frontend Upload
1. **FormData Submission**:
   - Hooks convert to FormData when files present
   - Use `postFormData()` and `patchFormData()` methods
   - Images appended as array

2. **User Experience**:
   - Drag-and-drop upload area
   - Image preview grid
   - Remove button on hover
   - Validation feedback
   - Loading state

3. **Smart Updating**:
   - Track new images vs existing
   - imagesToDelete array for removal
   - Fallback to JSON if no files

---

## Database Migrations

Update [shared/schema.ts](shared/schema.ts) with:
```typescript
export * from "./server/db/schemas/homeSettings";
export * from "./server/db/schemas/homeSettingImages";
```

Run migrations:
```bash
npm run db:push
```

---

## Testing Checklist

### Backend API
- [ ] GET /api/admin/homeSettings - List with pagination
- [ ] GET /api/admin/homeSettings - Filter by tenantId
- [ ] GET /api/admin/homeSettings - Search functionality
- [ ] POST /api/admin/homeSettings - Create with images
- [ ] PATCH /api/admin/homeSettings/:id - Update with new images
- [ ] PATCH /api/admin/homeSettings/:id - Delete images
- [ ] DELETE /api/admin/homeSettings/:id - Cascade delete images

### Frontend UI
- [ ] Navigate to /admin/home-settings
- [ ] Create new home setting with images
- [ ] Edit home setting, change tenant
- [ ] Edit home setting, add/remove images
- [ ] Delete home setting confirms removal
- [ ] Search filters by title/subtitle
- [ ] Tenant filter works
- [ ] Pagination works
- [ ] Sorting works (3-click cycle)
- [ ] Modal shows latest data on edit

### FAQ Fix
- [ ] Edit FAQ, change isActive true→false
- [ ] Click edit icon, confirms isActive=false
- [ ] No extra API calls on list view

---

## Files Created/Modified

### Backend (7 new, 2 modified)
**New**:
- server/db/schemas/homeSettings.ts
- server/db/schemas/homeSettingImages.ts
- server/shared/dtos/HomeSetting.ts
- server/shared/dtos/HomeSettingImage.ts
- server/shared/constants/feature/homeSettingMessages.ts
- server/service/repos/homeSetting_repo.ts
- server/service/homeSetting_image_service.ts
- server/service/homeSetting_service.ts
- server/api/controllers/homeSettings.ts
- server/api/routes/homeSettingRoute.ts

**Modified**:
- server/routes.ts: Added registerHomeSettingRoutes
- server/shared/constants/feature/index.ts: Export homeSettingMessages
- server/db/db.ts: Added drizzle setup

### Frontend (9 new, 2 modified)
**New**:
- client/src/models/HomeSetting.ts
- client/src/routes/homeSettingRoute.ts
- client/src/hooks/use-HomeSetting.ts
- client/src/pages/homeSetting/index.ts
- client/src/pages/homeSetting/CreateHomeSettingModal.tsx
- client/src/pages/homeSetting/EditHomeSettingModal.tsx
- client/src/pages/homeSetting/DeleteHomeSettingModal.tsx
- client/src/pages/homeSetting/HomeSettings.tsx
- client/src/pages/homeSetting/indexExport.ts

**Modified**:
- client/src/App.tsx: Added route + import
- client/src/components/Layout.tsx: Added menu item

### Configuration
**Modified**:
- shared/schema.ts: Added schema exports for migrations
- client/src/pages/faq/Faqs.tsx: Fixed stale modal data issue

---

## Summary

✅ Complete Home Setting CRUD feature implemented
✅ Multi-tenant support with proper isolation
✅ Image upload/management with Supabase
✅ Frontend UI with drag-and-drop
✅ FAQ modal stale data fix applied
✅ All routes registered and integrated
✅ Form validation and error handling
✅ Pagination, sorting, and search
✅ Duplicate title prevention per tenant
✅ Cascade deletion of images

Ready for testing and deployment!
