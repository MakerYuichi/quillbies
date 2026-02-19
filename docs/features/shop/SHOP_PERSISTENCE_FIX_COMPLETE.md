# Shop Items Persistence Fix - Complete

## Problem
Purchased items and equipped themes/decorations were not persisting after app restart.

## Root Cause
1. App was loading from `purchased_items` table (old table)
2. But saving to local state only
3. The newer `user_shop_items` table has better structure with `is_equipped` tracking
4. Room customization wasn't being properly reconstructed from database

## Solution
Migrated to use `user_shop_items` table for all shop item operations with proper equipped status tracking.

## Database Schema
Using `user_shop_items` table:
```sql
CREATE TABLE public.user_shop_items (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id text NOT NULL,
  category text NOT NULL,
  subcategory text,
  is_equipped boolean DEFAULT false,
  purchased_at timestamp,
  equipped_at timestamp
);
```

## Files Created

### 1. `lib/userShopItems.ts`
**New helper library for shop item operations:**

Functions:
- `purchaseShopItem(userId, itemId, category)` - Add item to user_shop_items
- `equipShopItem(userId, itemId, category)` - Set is_equipped=true, unequip others in category
- `unequipShopItem(userId, category)` - Set is_equipped=false for category
- `getUserShopItems(userId)` - Get all purchased items
- `getEquippedItems(userId)` - Get only equipped items

## Files Modified

### 1. `lib/syncManager.ts`
**Updated loadAllUserData():**
- Changed query from `purchased_items` to `user_shop_items`
- Now loads: `item_id, category, is_equipped`
- Provides equipped status for room reconstruction

### 2. `app/state/store-modular.ts`
**Updated loadFromDatabase():**
- Reconstructs `roomCustomization` from equipped items in `user_shop_items`
- Falls back to `user_profiles.light_type` and `plant_type` if no equipped items
- Properly maps equipped items to customization fields:
  - `light` category → `lightType`
  - `plant` category → `plantType`
  - `furniture` category → `furnitureType`
  - `theme` category → `themeType`

### 3. `app/state/slices/shopSlice.ts`
**Updated purchaseItem():**
- Saves to local state (immediate feedback)
- Syncs to database
- Calls `purchaseShopItem()` to save to `user_shop_items` table

**Updated equipItem():**
- Updates local `roomCustomization`
- Syncs to database
- Calls `equipShopItem()` to update `is_equipped` in database

**Updated unequipItem():**
- Removes from local `roomCustomization`
- Syncs to database
- Calls `unequipShopItem()` to update `is_equipped` in database

## Data Flow

### Purchase Flow:
```
1. User clicks "Buy"
2. Deduct currency (local state)
3. Add to purchasedItems array (local state)
4. Sync to database
5. Save to user_shop_items table (is_equipped=false)
```

### Equip Flow:
```
1. User clicks purchased item
2. Update roomCustomization (local state)
3. Sync to database
4. Update user_shop_items (is_equipped=true)
5. Unequip other items in same category
```

### Load Flow:
```
1. App starts
2. Load user_shop_items from database
3. Extract item_id where is_equipped=true
4. Build roomCustomization object
5. Apply to local state
6. Room renders with equipped items
```

## Benefits

### Before:
- ❌ Items lost on app restart
- ❌ No equipped status tracking
- ❌ Using old purchased_items table
- ❌ Manual room customization sync

### After:
- ✅ Items persist across restarts
- ✅ Equipped status tracked in database
- ✅ Using modern user_shop_items table
- ✅ Automatic room reconstruction from equipped items
- ✅ Single source of truth for equipped items

## Testing Checklist
- ✅ Purchase item → Saves to user_shop_items
- ✅ Equip item → is_equipped=true in database
- ✅ Unequip item → is_equipped=false in database
- ✅ Restart app → Purchased items still owned
- ✅ Restart app → Equipped items still equipped
- ✅ Restart app → Room shows equipped decorations
- ✅ Multiple categories → Each tracks independently
- ✅ Switch items → Old unequips, new equips

## Migration Notes
- Old `purchased_items` table still exists but is no longer used
- New purchases go to `user_shop_items`
- Old purchases can be migrated with SQL script if needed
- `user_profiles.light_type` and `plant_type` serve as fallback
