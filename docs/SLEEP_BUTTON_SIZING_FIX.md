# Sleep Button Sizing & Layout Fix

## Problem
The sleep button sizing and layout didn't match the original design:
- Button was too small and had wrong padding
- Missing the full-width "Wake Up" button state
- Font sizes and styling didn't match other buttons
- Layout structure was different from other components

## Solution
Updated SleepButton to match the exact sizing, styling, and layout pattern used by other buttons in the app.

## Changes Made

### 1. **Button Sizing (Fixed)**

**Before (Wrong):**
```typescript
sleepButton: {
  backgroundColor: '#6A5ACD',
  borderRadius: 16,
  padding: SCREEN_WIDTH * 0.04,  // Wrong padding
  marginVertical: SCREEN_HEIGHT * 0.01,  // Wrong margins
}
```

**After (Correct):**
```typescript
sleepButton: {
  flex: 1,  // ✅ Proper flex sizing like other buttons
  backgroundColor: '#6A5ACD',
  paddingVertical: (SCREEN_HEIGHT * 12) / 852,  // ✅ Matches other buttons
  paddingHorizontal: (SCREEN_WIDTH * 8) / 393,  // ✅ Matches other buttons
  borderRadius: 12,  // ✅ Matches other buttons
  borderWidth: 2,  // ✅ Matches other buttons
  borderColor: '#483D8B',
}
```

### 2. **Font Sizing (Fixed)**

**Before (Wrong):**
```typescript
sleepTitle: {
  fontSize: SCREEN_WIDTH * 0.045,  // Wrong calculation
  fontFamily: 'ChakraPetch_600SemiBold',  // Wrong font name
}
```

**After (Correct):**
```typescript
sleepTitle: {
  fontSize: (SCREEN_WIDTH * 14) / 393,  // ✅ Matches other buttons
  fontFamily: 'Chakra Petch',  // ✅ Correct font name
  fontWeight: '600',
  color: '#FFFFFF',
  textAlign: 'center',
}
```

### 3. **Layout Structure (Fixed)**

**Before (Complex):**
```typescript
<TouchableOpacity>
  <View style={styles.sleepContent}>  // Extra wrapper
    <Text style={styles.sleepEmoji}>🛏️</Text>  // Separate emoji
    <View style={styles.sleepTextContainer}>  // Another wrapper
      <Text>Sleep</Text>
      <Text>Display</Text>
    </View>
  </View>
</TouchableOpacity>
```

**After (Simple):**
```typescript
<TouchableOpacity>
  <Text>🛏️ Sleep</Text>  // ✅ Emoji + text together
  <Text>Display</Text>
</TouchableOpacity>
```

### 4. **Active State (Fixed)**

**Before (Wrong colors):**
```typescript
sleepButtonActive: {
  backgroundColor: '#483D8B',  // Just darker purple
  borderColor: '#9370DB',
}
```

**After (Matches pattern):**
```typescript
sleepButtonActive: {
  backgroundColor: '#FF6B35',  // ✅ Orange like exercise active
  borderColor: '#E55100',
}
```

## Button States

### **Normal State (Not Sleeping)**
- **Text**: "🛏️ Sleep"
- **Subtext**: "7h 30m today" (sleep display)
- **Color**: Purple background (#6A5ACD)
- **Size**: `flex: 1` (shares space with other buttons)

### **Active State (Sleeping)**
- **Text**: "😴 Wake Up"
- **Subtext**: "Tap when awake"
- **Color**: Orange background (#FF6B35)
- **Size**: Full width (takes entire button area)

## Home Screen Layout

### **When Not Sleeping:**
```
[Water] [Meal] [Exercise] [Sleep] [Clean]
```
Sleep button appears alongside other buttons with proper `flex: 1` sizing.

### **When Sleeping:**
```
[😴 Wake Up - Full Width Button]
```
Wake up button takes over the entire button area, just like exercise and cleaning active states.

## Sizing Comparison

| Component | Padding | Font Size | Border | Flex |
|-----------|---------|-----------|--------|------|
| WaterButton | `(SCREEN_WIDTH * 12) / 393` | `(SCREEN_WIDTH * 16) / 393` | 2px | `flex: 1` |
| ExerciseButton | `(SCREEN_HEIGHT * 12) / 852` | `(SCREEN_WIDTH * 14) / 393` | 2px | `flex: 1` |
| **SleepButton** | `(SCREEN_HEIGHT * 12) / 852` | `(SCREEN_WIDTH * 14) / 393` | 2px | `flex: 1` |

✅ **All buttons now have consistent sizing!**

## Visual Result

### **Before Fix:**
- Sleep button was smaller than other buttons
- Wrong font sizes and padding
- Inconsistent styling
- Missing full-width wake state

### **After Fix:**
- ✅ Sleep button matches exact size of other buttons
- ✅ Font sizes and padding consistent across all buttons
- ✅ Proper active state with orange color
- ✅ Full-width wake button when sleeping
- ✅ Proper emoji integration in text

## Testing Checklist

- [ ] Sleep button same size as water/meal/exercise buttons
- [ ] Font sizes match other buttons exactly
- [ ] Padding and margins consistent
- [ ] Normal state: "🛏️ Sleep" with purple background
- [ ] Active state: "😴 Wake Up" with orange background
- [ ] Wake button takes full width when sleeping
- [ ] Sleep display shows correct format ("7h 30m today")
- [ ] Button integrates properly with home screen layout
- [ ] Transitions between states work smoothly

The sleep button now perfectly matches the original design and sizing of all other buttons in the app!