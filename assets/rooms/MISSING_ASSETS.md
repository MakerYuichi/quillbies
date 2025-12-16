# Missing Room Assets - Ready to Add

## Overview
The Home screen code has placeholder spaces for these assets. When you add them, simply uncomment the corresponding code sections.

## Assets Needed

### 1. Floor Image
**Path**: `assets/rooms/floor.png`
**Figma Specs**:
- Width: 518px (132% of screen width)
- Height: 336px (39% of screen height)
- Position: left -90px, top 239px
- Border: 1px solid #000000
- Shadow: 0px 4px 4px rgba(21, 255, 0, 0.25)

**Code Location**: `app/(tabs)/index.tsx` - Line ~108
```tsx
// Uncomment when floor asset is added:
<Image 
  source={require('../../assets/rooms/floor.png')}
  style={styles.floorLayer}
  resizeMode="cover"
/>
```

**Current State**: Using colored View as placeholder (#D7CCC8)

---

### 2. Blue Decorative Background (Top)
**Path**: `assets/backgrounds/bluebg.png`
**Figma Specs**:
- Width: 401px (102% of screen width)
- Height: 260px (31% of screen height)
- Position: left -8px, top -190px
- Border: 1px solid #000000

**Code Location**: `app/(tabs)/index.tsx` - Line ~115
```tsx
// Uncomment when bluebg asset is added:
<Image 
  source={require('../../assets/backgrounds/bluebg.png')}
  style={styles.blueBgDecor}
  resizeMode="cover"
/>
```

**Current State**: Not visible (commented out)
**Purpose**: Decorative top element that adds depth to room

---

### 3. Clock Decoration
**Path**: `assets/rooms/clock.png`
**Figma Specs**:
- Width: 65px (16.5% of screen width)
- Height: 64px (7.5% of screen height)
- Position: right 69px (17.5% from right), top 0px
- Filter: drop-shadow(0px 4px 4px rgba(255, 0, 0, 0.25))

**Code Location**: `app/(tabs)/index.tsx` - Line ~130
```tsx
// Uncomment when clock asset is added:
<Image 
  source={require('../../assets/rooms/clock.png')}
  style={styles.clockDecor}
  resizeMode="contain"
/>
```

**Current State**: Not visible (commented out)
**Purpose**: Decorative clock element in top-right corner

---

## How to Add Assets

### Step 1: Add Image Files
Place the image files in the correct directories:
```
quillby-app/assets/
├── rooms/
│   ├── floor.png          ← Add this
│   └── clock.png          ← Add this
└── backgrounds/
    └── bluebg.png         ← Add this
```

### Step 2: Uncomment Code
In `app/(tabs)/index.tsx`, find the commented sections and uncomment them:

**For floor.png**:
```tsx
// Remove this line:
<View style={styles.floorLayer} />

// Uncomment these lines:
<Image 
  source={require('../../assets/rooms/floor.png')}
  style={styles.floorLayer}
  resizeMode="cover"
/>
```

**For bluebg.png**:
```tsx
// Uncomment:
<Image 
  source={require('../../assets/backgrounds/bluebg.png')}
  style={styles.blueBgDecor}
  resizeMode="cover"
/>
```

**For clock.png**:
```tsx
// Uncomment:
<Image 
  source={require('../../assets/rooms/clock.png')}
  style={styles.clockDecor}
  resizeMode="contain"
/>
```

### Step 3: Test
Run the app and verify:
- Floor appears with correct perspective
- Blue background adds depth at top
- Clock appears in top-right corner
- All layers stack correctly
- No performance issues

---

## Asset Requirements

### Image Format
- **Format**: PNG with transparency
- **Resolution**: 2x or 3x for retina displays
- **Optimization**: Compress images to reduce app size

### Recommended Sizes
Based on Figma specs (393x852 screen):
- **floor.png**: 1036x672px (@2x) or 1554x1008px (@3x)
- **bluebg.png**: 802x520px (@2x) or 1203x780px (@3x)
- **clock.png**: 130x128px (@2x) or 195x192px (@3x)

---

## Current Assets Available

✅ **walls-clean.png** - Wall background (in use)
✅ **studyroom-shelf.png** - Shelf decoration (in use)
✅ **hamster-casual.png** - Casual character (in use)
✅ **hamster-energetic.png** - Energetic character (in use)
✅ **hamster-scholar.png** - Scholar character (in use)

---

## Future Enhancements

### Mess-Based Variations
When implementing dynamic mess system, add:
- `floor-clean.png`
- `floor-messy1.png`
- `floor-messy2.png`
- `floor-messy3.png`
- `walls-messy1.png`
- `walls-messy2.png`
- `walls-messy3.png`

### Additional Decorations
- Books on shelf
- Scattered papers (for messy states)
- Cobwebs (for very messy states)
- Window with changing time of day
- Desk with study materials

---

## Notes

- All styles are already defined in `styles` object
- All positioning matches Figma specifications
- Code is production-ready, just needs assets
- No code changes needed when adding assets (just uncomment)
- Placeholder floor View can remain until asset is ready
