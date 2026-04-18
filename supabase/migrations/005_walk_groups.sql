-- Walk groups (遛狗揪團)
CREATE TABLE IF NOT EXISTS walk_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  creator_dog_id UUID NOT NULL REFERENCES dogs(id),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  walk_date DATE NOT NULL,
  walk_time TEXT NOT NULL,        -- 'morning' | 'afternoon' | 'evening'
  notes TEXT DEFAULT '',
  max_members INT DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Walk group members
CREATE TABLE IF NOT EXISTS walk_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES walk_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  dog_id UUID NOT NULL REFERENCES dogs(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, dog_id)
);

-- Walk group messages (group chat)
CREATE TABLE IF NOT EXISTS walk_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES walk_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE walk_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_group_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active walk groups
CREATE POLICY "Anyone can view active walk groups"
  ON walk_groups FOR SELECT
  USING (is_active = true);

-- Creator can update/delete own groups
CREATE POLICY "Creator can manage own groups"
  ON walk_groups FOR ALL
  USING (creator_id = auth.uid());

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups"
  ON walk_groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Anyone can view group members
CREATE POLICY "Anyone can view group members"
  ON walk_group_members FOR SELECT
  USING (true);

-- Users can join/leave groups
CREATE POLICY "Users can join groups"
  ON walk_group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups"
  ON walk_group_members FOR DELETE
  USING (user_id = auth.uid());

-- Group members can view messages
CREATE POLICY "Group members can view messages"
  ON walk_group_messages FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM walk_group_members WHERE user_id = auth.uid()
    )
    OR
    group_id IN (
      SELECT id FROM walk_groups WHERE creator_id = auth.uid()
    )
  );

-- Group members can send messages
CREATE POLICY "Group members can send messages"
  ON walk_group_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      group_id IN (
        SELECT group_id FROM walk_group_members WHERE user_id = auth.uid()
      )
      OR
      group_id IN (
        SELECT id FROM walk_groups WHERE creator_id = auth.uid()
      )
    )
  );

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE walk_group_messages;
