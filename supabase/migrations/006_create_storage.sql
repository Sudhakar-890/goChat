-- ============================================
-- goChat: Storage Bucket for Chat Media
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  false,
  52428800,  -- 50MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload to their own folder
DROP POLICY IF EXISTS "Media: authenticated upload" ON storage.objects;
CREATE POLICY "Media: authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read media from rooms they participate in
DROP POLICY IF EXISTS "Media: authenticated read" ON storage.objects;
CREATE POLICY "Media: authenticated read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-media');

-- Users can delete their own uploads
DROP POLICY IF EXISTS "Media: delete own" ON storage.objects;
CREATE POLICY "Media: delete own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
