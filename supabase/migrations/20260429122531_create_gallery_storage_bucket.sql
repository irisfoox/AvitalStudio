/*
  # Create gallery storage bucket

  Creates a public storage bucket named "gallery" for storing cake images.
  The bucket is public so images can be accessed without authentication.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to gallery bucket
CREATE POLICY "Public read gallery images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery');

-- Allow anon to upload (for admin PIN flow)
CREATE POLICY "Anon can upload gallery images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'gallery');
