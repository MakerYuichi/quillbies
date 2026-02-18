-- Verify Mess Points Sync Status
-- Run this to check if mess_points are in sync between tables

-- ============================================
-- Check current mess_points values
-- ============================================

SELECT 
  up.id as user_id,
  up.buddy_name,
  up.mess_points as profile_mess,
  dd.mess_points as daily_mess,
  CASE 
    WHEN up.mess_points = dd.mess_points THEN '✅ SYNCED'
    ELSE '❌ OUT OF SYNC'
  END as status,
  up.updated_at as profile_updated,
  dd.updated_at as daily_updated
FROM user_profiles up
LEFT JOIN daily_data dd ON up.id = dd.user_id
ORDER BY up.buddy_name;

-- ============================================
-- Check for any records without daily_data
-- ============================================

SELECT 
  up.id,
  up.buddy_name,
  up.mess_points,
  'Missing daily_data record' as issue
FROM user_profiles up
LEFT JOIN daily_data dd ON up.id = dd.user_id
WHERE dd.user_id IS NULL;

-- ============================================
-- Verify UNIQUE constraint exists
-- ============================================

SELECT 
  constraint_name, 
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'daily_data' 
  AND constraint_type = 'UNIQUE';

-- If no UNIQUE constraint, add it:
-- ALTER TABLE daily_data
-- ADD CONSTRAINT daily_data_user_id_unique UNIQUE (user_id);
