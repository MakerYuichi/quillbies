# Theme-Based Color System

## Overview
Each theme now has a custom color palette that affects the status bar (time/currency area) and tab bar, creating an immersive themed experience.

---

## Theme Color Palettes

### 🏛️ Library (Rare)
- **Status Bar**: `rgba(139, 69, 19, 0.85)` - Brown with transparency
- **Tab Bar**: `#8B4513` - Saddle brown
- **Active Tab**: `#D2691E` - Chocolate
- **Vibe**: Warm, scholarly, classic library feel

### 🌙 Night (Rare)
- **Status Bar**: `rgba(25, 25, 112, 0.85)` - Midnight blue with transparency
- **Tab Bar**: `#191970` - Midnight blue
- **Active Tab**: `#4169E1` - Royal blue
- **Vibe**: Calm, peaceful night atmosphere

### 🏰 Castle (Epic)
- **Status Bar**: `rgba(105, 105, 105, 0.85)` - Stone gray with transparency
- **Tab Bar**: `#696969` - Dim gray
- **Active Tab**: `#A9A9A9` - Dark gray
- **Vibe**: Medieval, stone fortress aesthetic

### 🚀 Space (Epic)
- **Status Bar**: `rgba(25, 25, 112, 0.85)` - Deep space blue with transparency
- **Tab Bar**: `#0a0a2e` - Very dark blue
- **Active Tab**: `#1e90ff` - Dodger blue
- **Vibe**: Cosmic, futuristic space exploration

### 🌸 Cherry Blossom (Epic)
- **Status Bar**: `rgba(255, 182, 193, 0.85)` - Light pink with transparency
- **Tab Bar**: `#FFB6C1` - Light pink
- **Active Tab**: `#FF69B4` - Hot pink
- **Vibe**: Soft, serene, spring garden

### 🌌 Galaxy (Legendary)
- **Status Bar**: `rgba(75, 0, 130, 0.85)` - Indigo with transparency
- **Tab Bar**: `#4B0082` - Indigo
- **Active Tab**: `#9370DB` - Medium purple
- **Vibe**: Mystical, deep space nebula

### 🏯 Japanese Zen (Legendary)
- **Status Bar**: `rgba(34, 139, 34, 0.85)` - Forest green with transparency
- **Tab Bar**: `#228B22` - Forest green
- **Active Tab**: `#32CD32` - Lime green
- **Vibe**: Peaceful, natural, zen garden

### 🌊 Ocean (Legendary)
- **Status Bar**: `rgba(0, 105, 148, 0.85)` - Ocean blue with transparency
- **Tab Bar**: `#006994` - Deep ocean blue
- **Active Tab**: `#00CED1` - Dark turquoise
- **Vibe**: Refreshing, underwater paradise

---

## Implementation Details

### Status Bar Overlay
```typescript
<View style={[styles.statusBarOverlay, { backgroundColor: themeColors.statusBar }]} />
```
- Positioned at top of screen
- Height: `(SCREEN_HEIGHT * 75) / 852` - covers time and currency area
- Semi-transparent (0.85 opacity) to blend with theme
- zIndex: 5 (below clock/currency, above room)

### Tab Bar Styling
```typescript
tabBarStyle: {
  backgroundColor: themeType ? themeColors.tabBar : '#FFFFFF',
  borderTopColor: themeType ? 'rgba(255, 255, 255, 0.2)' : '#EEE',
}
```
- Background changes to theme color
- Border becomes subtle white when themed
- Active tab uses theme's accent color
- Inactive tabs use semi-transparent white

### Theme Detection
```typescript
const themeType = userData.roomCustomization?.themeType;
const themeColors = getThemeColors(themeType);
```
- Automatically detects equipped theme
- Falls back to default colors when no theme
- Updates instantly when theme changes

---

## User Experience

### Without Theme
- Status bar: Transparent
- Tab bar: White background
- Active tab: Orange (#FF9800)
- Inactive tabs: Gray (#666)

### With Theme
- Status bar: Theme-colored overlay
- Tab bar: Theme-colored background
- Active tab: Theme's accent color
- Inactive tabs: Semi-transparent white
- Cohesive, immersive experience

---

## Files Modified

1. ✅ `app/utils/themeColors.ts` (NEW)
   - Central theme color definitions
   - Exported `getThemeColors()` function
   - All 8 themes configured

2. ✅ `app/components/room/RoomLayers.tsx`
   - Imports theme colors utility
   - Renders status bar overlay with theme color
   - Passes theme colors to UI

3. ✅ `app/(tabs)/_layout.tsx`
   - Imports theme colors utility
   - Detects equipped theme
   - Applies theme colors to tab bar
   - Updates active/inactive tab colors

---

## Color Design Principles

### Status Bar (Semi-transparent)
- Uses `rgba()` with 0.85 opacity
- Allows theme background to show through slightly
- Creates depth and layering effect

### Tab Bar (Solid)
- Uses solid hex colors
- Provides clear navigation area
- Contrasts with screen content

### Active Tab
- Lighter/brighter version of theme color
- High contrast for visibility
- Indicates current screen clearly

### Inactive Tabs
- Semi-transparent white when themed
- Subtle but visible
- Doesn't compete with active tab

---

## Testing Checklist

- [ ] Library theme: Brown status bar and tab bar
- [ ] Night theme: Midnight blue colors
- [ ] Castle theme: Gray stone colors
- [ ] Space theme: Deep space blue
- [ ] Cherry Blossom theme: Pink colors
- [ ] Galaxy theme: Purple/indigo colors
- [ ] Japanese Zen theme: Green colors
- [ ] Ocean theme: Blue ocean colors
- [ ] Status bar doesn't cover time/currency
- [ ] Tab bar updates when theme changes
- [ ] Active tab color matches theme
- [ ] Default colors when no theme equipped

---

## Summary

The theme color system creates a fully immersive experience:
- **Status bar** blends with theme using semi-transparent overlay
- **Tab bar** adopts theme's color palette
- **Active tabs** use theme-specific accent colors
- **Seamless transitions** when equipping/unequipping themes

Each theme now feels complete and cohesive, with UI elements that complement the background!
