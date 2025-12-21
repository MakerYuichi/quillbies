# 🛏️ Sleep & Energy System - How It Works

## Problem Fixed
**Before:** Clicking "Wake Up" immediately changed energy, which was bad because:
- Users could click it for fun and lose energy
- Short naps would reset energy to low values
- Energy would change unpredictably

**After:** Sleep tracking is separate from energy management
- Clicking "Wake Up" only records the sleep session
- Energy is ONLY set during the daily reset at midnight
- Users can track sleep without affecting their current energy

---

## 📊 How Sleep Tracking Works

### 1. Starting Sleep
```typescript
User clicks "Sleep" button
  ↓
startSleep() creates a new session
  ↓
Stores: {
  id: 'sleep-1234567890',
  start: '2024-12-20T23:30:00.000Z',
  // end and duration will be set later
}
  ↓
Button changes to "Sleeping..." with timer
```

### 2. Ending Sleep
```typescript
User clicks "Wake Up" button
  ↓
endSleep(sessionId) completes the session
  ↓
Calculates:
- duration = (end time - start time) in hours
- date = which day this sleep counts toward
  ↓
Stores completed session: {
  id: 'sleep-1234567890',
  start: '2024-12-20T23:30:00.000Z',
  end: '2024-12-21T07:00:00.000Z',
  duration: 7.5,
  date: '2024-12-20'
}
  ↓
Awards Q-Coins based on total sleep today:
- 8+ hours: +25 coins
- 7-8 hours: +20 coins
- 6-7 hours: +10 coins
  ↓
⚠️ ENERGY IS NOT CHANGED!
Current energy stays the same
```

### 3. Daily Reset (Midnight)
```typescript
Automatic check every minute
  ↓
If current time is 00:00 (midnight)
  ↓
resetDay() is called
  ↓
Calculates total sleep for today:
todaysSleep = sum of all sleep sessions with date = today
  ↓
Sets morning energy based on total sleep:
if (todaysSleep >= 7) energy = 100
if (todaysSleep >= 5) energy = 85
if (todaysSleep >= 4) energy = 50
else energy = 30
  ↓
Resets daily counters:
- ateBreakfast = false
- waterGlasses = 0
- mealsLogged = 0
- exerciseMinutes = 0
- studyMinutesToday = 0
  ↓
Mess points persist (no automatic decay)
```

---

## 🎯 Key Benefits

### For Users
✅ **Safe Sleep Tracking**: Can click sleep/wake up without fear of losing energy
✅ **Accurate Totals**: Multiple sleep sessions accumulate correctly
✅ **Predictable Energy**: Energy only changes at midnight based on total sleep
✅ **Immediate Rewards**: Still get Q-coins immediately when waking up

### For Gameplay
✅ **No Exploits**: Can't game the system by clicking sleep repeatedly
✅ **Realistic**: Energy reflects actual sleep quality from the previous night
✅ **Forgiving**: Short naps don't penalize energy
✅ **Motivating**: Good sleep habits lead to high morning energy

---

## 📈 Sleep Quality → Morning Energy

### Excellent Sleep (7+ hours)
```
Total Sleep: 8.5 hours
Morning Energy: 100/100 ⭐
Message: "Great sleep! Feeling refreshed!"
Coins: +25
```

### Good Sleep (5-7 hours)
```
Total Sleep: 6.5 hours
Morning Energy: 85/100 ✓
Message: "Good rest! Ready to focus."
Coins: +10
```

### Poor Sleep (4-5 hours)
```
Total Sleep: 4.5 hours
Morning Energy: 50/100 ⚠️
Message: "Not enough sleep. Energy reduced."
Coins: +0
```

### Very Poor Sleep (<4 hours)
```
Total Sleep: 3 hours
Morning Energy: 30/100 ❌
Message: "Exhausted! Get more sleep tonight."
Coins: +0
```

---

## 🔄 Complete Daily Cycle Example

### Day 1 - Evening
```
8:00 PM - User has 65 energy
11:00 PM - User clicks "Sleep"
  → Sleep session starts
  → Energy stays at 65
```

### Day 1 - Night
```
11:00 PM - 7:00 AM (8 hours sleeping)
  → Energy still at 65 (unchanged)
  → Sleep session recording duration
```

### Day 2 - Morning
```
7:00 AM - User clicks "Wake Up"
  → Sleep session completed: 8 hours
  → Awards +25 coins
  → Energy STILL at 65 (not changed yet!)
  
7:30 AM - User continues using app
  → Energy still 65
  → Can drink water, eat breakfast, etc.
```

### Day 2 - Midnight
```
12:00 AM (00:00) - Automatic daily reset
  → Calculates total sleep: 8 hours
  → Sets morning energy: 100
  → Resets daily counters
  → User wakes up tomorrow with 100 energy!
```

---

## 🛠️ Technical Implementation

### endSleep() Function
```typescript
endSleep: (sessionId: string) => {
  // 1. Find active session
  const activeSession = userData.activeSleepSession;
  
  // 2. Calculate duration
  const duration = (now - startTime) / (1000 * 60 * 60); // hours
  
  // 3. Determine date (before 6 AM = previous day)
  const sleepDate = startTime.getHours() < 6 
    ? previousDay 
    : currentDay;
  
  // 4. Save completed session
  const completedSession = {
    id, start, end, duration, date: sleepDate
  };
  
  // 5. Calculate total sleep for today
  const todaysSleep = getTodaysSleepHours(updatedSessions);
  
  // 6. Award coins based on total sleep
  if (todaysSleep >= 8) sleepCoins = 25;
  else if (todaysSleep >= 7) sleepCoins = 20;
  else if (todaysSleep >= 6) sleepCoins = 10;
  
  // 7. Update state
  set({
    userData: {
      ...userData,
      sleepSessions: updatedSessions,
      qCoins: userData.qCoins + sleepCoins,
      // ⚠️ ENERGY IS NOT CHANGED HERE!
      activeSleepSession: undefined
    }
  });
}
```

### resetDay() Function
```typescript
resetDay: () => {
  // 1. Calculate total sleep for today
  const todaysSleep = getTodaysSleepHours(userData.sleepSessions);
  
  // 2. Calculate morning energy based on sleep quality
  const morningEnergy = calculateMorningEnergy(todaysSleep);
  // if (todaysSleep >= 7) return 100
  // if (todaysSleep >= 5) return 85
  // if (todaysSleep >= 4) return 50
  // else return 30
  
  // 3. Set energy and reset daily counters
  set({
    userData: {
      ...userData,
      energy: morningEnergy, // ✅ ENERGY SET HERE!
      ateBreakfast: false,
      waterGlasses: 0,
      mealsLogged: 0,
      exerciseMinutes: 0,
      studyMinutesToday: 0,
      missedCheckpoints: 0
    }
  });
}
```

### Automatic Daily Reset (index.tsx)
```typescript
useEffect(() => {
  const dailyResetInterval = setInterval(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if it's midnight (00:00)
    if (currentHour === 0 && currentMinute === 0) {
      console.log('[Daily] Midnight reached - applying daily reset');
      const { resetDay } = useQuillbyStore.getState();
      resetDay();
    }
  }, 60000); // Check every minute
  
  return () => clearInterval(dailyResetInterval);
}, []);
```

---

## 🎮 User Experience Flow

### Scenario 1: Normal Night Sleep
```
User Action: Click "Sleep" at 11 PM
Result: Session starts, energy unchanged (stays at current value)

User Action: Click "Wake Up" at 7 AM
Result: 
- Session saved (8 hours)
- +25 coins awarded
- Energy unchanged (still at current value)

Automatic: Midnight reset
Result:
- Energy set to 100 (based on 8 hours sleep)
- Daily counters reset
```

### Scenario 2: Multiple Naps
```
User Action: Click "Sleep" at 2 PM
Result: Session starts, energy unchanged

User Action: Click "Wake Up" at 3 PM
Result:
- Session saved (1 hour)
- +0 coins (not enough sleep)
- Energy unchanged

User Action: Click "Sleep" at 11 PM
Result: Session starts, energy unchanged

User Action: Click "Wake Up" at 7 AM
Result:
- Session saved (8 hours)
- Total today: 9 hours
- +25 coins awarded
- Energy unchanged

Automatic: Midnight reset
Result:
- Energy set to 100 (based on 9 hours total)
```

### Scenario 3: Clicking for Fun
```
User Action: Click "Sleep" at 3 PM
Result: Session starts, energy unchanged (85)

User Action: Click "Wake Up" 10 seconds later
Result:
- Session saved (0.003 hours)
- +0 coins
- Energy unchanged (still 85) ✅ NO PENALTY!

User continues using app normally
Energy stays at 85 until midnight reset
```

---

## 📝 Summary

**Sleep Tracking = Recording sleep sessions**
- Tracks when you sleep and wake up
- Calculates total sleep for the day
- Awards coins immediately

**Energy Management = Daily reset based on total sleep**
- Energy ONLY changes at midnight
- Based on total accumulated sleep for the day
- Predictable and fair

**Result:**
- Users can track sleep without fear
- Energy reflects actual sleep quality
- No exploits or accidental penalties
- Realistic and engaging system

---

**Implementation Date**: December 2024  
**Status**: ✅ Fixed and Working
