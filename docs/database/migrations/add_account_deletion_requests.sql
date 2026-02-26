-- Migration: Add account_deletion_requests table
-- Purpose: Track account deletion requests with 30-day grace period
-- Date: 2024

-- Create account_deletion_requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one deletion request per user
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled_for ON account_deletion_requests(scheduled_for);

-- Enable RLS
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own deletion requests
CREATE POLICY "Users can view own deletion requests"
  ON account_deletion_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own deletion requests
CREATE POLICY "Users can create own deletion requests"
  ON account_deletion_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own deletion requests (for cancellation)
CREATE POLICY "Users can update own deletion requests"
  ON account_deletion_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own deletion requests (for cancellation)
CREATE POLICY "Users can delete own deletion requests"
  ON account_deletion_requests
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_account_deletion_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_account_deletion_requests_updated_at
  BEFORE UPDATE ON account_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_account_deletion_requests_updated_at();

-- Comments
COMMENT ON TABLE account_deletion_requests IS 'Tracks account deletion requests with 30-day grace period';
COMMENT ON COLUMN account_deletion_requests.user_id IS 'User who requested account deletion';
COMMENT ON COLUMN account_deletion_requests.requested_at IS 'When the deletion was requested';
COMMENT ON COLUMN account_deletion_requests.scheduled_for IS 'When the account will be deleted (30 days after request)';
COMMENT ON COLUMN account_deletion_requests.status IS 'Status: pending, cancelled, or completed';
