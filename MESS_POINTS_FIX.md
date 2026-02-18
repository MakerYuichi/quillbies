# Mess Points Fix

## Problem
Mess points were not being removed after completing focus sessions in the new modular store.

## Root Cause
The `sessionSlice.ts` `endFocusSession()` function was missing the mess points removal logic that existed in the old store.

## Analysis

### Old Store (store.ts) - Working ✅
```typescript
endFocusSession: () => {
  // Calculate rewards based on focus score and distractions
  const rewards = calculateSessionRewards(session.focusScore, session.distractionCount);
  const newMessPoints = removeMessAfterSession(userData.messPoints, rewards.messPointsRemoved);
  
  // Update user data
  updatedUserData = {
    ...userData,
    qCoins: userData.qCoins + rewards.qCoinsEarned,
    messPoints: newMessPoints,  // ✅ Mess points updated
    energy: Math.min(userData.energy + rewards.energyGained, 100)
  };
}
```

### New Store (sessionSlice.ts) - Broken ❌
```typescript
endFocusSession: () => {
  // Calculate rewards
  const qCoinsEarned = Math.floor(session.focusScore / 10);
  const energyGained = Math.min(15, Math.floor(session.focusScore / 20));
  
  // Update user data
  const updatedUserData = {
    ...userData,
    qCoins: userData.qCoins + qCoinsEarned,
    energy: Math.min(userData.energy + energyGained, 100),
    // ❌ messPoints NOT updated - missing!
    studyMinutesToday: (userData.studyMinutesToday || 0) + sessionMinutes,
    totalStudyMinutes: (userData.totalStudyMinutes || 0) + sessionMinutes,
    completedFocusSessions: completedSessions
  };
}
```

## Solution
Added mess points removal logic to `sessionSlice.ts`:

```typescript
endFocusSession: () => {
  // ... existing code ...
  
  // Remove mess points (always -2 per session)
  const MESS_REMOVAL_PER_SESSION = 2;
  const newMessPoints = Math.max(0, userData.messPoints - MESS_REMOVAL_PER_SESSION);
  
  console.log(`[Session] Mess points: ${userData.messPoints.toFixed(1)} → ${newMessPoints.toFixed(1)} (-${MESS_REMOVAL_PER_SESSION})`);
  
  // Update user data with session results
  const updatedUserData = {
    ...userData,
    qCoins: userData.qCoins + qCoinsEarned,
    energy: Math.min(userData.energy + energyGained, 100),
    messPoints: newMessPoints,  // ✅ Now included!
    studyMinutesToday: (userData.studyMinutesToday || 0) + sessionMinutes,
    totalStudyMinutes: (userData.totalStudyMinutes || 0) + sessionMinutes,
    completedFocusSessions: completedSessions
  };
}
```

## Mess Points System Overview

### When Mess Points Are Added
1. **Missed Study Checkpoints** (`store-modular.ts` - `addMissedCheckpoint`)
   - Adds mess points based on hours behind schedule
   - Minimum 0.5 mess points per missed checkpoint

2. **End of Day Evaluation** (`userSlice.ts` - `resetDay`)
   - Adds 2 mess points per hour of unmet study goal

3. **Skipped Meals** (`habitsSlice.ts` - `skipMeal`)
   - Adds mess points for skipping meals

### When Mess Points Are Removed
1. **Completing Focus Sessions** (`sessionSlice.ts` - `endFocusSession`)
   - Removes 2 mess points per completed session
   - Cannot go below 0

2. **Cleaning Room** (via shop/cleaning system)
   - Removes mess points through cleaning actions

## Testing
- [x] Mess points are removed after completing a focus session
- [x] Mess points cannot go below 0
- [x] Console logs show mess point changes
- [x] Changes sync to database

## Files Modified
- `quillby-app/app/state/slices/sessionSlice.ts`

## Status: ✅ Fixed
Mess points are now properly removed after completing focus sessions.
