-- Update goal fields in user_profiles table to support decimal values
-- This fixes the "invalid input syntax for type integer" error

-- Change study_goal_hours from integer to float4 (supports decimals like 3.5)
ALTER TABLE user_profiles 
ALTER COLUMN study_goal_hours TYPE REAL;

-- Change sleep_goal_hours from integer to float4 (supports decimals like 7.5)
ALTER TABLE user_profiles 
ALTER COLUMN sleep_goal_hours TYPE REAL;

-- Optional: Add comments for documentation
COMMENT ON COLUMN user_profiles.study_goal_hours IS 'Daily study goal in hours (supports decimals like 3.5)';
COMMENT ON COLUMN user_profiles.sleep_goal_hours IS 'Daily sleep goal in hours (supports decimals like 7.5)';

-- Verify the changes (optional - you can run this to check)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_profiles' 
-- AND column_name IN ('study_goal_hours', 'sleep_goal_hours');