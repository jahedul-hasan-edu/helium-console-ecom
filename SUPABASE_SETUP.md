# Supabase Service Role Key Setup Guide

## Issue
You're getting an "Invalid Compact JWS" error when trying to upload images. This means the `SUPABASE_SERVICE_ROLE_KEY` in your `.env.development` file is invalid or incorrect.

## Solution: Get Your Correct Service Role Key

### Step 1: Log into Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project (pxiqdqgaqvkwqvrwpsea)

### Step 2: Navigate to API Keys
1. Click on **Settings** in the left sidebar
2. Click on **API** 
3. You'll see several keys listed:
   - **Project URL**: Your Supabase URL
   - **anon public**: The anonymous/public key (shorter)
   - **service_role**: The service role key (longer, starts with "eyJ...")

### Step 3: Copy the Service Role Key
1. Find the **service_role** section
2. Click the copy button next to the long key
3. This is your `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Update Your .env Files
Replace the placeholder in both files:

**File: `.env`**
```dotenv
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**File: `.env.development`**
```dotenv
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: The service role key is a secret - never commit it to version control or share it publicly!

## Why You Need the Service Role Key

- Your **anon key** is for client-side operations with limited permissions
- Your **service role key** is for server-side operations and can bypass Row Level Security (RLS)
- Image uploads require the service role key to avoid RLS permission errors

## What If It Still Doesn't Work?

1. **Double-check the key format**: It should be a long string with 3 parts separated by dots (like a JWT)
2. **Regenerate keys** (if needed):
   - Go to Settings → API
   - Click "Regenerate" button
   - Copy the new service_role key
   - Update your `.env` files
   - Restart your server

3. **Check Bucket Permissions**: 
   - Go to Storage in Supabase dashboard
   - Click on `helium-ecom-bucket`
   - Ensure it's public or has proper RLS policies

## Testing

After updating the key, restart your development server:
```bash
npm run dev
```

Try uploading an image again. The service role key has the permissions needed to bypass RLS and upload files successfully.

## Environment Variables Summary

```dotenv
# Public URLs/Keys (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://pxiqdqgaqvkwqvrwpsea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Secret Keys (server-only, never expose)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
