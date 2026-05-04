-- Migration 015: dedupe upcoming health reminders by (dog, type, title)
--
-- Until now, every health record with a next_due_at appeared as its own
-- reminder. So when a user records "gave heartworm med today, next dose in
-- 30 days" on top of the previous record (which had next_due_at = today),
-- BOTH show in the bell — one as past-due, one as upcoming.
--
-- New rule: for each (dog_id, type_code, title) combination, only return
-- the record with the LATEST next_due_at. The newer "next dose" supersedes
-- older ones; the historical records still live in health_records (visible
-- on the dog's history page), they just stop nagging the bell.
--
-- title is part of the key so multiple meds of the same type ("心絲蟲藥",
-- "驅蟲藥" both type_code='medication') don't collapse into each other.

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
  WITH latest AS (
    SELECT DISTINCT ON (hr.dog_id, hr.type_code, hr.title)
      hr.id          AS record_id,
      hr.dog_id,
      d.name         AS dog_name,
      hr.type_code,
      hrt.label      AS type_label,
      hr.title,
      hr.next_due_at,
      (hr.next_due_at - CURRENT_DATE)::INT AS days_until
    FROM health_records hr
    JOIN dogs d                  ON d.id = hr.dog_id
    JOIN health_record_types hrt ON hrt.code = hr.type_code
    WHERE d.owner_id = p_user_id
      AND hr.next_due_at IS NOT NULL
    ORDER BY hr.dog_id, hr.type_code, hr.title, hr.next_due_at DESC
  )
  SELECT *
  FROM latest
  WHERE next_due_at <= CURRENT_DATE + p_within_days
  ORDER BY next_due_at ASC;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
