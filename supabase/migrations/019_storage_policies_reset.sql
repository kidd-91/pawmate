-- Migration 019: reset dog-photos storage policies to a known-good state
--
-- Symptom we're fixing: users report 「上傳失敗 — new row violates
-- row-level security policy」 when changing dog photos. Migration 002
-- set policies that should permit any authenticated upload, but the
-- user has been touching policies through the Supabase Dashboard UI
-- (deleted the public SELECT policy at one point) and we can't see the
-- live policy list from code. Best to nuke + recreate from scratch.
--
-- New design:
-- - INSERT/UPDATE/DELETE: gated on (first folder segment == auth.uid())
--   — i.e. users can only write inside `${their_id}/...`, never into
--   other users' folders. Tighter than 002's "any authenticated can
--   insert anywhere".
-- - SELECT: public. The bucket's Public flag handles direct-URL reads,
--   but having an explicit policy means listing operations from
--   authed clients also succeed without surprise.
--
-- Idempotent: drops by name first, then creates. Safe to re-run.

-- Drop every policy name we have ever created on dog-photos so a
-- partial / inconsistent state doesn't keep one of them active.
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos"            ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos"            ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view photos"                 ON storage.objects;
DROP POLICY IF EXISTS "dog-photos insert"                      ON storage.objects;
DROP POLICY IF EXISTS "dog-photos update"                      ON storage.objects;
DROP POLICY IF EXISTS "dog-photos delete"                      ON storage.objects;
DROP POLICY IF EXISTS "dog-photos select"                      ON storage.objects;

-- INSERT: only into own folder (`${auth.uid()}/...`).
CREATE POLICY "dog-photos insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'dog-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: same gate (for upsert when file already exists).
CREATE POLICY "dog-photos update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'dog-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'dog-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: same gate.
CREATE POLICY "dog-photos delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'dog-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: public read. Photos are intentionally world-readable (anyone
-- can see your dog on the swipe deck). Bucket Public flag also handles
-- this for direct URL access, but the explicit policy lets authed
-- clients list / fetch via the supabase-js storage API as well.
CREATE POLICY "dog-photos select"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'dog-photos');
