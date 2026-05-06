-- Migration 017: clear Supabase Security Advisor warnings
--
-- Three classes of issues:
--
-- 1. spatial_ref_sys has no RLS — PostGIS reference data, intentionally
--    public-readable. Add an explicit allow-all-read policy to satisfy
--    the linter without changing actual access semantics.
--
-- 2. Function search_path is mutable — every SECURITY DEFINER function
--    should pin search_path so a malicious caller can't shadow public
--    objects via session-level search_path manipulation. Use ALTER
--    FUNCTION ... SET search_path so we don't have to recreate bodies.
--
-- 3. SECURITY DEFINER functions executable by PUBLIC/anon — restrict
--    each function to exactly the role that should call it:
--      - User-callable RPCs → REVOKE PUBLIC, GRANT authenticated
--      - Trigger-only helpers → REVOKE all (only the trigger system uses)

-- ============================================================================
-- 1. spatial_ref_sys (PostGIS reference table)
-- ============================================================================
-- Owned by supabase_admin in some projects — wrap in DO block so the
-- migration doesn't fail if we lack ALTER permission.

DO $$
BEGIN
  EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
  EXECUTE 'DROP POLICY IF EXISTS "spatial_ref_sys read" ON public.spatial_ref_sys';
  EXECUTE 'CREATE POLICY "spatial_ref_sys read" ON public.spatial_ref_sys FOR SELECT USING (true)';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Skipping spatial_ref_sys RLS (not owner) — handle via dashboard';
END $$;

-- ============================================================================
-- 2 & 3. Functions: pin search_path + restrict EXECUTE
-- ============================================================================
-- Helper to make this less repetitive. For each function we know about:
--   ALTER FUNCTION ... SET search_path = public, pg_catalog;
--   REVOKE EXECUTE ... FROM PUBLIC;
--   (then GRANT to authenticated if user-callable)
--
-- DO blocks swallow "function does not exist" errors so the migration is
-- idempotent across migrations renaming/dropping functions.

-- 2a. User-callable RPCs (signed-in users may call)
DO $$
DECLARE
  fn TEXT;
  user_callable TEXT[] := ARRAY[
    'get_nearby_dogs(double precision, double precision, double precision)',
    'update_user_location(double precision, double precision)',
    'ensure_user_match(uuid, uuid)',
    'get_upcoming_health_reminders(uuid, integer)'
  ];
BEGIN
  FOREACH fn IN ARRAY user_callable LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%s SET search_path = public, pg_catalog', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip missing function: %', fn;
    END;
  END LOOP;
END $$;

-- 2b. Trigger-only helpers (NEVER user-callable; only the trigger system uses)
DO $$
DECLARE
  fn TEXT;
  trigger_only TEXT[] := ARRAY[
    'handle_new_user()',
    'matches_ensure_user_match()',
    'messages_fill_user_match_id()',
    'touch_updated_at()'
  ];
BEGIN
  FOREACH fn IN ARRAY trigger_only LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%s SET search_path = public, pg_catalog', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip missing function: %', fn;
    END;
  END LOOP;
END $$;

-- 2c. Functions that may have been added via SQL Editor (not in our migration
-- files but flagged by the advisor). Best-effort fix — skip if not present.
DO $$
DECLARE
  fn TEXT;
  unknown TEXT[] := ARRAY[
    'update_user_location_by_id(uuid, double precision, double precision)',
    'rls_auto_enable()'
  ];
BEGIN
  FOREACH fn IN ARRAY unknown LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%s SET search_path = public, pg_catalog', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC', fn);
    EXCEPTION WHEN undefined_function THEN
      RAISE NOTICE 'skip missing function: %', fn;
    END;
  END LOOP;
END $$;
