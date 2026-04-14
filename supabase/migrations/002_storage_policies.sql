-- Storage policies for dog-photos bucket
-- Run this in Supabase SQL Editor

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dog-photos');

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to all photos
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'dog-photos');
