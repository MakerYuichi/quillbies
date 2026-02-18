# Mess Points System - Complete Analysis

## How Mess Points Are Added

### 1. Missed Study Checkpoints (Real-time)
**Location**: `store-modular.ts` - `addMissedCheckpoint()`
**Trigger**: Called by `checkAndProcessCheckpoints()` every 15 minutes
**Logic**:
```typescript
// Mess points = missing hours (1 hour behind = 1 mess point)
const messPointsIncrease = Math.max(0.5, missingHours); // Minimum 0.5
const newMessPoints = userData.messPoints + messPointsIncrease;
```

**When it triggers**:
- Checks every 15 minutes if you're behind on study goals
- Compares actual study hours vs expected progress at checkpoint time
- Only triggers if behind by more than 30 minutes (0.5 hours)
- Only processes each checkpoint once per day (prevents duplicates)

**Example**:
- Goal: 3 hours/day
- Checkpoint: 6 PM
- Expected by 6 PM: (18/24) * 3 = 2.25 hours
- Actual: 1 hour
- Missing: 1.25 hours
- **Mess points added: 1.25**

### 2. End of Day Evaluation (Midnight)
**Location**: `userSlice.ts` - `resetDay()`
**Trigger**: Called at midnight (00:00-00:10) by interval in `index.tsx`
**Logic**:
```typescript
// Calculate mess points for unmet study goal
const studyDeficit = Math.max(0, studyGoal - studyHours);
const messPointsToAdd = studyDeficit * 2; // 2 mess points per hour of unmet goal
const newMessPoints = userData.messPoints + messPointsToAdd;
```

**When it triggers**:
- Runs once per day at midnight
- Calculates total study deficit for the day
- Adds 2 mess points per hour of unmet study goal

**Example**:
- Goal: 3 hours/day
- Actual: 1.5 hours
- Deficit: 1.5 hours
- **Mess points added: 3.0**

### 3. Skipped Tasks
**Location**: `habitsSlice.ts` - `skipTask()`
**Trigger**: Manual (when user skips a task)
**Logic**:
```typescript
const messIncrease = 1.0; // Simple mess increase for skipped tasks
```

## How Mess Points Are Removed

### 1. Completing Focus Sessions
**Location**: `sessionSlice.ts` - `endFocusSession()`
**Amount**: -2 mess points per session
**Logic**:
```typescript
const MESS_REMOVAL_PER_SESSION = 2;
const newMessPoints = Math.max(0, userData.messPoints - MESS_REMOVAL_PER_SESSION);
```

### 2. Cleaning Room
**Location**: `habitsSlice.ts` - `cleanRoom()`
**Amount**: Variable (based on cleaning plan)
**Logic**:
```typescript
const newMessPoints = Math.max(0, userData.messPoints - messPointsReduced);
```

## Potential Issues

### Issue 1: Checkpoint Detection
**Problem**: Checkpoints might not be triggering if:
- Study goal is not set (`studyGoalHours` is 0 or undefined)
- Checkpoints are not configured (`studyCheckpoints` is empty)
- Study habit is not enabled in `enabledHabits`

**Check**:
```typescript
console.log('[Checkpoint] Current state:', {
  studyGoalHours: userData.studyGoalHours,
  studyCheckpoints: userData.studyCheckpoints,
  enabledHabits: userData.enabledHabits,
  studyMinutesToday: userData.studyMinutesToday
});
```

### Issue 2: Midnight Reset Timing
**Problem**: `resetDay()` only runs if:
- App is open at midnight (00:00-00:10)
- Interval check happens during that 10-minute window
- No errors occur during the check

**Solution**: The interval checks every 10 minutes, so it should catch midnight within the window.

### Issue 3: Duplicate Prevention
**Problem**: Checkpoints are only processed once per day using `lastProcessedCheckpoint`
**Logic**:
```typescript
const checkpointKey = `${checkResult.checkpoint}-${today}`;
if (lastProcessedCheckpoint === checkpointKey) {
  console.log('Already processed this checkpoint today, skipping');
  return { shouldNotify: false };
}
```

This prevents adding mess points multiple times for the same checkpoint.

## Debugging Steps

### 1. Check if study goal is set
```typescript
console.log('Study Goal:', userData.studyGoalHours);
console.log('Checkpoints:', userData.studyCheckpoints);
```

### 2. Check if checkpoints are being detected
```typescript
// Look for these logs in console:
'[Checkpoint] Checking study checkpoints...'
'[checkWithCheckpoints] User is behind! Adding mess points'
'[addMissedCheckpoint] ADDING MESS POINTS:'
```

### 3. Check if midnight reset is running
```typescript
// Look for this log at midnight:
'[Daily] Midnight reached - applying daily reset'
'[Daily] 🧹 Adding X mess points for unmet study goal'
```

### 4. Verify mess points are being updated
```typescript
console.log('Mess Points:', userData.messPoints);
// After checkpoint miss or midnight:
'[addMissedCheckpoint] ✅ Mess points updated: X → Y'
'[Daily] Mess points: X → Y'
```

## Common Scenarios

### Scenario 1: No mess points added during day
**Possible causes**:
1. Study goal not set (check onboarding)
2. Study habit not enabled
3. User is actually on track with study goals
4. Checkpoints not configured

### Scenario 2: No mess points added at midnight
**Possible causes**:
1. App not open at midnight
2. Study goal already met (no deficit)
3. Error in resetDay function

### Scenario 3: Mess points added but not visible
**Possible causes**:
1. UI not refreshing
2. Database sync issue
3. State not updating properly

## Testing Checklist

- [ ] Set study goal in onboarding
- [ ] Enable study habit
- [ ] Configure checkpoints (e.g., 12 PM, 6 PM, 9 PM)
- [ ] Wait for checkpoint to pass without studying
- [ ] Check console for checkpoint detection logs
- [ ] Verify mess points increase
- [ ] Wait for midnight (or simulate)
- [ ] Check console for daily reset logs
- [ ] Verify mess points increase for unmet goal
- [ ] Complete a focus session
- [ ] Verify mess points decrease by 2

## Status

The system is correctly implemented. If mess points aren't being added, it's likely because:
1. **Study goal is not set** - User needs to complete onboarding
2. **Study habit is not enabled** - User needs to enable it in settings
3. **User is on track** - No mess points added if meeting goals
4. **App not open at midnight** - Daily evaluation only runs when app is active

## Recommendation

Add a manual trigger for testing:
```typescript
// In index.tsx, add a test button:
<TouchableOpacity onPress={() => {
  const { resetDay, checkAndProcessCheckpoints } = useQuillbyStore.getState();
  console.log('[TEST] Forcing checkpoint check...');
  checkAndProcessCheckpoints();
  console.log('[TEST] Forcing daily reset...');
  resetDay();
}}>
  <Text>🧪 Test Mess Points</Text>
</TouchableOpacity>
```
