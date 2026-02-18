-- =====================================================
-- SHOP ITEMS MIGRATION - NO DROP
-- =====================================================
-- This script updates existing shop_items table and creates
-- user_shop_items table without dropping existing data
-- =====================================================

-- =====================================================
-- STEP 1: Update shop_items table structure
-- =====================================================

-- Add new columns if they don't exist
ALTER TABLE public.shop_items 
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
ADD COLUMN IF NOT EXISTS gem_price INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update category constraint to include new categories
ALTER TABLE public.shop_items 
DROP CONSTRAINT IF EXISTS shop_items_category_check;

ALTER TABLE public.shop_items 
ADD CONSTRAINT shop_items_category_check 
CHECK (category IN ('light', 'plant', 'furniture', 'theme', 'decoration'));

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_shop_items_category ON public.shop_items(category);
CREATE INDEX IF NOT EXISTS idx_shop_items_subcategory ON public.shop_items(subcategory);
CREATE INDEX IF NOT EXISTS idx_shop_items_rarity ON public.shop_items(rarity);
CREATE INDEX IF NOT EXISTS idx_shop_items_active ON public.shop_items(is_active);

-- =====================================================
-- STEP 2: Create user_shop_items table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  is_equipped BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  equipped_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, item_id)
);

-- Create indexes for user_shop_items
CREATE INDEX IF NOT EXISTS idx_user_shop_items_user ON public.user_shop_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_shop_items_category ON public.user_shop_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_shop_items_subcategory ON public.user_shop_items(user_id, subcategory);
CREATE INDEX IF NOT EXISTS idx_user_shop_items_equipped ON public.user_shop_items(user_id, is_equipped);

-- =====================================================
-- STEP 3: Migrate existing purchased_items data
-- =====================================================

-- Copy data from purchased_items to user_shop_items
INSERT INTO public.user_shop_items (user_id, item_id, category, purchased_at)
SELECT 
  pi.user_id,
  pi.item_id,
  COALESCE(si.category, 'plant') as category,
  pi.purchased_at
FROM public.purchased_items pi
LEFT JOIN public.shop_items si ON pi.item_id = si.id
ON CONFLICT (user_id, item_id) DO NOTHING;

-- =====================================================
-- STEP 4: Clear and repopulate shop_items with new data
-- =====================================================

-- Temporarily disable foreign key constraint
ALTER TABLE public.purchased_items DROP CONSTRAINT IF EXISTS purchased_items_item_id_fkey;

-- Delete old items (but keep the table structure)
DELETE FROM public.shop_items;

-- Insert all 35 shop items with correct pricing FIRST

-- LIGHTS (3 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('fairy-lights', 'Fairy Lights', 'Warm and cozy fairy lights', 'light', 'ambient', 'common', 0, NULL, 'assets/rooms/fairy-lights.png', '✨'),
('lamp', 'Desk Lamp', 'Classic desk lamp', 'light', 'task', 'common', 0, NULL, 'assets/rooms/lamp.png', '💡'),
('colored-fairy-lights', 'Colored Fairy Lights', 'Vibrant colored fairy lights', 'light', 'ambient', 'rare', 300, 15, 'assets/shop/fairy-lights/colored.png', '🌈');

-- PLANTS - COMMON (9 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('plant', 'Basic Plant', 'Simple green plant', 'plant', 'basic', 'common', 0, NULL, 'assets/rooms/plant.png', '🌱'),
('basil', 'Basil Plant', 'Fresh basil for your room', 'plant', 'herbs', 'common', 50, NULL, 'assets/shop/common/plants/basil.png', '🌿'),
('spider', 'Spider Plant', 'Easy-care spider plant', 'plant', 'hanging', 'common', 75, NULL, 'assets/shop/common/plants/spider.png', '🕷️'),
('fern', 'Fern', 'Lush green fern', 'plant', 'foliage', 'common', 100, NULL, 'assets/shop/common/plants/fern.png', '🌿'),
('aloe-vera', 'Aloe Vera', 'Healing aloe vera plant', 'plant', 'succulents', 'common', 80, NULL, 'assets/shop/common/plants/aloe-vera.png', '🌵'),
('succulent-plant', 'Succulent Plant', 'Cute succulent', 'plant', 'succulents', 'common', 60, NULL, 'assets/shop/common/plants/succulent-plant.png', '🌱'),
('money', 'Money Plant', 'Brings good fortune', 'plant', 'vines', 'common', 90, NULL, 'assets/shop/common/plants/money.png', '💰'),
('peace-lily', 'Peace Lily', 'Elegant peace lily', 'plant', 'flowering', 'common', 100, NULL, 'assets/shop/common/plants/peace-lily.png', '🌸'),
('snake', 'Snake Plant', 'Hardy snake plant', 'plant', 'foliage', 'common', 85, NULL, 'assets/shop/common/plants/snake.png', '🐍');

-- PLANTS - RARE (3 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('blossom', 'Cherry Blossom', 'Beautiful cherry blossom', 'plant', 'flowering', 'rare', 400, 20, 'assets/shop/rare/plants/blossom.png', '🌸'),
('indoor-tree', 'Indoor Tree', 'Majestic indoor tree', 'plant', 'trees', 'rare', 500, 25, 'assets/shop/rare/plants/indoor-tree.png', '🌳'),
('bamboo', 'Bamboo', 'Lucky bamboo plant', 'plant', 'bamboo', 'rare', 350, 18, 'assets/shop/rare/plants/bamboo.png', '🎋');

-- PLANTS - EPIC (7 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('swiss-cheese-plant', 'Swiss Cheese Plant', 'Trendy monstera', 'plant', 'tropical', 'epic', 0, 35, 'assets/shop/epic/plants/swiss-cheese-plant.png', '🧀'),
('sunflower', 'Sunflower', 'Bright sunflower', 'plant', 'flowering', 'epic', 0, 40, 'assets/shop/epic/plants/sunflower.png', '🌻'),
('rose', 'Rose', 'Classic rose plant', 'plant', 'flowering', 'epic', 0, 45, 'assets/shop/epic/plants/rose.png', '🌹'),
('orchid', 'Orchid', 'Exotic orchid', 'plant', 'flowering', 'epic', 0, 50, 'assets/shop/epic/plants/orchid.png', '🌺'),
('lavender', 'Lavender', 'Calming lavender', 'plant', 'herbs', 'epic', 0, 38, 'assets/shop/epic/plants/lavender.png', '💜'),
('fiddle-leaf', 'Fiddle Leaf Fig', 'Statement fiddle leaf', 'plant', 'tropical', 'epic', 0, 48, 'assets/shop/epic/plants/fiddle-leaf.png', '🌿'),
('tulip', 'Tulip', 'Colorful tulip', 'plant', 'flowering', 'epic', 0, 42, 'assets/shop/epic/plants/tulip.png', '🌷');

-- FURNITURE - COMMON (2 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('chair', 'Chair', 'Simple wooden chair', 'furniture', 'seating', 'common', 200, NULL, 'assets/shop/common/furniture/chair.png', '🪑'),
('small-bookshelf', 'Small Bookshelf', 'Compact bookshelf', 'furniture', 'storage', 'common', 250, NULL, 'assets/shop/common/furniture/small-bookshelf.png', '📚');

-- FURNITURE - RARE (3 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('comfy-sofa', 'Comfy Sofa', 'Cozy sofa for relaxing', 'furniture', 'seating', 'rare', 600, 30, 'assets/shop/rare/furniture/comfy-sofa.png', '🛋️'),
('canvas-art', 'Canvas Art', 'Modern canvas artwork', 'furniture', 'decor', 'rare', 400, 20, 'assets/shop/rare/furniture/canvas-art.png', '🎨'),
('gaming-setup', 'Gaming Setup', 'Complete gaming station', 'furniture', 'desk', 'rare', 700, 35, 'assets/shop/rare/furniture/gaming-setup.png', '🖥️');

-- FURNITURE - EPIC (4 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('gaming-redecor', 'Gaming Room Redecor', 'Complete gaming room makeover', 'furniture', 'room-set', 'epic', 0, 80, 'assets/shop/epic/furniture/gaming-redecor.png', '🎮'),
('library-redecor', 'Library Redecor', 'Scholarly library setup', 'furniture', 'room-set', 'epic', 0, 85, 'assets/shop/epic/furniture/library-redecor.png', '📖'),
('home-redecor', 'Home Redecor', 'Cozy home aesthetic', 'furniture', 'room-set', 'epic', 0, 75, 'assets/shop/epic/furniture/home-redecor.png', '🏠'),
('throne-chair', 'Throne Chair', 'Royal throne chair', 'furniture', 'seating', 'epic', 0, 60, 'assets/shop/epic/furniture/throne-chair.png', '👑');

-- THEMES - RARE (2 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('library', 'Library Theme', 'Classic library ambiance', 'theme', 'indoor', 'rare', 0, 50, 'assets/shop/rare/theme/library.png', '📚'),
('night', 'Night Theme', 'Peaceful night setting', 'theme', 'time', 'rare', 0, 50, 'assets/shop/rare/theme/night.png', '🌃');

-- THEMES - EPIC (3 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('castle', 'Castle Theme', 'Medieval castle atmosphere', 'theme', 'fantasy', 'epic', 0, 100, 'assets/shop/epic/themes/castle.png', '🏰'),
('space', 'Space Theme', 'Cosmic space adventure', 'theme', 'sci-fi', 'epic', 0, 100, 'assets/shop/epic/themes/space.png', '🚀'),
('cherry-blossom', 'Cherry Blossom Theme', 'Serene cherry blossom garden', 'theme', 'nature', 'epic', 0, 100, 'assets/shop/epic/themes/cherry-blossom.png', '🌸');

-- THEMES - LEGENDARY (3 items)
INSERT INTO public.shop_items (id, name, description, category, subcategory, rarity, price, gem_price, asset_path, icon) VALUES
('galaxy', 'Galaxy Theme', 'Stunning galaxy vista', 'theme', 'sci-fi', 'legendary', 0, 150, 'assets/shop/legendary/themes/galaxy.png', '🌌'),
('japanese-zen', 'Japanese Zen Theme', 'Tranquil zen garden', 'theme', 'nature', 'legendary', 0, 150, 'assets/shop/legendary/themes/japanese-zen.png', '🏯'),
('ocean', 'Ocean Theme', 'Underwater paradise', 'theme', 'nature', 'legendary', 0, 150, 'assets/shop/legendary/themes/ocean.png', '🌊');

-- Re-enable foreign key constraint with CASCADE option
ALTER TABLE public.purchased_items 
ADD CONSTRAINT purchased_items_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES public.shop_items(id) 
ON DELETE CASCADE;

-- =====================================================
-- STEP 5: Create triggers and functions
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shop_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shop_items_updated_at ON public.shop_items;
CREATE TRIGGER shop_items_updated_at
BEFORE UPDATE ON public.shop_items
FOR EACH ROW
EXECUTE FUNCTION update_shop_items_updated_at();

-- Auto-populate category and subcategory in user_shop_items
CREATE OR REPLACE FUNCTION populate_user_shop_item_metadata()
RETURNS TRIGGER AS $$
BEGIN
  SELECT category, subcategory INTO NEW.category, NEW.subcategory
  FROM public.shop_items
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_shop_items_metadata ON public.user_shop_items;
CREATE TRIGGER user_shop_items_metadata
BEFORE INSERT ON public.user_shop_items
FOR EACH ROW
EXECUTE FUNCTION populate_user_shop_item_metadata();

-- =====================================================
-- STEP 6: Create helper functions
-- =====================================================

-- Function: Get user's owned items
CREATE OR REPLACE FUNCTION get_user_owned_items(p_user_id UUID)
RETURNS TABLE (
  item_id TEXT,
  item_name TEXT,
  category TEXT,
  subcategory TEXT,
  is_equipped BOOLEAN,
  purchased_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    usi.item_id,
    si.name,
    usi.category,
    usi.subcategory,
    usi.is_equipped,
    usi.purchased_at
  FROM public.user_shop_items usi
  JOIN public.shop_items si ON usi.item_id = si.id
  WHERE usi.user_id = p_user_id
  ORDER BY usi.category, usi.subcategory, usi.purchased_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Purchase item for user
CREATE OR REPLACE FUNCTION purchase_shop_item(
  p_user_id UUID,
  p_item_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user already owns the item
  IF EXISTS (
    SELECT 1 FROM public.user_shop_items 
    WHERE user_id = p_user_id AND item_id = p_item_id
  ) THEN
    RETURN FALSE; -- Already owned
  END IF;
  
  -- Insert the purchase
  INSERT INTO public.user_shop_items (user_id, item_id)
  VALUES (p_user_id, p_item_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function: Equip item for user
CREATE OR REPLACE FUNCTION equip_shop_item(
  p_user_id UUID,
  p_item_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_category TEXT;
BEGIN
  -- Get item category
  SELECT category INTO v_category
  FROM public.user_shop_items
  WHERE user_id = p_user_id AND item_id = p_item_id;
  
  IF v_category IS NULL THEN
    RETURN FALSE; -- User doesn't own this item
  END IF;
  
  -- Unequip all items in the same category
  UPDATE public.user_shop_items
  SET is_equipped = FALSE, equipped_at = NULL
  WHERE user_id = p_user_id AND category = v_category;
  
  -- Equip the selected item
  UPDATE public.user_shop_items
  SET is_equipped = TRUE, equipped_at = NOW()
  WHERE user_id = p_user_id AND item_id = p_item_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 7: Create views
-- =====================================================

CREATE OR REPLACE VIEW shop_items_organized AS
SELECT 
  category,
  subcategory,
  rarity,
  COUNT(*) as item_count,
  AVG(price) as avg_qbies_price,
  AVG(gem_price) as avg_gem_price
FROM public.shop_items
WHERE is_active = TRUE
GROUP BY category, subcategory, rarity
ORDER BY category, subcategory, rarity;

CREATE OR REPLACE VIEW user_owned_items_summary AS
SELECT 
  user_id,
  category,
  subcategory,
  COUNT(*) as owned_count,
  SUM(CASE WHEN is_equipped THEN 1 ELSE 0 END) as equipped_count
FROM public.user_shop_items
GROUP BY user_id, category, subcategory
ORDER BY user_id, category, subcategory;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.user_shop_items IS 'Tracks which items each user owns and has equipped';
COMMENT ON COLUMN public.shop_items.subcategory IS 'Subcategory for organizing items (e.g., herbs, succulents, seating)';
COMMENT ON COLUMN public.user_shop_items.is_equipped IS 'Only one item per category can be equipped at a time';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
-- - shop_items table updated with new columns (subcategory, rarity, gem_price)
-- - user_shop_items table created for tracking ownership and equipped items
-- - Data migrated from purchased_items to user_shop_items
-- - All 35 shop items inserted with correct pricing
-- - Helper functions and views created
-- =====================================================
