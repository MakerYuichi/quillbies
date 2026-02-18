-- Cleanup Duplicate daily_data Records
-- Run this to fix the mess_points reverting issue

-- ============================================
-- STEP 1: Find duplicate records
-- ============================================

-- Check if there are multiple records per user (there shouldn't be!)
SELECT 
  user_id,
  COUNT(*) as record_count,
  array_agg(date_tracked ORDER BY date_tracked DESC) as dates,
  array_agg(mess_points ORDER BY date_tracked DESC) as mess_points_history
FROM daily_data
GROUP BY user_id
HAVING COUNT(*) > 1;

-- ============================================
-- STEP 2: Delete duplicates, keep most recent
-- ============================================

-- Delete all but the most recent record for each user
DELETE FROM daily_data
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY date_tracked DESC, updated_at DESC NULLS LAST
      ) as rn
    FROM daily_data
  ) t
  WHERE rn > 1
);

-- ============================================
-- STEP 3: Verify only one record per user
-- ============================================

SELECT 
  user_id,
  COUNT(*) as record_count
FROM daily_data
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Should return 0 rows

-- ============================================
-- STEP 4: Sync remaining records with user_profiles
-- ============================================

-- Update daily_data to match user_profiles (source of truth)
UPDATE daily_data dd
SET 
  mess_points = up.mess_points,
  energy = up.energy,
  q_coins = up.q_coins,
  current_streak = up.current_streak,
  updated_at = NOW()
FROM user_profiles up
WHERE dd.user_id = up.id;

-- ============================================
-- STEP 5: Verify sync
-- ============================================

SELECT 
  up.id as user_id,
  up.buddy_name,
  up.mess_points as profile_mess,
  dd.mess_points as daily_mess,
  CASE 
    WHEN up.mess_points = dd.mess_points THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM user_profiles up
LEFT JOIN daily_data dd ON up.id = dd.user_id
ORDER BY up.buddy_name;

-- ============================================
-- DONE!
-- ============================================

-- After running this:
-- 1. Each user has exactly ONE daily_data record
-- 2. mess_points in daily_data matches user_profiles
-- 3. App will load the correct value on reload
