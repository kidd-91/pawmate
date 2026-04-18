-- Add walking-related fields to dogs table
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS walking_locations TEXT[] DEFAULT '{}';
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS walking_times TEXT[] DEFAULT '{}';
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS walking_frequency TEXT DEFAULT '';
