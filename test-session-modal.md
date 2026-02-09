# Session Modal Troubleshooting Guide

## Issue
The SessionCustomizationModal is not appearing when clicking "Start Focus Session" button.

## Fixes Applied

### 1. Added Missing `isPremium` Prop
**File:** `app/(tabs)/focus.tsx`

The modal was missing the `isPremium` prop which is required by the SessionCustomizationModal component.

**Before:**
```tsx
<SessionCustomizationModal
  visible={showSessionModal}
  onClose={() => {
    setShowSessionModal(false);
    setPendingDeadlineId(undefined);
  }}
  onStartSession={handleSessionStart}
/>
```

**After:**
```tsx
<SessionCustomizationModal
  visible={showSessionModal}
  onClose={() => {
    setShowSessionModal(false);
    setPendingDeadlineId(undefined);
  }}
  onStartSession={handleSessionStart}
  isPremium={userData.purchasedItems?.includes('premium') || false}
/>
```

### 2. Added Debug Logging
Added console.log statements to track:
- When `handleStartSession` is called
- When `showSessionModal` state changes
- When the modal's `visible` prop changes

## Testing Steps

1. **Open the Focus tab** in the app
2. **Click "Start Focus Session"** button
3. **Check the console** for these logs:
   ```
   [Focus] Starting session with deadlineId: undefined
   [Focus] Setting showSessionModal to true
   [Focus] showSessionModal should now be true
   [Focus] showSessionModal changed to: true
   [SessionModal] Visibility changed to: true
   ```

4. **The modal should appear** with:
   - Title: "🎯 Customize Your Focus Session"
   - Session presets: Pomodoro Classic, Custom Time, Deep Focus, etc.
   - Customization options
   - Start button at the bottom

## Common Issues & Solutions

### Issue 1: Modal Not Appearing
**Possible Causes:**
- Missing `isPremium` prop (FIXED)
- Modal is rendered but behind other elements
- State not updating properly

**Solution:**
- Verify the modal is receiving `visible={true}`
- Check z-index and overlay styles
- Ensure no other modals are blocking it

### Issue 2: Modal Appears But Is Empty
**Possible Causes:**
- ScrollView content not rendering
- SafeAreaView cutting off content

**Solution:**
- Check `scrollContentContainer` padding
- Verify `maxHeight` calculation
- Test on different screen sizes

### Issue 3: Modal Closes Immediately
**Possible Causes:**
- `onClose` being called unintentionally
- Touch events propagating incorrectly

**Solution:**
- Add `e.stopPropagation()` to button handlers
- Check for conflicting touch handlers

## Modal Structure

The SessionCustomizationModal uses:
- **Modal** component with `presentationStyle="overFullScreen"`
- **SafeAreaView** for proper spacing on iOS
- **ScrollView** for scrollable content
- **Overlay** with semi-transparent background
- **Bottom sheet style** (slides up from bottom)

## Next Steps

If the modal still doesn't appear:

1. **Check Metro bundler logs** for any errors
2. **Verify the modal is being imported** correctly
3. **Test on a physical device** (not just simulator)
4. **Check React Native Modal documentation** for platform-specific issues
5. **Try simplifying the modal** to a basic version to isolate the issue

## Files Modified
- `app/(tabs)/focus.tsx` - Added isPremium prop and debug logging
- `app/components/modals/SessionCustomizationModal.tsx` - Added debug logging