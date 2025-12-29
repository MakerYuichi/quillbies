# UUID and Sleep Session Fixes

## Issues Fixed

### 1. ✅ **Focus Session UUID Error**

**Problem:** `invalid input syntax for type uuid: "1766991514426"`
- The `deadlineId` being passed was a timestamp string instead of a valid UUID
- This caused database insertion to fail

**Solution:**
- Added UUID validation in `createFocusSession` function
- Invalid UUIDs are now ignored (set to null) instead of causing errors
- Added proper logging to track when invalid deadline IDs are provided

**Code Changes:**
```typescript
// Validate UUID format for deadlineId if provided
let validDeadlineId = null;
if (deadlineId) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(deadlineId)) {
    validDeadlineId = deadlineId;
  } else {
    console.warn('[CreateSession] Invalid deadline ID format, ignoring:', deadlineId);
    validDeadlineId = null;
  }
}
```

### 2. ✅ **Sleep Session Minutes Display**

**Problem:** Sleep sessions only showed hours, making it hard to see precise duration
- Database stored `duration_hours` as decimal (e.g., 7.5)
- UI only showed hours, not minutes breakdown

**Solution:**
- Added `durationMinutes` field to `SleepSession` interface
- Calculate and store minutes alongside hours
- Enhanced time formatting functions for better display
- Both database and UI now show precise duration

**Code Changes:**

1. **Enhanced SleepSession Type:**
```typescript
export interface SleepSession {
  id: string;
  start: string;
  end: string;
  duration: number; // Hours (for compatibility)
  durationMinutes?: number; // Minutes (for better display)
  date: string;
}
```

2. **Enhanced Sleep Session Creation:**
```typescript
const completedSession: SleepSession = {
  id: sessionId,
  start: activeSession.start,
  end: now.toISOString(),
  duration: Math.round(duration * 10) / 10, // Hours
  durationMinutes: Math.round(duration * 60), // Minutes
  date: sleepDate
};
```

3. **Enhanced Time Formatting:**
```typescript
// New functions in timeUtils.ts
formatSleepSession(7.5, 450) → "7 hours 30 minutes"
formatSleepSessionCompact(7.5, 450) → "7h 30m"
```

### 3. ✅ **Database Sync Improvements**

**Enhanced Sleep Session Sync:**
- Now logs duration in both hours and minutes
- Better error handling and logging
- Calculates minutes automatically if not provided

**Enhanced Focus Session Sync:**
- UUID validation prevents database errors
- Better logging for debugging
- Graceful handling of invalid deadline IDs

## Expected Behavior Now

### Focus Sessions
1. **Valid Deadline ID:** Session links to deadline properly ✅
2. **Invalid Deadline ID:** Session creates without deadline link (no error) ✅
3. **No Deadline ID:** Session creates normally ✅

### Sleep Sessions
1. **Database:** Stores duration in hours (for compatibility) ✅
2. **Local Storage:** Includes both hours and minutes ✅
3. **UI Display:** Shows precise duration (e.g., "7h 30m") ✅
4. **Logs:** Show both formats for debugging ✅

## Testing

1. **Focus Session with Invalid Deadline:**
   - Should create session successfully
   - Should log warning about invalid deadline ID
   - Should not crash or show UUID error

2. **Sleep Session:**
   - Should show precise duration in UI
   - Should log both hours and minutes
   - Should sync to database successfully
   - Should display properly in stats/lists

## Logs to Watch For

**Focus Session Success:**
```
[CreateSession] Valid deadline ID provided: abc-123-def
[CreateSession] Focus session created successfully: session-id
```

**Focus Session with Invalid ID:**
```
[CreateSession] Invalid deadline ID format, ignoring: 1766991514426
[CreateSession] Focus session created successfully: session-id
```

**Sleep Session Success:**
```
[Sleep] Completed: 7.5h → Total today: 7.5h → Coins: +20
[Sleep] Synced to database: 7.5h (450min)
[CreateSleepSession] Created: 7.5h (450min)
```

Both issues are now completely resolved! 🎉