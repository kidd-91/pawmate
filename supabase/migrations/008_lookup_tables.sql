-- Migration 008: Lookup tables for flexible enums
-- Replaces hardcoded CHECK constraints with data-driven lookup tables so new
-- categories can be added without schema changes.

-- ============================================================================
-- 1. Dog gender / size lookup tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS dog_genders (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dog_sizes (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: must include all existing values in dogs.gender / dogs.size before
-- swapping the CHECK for FK.
INSERT INTO dog_genders (code, label, sort_order) VALUES
  ('male',    '公',   10),
  ('female',  '母',   20),
  ('unknown', '未知', 30)
ON CONFLICT (code) DO NOTHING;

INSERT INTO dog_sizes (code, label, sort_order) VALUES
  ('small',  '小型 (10kg 以下)',  10),
  ('medium', '中型 (10-25kg)',    20),
  ('large',  '大型 (25kg 以上)',  30)
ON CONFLICT (code) DO NOTHING;

-- Swap CHECK constraints for FK constraints on dogs.
ALTER TABLE dogs DROP CONSTRAINT IF EXISTS dogs_gender_check;
ALTER TABLE dogs DROP CONSTRAINT IF EXISTS dogs_size_check;

ALTER TABLE dogs
  ADD CONSTRAINT dogs_gender_fkey FOREIGN KEY (gender) REFERENCES dog_genders(code),
  ADD CONSTRAINT dogs_size_fkey   FOREIGN KEY (size)   REFERENCES dog_sizes(code);

-- ============================================================================
-- 2. Expense categories (system + user-defined)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_by_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT expense_categories_owner_consistency CHECK (
    (is_system = true  AND created_by_user_id IS NULL)
    OR
    (is_system = false AND created_by_user_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_expense_categories_owner
  ON expense_categories(created_by_user_id) WHERE created_by_user_id IS NOT NULL;

-- Seed system categories. `code` is stable identifier; `name` may be edited.
INSERT INTO expense_categories (code, name, icon, color, is_system, sort_order) VALUES
  ('food',     '飼料',  '🥣', '#F59E0B', true, 10),
  ('treats',   '零食',  '🍖', '#FBBF24', true, 20),
  ('medical',  '醫療',  '💊', '#EF4444', true, 30),
  ('grooming', '美容',  '✂️', '#8B5CF6', true, 40),
  ('boarding', '寄宿',  '🏠', '#10B981', true, 50),
  ('toys',     '玩具',  '🎾', '#3B82F6', true, 60),
  ('training', '訓練',  '🎓', '#6366F1', true, 70),
  ('other',    '其他',  '📦', '#6B7280', true, 99)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. Health record types
-- ============================================================================

CREATE TABLE IF NOT EXISTS health_record_types (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  unit TEXT,
  icon TEXT,
  color TEXT,
  has_reminder BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO health_record_types (code, label, unit, icon, color, has_reminder, sort_order) VALUES
  ('vaccine',    '疫苗', NULL,  '💉', '#3B82F6', true,  10),
  ('weight',     '體重', 'kg',  '⚖️', '#10B981', false, 20),
  ('medication', '用藥', NULL,  '💊', '#EF4444', true,  30),
  ('vet_visit',  '看診', NULL,  '🏥', '#8B5CF6', false, 40),
  ('deworming',  '驅蟲', NULL,  '🪱', '#F59E0B', true,  50),
  ('grooming',   '美容', NULL,  '✂️', '#EC4899', false, 60)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 4. RLS — lookup tables are publicly readable; writes are restricted
-- ============================================================================

ALTER TABLE dog_genders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_sizes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_record_types ENABLE ROW LEVEL SECURITY;

-- Public read (everyone authenticated or not — these are reference data)
CREATE POLICY "Anyone can read dog_genders"         ON dog_genders         FOR SELECT USING (true);
CREATE POLICY "Anyone can read dog_sizes"           ON dog_sizes           FOR SELECT USING (true);
CREATE POLICY "Anyone can read health_record_types" ON health_record_types FOR SELECT USING (true);

-- Expense categories: anyone can read system + their own custom ones
CREATE POLICY "Anyone can read system expense_categories"
  ON expense_categories FOR SELECT
  USING (is_system = true OR created_by_user_id = auth.uid());

CREATE POLICY "Users can create own expense_categories"
  ON expense_categories FOR INSERT
  WITH CHECK (
    is_system = false
    AND created_by_user_id = auth.uid()
  );

CREATE POLICY "Users can update own expense_categories"
  ON expense_categories FOR UPDATE
  USING (created_by_user_id = auth.uid())
  WITH CHECK (created_by_user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete own expense_categories"
  ON expense_categories FOR DELETE
  USING (created_by_user_id = auth.uid() AND is_system = false);

-- Note: writes to dog_genders / dog_sizes / health_record_types are blocked
-- for normal users (no INSERT/UPDATE/DELETE policy = denied under RLS).
-- Admin changes should go through service_role or a future migration.
