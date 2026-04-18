-- Add specific walking spot names (e.g. "大安森林公園", "中和錦和公園")
-- walking_locations stays as location type tags (公園, 河堤, etc.)
-- walking_spots stores concrete place names for precise matching
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS walking_spots TEXT[] DEFAULT '{}';
