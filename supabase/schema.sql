-- Noodles Vocabulary App - Supabase Schema
-- Run this in your Supabase SQL Editor

-- User progress table (tracks status per word per user)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,              -- e.g., "greetings-1", "animals-42"
  category_id TEXT NOT NULL,          -- e.g., "greetings", "animals"
  status TEXT DEFAULT 'not_seen' CHECK (status IN ('not_seen', 'learning', 'mastered')),
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_category ON user_progress(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(user_id, status);

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: User statistics view for faster aggregations
CREATE OR REPLACE VIEW user_category_stats AS
SELECT
  user_id,
  category_id,
  COUNT(*) FILTER (WHERE status = 'not_seen') as not_seen_count,
  COUNT(*) FILTER (WHERE status = 'learning') as learning_count,
  COUNT(*) FILTER (WHERE status = 'mastered') as mastered_count,
  COUNT(*) as total_count
FROM user_progress
GROUP BY user_id, category_id;

-- Grant access to the view
GRANT SELECT ON user_category_stats TO authenticated;
