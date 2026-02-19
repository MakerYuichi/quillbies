# Legendary Themes Premium Lock Implementation

## Overview
Added premium subscription requirement for all legendary themes (Galaxy, Japanese Zen, Ocean).

## Changes Made

### 1. Shop Items Definition (`app/core/shopItems.ts`)
- Added `requiresPremium?: boolean` field to `ShopItem` interface
- Marked all legendary themes with `requiresPremium: true`:
  - Galaxy Theme
  - Japanese Zen Theme
  - Ocean Theme

### 2. Type Definitions (`app/core/types.ts`)
- Updated `ShopItem` interface to include `requiresPremium?: boolean` field

### 3. Shop Item Card UI (`app/components/shop/ShopItemCard.tsx`)
- Added `isPremium` prop to component
- Added `requiresPremium` field to item prop type
- Added premium lock overlay with:
  - 🔒 lock icon
  - "PREMIUM" text in gold color
  - Semi-transparent dark background
  - Dimmed item image (30% opacity)
- Premium-locked items hide pricing information
- Lock overlay appears above all other elements (z-index: 15)

### 4. Shop Screen (`app/(tabs)/shop.tsx`)
- Added premium check in `handleItemPress`:
  - Shows premium upgrade modal when non-premium users tap locked items
  - Prevents purchase/equip flow for premium-locked items
- Passes `isPremium={userData.isPremium || false}` to all ShopItemCard instances

### 5. Shop State Logic (`app/state/slices/shopSlice.ts`)
- Added premium check in `purchaseItem`:
  - Returns false if item requires premium and user is not premium
- Added premium check in `equipItem`:
  - Returns false if item requires premium and user is not premium
  - Prevents equipping even if somehow purchased

### 6. Premium Upgrade Modal (`app/components/modals/PremiumUpgradeModal.tsx`)
- Fixed modal overflow issue by making entire content scrollable
- Added close button (✕) at top-right corner, always visible
- Improved layout with proper ScrollView implementation
- Modal now properly fits within screen bounds (maxHeight: 90%)
- Close button has z-index: 100 to stay above all content

## User Experience

### Non-Premium Users
- Legendary themes display with lock overlay
- Tapping locked theme shows premium upgrade modal
- Modal can be closed via:
  - Top-right ✕ button
  - "Maybe Later" button at bottom
  - Back button (Android)
- Cannot purchase or equip legendary themes
- Clear visual indication with 🔒 icon and "PREMIUM" badge

### Premium Users
- All legendary themes accessible normally
- No lock overlay displayed
- Can purchase with gems (150 gems each)
- Can equip/unequip freely

## Testing Checklist
- [ ] Non-premium users see lock on legendary themes
- [ ] Tapping locked theme shows premium modal
- [ ] Modal close button (✕) is always visible and works
- [ ] Modal scrolls properly without content overflow
- [ ] "Maybe Later" button closes modal
- [ ] Premium users can purchase legendary themes
- [ ] Premium users can equip legendary themes
- [ ] Lock overlay displays correctly in both light and dark themes
- [ ] Owned legendary themes show "Owned" badge for premium users
- [ ] Non-premium users cannot bypass lock through any flow
