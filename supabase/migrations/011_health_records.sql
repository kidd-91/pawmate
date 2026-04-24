-- Migration 011: Dog health records
-- One table holds all health-related events (vaccines, weight, medications,
-- vet visits, deworming, grooming) with type-specific data in JSONB. The type
-- list lives in health_record_types (lookup table from migration 008), so new
-- types can be added without schema changes.

-- ============================================================================
-- 1. health_records — unified event log per dog
-- ============================================================================

CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  type_code TEXT NOT NULL REFERENCES health_record_types(code),
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL DEFAULT '',
  -- For numeric records (weight kg, dosage mg, temperature °C). NULL if N/A.
  numeric_value NUMERIC(10, 3),
  notes TEXT NOT NULL DEFAULT '',
  document_url TEXT,
  -- Type-specific extra fields, e.g.:
  --   vaccine:    { "vaccine_name": "...", "vet": "...", "lot_number": "..." }
  --   medication: { "drug": "...", "frequency": "1x/day", "duration_days": 7 }
  --   vet_visit:  { "vet": "...", "diagnosis": "...", "treatment": "..." }
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- When the next event is due (used for reminders); NULL = no reminder.
  next_due_at DATE,
  recorded_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_records_dog        ON health_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type       ON health_records(type_code);
CREATE INDEX IF NOT EXISTS idx_health_records_recorded   ON health_records(dog_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_next_due   ON health_records(next_due_at)
  WHERE next_due_at IS NOT NULL;

-- ============================================================================
-- 2. updated_at trigger (reuses touch_updated_at from migration 010)
-- ============================================================================

DROP TRIGGER IF EXISTS trg_health_records_touch ON health_records;
CREATE TRIGGER trg_health_records_touch
  BEFORE UPDATE ON health_records
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================================
-- 3. Helper: upcoming health reminders for a dog (or all dogs of a user)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_upcoming_health_reminders(
  p_user_id UUID,
  p_within_days INT DEFAULT 30
)
RETURNS TABLE (
  record_id UUID,
  dog_id UUID,
  dog_name TEXT,
  type_code TEXT,
  type_label TEXT,
  title TEXT,
  next_due_at DATE,
  days_until INT
) AS $$
  SELECT
    hr.id,
    hr.dog_id,
    d.name,
    hr.type_code,
    hrt.label,
    hr.title,
    hr.next_due_at,
    (hr.next_due_at - CURRENT_DATE)::INT AS days_until
  FROM health_records hr
  JOIN dogs d                 ON d.id = hr.dog_id
  JOIN health_record_types hrt ON hrt.code = hr.type_code
  WHERE d.owner_id = p_user_id
    AND hr.next_due_at IS NOT NULL
    AND hr.next_due_at <= CURRENT_DATE + p_within_days
  ORDER BY hr.next_due_at ASC;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================================
-- 4. RLS — owners manage their dogs' records
-- ============================================================================

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own dogs' health records"
  ON health_records FOR SELECT
  USING (dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can insert health records for own dogs"
  ON health_records FOR INSERT
  WITH CHECK (
    dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
    AND (recorded_by_user_id IS NULL OR recorded_by_user_id = auth.uid())
  );

CREATE POLICY "Owners can update own dogs' health records"
  ON health_records FOR UPDATE
  USING (dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid()))
  WITH CHECK (dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid()));

CREATE POLICY "Owners can delete own dogs' health records"
  ON health_records FOR DELETE
  USING (dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid()));
