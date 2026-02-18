-- Achievement History Table
-- Stores historical records of when users unlock achievements
-- This allows tracking of daily/weekly/monthly achievements over time

CREATE TABLE IF NOT EXISTS achievement_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'secret'
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  period_date DATE NOT NULL, -- The date/period this achievement was earned for
  gems_earned INTEGER DEFAULT 0,
  qbies_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_achievement_history_user_id ON achievement_history(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_history_achievement_id ON achievement_history(user_id, achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_history_period ON achievement_history(user_id, period_date DESC);
CREATE INDEX IF NOT EXISTS idx_achievement_history_type ON achievement_history(user_id, achievement_type);

-- RLS Policies
ALTER TABLE achievement_history ENABLE ROW LEVEL SECURITY;

-- Users can only read their own achievement history
CREATE POLICY "Users can view own achievement history"
  ON achievement_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own achievement history
CREATE POLICY "Users can insert own achievement history"
  ON achievement_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE achievement_history IS 'Historical record of all achievements unlocked by users, including repeatable daily/weekly/monthly achievements';
COMMENT ON COLUMN achievement_history.period_date IS 'The date or start of period (week/month) when this achievement was earned';
COMMENT ON COLUMN achievement_history.achievement_type IS 'Type of achievement: daily, weekly, monthly, or secret';
