-- Migration 012: tidy up health_record_types
--   * Drop 'deworming' — driving heartworm/flea/tick prevention is just a kind
--     of medication, so funnel any existing rows into 'medication'.
--   * Add 'other' for things that don't fit a category.

UPDATE health_records
   SET type_code = 'medication'
 WHERE type_code = 'deworming';

DELETE FROM health_record_types WHERE code = 'deworming';

INSERT INTO health_record_types (code, label, unit, icon, color, has_reminder, sort_order) VALUES
  ('other', '其他', NULL, '📋', '#6B7280', false, 90)
ON CONFLICT (code) DO NOTHING;
