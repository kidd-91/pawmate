-- Migration 013: drop walk_groups tables
-- The 揪團 (walk meetups) feature was removed in Phase 2.6 — users now find
-- friends via 探索/配對 and arrange meetups via private chat. The DB tables
-- have sat idle since the UI was hidden in Phase 2.1; this migration drops
-- them along with their realtime publication and related schema.

-- Drop in dependency order: messages → members → groups
DROP TABLE IF EXISTS public.walk_group_messages CASCADE;
DROP TABLE IF EXISTS public.walk_group_members  CASCADE;
DROP TABLE IF EXISTS public.walk_groups         CASCADE;

-- The realtime publication entry for walk_group_messages is removed
-- automatically when the table is dropped CASCADE.
