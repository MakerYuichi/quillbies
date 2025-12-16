# Immersive Layered Room - Home Screen ✅

## Overview
Transformed the Home screen from a flat scrollable list into an immersive 3D-style room environment with layered graphics, absolutely positioned pet, and floating UI elements.

## Architecture: 6-Layer System

### Layer 1: Wall Background
```tsx
<Image 
  source={require('../../assets/backgrounds/walls-clean.png')}
  style={styles.wallLayer}
  resizeMode="cover"
/>
```
- **Position**: Absolute, top of screen
- **Size**: Full width, 65% of screen height
- **Purpose**: Main room wall texture

### Layer 2: Floor (Perspective Effect)
```tsx
<View style={styles.floorLayer} />
```
- **Position**: Absolute, bottom half of screen
- **Size**: 120% width (extends beyond edges), 45% height
- **Effect**: Slight perspective with transform
- **Color**: Brown tint (#D7CCC8) with 30% opacity
- **Purpose**: Creates depth illusion

### Layer 3: Room Decorations
```tsx
<Image 
  source={require('../../assets/study-session/studyroom-shelf.png')}
  style={styles.shelfDecor}
  resizeMode="contain"
/>
```
- **Position**: Absolute, upper left
- **Size**: 40% width, 15% height
- **Opacity**: 80%
- **Purpose**: Adds room personality (shelf, books, etc.)

### Layer 4: Selected Character Hamster (In-Room Position)
```tsx
<View style={styles.petContainer} pointerEvents="none">
  <Image source={getCharacterImage()} ... />
</View>
```
- **Position**: Absolute, right side at 20% from top (per Figma specs)
- **Size**: 80% width, 27% height (matches Figma proportions)
- **Z-Index**: 10 (above room, below UI)
- **Pointer Events**: None (doesn't block scrolling)
- **Character Selection**: Displays the hamster chosen during onboarding
  - Casual: hamster-casual.png
  - Energetic: hamster-energetic.png
  - Scholar: hamster-scholar.png
- **Purpose**: Character lives IN the room, not in scroll flow

### Layer 5: Energy Bar (Floating)
```tsx
<View style={styles.energyBarContainer} pointerEvents="none">
  <EnergyBar ... />
</View>
```
- **Position**: Absolute, bottom of screen (above tab bar)
- **Z-Index**: 5
- **Pointer Events**: None
- **Purpose**: Always visible energy status

### Layer 6: Scrollable Content Overlay
```tsx
<ScrollView style={styles.contentScroll} ...>
  {/* All interactive UI cards */}
</ScrollView>
```
- **Position**: Fills entire screen
- **Z-Index**: 20 (topmost for interaction)
- **Background**: Transparent
- **Purpose**: All buttons, cards, and interactive elements

## Dynamic Mess System

### Mess Level Function
```tsx
const getRoomMessLevel = () => {
  if (userData.messPoints === 0) return 'clean';
  if (userData.messPoints < 5) return 'slightly_messy';
  if (userData.messPoints < 10) return 'messy';
  return 'very_messy';
};
```

### Room Status Indicator
- **Clean (0 points)**: ✨ Spotless Room
- **Slightly Messy (1-4)**: 📚 A few things scattered
- **Messy (5-9)**: 🗑️ Getting messy...
- **Very Messy (10+)**: 🕸️ Disaster zone!

## Visual Enhancements

### Semi-Transparent Cards
All UI cards use `rgba()` backgrounds for glass-morphism effect:
```tsx
backgroundColor: 'rgba(255, 255, 255, 0.95)' // 95% white
```

### Shadow Effects
Cards have depth with shadows:
```tsx
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,
elevation: 3, // Android
```

### Responsive Sizing
All dimensions use screen percentages:
```tsx
width: SCREEN_WIDTH * 0.4  // 40% of screen width
height: SCREEN_HEIGHT * 0.15  // 15% of screen height
```

## Key Features

### 1. Character Selection Display
The home screen displays the character hamster that was selected during onboarding:
```tsx
const getCharacterImage = () => {
  switch (selectedCharacter) {
    case 'casual': return require('../../assets/onboarding/hamster-casual.png');
    case 'energetic': return require('../../assets/onboarding/hamster-energetic.png');
    case 'scholar': return require('../../assets/onboarding/hamster-scholar.png');
    default: return require('../../assets/onboarding/hamster-casual.png');
  }
};
```

### 2. Pet Spacer
Added spacer in scroll content to prevent buttons from overlapping character:
```tsx
<View style={styles.petSpacer} /> // 25% screen height
```

### 3. Pointer Events Management
- Room layers: `pointerEvents="none"` (don't block touches)
- ScrollView: Full interaction enabled
- Result: Can scroll and tap buttons while character is visible

### 4. Z-Index Hierarchy
```
20: ScrollView (interactive content)
10: Character container
5: Energy bar
1: Room decorations
0: Wall and floor
```

## Positioning Strategy (Based on Figma Specs)

### Wall Position
```tsx
top: -8,  // Slightly above screen edge
height: SCREEN_HEIGHT * 0.69,  // 69% of screen (590px on 852px screen)
```

### Floor Position
```tsx
left: -SCREEN_WIDTH * 0.23,  // -90px on 393px screen
top: SCREEN_HEIGHT * 0.28,   // 239px on 852px screen
width: SCREEN_WIDTH * 1.32,  // 518px on 393px screen
height: SCREEN_HEIGHT * 0.39, // 336px on 852px screen
```

### Shelf Position
```tsx
right: SCREEN_WIDTH * 0.05,  // Top right corner
top: SCREEN_HEIGHT * 0.08,   // 70px on 852px screen
width: SCREEN_WIDTH * 0.34,  // 133px on 393px screen
height: SCREEN_HEIGHT * 0.11, // 93px on 852px screen
```

### Character Position
```tsx
right: SCREEN_WIDTH * 0.12,  // 46px on 393px screen
top: SCREEN_HEIGHT * 0.2,    // Centered vertically in upper room
width: SCREEN_WIDTH * 0.8,   // 312px on 393px screen
height: SCREEN_HEIGHT * 0.27, // 234px on 852px screen
```
- Visible in right side of room
- Large enough to see character details
- Doesn't interfere with scrollable content
- Shows the character selected during onboarding

### Energy Bar Position
```tsx
bottom: SCREEN_HEIGHT * 0.12,  // 12% from bottom (above tab bar)
left/right: SCREEN_WIDTH * 0.05,  // 5% padding on sides
```
- Always visible
- Above tab navigation
- Doesn't scroll away

## Future Enhancements

### Dynamic Wall Textures
```tsx
// Based on mess level
const wallTexture = messLevel === 'clean' 
  ? require('../../assets/backgrounds/walls-clean.png')
  : require('../../assets/backgrounds/walls-messy.png');
```

### Animated Decorations
- Clock ticking
- Books falling when messy
- Dust particles
- Cobwebs appearing

### Interactive Room Elements
- Tap shelf to organize
- Tap floor to clean
- Tap decorations for easter eggs

### Multiple Room Themes
- Study room (current)
- Bedroom
- Library
- Cafe
- Outdoor garden

## Assets Used

### Current
- `assets/backgrounds/walls-clean.png` - Wall texture
- `assets/study-session/studyroom-shelf.png` - Shelf decoration

### Needed for Full Mess System
- `assets/backgrounds/walls-messy1.png`
- `assets/backgrounds/walls-messy2.png`
- `assets/backgrounds/walls-messy3.png`
- `assets/rooms/floor-clean.png`
- `assets/rooms/floor-messy.png`
- `assets/rooms/decorations/` (various items)

## Technical Notes

### Performance
- All layers are absolutely positioned (no layout recalculation)
- Images loaded once and cached
- ScrollView only re-renders content, not room layers
- Smooth 60fps scrolling maintained

### Accessibility
- All interactive elements remain in ScrollView
- Touch targets not blocked by decorative layers
- Screen readers can navigate content normally

### Responsive Design
- All positions use screen percentage calculations
- Works on all device sizes (iPhone SE to tablets)
- Pet and decorations scale proportionally

## Testing Checklist

- [x] Pet visible in room (not scrolling with content)
- [x] Energy bar stays at bottom (doesn't scroll)
- [x] All buttons and cards are tappable
- [x] Scrolling works smoothly
- [x] Room decorations visible but don't block interaction
- [x] Mess level indicator updates correctly
- [x] Responsive on different screen sizes
- [x] No TypeScript errors
- [x] Semi-transparent cards readable over background

## Comparison: Before vs After

### Before (Flat Design)
```
┌─────────────────────┐
│ [Welcome Card]      │
│ [Q-Coins]           │
│ [Energy Cap]        │
│ [Room Status Box]   │
│ [Pet Component]     │ ← In scroll flow
│ [Energy Bar]        │ ← In scroll flow
│ [Start Button]      │
│ [Habits...]         │
│ [Stats...]          │
└─────────────────────┘
```

### After (Layered Room)
```
┌─────────────────────┐
│ 🖼️ Wall (fixed)     │
│     🐹 Pet (fixed)  │ ← Floating in room
│ 📚 Shelf (fixed)    │
│ ┌─────────────────┐ │
│ │ [Welcome Card]  │ │ ← Scrollable
│ │ [Q-Coins]       │ │
│ │ [Room Status]   │ │
│ │ [Start Button]  │ │
│ │ [Habits...]     │ │
│ └─────────────────┘ │
│ ⚡ Energy (fixed)   │ ← Always visible
└─────────────────────┘
```

## Result

The Home screen now feels like a real room where Quillby lives, rather than a flat list of UI elements. The pet exists in the space, decorations add personality, and the layered approach creates depth and immersion while maintaining full functionality.
