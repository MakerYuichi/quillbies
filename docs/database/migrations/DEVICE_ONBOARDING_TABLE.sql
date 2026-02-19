-- Create device_onboarding table for tracking onboarding completion per device
-- This ensures onboarding only shows once per device, not per user

CREATE TABLE IF NOT EXISTS device_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  app_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by device_id
CREATE INDEX IF NOT EXISTS idx_device_onboarding_device_id ON device_onboarding(device_id);

-- Create index for completed status
CREATE INDEX IF NOT EXISTS idx_device_onboarding_completed ON device_onboarding(completed);

-- Add RLS (Row Level Security) policy if needed
-- ALTER TABLE device_onboarding ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write their own device onboarding records
-- CREATE POLICY "Users can manage their device onboarding" ON device_onboarding
--   FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE device_onboarding IS 'Tracks onboarding completion per device to prevent repeated onboarding';
COMMENT ON COLUMN device_onboarding.device_id IS 'Unique device identifier from deviceAuth.ts';
COMMENT ON COLUMN device_onboarding.completed IS 'Whether onboarding has been completed for this device';
COMMENT ON COLUMN device_onboarding.completed_at IS 'When onboarding was completed';
COMMENT ON COLUMN device_onboarding.app_version IS 'App version when onboarding was completed';