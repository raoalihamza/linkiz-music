-- Create storage bucket for media conversions
-- This bucket stores temporarily converted media files with 24h expiry

-- Insert the conversions bucket (safely)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'conversions',
  'conversions',
  true,
  524288000, -- 500MB limit
  array['audio/mpeg', 'audio/mp3', 'video/mp4', 'video/x-matroska', 'audio/webm', 'video/webm']
)
on conflict (id) do nothing;

-- Drop existing policies to ensure clean state and avoid conflicts on re-run
drop policy if exists "Public can read conversions" on storage.objects;
drop policy if exists "Service role can upload conversions" on storage.objects;
drop policy if exists "Service role can delete conversions" on storage.objects;

-- Policy: Allow public to read files from conversions bucket
-- This allows users to download converted files via signed URLs
create policy "Public can read conversions"
on storage.objects for select
to public
using (bucket_id = 'conversions');

-- Policy: Allow service role to upload files
-- Edge function will use service role to upload converted files
create policy "Service role can upload conversions"
on storage.objects for insert
to service_role
with check (bucket_id = 'conversions');

-- Policy: Allow service role to delete files
-- For cleanup of old files
create policy "Service role can delete conversions"
on storage.objects for delete
to service_role
using (bucket_id = 'conversions');

-- Create storage bucket for user-uploaded files
-- This bucket stores files that users upload to share via their Linkiz pages

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-files',
  'user-files',
  true,
  104857600, -- 100MB limit
  array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'application/zip', 'application/x-zip-compressed']
)
on conflict (id) do nothing;

-- Drop existing policies for user-files
drop policy if exists "Public can read user files" on storage.objects;
drop policy if exists "Users can upload their files" on storage.objects;
drop policy if exists "Users can update their files" on storage.objects;
drop policy if exists "Users can delete their files" on storage.objects;

-- Policy: Allow public to read user files
create policy "Public can read user files"
on storage.objects for select
to public
using (bucket_id = 'user-files');

-- Policy: Allow authenticated users to upload their own files
create policy "Users can upload their files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own files
create policy "Users can update their files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own files
create policy "Users can delete their files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add comment for documentation
comment on table storage.buckets is 'Storage buckets for Linkiz platform: conversions (temp files) and user-files (permanent uploads)';
