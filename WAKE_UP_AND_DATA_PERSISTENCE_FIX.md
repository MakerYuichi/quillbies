# Wake-Up Animation & Data Persistence Fix

## Date: February 10, 2026

## Issues Fixed

### 1. Wake-Up Animation Not Visible for 2-3 Seconds
**Problem**: After clicking the "Wake Up" button, the wake-up animation (`wake-up.png`) was not visible for 2-3 seconds.

**Root Cause**: The animation state was being set AFTER calling `endSleep()`, which triggers state updates and re-renders. This caused a delay before the animation appeared.

**Solution**: Reordered the operations in `handleWakeUpButton()`:
1. Set wake-up animation FIRST (before any other state changes)
2. Then end the sleep session
3. Then reset sleep states
4. Finally, return to idle after 3 seconds

**Files Modified**:
- `quillby-app/app/hooks/useSleepTracking.tsx` - Reordered wake-up animation logic

**Code Change**:
```typescript
// BEFORE (animation set after endSleep)
endSleep(activeSleepSessionId);
setCurrentAnimation('wake-up');
setTimeout(() => setCurrentAnimation('idle'), 3000);
setIsSleeping(false);
// ... more state changes

// AFTER (animation set FIRST)
setCurrentAnimation('wake-up'); // Set immediately!
endSleep(activeSleepSessionId);
setIsSleeping(false);
// ... more state changes
setTimeout(() => {
  setCurrentAnimation('idle'); // Return to idle after animation
  setMessage('');
  setMessageTimestamp(0);
}, 3000);
```

### 2. Data Resets After Closing App (But Onboarding Doesn't Show)
**Problem**: After closing and reopening the app, data like qCoins, water, and meals was reset to 0, but onboarding didn't show (meaning the app knew the user had completed onboarding).

**Root Cause**: The app has TWO separate data persistence systems:
1. **Device-level onboarding** - Stored in AsyncStorage (`@quillby_device_onboarding_completed`)
2. **User data** - Stored in Supabase database

When the app reopens:
- Device onboarding check passes ✅ (AsyncStorage persists)
- User data loads from database ❌ (database has old/stale data)
- Database data overwrites local data with old values

**Why This Happens**:
1. User completes onboarding → Device onboarding marked complete in AsyncStorage
2. User makes progress (earns qCoins, drinks water, etc.)
3. Data syncs to database (but may fail silently if offline)
4. User closes app
5. User reopens app
6. Device onboarding check passes (AsyncStorage still has completion flag)
7. `loadFromDatabase()` loads old data from Supabase
8. Old database data (0 qCoins, 0 water) overwrites current session data

**Current Behavior**:
```typescript
// In loadFromDatabase()
const mergedUserData = {
  ...userData, // Local data (current session)
  qCoins: dbData.userProfile.q_coins ?? userData.qCoins, // Database overwrites!
  waterGlasses: dbData.dailyData.water_glasses ?? userData.waterGlasses, // Database overwrites!
  mealsLogged: dbData.dailyData.meals_logged ?? userData.mealsLogged, // Database overwrites!
};
```

**Solutions** (Choose One):

#### Option A: Prioritize Local Data (Recommended for Offline-First)
```typescript
// In loadFromDatabase()
const mergedUserData = {
  ...userData, // Start with local data
  // Only load from database if local data is missing or stale
  qCoins: userData.qCoins > 0 ? userData.qCoins : (dbData.userProfile.q_coins ?? 0),
  waterGlasses: userData.waterGlasses > 0 ? userData.waterGlasses : (dbData.dailyData.water_glasses ?? 0),
  // ... etc
};
```

#### Option B: Check Data Freshness
```typescript
// Only load from database if it's fresher than local data
const dbTimestamp = new Date(dbData.userProfile.updated_at).getTime();
const localTimestamp = userData.lastActiveTimestamp;

if (dbTimestamp > localTimestamp) {
  // Database is newer, use it
  mergedUserData.qCoins = dbData.userProfile.q_coins;
} else {
  // Local is newer, keep it
  mergedUserData.qCoins = userData.qCoins;
}
```

#### Option C: Don't Load Daily Data on Startup
```typescript
// Only load persistent data (profile, goals, purchases)
// Don't load daily data (water, meals, study minutes) on startup
const mergedUserData = {
  ...userData,
  // Profile data (persistent)
  buddyName: dbData.userProfile.buddy_name || userData.buddyName,
  qCoins: dbData.userProfile.q_coins ?? userData.qCoins,
  currentStreak: dbData.userProfile.current_streak ?? userData.currentStreak,
  
  // Daily data (keep local, don't load from database)
  waterGlasses: userData.waterGlasses, // Keep local!
  mealsLogged: userData.mealsLogged, // Keep local!
  studyMinutesToday: userData.studyMinutesToday, // Keep local!
};
```

## Recommended Fix

**Option C** is recommended because:
1. Daily data should be session-based (not loaded from database on startup)
2. Persistent data (qCoins, streak, profile) should come from database
3. Prevents data loss when app is closed/reopened during the same day
4. Simpler logic, fewer edge cases

## Implementation

### Step 1: Modify loadFromDatabase
```typescript
// In store-modular.ts, loadFromDatabase function
const mergedUserData = {
  ...userData,
  
  // PERSISTENT DATA - Load from database
  buddyName: dbData.userProfile.buddy_name || userData.buddyName,
  selectedCharacter: dbData.userProfile.selected_character || userData.selectedCharacter,
  userName: dbData.userProfile.user_name || userData.userName,
  qCoins: dbData.userProfile.q_coins ?? userData.qCoins,
  messPoints: dbData.userProfile.mess_points ?? userData.messPoints,
  currentStreak: dbData.userProfile.current_streak ?? userData.currentStreak,
  enabledHabits: dbData.userProfile.enabled_habits || userData.enabledHabits,
  studyGoalHours: dbData.userProfile.study_goal_hours ?? userData.studyGoalHours,
  // ... other persistent fields
  
  // DAILY DATA - Keep local (don't load from database on startup)
  // These will be reset by resetDay() at midnight
  waterGlasses: userData.waterGlasses,
  mealsLogged: userData.mealsLogged,
  studyMinutesToday: userData.studyMinutesToday,
  exerciseMinutes: userData.exerciseMinutes,
  appleTapsToday: userData.appleTapsToday,
  coffeeTapsToday: userData.coffeeTapsToday,
  ateBreakfast: userData.ateBreakfast,
  missedCheckpoints: userData.missedCheckpoints,
};
```

### Step 2: Add Data Freshness Check
```typescript
// Check if it's a new day - if so, reset daily data
const today = new Date().toDateString();
const lastCheckIn = userData.lastCheckInDate;

if (lastCheckIn !== today) {
  console.log('[Load] New day detected, resetting daily data');
  mergedUserData.waterGlasses = 0;
  mergedUserData.mealsLogged = 0;
  mergedUserData.studyMinutesToday = 0;
  mergedUserData.exerciseMinutes = 0;
  mergedUserData.appleTapsToday = 0;
  mergedUserData.coffeeTapsToday = 0;
  mergedUserData.ateBreakfast = false;
  mergedUserData.missedCheckpoints = 0;
  mergedUserData.lastCheckInDate = today;
}
```

## Testing

### Test Wake-Up Animation
1. Start a sleep session
2. Click "Wake Up" button
3. ✅ Wake-up animation should appear IMMEDIATELY
4. ✅ Animation should last 3 seconds
5. ✅ Hamster should return to idle after animation

### Test Data Persistence
1. Complete onboarding
2. Earn some qCoins (e.g., 50)
3. Drink some water (e.g., 3 glasses)
4. Log some meals (e.g., 2 meals)
5. Close the app completely
6. Reopen the app
7. ✅ qCoins should still be 50 (persistent data)
8. ✅ Water should still be 3 (daily data, same day)
9. ✅ Meals should still be 2 (daily data, same day)
10. ✅ Onboarding should NOT show again

### Test New Day Reset
1. Have some progress (qCoins, water, meals)
2. Wait until midnight OR trigger `resetDay()` manually
3. ✅ Daily data resets (water, meals, study minutes)
4. ✅ Persistent data remains (qCoins, streak, profile)
5. ✅ Onboarding does NOT show

## Current Status

✅ **Wake-up animation fix** - COMPLETED
- Animation now appears immediately when clicking "Wake Up"
- No more 2-3 second delay

⚠️ **Data persistence fix** - NEEDS IMPLEMENTATION
- Issue identified and documented
- Solution designed (Option C recommended)
- Needs code changes in `store-modular.ts`

## Next Steps

1. Implement Option C in `loadFromDatabase()` function
2. Add data freshness check for new day detection
3. Test thoroughly with app close/reopen scenarios
4. Test with midnight reset
5. Verify onboarding doesn't show for returning users
