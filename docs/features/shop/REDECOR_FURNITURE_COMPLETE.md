# Redecor Furniture - Full Room Replacement

## Feature Overview
Redecor furniture items (gaming-redecor, library-redecor, home-redecor) now replace the entire room with a single asset, similar to how themes work.

## How It Works

### Redecor Furniture Items
These special furniture items show a complete room design:
- **Gaming Redecor** (`gaming-redecor`) - Gaming room setup
- **Library Redecor** (`library-redecor`) - Library/study room
- **Home Redecor** (`home-redecor`) - Cozy home setup

### Rendering Priority
```
1. Redecor Furniture (if equipped) → Shows full room asset
2. Theme (if equipped) → Shows theme background
3. Default Room → Shows walls, floor, decorations
```

### What Gets Hidden with Redecor
When a redecor furniture is equipped, these elements are hidden:
- ❌ Wall background
- ❌ Floor
- ❌ Blue decorative background
- ❌ Photo frames
- ❌ Lights (lamp, fairy lights)
- ❌ Plants
- ❌ Regular furniture

Only the redecor asset and currency display remain visible.

## Code Implementation

### Detection
```typescript
// Check if a redecor furniture is equipped
const hasRedecorFurniture = roomCustomization?.furnitureType?.includes('redecor');
```

### Asset Mapping
```typescript
const getRedecorAsset = () => {
  if (!hasRedecorFurniture) return null;
  
  const redecorMap: { [key: string]: any } = {
    'gaming-redecor': require('../../../assets/shop/epic/furniture/gaming-redecor.png'),
    'library-redecor': require('../../../assets/shop/epic/furniture/library-redecor.png'),
    'home-redecor': require('../../../assets/shop/epic/furniture/home-redecor.png'),
  };
  
  return redecorMap[roomCustomization?.furnitureType || ''];
};
```

### Rendering Logic
```typescript
{hasRedecorFurniture && getRedecorAsset() ? (
  // Show redecor as full room
  <Image source={getRedecorAsset()} style={styles.themeBackground} />
) : hasTheme && themeBackground ? (
  // Show theme background
  <Image source={themeBackground} style={styles.themeBackground} />
) : (
  // Show default room with all layers
  <>
    <Image source={getRoomWall()} />
    <Image source={getRoomFloor()} />
    {/* ... other layers */}
  </>
)}
```

### Conditional Rendering
```typescript
// Lights - hide when redecor is equipped
{!hasRedecorFurniture && (
  <Image source={require('lamp.png')} />
)}

// Plants - hide when redecor is equipped
{!hasRedecorFurniture && roomCustomization?.plantType && (
  <Image source={getPlantAsset(plantType)} />
)}

// Regular furniture - hide when redecor is equipped
{!hasRedecorFurniture && roomCustomization?.furnitureType && (
  <Image source={getFurnitureAsset(furnitureType)} />
)}
```

## User Experience

### Equipping Redecor
1. Go to shop → Furniture tab
2. Purchase/claim redecor furniture (epic rarity)
3. Click to equip
4. Entire room transforms instantly
5. All decorations hidden, clean slate

### Unequipping Redecor
1. Click equipped redecor again
2. Room returns to default state
3. Previously equipped items reappear (lights, plants, etc.)

### Switching Between Redecors
1. Equip gaming-redecor → Gaming room appears
2. Equip library-redecor → Library room replaces gaming room
3. Only one redecor active at a time

## Comparison with Themes

### Similarities
- Both replace entire room
- Both use same rendering style (themeBackground)
- Both hide default room elements

### Differences
- **Themes**: Change background color, add decorative emojis, affect status bar
- **Redecor**: Only replace room area, no color changes, no decorations
- **Category**: Themes are in 'theme' category, redecors are in 'furniture' category

## Asset Requirements

Redecor assets should:
- Be full room images (wall + floor + decorations)
- Match the room dimensions (same as theme backgrounds)
- Include all necessary elements (no need for separate plants/lights)
- Be self-contained complete scenes

## Files Modified

1. **app/components/room/RoomLayers.tsx**
   - Added `hasRedecorFurniture` check
   - Added `getRedecorAsset()` helper function
   - Updated rendering priority (redecor → theme → default)
   - Added `!hasRedecorFurniture` checks to lights, plants, furniture

## Testing Checklist

### Basic Flow
- ✅ Equip gaming-redecor → Gaming room appears
- ✅ Equip library-redecor → Library room appears
- ✅ Equip home-redecor → Home room appears
- ✅ Unequip redecor → Default room returns

### Element Hiding
- ✅ Redecor equipped → No plants visible
- ✅ Redecor equipped → No lights visible
- ✅ Redecor equipped → No regular furniture visible
- ✅ Redecor equipped → No wall/floor visible

### Switching
- ✅ Switch between redecors → Instant change
- ✅ Switch from redecor to theme → Theme takes over
- ✅ Switch from theme to redecor → Redecor takes over
- ✅ Unequip redecor with plants equipped → Plants reappear

### Persistence
- ✅ Equip redecor → Restart app → Redecor still equipped
- ✅ Unequip redecor → Restart app → Default room shows

## Benefits

### Before
- ❌ Redecor furniture rendered as small items
- ❌ Couldn't create complete room transformations
- ❌ Limited customization options

### After
- ✅ Redecor furniture replaces entire room
- ✅ Complete room transformations possible
- ✅ Clean, immersive room designs
- ✅ Same behavior as themes (consistent UX)
- ✅ Easy to add new redecor designs

## Adding New Redecor Furniture

1. Add to `shopItems.ts`:
```typescript
{
  id: 'new-redecor',
  name: 'New Room Redecor',
  category: 'furniture',
  rarity: 'epic',
  price: 0,
  gemPrice: 500,
  assetPath: 'assets/shop/epic/furniture/new-redecor.png',
  description: 'Transform your room',
  icon: '🏠'
}
```

2. Add to `getRedecorAsset()` in RoomLayers:
```typescript
const redecorMap: { [key: string]: any } = {
  // ... existing redecors
  'new-redecor': require('../../../assets/shop/epic/furniture/new-redecor.png'),
};
```

That's it! The redecor will automatically work with equip/unequip/persistence.

