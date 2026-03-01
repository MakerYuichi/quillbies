-- Fix Row Level Security for feedback table
-- Run this in your Supabase SQL Editor

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous feedback submission" ON feedback;
DROP POLICY IF EXISTS "Users can read their own feedback" ON feedback;
DROP POLICY IF EXISTS "Admins can read all feedback" ON feedback;

-- Create policy to allow anyone (including anonymous) to insert feedback
CREATE POLICY "Allow anonymous feedback submission"
  ON feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to read their own feedback
CREATE POLICY "Users can read their own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (device_id = current_setting('request.jwt.claims', true)::json->>'device_id');

-- Optional: Create policy for service role to read all feedback
CREATE POLICY "Service role can read all feedback"
  ON feedback
  FOR SELECT
  TO service_role
  USING (true);

-- Verify RLS is enabled
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT ON feedback TO anon;
GRANT INSERT ON feedback TO authenticated;
GRANT SELECT ON feedback TO authenticated;
GRANT ALL ON feedback TO service_role;
