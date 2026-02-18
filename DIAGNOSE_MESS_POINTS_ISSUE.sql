-- Diagnose mess points synchronization issue
-- Run these queries to identify the problem

-- 1. Check user_profiles table for mess_points
SELECT 
  id,
  user_name,
  mess_points,
  updated_at,
  created_at
FROM user_profiles
ORDER BY updated_at DESC;

-- 2. Check daily_data table for mess_points (if it exists there)
SELECT 
  user_id,
  date_tracked,
  mess_points,
  updated_at
FROM daily_data
WHERE date_tracked >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date_tracked DESC, updated_at DESC;

-- 3. Check for multiple records for the same user in user_profiles
SELECT 
  id,
  COUNT(*) as record_count
FROM user_profiles
GROUP BY id
HAVING COUNT(*) > 1;

-- 4. Check for multiple daily_data records for today
SELECT 
  user_id,
  date_tracked,
  COUNT(*) as record_count,
  ARRAY_AGG(mess_points ORDER BY updated_at DESC) as mess_points_values
FROM daily_data
WHERE date_tracked = CURRENT_DATE
GROUP BY user_id, date_tracked
HAVING COUNT(*) > 1;

-- 5. Compare mess_points between user_profiles and daily_data for today
SELECT 
  up.id as user_id,
  up.user_name,
  up.mess_points as profile_mess_points,
  dd.mess_points as daily_mess_points,
  up.updated_at as profile_updated,
  dd.updated_at as daily_updated
FROM user_profiles up
LEFT JOIN daily_data dd ON up.id = dd.user_id AND dd.date_tracked = CURRENT_DATE
WHERE up.mess_points IS NOT NULL OR dd.mess_points IS NOT NULL;
