-- Update get_nearby_dogs to return distance and owner info
CREATE OR REPLACE FUNCTION get_nearby_dogs(user_lat FLOAT, user_lng FLOAT, radius_km FLOAT)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  name TEXT,
  breed TEXT,
  age_months INT,
  gender TEXT,
  size TEXT,
  personality TEXT[],
  bio TEXT,
  city TEXT,
  district TEXT,
  walking_locations TEXT[],
  walking_times TEXT[],
  walking_frequency TEXT,
  photos TEXT[],
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  distance_km FLOAT,
  owner_name TEXT
) AS $$
  SELECT
    d.id,
    d.owner_id,
    d.name,
    d.breed,
    d.age_months,
    d.gender,
    d.size,
    d.personality,
    d.bio,
    d.city,
    d.district,
    d.walking_locations,
    d.walking_times,
    d.walking_frequency,
    d.photos,
    d.is_active,
    d.created_at,
    ROUND((ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) / 1000)::numeric, 1)::float AS distance_km,
    p.display_name AS owner_name
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

-- Helper function to update user location (avoids geography type issues via REST API)
CREATE OR REPLACE FUNCTION update_user_location(lat FLOAT, lng FLOAT)
RETURNS VOID AS $$
  UPDATE profiles
  SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;
