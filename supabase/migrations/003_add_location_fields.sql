-- Add city and district columns to dogs table
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '';
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS district TEXT DEFAULT '';
