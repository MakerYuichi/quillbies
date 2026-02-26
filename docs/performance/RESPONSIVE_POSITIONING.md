# Responsive Positioning Guide

## Overview
This document explains the responsive positioning approach used in Quillby to ensure the UI works correctly across different screen sizes.

## Problem
Hard-coded pixel values (e.g., `top: 634`, `left: 60`) only work correctly on the original design screen size (393x852). On different devices, elements appear mispositioned:
- iPhone SE (375x667): Elements positioned incorrectly
- iPad (768x1024): Everything tiny and mispositioned
- Large Android (430x932): Layout stretched

## Solution: Percentage-Based Positioning

### Conversion Formula
```typescript
// ❌ WRONG - Hard-coded pixels
top: 634
left: 60
width: 350

// ✅ RIGHT - Percentage-based
top: SCREEN_HEIGHT * 0.744  // 634/852 = 0.744
left: SCREEN_WIDTH * 0.153  // 60/393 = 0.153
width: SCREEN_WIDTH * 0.891  // 350/393 = 0.891
```

### Design Reference
- Base design width: 393px
- Base design height: 852px

## Files Updated

### 1. study-session.tsx
Updated all hard-coded positions to percentages:

**Tooltip Steps:**
- Welcome position: `top: SCREEN_HEIGHT * 0.5 - (SCREEN_HEIGHT * 0.117)`
- Coffee/Apple highlights: `top: SCREEN_HEIGHT * 0.885` (was 754)
- Focus/Break/Done highlights: `top: SCREEN_HEIGHT * 0.683` (was 582)

**Styles:**
- `studyShelf.top`: `SCREEN_HEIGHT * 0.088` (was 75)
- `statusSection.top`: `SCREEN_HEIGHT * 0.513` (was 437)
- `actionButtons.top`: `SCREEN_HEIGHT * 0.683` (was 582)
- `orangeTheme.top`: `SCREEN_HEIGHT * 0.744` (was 634)
- `speechBubble.left`: `SCREEN_WIDTH * 0.043` (was 17)
- `habitButtons.top`: `SCREEN_HEIGHT * 0.141` (was 120)

### 2. RoomLayers.tsx
Updated furniture positioning to be responsive:

**getFurnitureDimensions():**
All furniture items now use percentage-based positioning:
```typescript
'chair': { 
  width: SCREEN_WIDTH * 0.254,   // 100/393
  height: SCREEN_HEIGHT * 0.141,  // 120/852
  top: SCREEN_HEIGHT * 0.270,     // 230/852
  left: SCREEN_WIDTH * 0.373      // 146.5/393
}
```

## Testing Checklist

Test on these screen sizes:
- ✅ iPhone SE (375 x 667) - Small
- ✅ iPhone 14 (390 x 844) - Standard
- ✅ iPhone 14 Pro Max (430 x 932) - Large
- ✅ iPad (768 x 1024) - Tablet

## Best Practices

1. **Always use percentages for absolute positioning**
   ```typescript
   position: 'absolute',
   top: SCREEN_HEIGHT * 0.5,  // 50% down
   left: SCREEN_WIDTH * 0.25,  // 25% from left
   ```

2. **Calculate percentages from design specs**
   ```typescript
   // If design shows top: 200 on 852px screen
   top: SCREEN_HEIGHT * (200/852)  // = SCREEN_HEIGHT * 0.235
   ```

3. **Use flexbox when possible**
   - Flexbox is naturally responsive
   - Only use absolute positioning when necessary

4. **Avoid magic numbers**
   ```typescript
   // ❌ BAD
   top: SCREEN_HEIGHT * 0.5 - 100
   
   // ✅ GOOD
   top: SCREEN_HEIGHT * 0.5 - (SCREEN_HEIGHT * 0.117)  // 100/852
   ```

## Dynamic Dimensions (Optional Enhancement)

For handling screen rotation:
```typescript
const [dimensions, setDimensions] = useState({
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
});

useEffect(() => {
  const subscription = Dimensions.addEventListener('change', ({ window }) => {
    setDimensions({ width: window.width, height: window.height });
  });
  return () => subscription?.remove();
}, []);
```

## Related Files
- `study-session.tsx` - Main study screen with tooltips
- `RoomLayers.tsx` - Room furniture positioning
- `TermsModal.tsx` - Uses flexbox (no hard-coded positions)

## Notes
- TermsModal.tsx already uses flexbox layout and doesn't require position fixes
- Most modals use flexbox and are naturally responsive
- Focus on screens with absolute positioning for fixes
