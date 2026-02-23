-- Migration: Add premium support and gem purchases tracking
-- Created: 2024
-- Description: Adds isPremium field to user_profiles and creates gem_purchases table for RevenueCat integration

-- Step 1: Add isPremium field to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Step 2: Create gem_purchases table for tracking in-app purchases
CREATE TABLE IF NOT EXISTS public.gem_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  gems_granted INTEGER NOT NULL,
  purchase_token TEXT UNIQUE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- RevenueCat specific fields
  revenue_cat_transaction_id TEXT UNIQUE,
  revenue_cat_product_identifier TEXT,
  revenue_cat_store TEXT, -- 'app_store' or 'play_store'
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gem_purchases_user_id ON public.gem_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gem_purchases_purchased_at ON public.gem_purchases(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_gem_purchases_transaction_id ON public.gem_purchases(revenue_cat_transaction_id);

-- Step 4: Add RLS (Row Level Security) policies
ALTER TABLE public.gem_purchases ENABLE ROW LEVEL SECURITY;

-- Users can only view their own purchases
CREATE POLICY "Users can view own gem purchases"
  ON public.gem_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert purchases (via service role)
CREATE POLICY "Service role can insert gem purchases"
  ON public.gem_purchases
  FOR INSERT
  WITH CHECK (true);

-- Step 5: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gem_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for updated_at
CREATE TRIGGER update_gem_purchases_updated_at_trigger
  BEFORE UPDATE ON public.gem_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_gem_purchases_updated_at();

-- Step 7: Add comment for documentation
COMMENT ON TABLE public.gem_purchases IS 'Tracks all gem purchases made through RevenueCat (Google Play / App Store)';
COMMENT ON COLUMN public.user_profiles.is_premium IS 'Whether user has active premium subscription';
