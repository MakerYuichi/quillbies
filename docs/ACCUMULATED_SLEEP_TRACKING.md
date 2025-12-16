# Accumulated Sleep Tracking ✅

## Overview
Sleep hours now accumulate throughout the day instead of being replaced. Users can take multiple naps or sleep sessions, and all hours add up to their daily total.

## How It Works

### 1. Sleep Accumulation
```
Session 1: Sleep 4h → Total: 4h today
Session 2: Sleep 2h → Total: 6h today (4h + 2h)
Session 3: Sleep 1h → Total: 7h today (6h + 1h)
```

### 2. Daily Reset
- Sleep counter resets at midnight (new day)
- Tracked via `lastSleepReset` field in UserData
- Automatic reset when new day is detected

### 3. Energy Consequences
Energy cap is calculated based on **total accumulated sleep**:
- **< 6h total**: -30% max energy cap
- **6-8h total**: Normal energy cap (100%)
- **8h+ total**: +10 bonus energy

## Implementation

### Store Changes (state/store.ts)

#### 1. Added lastSleepReset Field
```typescript
userData: {
  sleepHours: 0, // Accumulated sleep today
  lastSleepReset: new Date().toDateString(),
  // ... other fields
}
```

#### 2. Updated logSleep Function
```typescript
logSleep: (hours: number) => {
  const { userData } = get();
  
  // Check if it's a new day
  const today = new Date().toDateString();
  const isNewDay = userData.lastSleepReset !== today;
  
  // Accumulate sleep (reset if new day)
  const accumulatedSleep = isNewDay 
    ? hours 
    : userData.sleepHours + hours; // ADD, don't replace
  
  // Calculate max cap based on total sleep
  const newMaxCap = calculateMaxEnergyCap({ 
    ...userData, 
    sleepHours: accumulatedSleep 
  });
  
  // Add bonus energy if total >= 8h
  const bonusEnergy = accumulatedSleep >= 8 ? 10 : 0;
  
  set({
    userData: {
      ...userData,
      sleepHours: accumulatedSleep, // ACCUMULATE
      maxEnergyCap: newMaxCap,
      energy: Math.min(userData.energy + bonusEnergy, newMaxCap),
      lastSleepReset: today
    }
  });
}
```

#### 3. Updated resetDay Function
```typescript
resetDay: () => {
  const today = new Date().toDateString();
  
  set({
    userData: {
      ...userData,
      sleepHours: 0, // Reset to 0
      lastSleepReset: today,
      // ... reset other daily values
    }
  });
}
```

### Hook Changes (hooks/useSleepTracking.ts)

#### 1. Auto-Reset on New Day
```typescript
useEffect(() => {
  const today = new Date().toDateString();
  const lastReset = userData.lastSleepReset || userData.lastCheckInDate;
  
  if (lastReset !== today) {
    console.log('[Sleep] New day detected - resetting sleep counter');
    resetDay();
  }
}, [userData.lastSleepReset, userData.lastCheckInDate, resetDay]);
```

#### 2. Display Accumulated Sleep
```typescript
const formatAccumulatedSleep = () => {
  const hours = Math.floor(userData.sleepHours);
  if (hours === 0) return '0h today';
  return `${hours}h today`;
};

return {
  sleepDisplay: formatAccumulatedSleep(), // "7h today"
  // ... other returns
};
```

#### 3. Updated Wake Message
```typescript
const handleWakeUpButton = () => {
  // Calculate this session duration
  const hoursInt = Math.round(durationMs / (1000 * 60 * 60));
  
  // Calculate new total after adding this session
  const newTotal = userData.sleepHours + hoursInt;
  
  // Log sleep (will accumulate in store)
  logSleep(hoursInt);
  
  // Show message with both session and total
  setMessage(`😊 Slept ${durationText} (${newTotal}h total today)\nGood rest!`);
};
```

### Component Changes (components/SleepButton.tsx)

#### Updated Props
```typescript
interface SleepButtonProps {
  isSleeping: boolean;
  sleepDisplay: string; // "7h today" instead of just hours
  onSleep: () => void;
  onWakeUp: () => void;
}
```

#### Display Format
```typescript
<Text style={styles.sleepButtonSubtext}>
  {sleepDisplay} {/* Shows "7h today" */}
</Text>
```

## User Experience

### Before (Single Sleep)
```
User: Sleeps 4h
Display: "4h last"
Energy: -30% cap (< 6h)

User: Sleeps 2h later
Display: "2h last" ❌ (Lost the 4h!)
Energy: -30% cap (< 6h) ❌ (Should be 6h total!)
```

### After (Accumulated Sleep)
```
User: Sleeps 4h
Display: "4h today"
Energy: -30% cap (< 6h)
Message: "😴 Slept 4h 15m (4h total today)"

User: Sleeps 2h later
Display: "6h today" ✅ (Accumulated!)
Energy: Normal cap ✅ (6h total!)
Message: "😊 Slept 2h 10m (6h total today)"

User: Sleeps 2h more
Display: "8h today" ✅
Energy: Normal cap + 10 bonus ✅
Message: "⭐ Slept 2h 5m (8h total today) Perfect!"
```

## Benefits

### 1. Realistic Tracking
- Supports naps and multiple sleep sessions
- Reflects real-world sleep patterns
- No more "lost" sleep hours

### 2. Fair Energy System
- Energy cap based on total sleep, not last session
- Encourages healthy sleep habits
- Rewards consistent sleep throughout day

### 3. Better Feedback
- Shows both session duration and daily total
- Clear progress toward 8h goal
- Motivates users to reach optimal sleep

### 4. Daily Reset
- Automatic reset at midnight
- Fresh start each day
- No manual intervention needed

## Examples

### Example 1: Night Owl
```
11 PM: Sleep 5h → "5h today" → -30% energy cap
4 AM: Wake up
2 PM: Nap 2h → "7h today" → Normal energy cap ✅
4 PM: Wake up
```

### Example 2: Power Napper
```
1 PM: Nap 1h → "1h today" → -30% energy cap
2 PM: Wake up
3 PM: Nap 1h → "2h today" → -30% energy cap
4 PM: Wake up
10 PM: Sleep 6h → "8h today" → +10 bonus energy ✅
4 AM: Wake up
```

### Example 3: Long Sleeper
```
10 PM: Sleep 9h → "9h today" → +10 bonus energy ✅
7 AM: Wake up
3 PM: Nap 1h → "10h today" → Still good!
4 PM: Wake up
```

## Edge Cases Handled

### 1. New Day Detection
- Checks `lastSleepReset` vs current date
- Auto-resets sleep counter at midnight
- Prevents accumulation across days

### 2. First Time User
- Starts with 0h sleep
- No penalty until first sleep logged
- Encourages immediate sleep tracking

### 3. Very Short Naps
- Rounds to nearest hour for energy calculation
- Shows minutes in message for accuracy
- Example: 30m nap = 0h for energy, but shows "30m" in message

### 4. Very Long Sleep
- No upper limit on accumulation
- Energy cap maxes at 100% + bonus
- Example: 12h sleep = same as 8h for energy

## Testing Scenarios

### Test 1: Multiple Naps
1. Sleep 2h → Check: "2h today", -30% cap
2. Sleep 2h → Check: "4h today", -30% cap
3. Sleep 2h → Check: "6h today", normal cap ✅

### Test 2: Overnight + Nap
1. Sleep 7h → Check: "7h today", normal cap
2. Nap 1h → Check: "8h today", +10 bonus ✅

### Test 3: Daily Reset
1. Sleep 8h → Check: "8h today"
2. Wait until midnight
3. Check: "0h today" (reset) ✅

### Test 4: Quick Sessions
1. Sleep 30m → Check: "0h today" (rounds down)
2. Sleep 30m → Check: "1h today" (accumulated)
3. Sleep 30m → Check: "1h today" (accumulated)

## Future Enhancements

### 1. Sleep Quality
- Track interruptions
- Rate sleep quality
- Adjust energy based on quality

### 2. Sleep Schedule
- Detect regular sleep times
- Reward consistent schedule
- Penalize irregular sleep

### 3. Sleep Goals
- Set custom sleep goals (e.g., 7h)
- Track progress toward goal
- Celebrate goal achievements

### 4. Sleep Statistics
- Average sleep per day
- Best sleep streak
- Sleep patterns over time

### 5. Smart Reminders
- Bedtime reminder based on goal
- Wake-up reminder if sleeping too long
- Nap suggestions based on energy

## Conclusion

Accumulated sleep tracking provides a more realistic and fair system for managing energy in Quillby. Users can now take multiple sleep sessions throughout the day, and all hours count toward their daily total. This encourages healthy sleep habits and rewards consistent rest! 🐹💤✨
