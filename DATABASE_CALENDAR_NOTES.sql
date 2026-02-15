-- Calendar Day Notes Table
-- Stores user notes and emojis for specific calendar days

CREATE TABLE IF NOT EXISTS calendar_day_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT,
  emoji TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one entry per user per date
  UNIQUE(user_id, date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_calendar_notes_user_date ON calendar_day_notes(user_id, date);

-- RLS Policies
ALTER TABLE calendar_day_notes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notes
CREATE POLICY "Users can view own calendar notes"
  ON calendar_day_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own notes
CREATE POLICY "Users can insert own calendar notes"
  ON calendar_day_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update own calendar notes"
  ON calendar_day_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete own calendar notes"
  ON calendar_day_notes FOR DELETE
  USING (auth.uid() = user_id);
