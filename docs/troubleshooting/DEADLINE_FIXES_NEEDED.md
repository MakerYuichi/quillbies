# Deadline Fixes Summary

## Critical Issue: Deadlines Not Showing After Restart

**Status**: Investigating

**Symptoms**:
- Deadlines save to database correctly
- Deadlines show in calendar after restart
- Deadlines DON'T show in focus tab or home tab after restart

**Possible Causes**:
1. Store persistence issue - deadlines not being saved to AsyncStorage
2. Loading order issue - deadlines loaded but then overwritten
3. Component not re-rendering when deadlines load

**Debug Steps**:
1. Check console logs for: `[Load] Loaded deadlines from database: X`
2. Check if deadline IDs are logged
3. Verify focus tab is reading from store correctly

**Next Steps**:
- Add more logging to track deadline flow
- Check if focus tab useEffect dependencies include deadlines
- Verify store persistence configuration

---

## UI Improvements Needed

### 1. Placeholder Text Visibility
**Current**: `placeholderTextColor="#999"` (too dark)
**Needed**: `placeholderTextColor="#BBB"` (lighter, less visible)

**Files to Update**:
- `quillby-app/app/components/modals/CreateDeadlineModal.tsx`
  - Task name input
  - Date input
  - Time input

### 2. Default Time to Current Time
**Current**: Empty string or hardcoded time
**Needed**: Current time in local timezone (HH:MM format)

**Solution**: Use `getCurrentTime()` helper function
```typescript
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
```

### 3. Scrollable Hour/Minute Picker
**Current**: Text input with decimal-pad keyboard
**Needed**: Scrollable picker like water glasses (0-10)

**Implementation**:
- Use existing `ScrollablePicker` component from `app/components/ui/ScrollablePicker.tsx`
- Create two pickers: Hours (0-24) and Minutes (0, 15, 30, 45)
- Calculate total hours: `hours + (minutes / 60)`
- Display as: "3 hrs 30 min" instead of "3.5"

**Example from EditGoalsModal**:
```tsx
<ScrollablePicker
  visible={true}
  onClose={() => setShowPicker({ type: null })}
  onSelect={(value) => {
    setSelectedHours(value);
    setShowPicker({ type: null });
  }}
  selectedValue={selectedHours}
  min={0}
  max={24}
  label="Hours"
/>
```

---

## Implementation Plan

### Phase 1: Fix Critical Deadline Loading (PRIORITY)
1. Add comprehensive logging to track deadline flow
2. Check store persistence configuration
3. Verify focus tab is subscribed to deadline changes
4. Test with console logs to see where deadlines are lost

### Phase 2: UI Improvements
1. Update placeholder colors to #BBB
2. Set default time to current time
3. Replace text input with ScrollablePicker for hours/minutes
4. Update validation to use selectedHours + selectedMinutes
5. Display estimated time as "X hrs Y min"

### Phase 3: Testing
1. Create deadline and verify it appears immediately
2. Restart app and verify deadline shows in all tabs
3. Test with different hour/minute combinations
4. Verify database sync works correctly

---

## Files to Modify

### Critical Fix:
- `quillby-app/app/(tabs)/focus.tsx` - Check deadline subscription
- `quillby-app/app/(tabs)/index.tsx` - Check deadline subscription  
- `quillby-app/app/state/store-modular.ts` - Add more logging

### UI Improvements:
- `quillby-app/app/components/modals/CreateDeadlineModal.tsx`
  - Add ScrollablePicker imports
  - Add hour/minute state
  - Replace text input with pickers
  - Update validation logic
  - Update placeholder colors
  - Set default time

---

## Current Status

✅ Deadlines save to database
✅ Deadlines show in calendar
✅ Database ID properly assigned
❌ Deadlines don't show in focus/home after restart
⏳ UI improvements pending
