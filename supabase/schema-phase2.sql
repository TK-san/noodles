-- Noodles Vocabulary App - Phase 2 Schema
-- Extended vocabulary and user progression
-- Run this in your Supabase SQL Editor

-- ============================================
-- Extended Vocabulary Table (for 10,000+ words)
-- ============================================
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_key TEXT UNIQUE NOT NULL,        -- Unique identifier e.g., "ext-food-001"
  chinese TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  english TEXT NOT NULL,
  example_chinese TEXT,
  example_pinyin TEXT,
  example_english TEXT,
  category_id TEXT NOT NULL,            -- e.g., "food", "business", "medical"
  difficulty_level INT DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
  hsk_level INT CHECK (hsk_level BETWEEN 1 AND 6),
  frequency_rank INT,                   -- Lower = more common
  tags TEXT[],                          -- e.g., ['formal', 'spoken', 'written']
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category_id);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_words_hsk ON words(hsk_level);
CREATE INDEX IF NOT EXISTS idx_words_frequency ON words(frequency_rank);

-- Enable RLS (words are public read, admin write)
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Anyone can read words
CREATE POLICY "Words are publicly readable"
  ON words FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (via admin scripts)
-- No INSERT/UPDATE/DELETE policies = only service role can modify

-- ============================================
-- User Levels / Progression
-- ============================================
CREATE TABLE IF NOT EXISTS user_levels (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INT DEFAULT 1 CHECK (current_level BETWEEN 1 AND 5),
  total_words_mastered INT DEFAULT 0,
  xp_points INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;

-- Users can only access their own level data
CREATE POLICY "Users can view their own level"
  ON user_levels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own level"
  ON user_levels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own level"
  ON user_levels FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Extended Categories (for Supabase-stored words)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_zh TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  min_level INT DEFAULT 1,              -- Minimum user level to access
  word_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (categories are public read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  USING (true);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_words_updated_at') THEN
    CREATE TRIGGER update_words_updated_at
      BEFORE UPDATE ON words
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_levels_updated_at') THEN
    CREATE TRIGGER update_user_levels_updated_at
      BEFORE UPDATE ON user_levels
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- Helper function: Update category word count
-- ============================================
CREATE OR REPLACE FUNCTION update_category_word_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET word_count = word_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET word_count = word_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'words_count_trigger') THEN
    CREATE TRIGGER words_count_trigger
      AFTER INSERT OR DELETE ON words
      FOR EACH ROW
      EXECUTE FUNCTION update_category_word_count();
  END IF;
END $$;

-- ============================================
-- View: Combined user stats
-- ============================================
CREATE OR REPLACE VIEW user_full_stats AS
SELECT
  ul.user_id,
  ul.current_level,
  ul.total_words_mastered,
  ul.xp_points,
  ul.streak_days,
  ul.last_study_date,
  COALESCE(up.learning_count, 0) as learning_count,
  COALESCE(up.mastered_count, 0) as mastered_count
FROM user_levels ul
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) FILTER (WHERE status = 'learning') as learning_count,
    COUNT(*) FILTER (WHERE status = 'mastered') as mastered_count
  FROM user_progress
  GROUP BY user_id
) up ON ul.user_id = up.user_id;

GRANT SELECT ON user_full_stats TO authenticated;

-- ============================================
-- Level progression thresholds
-- ============================================
-- Level 1: 0-100 words mastered (static vocabulary)
-- Level 2: 100-300 words mastered (static vocabulary)
-- Level 3: 300-800 words mastered (unlock extended)
-- Level 4: 800-2000 words mastered
-- Level 5: 2000+ words mastered

COMMENT ON TABLE user_levels IS 'Tracks user progression through vocabulary levels';
COMMENT ON COLUMN user_levels.current_level IS '1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert';
