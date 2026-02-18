# Currency Display Fix - Complete

## Problem
1. In shop: Gems and Q-Bies were overlapping in the top right corner
2. In home tab: Gems were not visible at all, only Q-Bies showed

## Root Cause
- RoomLayers component only displayed Q-Bies
- Shop had a separate gems display that overlapped with Q-Bies from RoomLayers
- Home tab didn't pass gems to RoomLayers

## Solution
Centralized currency display in RoomLayers component to show both Q-Bies and Gems side by side.

## Files Changed

### 1. `app/components/room/RoomLayers.tsx`

**Added gems prop:**
```typescript
interface RoomLayersProps {
  // ... other props
  qCoins?: number;
  gems?: number; // NEW
}
```

**Updated currency display:**
- Changed from single Q-Bies container to a parent container with both currencies
- Added `currencyContainer` with flexDirection: 'row' and gap: 8
- Q-Bies: Orange background (#FF9800) with Q-Bies icon
- Gems: Purple background (#7E57C2) with 💎 emoji

**New Layout:**
```
┌─────────────────────────────┐
│  [Q-Bies Icon] 100  [💎] 25 │  ← Both side by side
└─────────────────────────────┘
```

### 2. `app/(tabs)/shop.tsx`

**Removed duplicate gems display:**
- Removed `gemsDisplay` from shopTitleOverlay
- Removed related styles (gemsDisplay, gemIcon, currencyText)
- Now passes both qCoins and gems to RoomLayers

**Before:**
```tsx
<RoomLayers qCoins={0} />
<View style={styles.gemsDisplay}>💎 {gems}</View>  ← Overlapping!
```

**After:**
```tsx
<RoomLayers qCoins={userData.qCoins} gems={userData.gems} />
```

### 3. `app/(tabs)/index.tsx`

**Added gems prop:**
```tsx
<RoomLayers 
  qCoins={userData.qCoins}
  gems={userData.gems || 0}  ← NEW
/>
```

## Visual Design

### Q-Bies Container:
- Background: rgba(255, 152, 0, 0.1) (light orange)
- Border: 1.5px solid #FF9800 (orange)
- Icon: Q-Bies image (20x20)
- Text: ChakraPetch Bold, 14px

### Gems Container:
- Background: rgba(126, 87, 194, 0.1) (light purple)
- Border: 1.5px solid #7E57C2 (purple)
- Icon: 💎 emoji (16px)
- Text: ChakraPetch Bold, 14px

### Layout:
- Position: Absolute, top-right corner (right: 16, top: 3)
- Spacing: 8px gap between containers
- Both containers have same height for alignment

## Result
✅ Shop: Q-Bies and Gems display side by side without overlapping
✅ Home: Both Q-Bies and Gems are visible
✅ Consistent design across all screens
✅ Proper color coding (orange for Q-Bies, purple for Gems)
