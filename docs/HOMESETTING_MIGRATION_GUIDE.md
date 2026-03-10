# Home Setting Feature - Database Migration Guide

## Prerequisites
- PostgreSQL database running
- Drizzle Kit installed
- `.env` file with DATABASE_URL configured

## Migration Steps

### 1. Update Schema Exports
The schema export file has been created at: `shared/schema.ts`

It includes all database schemas needed for Drizzle migrations, including:
- `homeSettings` table
- `homeSettingImages` table

### 2. Generate Migration
Run the following command to generate the migration:

```bash
npm run db:push
```

This will:
1. Connect to your PostgreSQL database
2. Compare current schema with database
3. Generate necessary SQL migrations
4. Apply migrations automatically

### 3. Verify Tables Created
After migration completes, verify tables exist:

```sql
-- Check home_settings table
\dt home_settings

-- Check home_setting_images table
\dt home_setting_images

-- Verify columns
\d home_settings
\d home_setting_images
```

### 4. Expected Tables

#### home_settings
```
Column       | Type                     | Constraints
-------------|--------------------------|------------------
id           | uuid                     | PRIMARY KEY
tenant_id    | uuid                     | 
title        | text                     | 
sub_title    | text                     | 
is_active    | boolean                  | DEFAULT true
created_by   | uuid                     | 
updated_by   | uuid                     | 
created_on   | timestamp with timezone  | 
updated_on   | timestamp with timezone  | 
user_ip      | text                     | 
```

#### home_setting_images
```
Column           | Type                     | Constraints
-----------------|--------------------------|------------------
id               | uuid                     | PRIMARY KEY
home_setting_id  | uuid                     | 
image_url        | text                     | 
created_by       | uuid                     | 
updated_by       | uuid                     | 
created_on       | timestamp with timezone  | 
updated_on       | timestamp with timezone  | 
user_ip          | text                     | 
```

### 5. Index Setup (Optional)
For better query performance, consider adding indexes:

```sql
-- Index for tenant_id filtering on home_settings
CREATE INDEX idx_home_settings_tenant_id ON home_settings(tenant_id);

-- Composite index for tenant_id + title (for uniqueness check)
CREATE INDEX idx_home_settings_tenant_title ON home_settings(tenant_id, LOWER(title));

-- Index for home_setting_id on images
CREATE INDEX idx_home_setting_images_home_setting_id ON home_setting_images(home_setting_id);
```

### 6. Rollback (If Needed)
To rollback migrations, manual SQL would be required:

```sql
-- Drop tables if they exist
DROP TABLE IF EXISTS home_setting_images CASCADE;
DROP TABLE IF EXISTS home_settings CASCADE;
```

## Troubleshooting

### Error: "DATABASE_URL is not set"
- Verify `.env` file contains `DATABASE_URL`
- Format: `postgresql://user:password@host:port/database`
- Test connection with: `psql $DATABASE_URL`

### Error: "No migration files found"
- Ensure `shared/schema.ts` exports all schema tables
- Run migration generation again

### Connection Timeout
- Check database is running and accessible
- Verify network connectivity to database host
- Check DATABASE_URL format and credentials

### Permission Denied
- Verify database user has CREATE TABLE permissions
- User should have schema modification rights

## Verification Checklist

After migration, verify:
- [ ] `npm run db:push` completes without errors
- [ ] Tables exist in database
- [ ] Columns match schema definitions
- [ ] Can insert test record:
  ```sql
  INSERT INTO home_settings (id, tenant_id, title, sub_title, is_active, created_on)
  VALUES (gen_random_uuid(), 'test-tenant-id', 'Test', 'Test Subtitle', true, NOW());
  ```
- [ ] Home Settings page loads without errors
- [ ] Can create/edit/delete home settings
- [ ] Images upload to Supabase successfully

## Supabase Configuration

Ensure Supabase bucket is set up:

1. Create bucket: `product-images` (or configure in code)
2. Set bucket to public if serving public images
3. Configure CORS for your domain
4. Verify credentials in environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (backend)
   - `SUPABASE_ANON_KEY` (frontend)

## Next Steps

1. Run migration: `npm run db:push`
2. Start application: `npm run dev`
3. Navigate to: `http://localhost:5000/admin/home-settings`
4. Test creating/editing/deleting home settings
5. Verify images upload successfully to Supabase
