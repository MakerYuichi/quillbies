# Mess System Quick Reference

## How It Works

The mess system automatically switches between clean and messy room assets based on the user's mess points.

## Mess Point Thresholds

```typescript
0-5 points   → Clean room (original asset)
6-10 points  → Light mess (messy1 asset)
11-20 points → Medium mess (messy2 asset)
21+ points   → Heavy mess (messy3 asset)
```

## Asset Naming Convention

### Themes
```
Clean: assets/shop/{rarity}/themes/{theme-name}.png
Messy: assets/rooms/mess/themes/{theme-name}/{theme-name}-messy{1-3}.png
```

Example:
```
Clean: assets/shop/epic/themes/castle.png
Mess1: assets/rooms/mess/themes/castle/castle-messy1.png
Mess2: assets/rooms/mess/themes/castle/castle-messy2.png
Mess3: assets/rooms/mess/themes/castle/castle-messy3.png
```

### Redecor Furniture
```
Clean: assets/shop/epic/furniture/{redecor-name}.png
Messy: assets/rooms/mess/redecor/{base-name}/{base-name}-mess{1-3}.png
```

Example:
```
Clean: assets/shop/epic/furniture/gaming-redecor.png
Mess1: assets/rooms/mess/redecor/gaming/gaming-mess1.png
Mess2: assets/rooms/mess/redecor/gaming/gaming-mess2.png
Mess3: assets/rooms/mess/redecor/gaming/gaming-mess3.png
```

## Code Integration

### RoomLayers Component
The `RoomLayers.tsx` component receives `messPoints` as a prop and automatically selects the appropriate asset.

```typescript
<RoomLayers 
  messPoints={userData.messPoints}
  // ... other props
/>
```

### Adding New Theme with Mess Support

1. **Add to shopItems.ts:**
```typescript
{
  id: 'new-theme',
  name: 'New Theme',
  category: 'theme',
  rarity: 'epic',
  price: 0,
  gemPrice: 100,
  assetPath: 'assets/shop/epic/themes/new-theme.png',
  description: 'Amazing new theme',
  icon: '🎨'
}
```

2. **Create mess assets:**
```
assets/rooms/mess/themes/new-theme/
  ├── new-theme-messy1.png
  ├── new-theme-messy2.png
  └── new-theme-messy3.png
```

3. **Update RoomLayers.tsx getThemeBackground():**
```typescript
const messyThemeMap: { [key: string]: { [key: number]: any } } = {
  // ... existing themes
  'new-theme': {
    1: require('../../../assets/rooms/mess/themes/new-theme/new-theme-messy1.png'),
    2: require('../../../assets/rooms/mess/themes/new-theme/new-theme-messy2.png'),
    3: require('../../../assets/rooms/mess/themes/new-theme/new-theme-messy3.png'),
  },
};

const themeMap: { [key: string]: any } = {
  // ... existing themes
  'new-theme': require('../../../assets/shop/epic/themes/new-theme.png'),
};
```

### Adding New Redecor with Mess Support

1. **Add to shopItems.ts:**
```typescript
{
  id: 'new-redecor',
  name: 'New Redecor',
  category: 'furniture',
  rarity: 'epic',
  price: 0,
  gemPrice: 80,
  assetPath: 'assets/shop/epic/furniture/new-redecor.png',
  description: 'Complete room makeover',
  icon: '🏠'
}
```

2. **Create mess assets:**
```
assets/rooms/mess/redecor/new/
  ├── new-mess1.png
  ├── new-mess2.png
  └── new-mess3.png
```

3. **Update RoomLayers.tsx getRedecorAsset():**
```typescript
const messyRedecorMap: { [key: string]: { [key: number]: any } } = {
  // ... existing redecors
  'new-redecor': {
    1: require('../../../assets/rooms/mess/redecor/new/new-mess1.png'),
    2: require('../../../assets/rooms/mess/redecor/new/new-mess2.png'),
    3: require('../../../assets/rooms/mess/redecor/new/new-mess3.png'),
  },
};

const redecorMap: { [key: string]: any } = {
  // ... existing redecors
  'new-redecor': require('../../../assets/shop/epic/furniture/new-redecor.png'),
};
```

## Testing Checklist

- [ ] Clean state (0-5 mess points) shows original asset
- [ ] Light mess (6-10 points) shows messy1 asset
- [ ] Medium mess (11-20 points) shows messy2 asset
- [ ] Heavy mess (21+ points) shows messy3 asset
- [ ] Transitions are smooth when mess points change
- [ ] Works with all themes
- [ ] Works with all redecor furniture
- [ ] Default room (no theme/redecor) still shows mess on walls/floor

## Related Files

- `app/components/room/RoomLayers.tsx` - Main rendering logic
- `app/core/shopItems.ts` - Shop item definitions
- `app/core/types.ts` - Type definitions
- `docs/features/MESS_ASSETS.md` - Detailed documentation
- `docs/features/MESS_ASSETS_CHECKLIST.md` - Asset tracking
