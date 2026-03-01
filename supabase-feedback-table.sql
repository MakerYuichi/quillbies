-- Create feedback table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT,
  user_name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  os_version TEXT,
  device_model TEXT,
  device_name TEXT,
  app_version TEXT,
  build_number TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for better query performance
  CONSTRAINT feedback_category_check CHECK (category IN ('bug', 'feature', 'improvement', 'praise', 'other'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_device_id ON feedback(device_id);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);

-- Enable Row Level Security (RLS)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert feedback (anonymous submissions)
CREATE POLICY "Allow anonymous feedback submission"
  ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to read their own feedback
CREATE POLICY "Users can read their own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (device_id = current_setting('request.jwt.claims', true)::json->>'device_id');

-- Create policy for admins to read all feedback (optional)
-- You'll need to set up a custom claim for admin users
CREATE POLICY "Admins can read all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

-- Grant permissions
GRANT INSERT ON feedback TO anon;
GRANT SELECT ON feedback TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE feedback IS 'User feedback submissions from the Quillby mobile app';
