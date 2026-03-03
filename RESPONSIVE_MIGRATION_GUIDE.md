# Responsive Design Migration Guide

## Problem
The app was using percentage-based scaling (`SCREEN_WIDTH * 0.12`) which causes:
- Content zooming on small phones (320px-360px width)
- Overlapping elements
- Poor readability on different screen sizes

## Solution
Updated `app/utils/responsive.ts` with constrained scaling that:
- Uses a base design width (393px - iPhone 14)
- Applies min/max scale constraints (0.85x to 1.15x for most elements)
- Prevents extreme scaling on small/large devices
- Maintains proper proportions across devices

## New Helper Functions

### Width & Height
```typescript
wp(5)  // 5% of base width with constraints
hp(10) // 10% of base height with constraints
```

### Font Sizes
```typescript
fs(4.5) // Font size based on 4.5% of base width
// Tighter constraints (0.9-1.1) for readability
```

### Spacing
```typescript
sp(2) // Spacing based on 2% of base width
```

### Direct Functions
```typescript
responsiveWidth(60)      // 60px scaled with constraints
responsiveHeight(100)    // 100px scaled with constraints
responsiveFontSize(16)   // 16px font with constraints
responsiveSpacing(12)    // 12px spacing with constraints
```

## Migration Pattern

### Before (Percentage-based)
```typescript
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  title: {
    fontSize: SCREEN_WIDTH * 0.12,  // 47px on 393px, 38px on 320px
    padding: SCREEN_WIDTH * 0.05,
    marginTop: SCREEN_HEIGHT * 0.08,
  }
});
```

### After (Constrained scaling)
```typescript
import { wp, hp, fs, sp } from '../utils/responsive';

const styles = StyleSheet.create({
  title: {
    fontSize: fs(12),  // ~47px on 393px, ~42px on 320px (constrained)
    padding: sp(5),
    marginTop: hp(8),
  }
});
```

## Files Already Migrated
- ✅ `app/utils/responsive.ts` - Core utility updated
- ✅ `app/onboarding/goal-setup.tsx` - Example migration
- ✅ `app/components/habits/CleanButton.tsx` - Example migration

## Files That Need Migration
Search for files using percentage-based scaling:
```bash
grep -r "SCREEN_WIDTH \* 0\." quillby-app/app --include="*.tsx"
```

Priority files to migrate:
1. Main screens (home, room, habits)
2. Navigation components
3. Modal/overlay components
4. Card components
5. Button components

## Migration Steps

1. **Import helpers**
   ```typescript
   import { wp, hp, fs, sp } from '../utils/responsive';
   ```

2. **Remove Dimensions import**
   ```typescript
   // Remove this:
   const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
   ```

3. **Convert styles**
   - `SCREEN_WIDTH * 0.05` → `wp(5)` or `sp(5)`
   - `SCREEN_HEIGHT * 0.08` → `hp(8)`
   - Font sizes → `fs(percentage)`

4. **Test on multiple devices**
   - Small phone (320px width)
   - Medium phone (393px width)
   - Large phone (430px width)
   - Tablet (768px+ width)

## Benefits
- ✅ No more zooming on small phones
- ✅ No overlapping elements
- ✅ Consistent spacing across devices
- ✅ Better readability
- ✅ Tablet support built-in
- ✅ Easier to maintain

## Notes
- The base design is 393x852 (iPhone 14)
- Constraints prevent extreme scaling
- Fonts use tighter constraints (0.9-1.1) for readability
- Tablets get 1.2x scaling with max limits
- All values are rounded to whole pixels
