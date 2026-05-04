-- Migration 016: revert auto-dedupe (015), add manual dismiss instead
--
-- 015 collapsed reminders by (dog, type, title) keeping only the latest
-- next_due_at — wrong for the actual use case: user may pre-schedule a
-- year of monthly doses (12 records same title, 12 distinct due dates),
-- and every one of them should fire a reminder on its date.
--
-- New design: every record with next_due_at appears as a reminder. User
-- taps an "X" on the one they've handled → dismissed_at is set → that
-- specific record stops nagging the bell. Past-due records still show
-- until dismissed (so missed doses don't silently disappear).

ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ NULL;

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
  JOIN dogs d                  ON d.id = hr.dog_id
  JOIN health_record_types hrt ON hrt.code = hr.type_code
  WHERE d.owner_id = p_user_id
    AND hr.next_due_at IS NOT NULL
    AND hr.dismissed_at IS NULL
    AND hr.next_due_at <= CURRENT_DATE + p_within_days
  ORDER BY hr.next_due_at ASC;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
