# Supabase Storage Setup for Menu Images

## Step 1: Create Storage Bucket in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter bucket details:
   - **Name**: `menu-images`
   - **Public bucket**: ✅ Check this (so images can be publicly accessible)
   - **File size limit**: 50MB (or as needed)
   - **Allowed MIME types**: Leave empty for all image types

## Step 2: Set Bucket Policies (Optional - for security)

If you want to restrict uploads to authenticated users:

```sql
-- Allow authenticated users to upload
INSERT INTO storage.policies (id, bucket_id, name, definition)
VALUES (
  'authenticated-uploads',
  'menu-images',
  'Authenticated users can upload',
  'auth.role() = ''authenticated'''
);

-- Allow public read access to images
INSERT INTO storage.policies (id, bucket_id, name, definition)
VALUES (
  'public-read',
  'menu-images', 
  'Public can view images',
  'true'
);
```

## Step 3: Update Database Schema

Add the image_url column to your Items table if not already present:

```sql
ALTER TABLE public."Items" 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

## Step 4: Test the Upload

1. Go to your admin menu page: `http://localhost:3000/admin/adminmenu`
2. Click "Add New Item"
3. Fill in the form and select an image file
4. Submit the form

The image should upload to Supabase storage and display in your item cards!

## Troubleshooting

- If you get storage errors, check that the bucket name matches exactly: `menu-images`
- Ensure your Supabase project has storage enabled
- Check that the bucket is set to public if you want direct image access
- Verify your environment variables are correct in `.env.local`