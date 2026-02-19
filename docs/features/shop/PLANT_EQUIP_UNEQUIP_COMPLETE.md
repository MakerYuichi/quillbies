# Plant Equip/Unequip System - Complete

## Feature Overview
Plants can now be equipped and unequipped by clicking them in the shop. The state persists across app restarts.

## How It Works

### 1. Initial State (No Plant)
- User starts with no plants equipped
- `roomCustomization.plantType` is `undefined`
- Room shows no plants

### 2. Claiming Free Plant
- Basic Plant is free (price: 0)
- Click "Basic Plant" in shop
- Auto-purchases and auto-equips
- Plant appears in room immediately

### 3. Equipping Different Plants
- Purchase any plant from shop
- Click the plant card
- Previous plant is unequipped
- New plant is equipped
- Room updates immediately

### 4. Unequipping Plant
- Click the currently equipped plant again
- Plant is unequipped
- `roomCustomization.plantType` becomes `undefined`
- Plant disappears from room

### 5. Persistence
- All purchases saved to `user_shop_items` table
- Equipped status saved with `is_equipped=true`
- On app restart:
  - Loads from database
  - Reconstructs `roomCustomization`
  - Plant reappears if equipped

## Code Flow

### Shop Click Handler
```typescript
// If already purchased
if (userData.purchasedItems?.includes(item.id)) {
  const isEquipped = getIsEquipped(item);
  
  if (isEquipped) {
    // Unequip the item
    await unequipItem(item.category);
  } else {
    // Equip the item
    await equipItem(item.id, item.category);
  }
}
```

### Equip Function
```typescript
equipItem: async (itemId, category) => {
  // Update local state
  newCustomization.plantType = itemId;
  
  // Sync to database
  syncToDatabase(updatedUserData);
  
  // Update user_shop_items.is_equipped
  await equipShopItem(user.id, itemId, category);
}
```

### Unequip Function
```typescript
unequipItem: async (category) => {
  // Remove from local state
  delete newCustomization.plantType;
  
  // Sync to database
  syncToDatabase(updatedUserData);
  
  // Update user_shop_items.is_equipped = false
  await unequipShopItem(user.id, category);
}
```

### Room Rendering
```typescript
{/* Only show if plantType is set */}
{!hideItems && roomCustomization?.plantType && (
  <Image 
    source={
      roomCustomization.plantType === 'succulent-plant' 
        ? require('...succulent-plant.png')
        : roomCustomization.plantType === 'swiss-cheese-plant'
        ? require('...swiss-cheese-plant.png')
        : roomCustomization.plantType === 'plant'
        ? require('...plant.png')
        : require('...plant.png')
    }
  />
)}
```

## Available Plants

### Free Plants
- **Basic Plant** (id: 'plant') - Free, simple green plant

### Common Plants (50 QBies)
- **Basil Plant** (id: 'basil')
- **Succulent Plant** (id: 'succulent-plant')

### Epic Plants (150 QBies)
- **Swiss Cheese Plant** (id: 'swiss-cheese-plant')

## Testing Checklist

### Basic Flow
- ✅ Start app with no plant → No plant visible
- ✅ Claim free Basic Plant → Plant appears
- ✅ Click equipped plant → Plant disappears
- ✅ Click unequipped plant → Plant reappears

### Purchase Flow
- ✅ Purchase Succulent Plant → Added to owned items
- ✅ Click Succulent Plant → Equips, Basic Plant unequips
- ✅ Click Succulent Plant again → Unequips, no plant visible

### Persistence
- ✅ Equip plant → Restart app → Plant still equipped
- ✅ Unequip plant → Restart app → No plant visible
- ✅ Purchase plant → Restart app → Plant still owned

### Multiple Plants
- ✅ Own multiple plants → Can switch between them
- ✅ Only one plant equipped at a time
- ✅ Clicking equipped plant removes it

### Edge Cases
- ✅ Rapid clicks → No duplicate actions
- ✅ Network lag → Syncs when connection restored
- ✅ Database empty → Uses local state
- ✅ Local state empty → Uses database

## Database Schema

```sql
-- user_shop_items tracks purchases and equipped status
CREATE TABLE user_shop_items (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id text NOT NULL, -- 'plant', 'succulent-plant', etc.
  category text NOT NULL, -- 'plant'
  is_equipped boolean DEFAULT false,
  purchased_at timestamp,
  equipped_at timestamp
);

-- Only one plant can be equipped at a time
-- When equipping new plant:
-- 1. Set all plants is_equipped=false
-- 2. Set selected plant is_equipped=true
```

## User Experience

### Visual Feedback
- ✅ Equipped items show checkmark badge
- ✅ Sound plays on equip/unequip
- ✅ Room updates immediately (no delay)
- ✅ Smooth transitions

### Intuitive Behavior
- ✅ Click to equip
- ✅ Click again to unequip
- ✅ Same as theme behavior (consistent UX)
- ✅ No confirmation needed (instant action)

## Console Logs

Good logs to watch for:
```
[Shop] Item pressed: { id: 'plant', category: 'plant' }
[Shop] Is item purchased? true
[Shop] Equipped plant
[UserShopItems] Item equipped: plant

// On unequip:
[Shop] Unequipped plant
[UserShopItems] Category unequipped: plant

// On restart:
[Load] Purchased items: { fromDB: 1, fromLocal: 1, merged: 1 }
[Load] Room customization: { fromEquipped: 1, fromLocal: 0, final: 1 }
```

## Benefits

### Before
- ❌ Plants always visible (couldn't remove)
- ❌ Default plant always shown
- ❌ No way to have empty room

### After
- ✅ Plants can be removed by clicking again
- ✅ Start with empty room (clean slate)
- ✅ Full control over plant visibility
- ✅ Consistent with theme behavior
- ✅ Persists across restarts

## Notes

- Plants render in two positions (left and right side of room)
- Both positions show the same plant type
- When unequipped, both positions are empty
- `hideItems` prop can hide plants (used in shop preview)
- Plants don't show when theme is equipped (theme has its own decorations)

