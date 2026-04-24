-- Migration 010: Dog expense tracking
-- Three-table design preserves flexibility from day 1:
--   * dog_expenses        — the expense itself (amount, date, category, payer)
--   * expense_pets        — which dog(s) the expense applies to (multi-dog share)
--   * expense_contributors — who pitched in (multi-user co-tracking, Splitwise-style)
-- UI initially exposes single-dog + single-payer; multi-dog/multi-user can be
-- enabled later without schema changes.

-- ============================================================================
-- 1. dog_expenses — the main ledger
-- ============================================================================

CREATE TABLE IF NOT EXISTS dog_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES expense_categories(id),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'TWD',
  spent_at DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  merchant TEXT,
  notes TEXT NOT NULL DEFAULT '',
  receipt_photo_url TEXT,
  -- Parsed receipt data: e-invoice QR payload, OCR result, items, etc.
  -- Schema example:
  --   { "source": "e_invoice_qr"|"ocr"|"manual",
  --     "invoice_number": "...", "merchant_id": "...",
  --     "items": [{"name":"...","qty":1,"price":100}], ... }
  receipt_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dog_expenses_payer    ON dog_expenses(paid_by_user_id);
CREATE INDEX IF NOT EXISTS idx_dog_expenses_category ON dog_expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_dog_expenses_spent_at ON dog_expenses(spent_at DESC);

-- ============================================================================
-- 2. expense_pets — which dogs this expense covers (1..N)
-- ============================================================================

CREATE TABLE IF NOT EXISTS expense_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES dog_expenses(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  -- Share of the expense for this dog (0..1). Defaults to 1.0 = whole expense.
  -- For multi-dog expenses, app divides evenly (or user-specified).
  share_ratio NUMERIC(6, 4) NOT NULL DEFAULT 1.0
    CHECK (share_ratio > 0 AND share_ratio <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (expense_id, dog_id)
);

CREATE INDEX IF NOT EXISTS idx_expense_pets_expense ON expense_pets(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_pets_dog     ON expense_pets(dog_id);

-- ============================================================================
-- 3. expense_contributors — who paid / who owes (Splitwise-style)
--    Empty set ⇒ paid_by_user_id is the sole contributor (100%).
-- ============================================================================

CREATE TABLE IF NOT EXISTS expense_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES dog_expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  amount_owed NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount_owed >= 0),
  -- Free-form status: 'pending' | 'settled' | 'cancelled' (app-enforced).
  -- Left as TEXT (no CHECK) to keep flexibility; promote to lookup table later
  -- if the workflow grows.
  status TEXT NOT NULL DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (expense_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_expense_contributors_expense ON expense_contributors(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_contributors_user    ON expense_contributors(user_id);

-- ============================================================================
-- 4. updated_at triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dog_expenses_touch ON dog_expenses;
CREATE TRIGGER trg_dog_expenses_touch
  BEFORE UPDATE ON dog_expenses
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_expense_contributors_touch ON expense_contributors;
CREATE TRIGGER trg_expense_contributors_touch
  BEFORE UPDATE ON expense_contributors
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================================
-- 5. RLS
-- ============================================================================

ALTER TABLE dog_expenses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_pets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_contributors ENABLE ROW LEVEL SECURITY;

-- An expense is visible to: payer, any contributor, or any dog owner on it.
CREATE POLICY "Users can view related expenses"
  ON dog_expenses FOR SELECT
  USING (
    paid_by_user_id = auth.uid()
    OR id IN (SELECT expense_id FROM expense_contributors WHERE user_id = auth.uid())
    OR id IN (
      SELECT ep.expense_id
        FROM expense_pets ep
        JOIN dogs d ON d.id = ep.dog_id
       WHERE d.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own expenses"
  ON dog_expenses FOR INSERT
  WITH CHECK (paid_by_user_id = auth.uid());

CREATE POLICY "Payers can update own expenses"
  ON dog_expenses FOR UPDATE
  USING (paid_by_user_id = auth.uid())
  WITH CHECK (paid_by_user_id = auth.uid());

CREATE POLICY "Payers can delete own expenses"
  ON dog_expenses FOR DELETE
  USING (paid_by_user_id = auth.uid());

-- expense_pets: visible if user can see the parent expense; writable by payer
-- or by the dog's owner.
CREATE POLICY "Users can view related expense_pets"
  ON expense_pets FOR SELECT
  USING (
    expense_id IN (SELECT id FROM dog_expenses WHERE paid_by_user_id = auth.uid())
    OR expense_id IN (
      SELECT expense_id FROM expense_contributors WHERE user_id = auth.uid()
    )
    OR dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can attach own dogs or own expenses"
  ON expense_pets FOR INSERT
  WITH CHECK (
    expense_id IN (SELECT id FROM dog_expenses WHERE paid_by_user_id = auth.uid())
    OR dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
  );

CREATE POLICY "Payers and dog owners can detach expense_pets"
  ON expense_pets FOR DELETE
  USING (
    expense_id IN (SELECT id FROM dog_expenses WHERE paid_by_user_id = auth.uid())
    OR dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
  );

-- expense_contributors: visible to anyone who can see the expense.
CREATE POLICY "Users can view related contributors"
  ON expense_contributors FOR SELECT
  USING (
    user_id = auth.uid()
    OR expense_id IN (SELECT id FROM dog_expenses WHERE paid_by_user_id = auth.uid())
    OR expense_id IN (
      SELECT ep.expense_id
        FROM expense_pets ep
        JOIN dogs d ON d.id = ep.dog_id
       WHERE d.owner_id = auth.uid()
    )
  );

-- Payer (creator) can manage all contributor rows on their expense; users can
-- update their own row (e.g. mark settled).
CREATE POLICY "Payers can insert contributors"
  ON expense_contributors FOR INSERT
  WITH CHECK (
    expense_id IN (SELECT id FROM dog_expenses WHERE paid_by_user_id = auth.uid())
  );

CREATE POLICY "Payers or self can update contributors"
  ON expense_contributors FOR UPDATE
  USING (
    user_id = auth.uid()
    OR expense_id IN (SELECT id FROM dog_expenses WHERE paid_by_user_id = auth.uid())
  );

CREATE POLICY "Payers can delete contributors"
  ON expense_contributors FOR DELETE
  USING (
    expense_id IN (SELECT id FROM dog_expenses WHERE paid_by_user_id = auth.uid())
  );
