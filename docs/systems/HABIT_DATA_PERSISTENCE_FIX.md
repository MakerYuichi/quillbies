# Habit Data Persistence Fix

## Problem
Exercise minutes and sleep sessions were resetting to 0 after app reload, even though users had logged them during the session.

## Root Cause
The habit logging functions (`logExercise`, `endSleep`, `logWater`, `logBreakfast`, `logMeal`) were updating local state but NOT calling `syncToDatabase()` to persist the data to Supabase. This meant:

1. Data was only stored in memory (Zustand state)
2. When the app reloaded, it would load from database (which had old/empty data)
3. All progress was lost

## Solution
Added `syncToDatabase(updatedUserData)` calls to all habit logging functions in `app/state/slices/habitsSlice.ts`:

### Functions Fixed:
1. **logWater()** - Now syncs water glass count to database
2. **logBreakfast()** - Now syncs breakfast status to database
3. **logMeal()** - Now syncs meal count to database
4. **logExercise()** - Now syncs exercise minutes to database
5. **endSleep()** - Now syncs completed sleep sessions to database

### Changes Made:
- Refactored each function to create `updatedUserData` object
- Called `set({ userData: updatedUserData })` to update local state
- Called `syncToDatabase(updatedUserData)` to persist to database
- Added console logs for better debugging

## Database Tables Affected
- `user_profiles` - Stores qCoins, energy, maxEnergyCap
- `daily_data` - Stores waterGlasses, ateBreakfast, mealsLogged, exerciseMinutes, lastExerciseReset
- `sleep_sessions` - Stores individual sleep sessions with start/end times

## Testing Checklist
- [ ] Log exercise minutes, reload app - minutes should persist
- [ ] Complete sleep session, reload app - sleep hours should persist
- [ ] Log water glasses, reload app - water count should persist
- [ ] Log breakfast, reload app - breakfast status should persist
- [ ] Log meals, reload app - meal count should persist
- [ ] Verify Q-Coins and energy persist after habit logging
- [ ] Test across day boundary - daily data should reset properly
- [ ] Check database tables to confirm data is being written

## Notes
- The `syncToDatabase()` function handles both `user_profiles` and `daily_data` table updates
- Sleep sessions are also synced to the `sleep_sessions` table via the sync utility
- Daily reset logic still works correctly - it resets counters at day boundary while preserving historical data
