-- Enable PostGIS extension for location features
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  location GEOGRAPHY(Point, 4326),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dogs
CREATE TABLE dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT '',
  age_months INT NOT NULL DEFAULT 0,
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
  size TEXT NOT NULL DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large')),
  personality TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT NOT NULL DEFAULT '',
  photos TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Swipes
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  swiped_dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('like', 'pass')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (swiper_dog_id, swiped_dog_id)
);

-- Matches (created when both dogs like each other)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_a_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  dog_b_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dogs_owner ON dogs(owner_id);
CREATE INDEX idx_dogs_active ON dogs(is_active) WHERE is_active = true;
CREATE INDEX idx_swipes_swiper ON swipes(swiper_dog_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_dog_id);
CREATE INDEX idx_matches_dog_a ON matches(dog_a_id);
CREATE INDEX idx_matches_dog_b ON matches(dog_b_id);
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Dogs: everyone can see active dogs, owners can manage their own
CREATE POLICY "Active dogs are viewable by everyone" ON dogs FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can insert own dogs" ON dogs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own dogs" ON dogs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own dogs" ON dogs FOR DELETE USING (auth.uid() = owner_id);

-- Swipes: users can only manage swipes from their own dogs
CREATE POLICY "Users can view own swipes" ON swipes FOR SELECT
  USING (swiper_dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid()));
CREATE POLICY "Users can insert swipes for own dogs" ON swipes FOR INSERT
  WITH CHECK (swiper_dog_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid()));

-- Matches: users can view matches involving their dogs
CREATE POLICY "Users can view own matches" ON matches FOR SELECT
  USING (
    dog_a_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
    OR dog_b_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
  );
CREATE POLICY "Users can create matches" ON matches FOR INSERT
  WITH CHECK (
    dog_a_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
    OR dog_b_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
  );

-- Messages: users can view/send messages in their matches
CREATE POLICY "Users can view messages in their matches" ON messages FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches WHERE
        dog_a_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
        OR dog_b_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages in their matches" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND match_id IN (
      SELECT id FROM matches WHERE
        dog_a_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
        OR dog_b_id IN (SELECT id FROM dogs WHERE owner_id = auth.uid())
    )
  );

-- Function: Get nearby dogs
CREATE OR REPLACE FUNCTION get_nearby_dogs(user_lat FLOAT, user_lng FLOAT, radius_km FLOAT)
RETURNS SETOF dogs AS $$
  SELECT d.*
  FROM dogs d
  JOIN profiles p ON d.owner_id = p.id
  WHERE d.is_active = true
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY p.location <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
