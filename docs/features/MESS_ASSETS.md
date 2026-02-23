# Mess Assets System

## Overview
The mess assets system dynamically changes the appearance of the room based on the user's mess points. This applies to both themes and redecor furniture items.

## Mess Levels
The room appearance changes based on mess points:
- **Clean (0-5 mess points)**: Original clean asset
- **Light Mess (6-10 mess points)**: Level 1 messy asset
- **Medium Mess (11-20 mess points)**: Level 2 messy asset
- **Heavy Mess (21+ mess points)**: Level 3 messy asset

## Asset Structure

### Default Room (No Theme/Redecor)
Located in `assets/rooms/mess/`:
- `walls-messy1.png`, `walls-messy2.png`, `walls-messy3.png`
- `floor-messy1.png`, `floor-messy2.png`, `floor-messy3.png`

### Themes
Each theme has 3 messy variants in `assets/rooms/mess/themes/{theme-name}/`:

**Rare Themes:**
- `library/library-messy1.png`, `library-messy2.png`, `library-messy3.png`
- `night/night-messy1.png`, `night-messy2.png`, `night-messy3.png`

**Epic Themes:**
- `castle/castle-messy1.png`, `castle-messy2.png`, `castle-messy3.png`
- `space/space-messy1.png`, `space-messy2.png`, `space-messy3.png`
- `cherry-blossom/cherry-blossom-messy1.png`, `cherry-blossom-messy2.png`, `cherry-blossom-messy3.png`

**Legendary Themes:**
- `galaxy/galaxy-messy1.png`, `galaxy-messy2.png`, `galaxy-messy3.png`
- `japanese-zen/japanese-zen-messy1.png`, `japanese-zen-messy2.png`, `japanese-zen-messy3.png`
- `ocean/ocean-messy1.png`, `ocean-messy2.png`, `ocean-messy3.png`

### Redecor Furniture
Each redecor has 3 messy variants in `assets/rooms/mess/redecor/{redecor-name}/`:

**Epic Redecors:**
- `gaming/gaming-mess1.png`, `gaming-mess2.png`, `gaming-mess3.png`
- `library/library-mess1.png`, `library-mess2.png`, `library-mess3.png`
- `home/home-mess1.png`, `home-mess2.png`, `home-mess3.png`

## Implementation

### RoomLayers Component
The `RoomLayers.tsx` component handles mess asset rendering:

1. **getThemeBackground()**: Returns appropriate theme asset based on mess points
2. **getRedecorAsset()**: Returns appropriate redecor asset based on mess points
3. **getRoomWall()**: Returns appropriate wall asset for default room
4. **getRoomFloor()**: Returns appropriate floor asset for default room

### Logic Flow
```typescript
if (messPoints > 5) {
  const messLevel = messPoints <= 10 ? 1 : messPoints <= 20 ? 2 : 3;
  // Load messy asset based on messLevel
} else {
  // Load clean asset
}
```

## Adding New Themes/Redecors

When adding a new theme or redecor:

1. Create clean asset in appropriate shop folder
2. Create mess asset folder in `assets/rooms/mess/themes/` or `assets/rooms/mess/redecor/`
3. Add 3 messy variants: `{name}-messy1.png`, `{name}-messy2.png`, `{name}-messy3.png`
4. Update `getThemeBackground()` or `getRedecorAsset()` in `RoomLayers.tsx`
5. Add entry to `shopItems.ts`

## Design Guidelines

### Mess Progression
- **Level 1**: Subtle clutter (papers, books, small items)
- **Level 2**: Moderate mess (clothes, dishes, more scattered items)
- **Level 3**: Heavy mess (piles of items, visible dirt/stains)

### Consistency
- Maintain theme aesthetic even when messy
- Keep character and interactive elements visible
- Ensure mess doesn't obscure important UI elements

## Testing

Test mess assets by:
1. Equipping theme/redecor in shop
2. Adjusting mess points in state (0, 7, 15, 25)
3. Verifying correct asset loads for each level
4. Checking transitions between levels
