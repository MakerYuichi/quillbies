-- Database Consolidation Migration
-- This migration fixes inconsistencies and consolidates duplicate tables
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Consolidate Daily Tracking Tables
-- ============================================

-- Add missing fields from daily_progress to daily_data
ALTER TABLE daily_data
ADD COLUMN IF NOT EXISTS energy integer DEFAULT 100 CHECK (energy >= 0 AND energy <= 100),
ADD COLUMN IF NOT EXISTS q_coins integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS mess_points numeric DEFAULT 0 CHECK (mess_points >= 0),
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_in_date date;

-- Migrate data from daily_progress to daily_data (if any exists)
-- Only migrate the most recent record per user to avoid duplicates
INSERT INTO daily_data (
  user_id, date_tracked, energy, q_coins, mess_points, 
  ate_breakfast, water_glasses, meals_logged, exercise_minutes,
  study_minutes_today, missed_checkpoints, current_streak, last_check_in_date
)
SELECT DISTINCT ON (user_id)
  user_id, date, energy, q_coins, mess_points,
  ate_breakfast, water_glasses, meals_logged, exercise_minutes,
  study_minutes_today, missed_checkpoints, current_streak, last_check_in_date
FROM daily_progress
ORDER BY user_id, date DESC, updated_at DESC NULLS LAST
ON CONFLICT (user_id) DO UPDATE SET
  date_tracked = EXCLUDED.date_tracked,
  energy = EXCLUDED.energy,
  q_coins = EXCLUDED.q_coins,
  mess_points = EXCLUDED.mess_points,
  ate_breakfast = EXCLUDED.ate_breakfast,
  water_glasses = EXCLUDED.water_glasses,
  meals_logged = EXCLUDED.meals_logged,
  exercise_minutes = EXCLUDED.exercise_minutes,
  study_minutes_today = EXCLUDED.study_minutes_today,
  missed_checkpoints = EXCLUDED.missed_checkpoints,
  current_streak = EXCLUDED.current_streak,
  last_check_in_date = EXCLUDED.last_check_in_date,
  updated_at = CURRENT_TIMESTAMP;

-- Drop daily_progress table
DROP TABLE IF EXISTS daily_progress CASCADE;

-- ============================================
-- STEP 2: Drop Duplicate Profiles Table
-- ============================================

-- The profiles table is redundant - user_profiles has all the same fields plus more
-- All data should already be in user_profiles
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- STEP 3: Standardize Column Names
-- ============================================

-- Rename coins_earned to q_coins_earned for consistency
ALTER TABLE sleep_sessions
RENAME COLUMN coins_earned TO q_coins_earned;

-- ============================================
-- STEP 4: Add Performance Indexes
-- ============================================

-- Daily data indexes
CREATE INDEX IF NOT EXISTS idx_daily_data_user_id 
  ON daily_data(user_id);

CREATE INDEX IF NOT EXISTS idx_daily_data_user_date 
  ON daily_data(user_id, date_tracked DESC);

-- Deadlines indexes
CREATE INDEX IF NOT EXISTS idx_deadlines_user_completed 
  ON deadlines(user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_deadlines_due_date 
  ON deadlines(due_date);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_due 
  ON deadlines(user_id, due_date);

-- Focus sessions indexes
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_completed 
  ON focus_sessions(user_id, is_completed);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_start 
  ON focus_sessions(user_id, start_time DESC);

-- Sleep sessions indexes
CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_date 
  ON sleep_sessions(user_id, date_assigned DESC);

CREATE INDEX IF NOT EXISTS idx_sleep_sessions_user_start 
  ON sleep_sessions(user_id, start_time DESC);

-- Purchased items indexes
CREATE INDEX IF NOT EXISTS idx_purchased_items_user_id 
  ON purchased_items(user_id);

CREATE INDEX IF NOT EXISTS idx_purchased_items_item_id 
  ON purchased_items(item_id);

-- ============================================
-- STEP 5: Update Foreign Key Constraints
-- ============================================

-- Note: Foreign key updates require dropping and recreating constraints
-- This is done carefully to avoid data loss

-- Update daily_data foreign key to include CASCADE
ALTER TABLE daily_data
DROP CONSTRAINT IF EXISTS daily_data_user_id_fkey,
ADD CONSTRAINT daily_data_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update deadlines foreign key to include CASCADE
ALTER TABLE deadlines
DROP CONSTRAINT IF EXISTS deadlines_user_id_fkey,
ADD CONSTRAINT deadlines_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update focus_sessions foreign keys to include CASCADE
ALTER TABLE focus_sessions
DROP CONSTRAINT IF EXISTS focus_sessions_user_id_fkey,
ADD CONSTRAINT focus_sessions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE focus_sessions
DROP CONSTRAINT IF EXISTS focus_sessions_deadline_id_fkey,
ADD CONSTRAINT focus_sessions_deadline_id_fkey 
  FOREIGN KEY (deadline_id) REFERENCES deadlines(id) ON DELETE SET NULL;

-- Update purchased_items foreign keys to include CASCADE
ALTER TABLE purchased_items
DROP CONSTRAINT IF EXISTS purchased_items_user_id_fkey,
ADD CONSTRAINT purchased_items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update sleep_sessions foreign key to include CASCADE
ALTER TABLE sleep_sessions
DROP CONSTRAINT IF EXISTS sleep_sessions_user_id_fkey,
ADD CONSTRAINT sleep_sessions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update calendar_day_notes foreign key to include CASCADE
ALTER TABLE calendar_day_notes
DROP CONSTRAINT IF EXISTS calendar_day_notes_user_id_fkey,
ADD CONSTRAINT calendar_day_notes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update achievement_history foreign key to include CASCADE
ALTER TABLE achievement_history
DROP CONSTRAINT IF EXISTS achievement_history_user_id_fkey,
ADD CONSTRAINT achievement_history_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- STEP 6: Standardize UUID Generation
-- ============================================

-- Update achievement_history to use gen_random_uuid()
ALTER TABLE achievement_history
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Update calendar_day_notes to use gen_random_uuid()
ALTER TABLE calendar_day_notes
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================
-- STEP 7: Add Comments for Documentation
-- ============================================

COMMENT ON TABLE daily_data IS 'Consolidated daily tracking data including habits, energy, coins, and progress';
COMMENT ON COLUMN daily_data.energy IS 'Current energy level (0-100)';
COMMENT ON COLUMN daily_data.q_coins IS 'Q-Bies currency balance';
COMMENT ON COLUMN daily_data.mess_points IS 'Room messiness points';
COMMENT ON COLUMN daily_data.current_streak IS 'Current daily streak count';

COMMENT ON COLUMN sleep_sessions.q_coins_earned IS 'Q-Bies earned from this sleep session';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify the migration was successful:

-- Check that daily_data has all required columns
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'daily_data' 
-- ORDER BY ordinal_position;

-- Check that profiles table is dropped
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'profiles';

-- Check that daily_progress table is dropped
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name = 'daily_progress';

-- Check all indexes
-- SELECT tablename, indexname 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- Check all foreign key constraints
-- SELECT
--   tc.table_name, 
--   tc.constraint_name, 
--   tc.constraint_type,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name,
--   rc.delete_rule
-- FROM information_schema.table_constraints AS tc 
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- LEFT JOIN information_schema.referential_constraints AS rc
--   ON tc.constraint_name = rc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY' 
--   AND tc.table_schema = 'public'
-- ORDER BY tc.table_name;

-- ============================================
-- ROLLBACK PLAN (if needed)
-- ============================================

-- If something goes wrong, you can rollback by:
-- 1. Restore from backup
-- 2. Or manually recreate the dropped tables from the original schema

-- Note: Always test in a staging environment first!
