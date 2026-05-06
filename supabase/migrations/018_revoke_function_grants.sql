-- Migration 018: revoke explicit function grants from anon/authenticated
--
-- 017 used `REVOKE EXECUTE FROM PUBLIC` which only removes the implicit
-- PUBLIC role grant. Supabase additionally grants EXECUTE to `anon`,
-- `authenticated`, `service_role` explicitly for any function in the
-- public schema, so the advisor still flags those.
--
-- Strategy: REVOKE from all three roles, then GRANT back only what's
-- actually needed (authenticated for user-callable RPCs; trigger-only
-- helpers stay revoked because triggers run as the table owner).
--
-- service_role keeps EXECUTE because the backend uses it for RPC calls.

-- ============================================================================
-- User-callable RPCs (backend or signed-in client may call)
-- ============================================================================
DO $$
DECLARE
  fn TEXT;
  user_callable TEXT[] := ARRAY[
    'get_nearby_dogs(double precision, double precision, double precision)',
    'ensure_user_match(uuid, uuid)',
    'get_upcoming_health_reminders(uuid, integer)'
  ];
BEGIN
  FOREACH fn IN ARRAY user_callable LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM authenticated', fn);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
      -- service_role keeps grant by default; no change
    EXCEPTION
      WHEN undefined_function THEN
        RAISE NOTICE 'skip missing function: %', fn;
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'skip (not owner): %', fn;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- Trigger-only helpers (only the trigger system calls these — never users)
-- ============================================================================
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
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM authenticated', fn);
      -- Triggers run as table owner (postgres), so they can still fire.
    EXCEPTION
      WHEN undefined_function THEN
        RAISE NOTICE 'skip missing function: %', fn;
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'skip (not owner): %', fn;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- Unknown functions found via SQL Editor (best-effort)
-- ============================================================================
DO $$
DECLARE
  fn TEXT;
  unknown TEXT[] := ARRAY[
    'rls_auto_enable()',
    'update_user_location_by_id(uuid, double precision, double precision)'
  ];
BEGIN
  FOREACH fn IN ARRAY unknown LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon', fn);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM authenticated', fn);
    EXCEPTION
      WHEN undefined_function THEN
        RAISE NOTICE 'skip missing function: %', fn;
      WHEN insufficient_privilege THEN
        RAISE NOTICE 'skip (not owner): %', fn;
    END;
  END LOOP;
END $$;
