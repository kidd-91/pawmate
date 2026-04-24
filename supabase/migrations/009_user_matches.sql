-- Migration 009: user_matches aggregator
-- Adds a user-level match concept on top of the existing dog-to-dog matches.
-- When a user owns multiple dogs, this prevents the chat list from showing
-- the same person multiple times (one user_match per pair, regardless of how
-- many dog-level matches they accumulate).

-- ============================================================================
-- 1. user_matches table — one row per (user_a, user_b) pair
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Canonical ordering so each pair appears exactly once
  CONSTRAINT user_matches_ordered CHECK (user_a_id < user_b_id),
  CONSTRAINT user_matches_unique_pair UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_user_matches_user_a ON user_matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_user_b ON user_matches(user_b_id);

-- ============================================================================
-- 2. Helper: ensure_user_match(a, b) — idempotent get-or-create, sorts pair
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_user_match(p_user_a UUID, p_user_b UUID)
RETURNS UUID AS $$
DECLARE
  v_lo UUID;
  v_hi UUID;
  v_id UUID;
BEGIN
  IF p_user_a IS NULL OR p_user_b IS NULL THEN
    RAISE EXCEPTION 'ensure_user_match: user ids cannot be NULL';
  END IF;
  IF p_user_a = p_user_b THEN
    RAISE EXCEPTION 'ensure_user_match: cannot match a user with themselves';
  END IF;

  IF p_user_a < p_user_b THEN
    v_lo := p_user_a; v_hi := p_user_b;
  ELSE
    v_lo := p_user_b; v_hi := p_user_a;
  END IF;

  INSERT INTO user_matches (user_a_id, user_b_id) VALUES (v_lo, v_hi)
  ON CONFLICT (user_a_id, user_b_id) DO NOTHING;

  SELECT id INTO v_id FROM user_matches
   WHERE user_a_id = v_lo AND user_b_id = v_hi;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. Backfill: derive user_matches from existing dog-level matches
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT
      LEAST(d_a.owner_id, d_b.owner_id)    AS user_lo,
      GREATEST(d_a.owner_id, d_b.owner_id) AS user_hi
    FROM matches m
    JOIN dogs d_a ON d_a.id = m.dog_a_id
    JOIN dogs d_b ON d_b.id = m.dog_b_id
    WHERE d_a.owner_id <> d_b.owner_id
  LOOP
    PERFORM ensure_user_match(r.user_lo, r.user_hi);
  END LOOP;
END $$;

-- ============================================================================
-- 4. Trigger: auto-create user_match when a dog-level match is created
-- ============================================================================

CREATE OR REPLACE FUNCTION matches_ensure_user_match()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_a UUID;
  v_owner_b UUID;
BEGIN
  SELECT owner_id INTO v_owner_a FROM dogs WHERE id = NEW.dog_a_id;
  SELECT owner_id INTO v_owner_b FROM dogs WHERE id = NEW.dog_b_id;

  IF v_owner_a IS NOT NULL AND v_owner_b IS NOT NULL AND v_owner_a <> v_owner_b THEN
    PERFORM ensure_user_match(v_owner_a, v_owner_b);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_matches_ensure_user_match ON matches;
CREATE TRIGGER trg_matches_ensure_user_match
  AFTER INSERT ON matches
  FOR EACH ROW EXECUTE FUNCTION matches_ensure_user_match();

-- ============================================================================
-- 5. Move messages from match_id to user_match_id
--    Strategy: add nullable column, backfill, then a BEFORE INSERT trigger
--    fills user_match_id from match_id automatically. Old app code keeps
--    working; new code can write user_match_id directly. match_id stays for
--    now (drop in a later migration once app code no longer uses it).
-- ============================================================================

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS user_match_id UUID REFERENCES user_matches(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_user_match ON messages(user_match_id);

-- Backfill existing messages
UPDATE messages m
SET user_match_id = sub.user_match_id
FROM (
  SELECT
    msg.id AS message_id,
    um.id  AS user_match_id
  FROM messages msg
  JOIN matches mt    ON mt.id = msg.match_id
  JOIN dogs    d_a   ON d_a.id = mt.dog_a_id
  JOIN dogs    d_b   ON d_b.id = mt.dog_b_id
  JOIN user_matches um
    ON um.user_a_id = LEAST(d_a.owner_id, d_b.owner_id)
   AND um.user_b_id = GREATEST(d_a.owner_id, d_b.owner_id)
  WHERE msg.user_match_id IS NULL
) sub
WHERE m.id = sub.message_id;

-- Trigger: auto-fill user_match_id from match_id on insert if missing.
-- Runs BEFORE INSERT so the value is in place when RLS WITH CHECK runs.
CREATE OR REPLACE FUNCTION messages_fill_user_match_id()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_a UUID;
  v_owner_b UUID;
BEGIN
  IF NEW.user_match_id IS NULL AND NEW.match_id IS NOT NULL THEN
    SELECT d_a.owner_id, d_b.owner_id
      INTO v_owner_a, v_owner_b
      FROM matches mt
      JOIN dogs d_a ON d_a.id = mt.dog_a_id
      JOIN dogs d_b ON d_b.id = mt.dog_b_id
     WHERE mt.id = NEW.match_id;

    IF v_owner_a IS NOT NULL AND v_owner_b IS NOT NULL THEN
      NEW.user_match_id := ensure_user_match(v_owner_a, v_owner_b);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_messages_fill_user_match ON messages;
CREATE TRIGGER trg_messages_fill_user_match
  BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION messages_fill_user_match_id();

-- ============================================================================
-- 6. RLS for user_matches
-- ============================================================================

ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own user_matches"
  ON user_matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can create user_matches involving themselves"
  ON user_matches FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can delete own user_matches"
  ON user_matches FOR DELETE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- ============================================================================
-- 7. Update messages RLS to use user_match_id (replaces match_id-based check)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;

CREATE POLICY "Users can view messages in their user_matches"
  ON messages FOR SELECT
  USING (
    user_match_id IN (
      SELECT id FROM user_matches
       WHERE user_a_id = auth.uid() OR user_b_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their user_matches"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND user_match_id IN (
      SELECT id FROM user_matches
       WHERE user_a_id = auth.uid() OR user_b_id = auth.uid()
    )
  );

-- Note: messages.match_id column kept for now; will be dropped in a later
-- migration after app code no longer references it.
