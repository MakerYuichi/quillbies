# Settings Persistence Fix

## Issue
Settings changes (hamster style, habits, goals, profile) were not persisting after app restart.

## Root Cause Analysis

### 1. Hamster Style (selectedCharacter)
**FIXED** ✅
- **Problem**: `setCharacter()` function was NOT calling `syncToDatabase()`
- **Solution**: Added `syncToDatabase(updatedUserData)` call to `setCharacter()` in `userSlice.ts`
- **File**: `quillby-app/app/state/slices/userSlice.ts`

### 2. Goals & Profile Settings
**ALREADY WORKING** ✅
- All goal-setting functions (`setStudyGoal`, `setExerciseGoal`, `setHydrationGoal`, `setSleepGoal`) already call `syncToDatabase()`
- Profile functions (`setProfile`, `setBuddyName`) already call `syncToDatabase()`
- Habits function (`setHabits`) already calls `syncToDatabase()`

### 3. Database Loading
**ALREADY WORKING** ✅
- `loadFromDatabase()` is called on app startup in `_layout.tsx`
- It loads all settings from database including:
  - `study_goal_hours`
  - `exercise_goal_minutes`
  - `hydration_goal_glasses`
  - `sleep_goal_hours`
  - `enabled_habits`
  - `selected_character`
  - `buddy_name`
  - `user_name`
  - `student_level`
  - `country`
  - `timezone`

## Verification Steps

### If Settings Still Don't Persist:

1. **Check Database Connection**
   - Open app and check console logs for `[Load] Loading comprehensive user data from database...`
   - Should see `[Load] Comprehensive user data loaded from database`

2. **Check Database Schema**
   - Ensure the SQL migration was run: `DATABASE_GOAL_FIELDS_UPDATE.sql`
   - This changes `study_goal_hours` and `sleep_goal_hours` to support decimal values

3. **Check Sync Logs**
   - When changing settings, look for `[Sync] Background sync completed`
   - Should see `[SyncAll] ✅ user_profiles synced successfully`

4. **Manual Database Check**
   - Query the `user_profiles` table to verify data is being saved:
   ```sql
   SELECT 
     buddy_name,
     selected_character,
     study_goal_hours,
     exercise_goal_minutes,
     hydration_goal_glasses,
     sleep_goal_hours,
     enabled_habits
   FROM user_profiles
   WHERE id = 'your-user-id';
   ```

## What Was Fixed

### File: `quillby-app/app/state/slices/userSlice.ts`

**Before:**
```typescript
setCharacter: (character: string) => {
  const { userData } = get();
  set({
    userData: {
      ...userData,
      selectedCharacter: character
    }
  });
},
```

**After:**
```typescript
setCharacter: (character: string) => {
  const { userData } = get();
  const updatedUserData = {
    ...userData,
    selectedCharacter: character
  };
  set({ userData: updatedUserData });
  // Sync to database
  syncToDatabase(updatedUserData);
},
```

## Testing

1. Change hamster style in settings
2. Change habits in settings
3. Change goals in settings
4. Change profile info in settings
5. Close and restart the app
6. Verify all changes persisted

## Expected Behavior

All settings changes should now persist across app restarts because:
1. ✅ All setter functions call `syncToDatabase()`
2. ✅ `syncToDatabase()` saves to `user_profiles` table
3. ✅ `loadFromDatabase()` loads from database on app startup
4. ✅ Database schema supports all field types

## If Issues Persist

Check these potential problems:

1. **Database not accessible**
   - User might be offline
   - Supabase connection issue
   - Check console for database errors

2. **RLS (Row Level Security) blocking updates**
   - Verify RLS policies allow updates
   - Check Supabase dashboard for policy errors

3. **Sync throttling**
   - Syncs are throttled to every 15 seconds
   - Wait 15 seconds after change, then restart app

4. **AsyncStorage corruption**
   - Clear app data and re-onboard
   - This will force fresh database load
