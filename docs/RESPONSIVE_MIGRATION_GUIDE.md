# Responsive Design Migration Guide

## Overview
This guide explains how to migrate existing screens to use the new responsive utility system for proper tablet and large screen support.

## The Problem

**Before (Problematic):**
```typescript
const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH * 0.9,  // ❌ Too wide on tablets!
    padding: 24,                 // ❌ Same padding on all devices
    fontSize: 16,                // ❌ Same font size everywhere
  },
});
```

**On a tablet (1024px width):**
- Container width: 921px (way too wide!)
- Content looks stretched and awkward
- Poor use of screen space

## The Solution

**After (Responsive):**
```typescript
import { getModalWidth, responsiveFontSize, getResponsivePadding } from '../utils/responsive';

const styles = StyleSheet.create({
  container: {
    width: getModalWidth(),              // ✅ Max 500px on tablets
    padding: getResponsivePadding().large, // ✅ Scales appropriately
    fontSize: responsiveFontSize(16),    // ✅ Slightly larger on tablets
  },
});
```

**On a tablet:**
- Container width: 500px (comfortable reading width)
- Padding: 32px (more breathing room)
- Font size: 19.2px (easier to read)

## Available Utilities

### 1. Device Detection
```typescript
import { isTablet, isLandscape, getLayoutMode } from '../utils/responsive';

const tablet = isTablet();        // true if screen width >= 600px
const landscape = isLandscape();  // true if width > height
const mode = getLayoutMode();     // 'phone-portrait' | 'phone-landscape' | 'tablet-portrait' | 'tablet-landscape'
```

### 2. Responsive Dimensions
```typescript
import { getModalWidth, getContainerWidth, responsiveWidth } from '../utils/responsive';

// Modal width (max 500px on tablets)
width: getModalWidth()

// Container width (max 600px on tablets)
width: getContainerWidth(90)  // 90% of screen, max 600px

// Custom responsive width
width: responsiveWidth(80, 400)  // 80% of screen, max 400px on tablets
```

### 3. Responsive Typography
```typescript
import { responsiveFontSize } from '../utils/responsive';

fontSize: responsiveFontSize(16)  // 16px on phones, 19.2px on tablets (1.2x)
fontSize: responsiveFontSize(24)  // 24px on phones, 28.8px on tablets
```

### 4. Responsive Spacing
```typescript
import { getResponsivePadding, getResponsiveMargins, responsiveSpacing } from '../utils/responsive';

const padding = getResponsivePadding();
// padding.small:  8px (phone) / 12px (tablet)
// padding.medium: 16px (phone) / 20px (tablet)
// padding.large:  24px (phone) / 32px (tablet)
// padding.xlarge: 32px (phone) / 48px (tablet)

padding: padding.large  // Use predefined sizes

// Or custom spacing
padding: responsiveSpacing(20)  // 20px on phones, 26px on tablets (1.3x)
```

### 5. Grid Layouts
```typescript
import { getGridColumns, getCardWidth } from '../utils/responsive';

const columns = getGridColumns(2);  // 2 on phones, 3 on tablets, 4 on tablet landscape
const cardWidth = getCardWidth(columns);  // Calculates card width with spacing
```

## Migration Examples

### Example 1: Modal Component

**Before:**
```typescript
import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    padding: 24,
  },
  title: {
    fontSize: 24,
  },
  text: {
    fontSize: 14,
  },
});
```

**After:**
```typescript
import { getModalWidth, responsiveFontSize, getResponsivePadding } from '../utils/responsive';

const styles = StyleSheet.create({
  modalContainer: {
    width: getModalWidth(),
    padding: getResponsivePadding().large,
  },
  title: {
    fontSize: responsiveFontSize(24),
  },
  text: {
    fontSize: responsiveFontSize(14),
  },
});
```

### Example 2: Card Grid

**Before:**
```typescript
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: (SCREEN_WIDTH - 48) / 2,  // Always 2 columns
    margin: 8,
  },
});
```

**After:**
```typescript
import { getGridColumns, getCardWidth, responsiveSpacing } from '../utils/responsive';

const columns = getGridColumns(2);  // 2-4 columns based on device
const cardWidth = getCardWidth(columns);
const spacing = responsiveSpacing(8);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    width: cardWidth,
    margin: spacing,
  },
});
```

### Example 3: Adaptive Layout

**Before:**
```typescript
// Same layout for all devices
<View style={styles.container}>
  <View style={styles.sidebar} />
  <View style={styles.content} />
</View>
```

**After:**
```typescript
import { isTablet, isLandscape } from '../utils/responsive';

const tablet = isTablet();
const landscape = isLandscape();

// Adaptive layout
<View style={[
  styles.container,
  tablet && landscape && styles.containerTabletLandscape
]}>
  {tablet && landscape && <View style={styles.sidebar} />}
  <View style={styles.content} />
</View>

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  containerTabletLandscape: {
    flexDirection: 'row',  // Side-by-side on tablet landscape
  },
});
```

## Migration Checklist

For each screen/component:

### 1. Replace Dimensions Import
```typescript
// ❌ Remove
import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ✅ Add
import { getModalWidth, responsiveFontSize, ... } from '../utils/responsive';
```

### 2. Update Width/Height
```typescript
// ❌ Before
width: SCREEN_WIDTH * 0.9

// ✅ After
width: getModalWidth()  // or getContainerWidth(90)
```

### 3. Update Font Sizes
```typescript
// ❌ Before
fontSize: 16

// ✅ After
fontSize: responsiveFontSize(16)
```

### 4. Update Spacing
```typescript
// ❌ Before
padding: 24
margin: 16

// ✅ After
padding: getResponsivePadding().large
margin: getResponsiveMargins().medium
```

### 5. Add Adaptive Layouts (Optional)
```typescript
const tablet = isTablet();
const landscape = isLandscape();

// Use these to conditionally render or style
```

## Already Migrated Components

✅ **TermsModal** - Uses responsive utilities  
✅ **AccountDeletionModal** - Uses responsive utilities  

## Components to Migrate

Priority order:

### High Priority (User-facing)
- [ ] Settings screen (`app/(tabs)/settings.tsx`)
- [ ] Home screen (`app/(tabs)/index.tsx`)
- [ ] Shop screen (`app/(tabs)/shop.tsx`)
- [ ] Focus screen (`app/(tabs)/focus.tsx`)
- [ ] Stats screen (`app/(tabs)/stats.tsx`)

### Medium Priority (Modals)
- [ ] PremiumPaywallModal
- [ ] SessionCustomizationModal
- [ ] EditProfileModal
- [ ] ManageHabitsModal
- [ ] All other modals

### Lower Priority (Onboarding)
- [ ] Welcome screen
- [ ] Tutorial screen
- [ ] Profile setup screen

## Testing

After migration, test on:

1. **Phone Portrait** (360x640)
   - Elements should look normal
   - No changes from before

2. **Phone Landscape** (640x360)
   - Content should be accessible
   - May have horizontal scrolling

3. **Tablet Portrait** (768x1024)
   - Modals should be centered with max width
   - Font sizes slightly larger
   - More padding/spacing

4. **Tablet Landscape** (1024x768)
   - Content should use available space wisely
   - Consider side-by-side layouts
   - Grid should show more columns

## Common Patterns

### Pattern 1: Centered Content on Tablets
```typescript
import { getSafeContentWidth } from '../utils/responsive';

<View style={styles.container}>
  <View style={[styles.content, { width: getSafeContentWidth() }]}>
    {/* Content */}
  </View>
</View>

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',  // Center on tablets
  },
  content: {
    // Width handled by getSafeContentWidth()
  },
});
```

### Pattern 2: Responsive Grid
```typescript
import { getGridColumns, getCardWidth } from '../utils/responsive';

const columns = getGridColumns(2);

<View style={styles.grid}>
  {items.map(item => (
    <View key={item.id} style={[styles.card, { width: getCardWidth(columns) }]}>
      {/* Card content */}
    </View>
  ))}
</View>
```

### Pattern 3: Conditional Rendering
```typescript
import { isTablet, isLandscape } from '../utils/responsive';

const tablet = isTablet();
const landscape = isLandscape();

{tablet && landscape ? (
  <TabletLandscapeLayout />
) : (
  <DefaultLayout />
)}
```

## Best Practices

### DO ✅
- Use responsive utilities for all new components
- Test on multiple screen sizes
- Use max-width constraints on tablets
- Scale fonts and spacing appropriately
- Consider landscape layouts

### DON'T ❌
- Use raw `SCREEN_WIDTH * percentage` without max constraints
- Use fixed pixel values for dimensions
- Ignore tablet users
- Assume portrait orientation only
- Make elements too large on tablets

## Performance Considerations

The responsive utilities are lightweight:
- Device detection runs once
- No re-renders on rotation (use hooks for that)
- Minimal calculation overhead
- Can be used in StyleSheet.create()

For dynamic updates on rotation:
```typescript
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { isTablet, isLandscape } from '../utils/responsive';

const [tablet, setTablet] = useState(isTablet());
const [landscape, setLandscape] = useState(isLandscape());

useEffect(() => {
  const subscription = Dimensions.addEventListener('change', () => {
    setTablet(isTablet());
    setLandscape(isLandscape());
  });
  
  return () => subscription?.remove();
}, []);
```

## Summary

**Key Changes:**
1. Import responsive utilities instead of Dimensions
2. Use `getModalWidth()` instead of `SCREEN_WIDTH * 0.9`
3. Use `responsiveFontSize()` for all font sizes
4. Use `getResponsivePadding()` for spacing
5. Test on tablets and landscape modes

**Benefits:**
- Better tablet experience
- Proper large screen support
- Android 16 compliance
- Professional appearance
- Happy users!

---

**Status:** In Progress  
**Priority:** High  
**Target:** All user-facing screens
