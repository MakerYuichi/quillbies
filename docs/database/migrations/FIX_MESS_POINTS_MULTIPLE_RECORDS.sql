-- Fix Mess Points Multiple Records Issue
-- This script identifies and fixes the issue where mess_points keeps reverting to old values

-- ============================================
-- STEP 1: Check for multiple daily_data records
-- ============================================

-- See all daily_data records for your user (replace YOUR_USER_ID)
SELECT 
  user_id,
  date_tracked,
  mess_points,
  energy,
  q_coins,
  created_at,
  updated_at
FROM daily_data
WHERE user_id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0'
ORDER BY date_tracked DESC;

-- ============================================
-- STEP 2: Check user_profiles mess_points
-- ============================================

SELECT 
  id,
  buddy_name,
  mess_points,
  energy,
  q_coins,
  current_streak
FROM user_profiles
WHERE id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0';

-- ============================================
-- STEP 3: Delete old daily_data records (keep only today)
-- ============================================

-- Delete all records except today's
DELETE FROM daily_data
WHERE user_id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0'
  AND date_tracked < CURRENT_DATE;

-- Verify only today's record remains
SELECT COUNT(*) as record_count, date_tracked
FROM daily_data
WHERE user_id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0'
GROUP BY date_tracked;

-- ============================================
-- STEP 4: Sync mess_points between tables
-- ============================================

-- Option A: Use user_profiles as source of truth
UPDATE daily_data
SET mess_points = (
  SELECT mess_points 
  FROM user_profiles 
  WHERE id = daily_data.user_id
)
WHERE user_id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0';

-- Option B: Use daily_data as source of truth (if you just cleaned the room)
UPDATE user_profiles
SET mess_points = (
  SELECT mess_points 
  FROM daily_data 
  WHERE user_id = user_profiles.id 
    AND date_tracked = CURRENT_DATE
)
WHERE id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0';

-- ============================================
-- STEP 5: Verify both tables match
-- ============================================

SELECT 
  'user_profiles' as source,
  mess_points,
  energy,
  q_coins
FROM user_profiles
WHERE id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0'

UNION ALL

SELECT 
  'daily_data' as source,
  mess_points,
  energy,
  q_coins
FROM daily_data
WHERE user_id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0'
  AND date_tracked = CURRENT_DATE;

-- ============================================
-- STEP 6: Set mess_points to specific value (if needed)
-- ============================================

-- Set to 3 in both tables
UPDATE user_profiles
SET mess_points = 3
WHERE id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0';

UPDATE daily_data
SET mess_points = 3
WHERE user_id = '7b6a77a1-06f3-4776-bf33-a1d34f7c6ab0'
  AND date_tracked = CURRENT_DATE;

-- ============================================
-- PREVENTION: Add constraint to ensure one record per user
-- ============================================

-- This was already done in the consolidation migration
-- The UNIQUE constraint on user_id ensures only one record per user

-- Verify the constraint exists
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'daily_data'::regclass
  AND contype = 'u'; -- unique constraint

-- ============================================
-- NOTES
-- ============================================

-- The issue occurs because:
-- 1. daily_data table has one record per user (with date_tracked field)
-- 2. Old records from previous days might still exist
-- 3. When loading, the app might be loading from an old record
-- 4. The sync updates today's record, but old records remain

-- Solution:
-- 1. Delete old daily_data records (keep only today)
-- 2. Ensure both tables have the same mess_points value
-- 3. The app should only query daily_data WHERE date_tracked = CURRENT_DATE
