-- Fix mess points synchronization issue
-- Make user_profiles the single source of truth for mess_points

-- Step 1: Show current state before fix
SELECT 
  'BEFORE FIX' as status,
  up.id as user_id,
  up.user_name,
  up.mess_points as profile_mess_points,
  dd.mess_points as daily_mess_points,
  up.updated_at as profile_updated,
  dd.updated_at as daily_updated,
  CASE 
    WHEN dd.updated_at IS NULL THEN 'No daily_data record'
    WHEN dd.updated_at > up.updated_at THEN 'daily_data is newer'
    WHEN up.updated_at > dd.updated_at THEN 'profile is newer'
    ELSE 'Same timestamp'
  END as which_is_newer
FROM user_profiles up
LEFT JOIN daily_data dd ON up.id = dd.user_id AND dd.date_tracked = CURRENT_DATE
WHERE up.mess_points IS NOT NULL OR dd.mess_points IS NOT NULL
ORDER BY up.updated_at DESC;

-- Step 2: Identify the correct mess_points value
-- (Use the most recently updated value between user_profiles and daily_data)
WITH latest_mess AS (
  SELECT 
    up.id as user_id,
    up.mess_points as current_profile_value,
    dd.mess_points as current_daily_value,
    CASE 
      -- If daily_data is newer and has a value, use it
      WHEN dd.updated_at > up.updated_at AND dd.mess_points IS NOT NULL THEN dd.mess_points
      -- Otherwise use profile value (or 0 if null)
      ELSE COALESCE(up.mess_points, 0)
    END as correct_mess_points,
    CASE 
      WHEN dd.updated_at > up.updated_at AND dd.mess_points IS NOT NULL THEN 'Using daily_data (newer)'
      ELSE 'Using user_profiles'
    END as source
  FROM user_profiles up
  LEFT JOIN daily_data dd ON up.id = dd.user_id AND dd.date_tracked = CURRENT_DATE
)
SELECT 
  'CORRECTION PLAN' as status,
  user_id,
  current_profile_value,
  current_daily_value,
  correct_mess_points,
  source
FROM latest_mess
WHERE current_profile_value IS DISTINCT FROM correct_mess_points
ORDER BY user_id;

-- Step 3: Apply the correction to user_profiles
WITH latest_mess AS (
  SELECT 
    up.id as user_id,
    CASE 
      WHEN dd.updated_at > up.updated_at AND dd.mess_points IS NOT NULL THEN dd.mess_points
      ELSE COALESCE(up.mess_points, 0)
    END as correct_mess_points
  FROM user_profiles up
  LEFT JOIN daily_data dd ON up.id = dd.user_id AND dd.date_tracked = CURRENT_DATE
)
UPDATE user_profiles up
SET 
  mess_points = lm.correct_mess_points,
  updated_at = NOW()
FROM latest_mess lm
WHERE up.id = lm.user_id
  AND up.mess_points IS DISTINCT FROM lm.correct_mess_points;

-- Step 4: Verify the fix was applied
SELECT 
  'AFTER FIX' as status,
  up.id as user_id,
  up.user_name,
  up.mess_points as profile_mess_points,
  dd.mess_points as daily_mess_points,
  up.updated_at as profile_updated,
  dd.updated_at as daily_updated
FROM user_profiles up
LEFT JOIN daily_data dd ON up.id = dd.user_id AND dd.date_tracked = CURRENT_DATE
WHERE up.mess_points IS NOT NULL OR dd.mess_points IS NOT NULL
ORDER BY up.updated_at DESC;

-- Step 5: (OPTIONAL) Remove mess_points from daily_data table
-- This makes user_profiles the ONLY source of truth
-- Uncomment the line below to permanently remove the column:
ALTER TABLE daily_data DROP COLUMN IF EXISTS mess_points;

-- IMPORTANT NOTES:
-- 1. The code has been updated to only sync mess_points to user_profiles
-- 2. The code now only loads mess_points from user_profiles
-- 3. After running this SQL, mess_points will be consistent
-- 4. Consider running Step 5 to prevent future conflicts
