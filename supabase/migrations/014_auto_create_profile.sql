-- Migration 014: auto-create profiles row on new auth.users insert
--
-- Until now, profiles were created manually by the backend `/api/auth/register`
-- handler after Supabase signup. That works for email/password signup but
-- breaks for OAuth (Google, etc.) — those flows hit Supabase Auth directly,
-- bypassing our backend, so no profile gets created and downstream queries
-- (fetch dog, expenses, etc.) all 404.
--
-- This trigger runs on every auth.users insert and creates the matching
-- profile row, pulling display_name from whichever source is available:
--   - email signup → raw_user_meta_data.display_name (set by backend)
--   - Google OAuth → raw_user_meta_data.full_name / name
--   - fallback     → email local-part

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      split_part(NEW.email, '@', 1),
      'User'
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
