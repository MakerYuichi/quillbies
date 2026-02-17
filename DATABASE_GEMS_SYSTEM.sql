-- Add gems field to user_profiles table
-- Gems are a premium currency earned through achievements and special events

ALTER TABLE user_profiles
ADD COLUMN gems INTEGER DEFAULT 0;

-- Add comment explaining gems
COMMENT ON COLUMN user_profiles.gems IS 'Premium currency earned through achievements, streaks, and special events. Used for exclusive shop items.';

-- Update existing users to have 0 gems
UPDATE user_profiles SET gems = 0 WHERE gems IS NULL;
