# Shop UI Improvement Plan

## Overview
Complete redesign of the shop UI to display all 35 items with proper categorization, rarity-based styling, and dual currency support (Qbies and Gems).

## Completed
✅ Created comprehensive shop items catalog (`app/core/shopItems.ts`)
- 35 total items across 4 categories
- Proper rarity classification (Common, Rare, Epic, Legendary)
- Dual pricing support (coins and/or gems)
- Helper functions for filtering and styling

## Items Breakdown
- **Lights**: 3 items (2 free, 1 rare)
- **Plants**: 18 items (9 common, 3 rare, 7 epic)
- **Furniture**: 9 items (2 common, 3 rare, 4 epic)
- **Themes**: 8 items (2 rare, 3 epic, 3 legendary)

## UI Improvements Needed

### 1. Category Tabs
Update tabs to include all 4 categories:
- ✨ Lights
- 🌿 Plants  
- 🪑 Furniture
- 🎨 Themes
- 💎 Plus (existing)

### 2. Rarity-Based Visual Hierarchy

#### Common Items (Bronze)
- Border color: #CD7F32
- Background: Light bronze tint
- Coin pricing only
- Simple card design

#### Rare Items (Blue)
- Border color: #42A5F5
- Background: Light blue tint
- Dual pricing option (coins OR gems)
- Subtle glow effect

#### Epic Items (Purple)
- Border color: #AB47BC
- Background: Light purple tint
- Gems only pricing
- Animated glow effect
- Larger card size

#### Legendary Items (Gold)
- Border color: #FFD700
- Background: Gold gradient
- Gems only pricing
- Strong animated glow
- Premium card design
- Sparkle effects

### 3. Item Card Design

```
┌─────────────────────┐
│   [Item Image]      │ ← Asset preview
│                     │
│   Item Name         │ ← Bold, rarity color
│   ⭐⭐⭐ Rarity     │ ← Stars based on rarity
│                     │
│   💰 100 coins      │ ← Pricing (coins/gems/both)
│   OR 💎 5 gems      │
│                     │
│   [Buy/Equip]       │ ← Action button
└─────────────────────┘
```

### 4. Pricing Display

**Coins Only:**
```
🪙 100 Qbies
```

**Gems Only:**
```
💎 50 Gems
```

**Dual Pricing (Rare items):**
```
🪙 400 Qbies
    OR
💎 20 Gems
```

### 5. Filtering & Sorting

Add filter options:
- All Items
- By Rarity (Common, Rare, Epic, Legendary)
- Owned / Not Owned
- Can Afford / Can't Afford

Add sort options:
- Price (Low to High)
- Price (High to Low)
- Rarity
- Name (A-Z)

### 6. Room Preview Updates

Currently shows:
- Lights (lamp, fairy lights)
- Plants (basic plant, succulent, swiss cheese)

Needs to support:
- All 18 plant types
- Furniture items (chair, sofa, bookshelf, etc.)
- Theme backgrounds (library, night, castle, space, etc.)

### 7. Purchase Flow

1. User taps item card
2. Show detailed modal with:
   - Large item preview
   - Full description
   - Rarity badge
   - Pricing options
   - "Buy with Coins" button
   - "Buy with Gems" button (if available)
   - "Equip" button (if owned)
3. Confirm purchase
4. Auto-equip after purchase
5. Show success animation

### 8. Insufficient Funds Handling

**Not Enough Coins:**
- Show how many more coins needed
- Suggest ways to earn coins
- Option to buy with gems instead (if available)

**Not Enough Gems:**
- Show how many more gems needed
- Suggest ways to earn gems
- Link to achievements screen

### 9. Visual Enhancements

**Rarity Indicators:**
- Common: 1 star ⭐
- Rare: 2 stars ⭐⭐
- Epic: 3 stars ⭐⭐⭐
- Legendary: 4 stars ⭐⭐⭐⭐

**Card Animations:**
- Hover/tap: Scale up slightly
- Owned items: Checkmark badge
- Equipped items: Green border + "Equipped" label
- New items: "NEW" badge

**Background Effects:**
- Epic items: Subtle purple glow
- Legendary items: Animated gold sparkles

### 10. Mobile Optimization

**Grid Layout:**
- 2 columns on mobile (portrait)
- 3 columns on tablet (landscape)
- Responsive card sizing

**Touch Targets:**
- Minimum 44x44pt for buttons
- Adequate spacing between cards
- Easy scrolling

## Implementation Priority

### Phase 1 (Essential)
1. ✅ Create shop items catalog
2. Update category tabs (add Furniture & Themes)
3. Implement rarity-based card styling
4. Add dual pricing display
5. Update purchase flow for gems

### Phase 2 (Enhanced)
6. Add filtering & sorting
7. Implement detailed item modal
8. Add rarity indicators (stars)
9. Update room preview for all items

### Phase 3 (Polish)
10. Add animations and effects
11. Implement insufficient funds handling
12. Add "NEW" badges for recent additions
13. Performance optimization

## Asset Requirements

All assets should be in: `assets/shop/`

**Structure:**
```
assets/shop/
├── decoration/
│   ├── plants/
│   │   ├── basil.png
│   │   ├── spider.png
│   │   ├── fern.png
│   │   ├── aloe-vera.png
│   │   ├── succulent-plant.png (✅ exists)
│   │   ├── money.png
│   │   ├── peace-lily.png
│   │   ├── snake.png
│   │   ├── blossom.png
│   │   ├── indoor-tree.png
│   │   ├── bamboo.png
│   │   ├── swiss-cheese-plant.png (✅ exists)
│   │   ├── sunflower.png
│   │   ├── rose.png
│   │   ├── orchid.png
│   │   ├── lavender.png
│   │   ├── fiddle-leaf.png
│   │   └── tulip.png
│   └── fairy-lights/
│       └── colored.png (✅ exists)
├── furniture/
│   ├── chair.png
│   ├── small-bookshelf.png
│   ├── comfy-sofa.png
│   ├── canvas-art.png
│   ├── gaming-setup.png
│   ├── gaming-redecor.png
│   ├── library-redecor.png
│   ├── home-redecor.png
│   └── throne-chair.png
└── themes/
    ├── library.png
    ├── night.png
    ├── castle.png
    ├── space.png
    ├── cherry-blossom.png
    ├── galaxy.png
    ├── japanese-zen.png
    └── ocean.png
```

## Next Steps

1. Update `app/state/slices/shopSlice.ts` to use new shop items catalog
2. Redesign `app/(tabs)/shop.tsx` with new UI
3. Create reusable `ShopItemCard` component
4. Create `ItemDetailModal` component
5. Add asset loading for all new items
6. Test purchase flow with both currencies
7. Test room preview with all item types

## Notes

- Keep existing free items (fairy lights, lamp, basic plant)
- Maintain backward compatibility with purchased items
- Ensure database schema supports new item types
- Consider adding "Featured Items" section
- Consider adding "Daily Deals" with discounts
