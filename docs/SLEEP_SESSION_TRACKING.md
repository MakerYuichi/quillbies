# Sleep Session Tracking Implementation

## Overview
Replaced simple daily sleep hours with realistic sleep session tracking that handles actual sleep/wake cycles with start and end times.

## Key Changes

### 1. **New Data Structure**

**Before (Simple):**
```typescript
sleepHours: number; // Just accumulated hours per day
```

**After (Realistic):**
```typescript
sleepSessions: SleepSession[]; // Array of actual sleep sessions
activeSleepSession?: Partial<SleepSession>; // Currently active session

interface SleepSession {
  id: string;
  start: string; // ISO timestamp when sleep started
  end: string; // ISO timestamp when sleep ended  
  duration: number; // Duration in hours (calculated)
  date: string; // Date (YYYY-MM-DD) this sleep counts toward
}
```

### 2. **Smart Date Assignment**
Sleep sessions are assigned to the correct date based on when they started:
- **Sleep starts after 6 AM**: Counts toward that day
- **Sleep starts before 6 AM**: Counts toward the previous day

**Example:**
```typescript
// Sleep from 11 PM Dec 25 → 7 AM Dec 26
// Counts toward Dec 25 (started before 6 AM rule)

// Nap from 2 PM Dec 26 → 4 PM Dec 26  
// Counts toward Dec 26 (started after 6 AM)
```

### 3. **New Store Functions**

**`startSleep()`**
- Creates new sleep session with start timestamp
- Returns session ID for tracking
- Stores as `activeSleepSession` until completed

**`endSleep(sessionId)`**
- Completes the sleep session
- Calculates duration automatically
- Assigns to correct date
- Updates energy cap based on new total sleep
- Adds bonus energy for 8+ hours total sleep

**`getTodaysSleepHours()`**
- Calculates total sleep for today from all sessions
- Used for energy cap calculations

### 4. **Energy Cap Calculation**
Updated `calculateMaxEnergyCap()` to use session-based sleep:

```typescript
// Before
if (userData.sleepHours < 6) {
  cap -= (BASE_MAX_ENERGY * SLEEP_PENALTY) / 100;
}

// After  
const todaysSleepHours = getTodaysSleepHours(userData.sleepSessions || []);
if (todaysSleepHours < 6) {
  cap -= (BASE_MAX_ENERGY * SLEEP_PENALTY) / 100;
}
```

### 5. **New Sleep Button Component**
Created `SleepButton.tsx` with:
- **Start Sleep**: Confirmation modal → begins tracking
- **End Sleep**: Confirmation alert → completes session
- **Real-time Display**: Shows current session duration or daily total
- **Visual States**: Different emoji for sleeping vs awake

## User Experience Flow

### **Starting Sleep**
1. User taps "Sleep" button (🛏️)
2. Confirmation modal: "Going to Sleep?"
3. Shows current daily sleep total
4. User confirms → Sleep session starts
5. Button changes to "Sleeping..." (😴)
6. Shows live duration: "2.3h so far"

### **Ending Sleep**
1. User taps "Sleeping..." button (😴)
2. Confirmation alert: "Ready to wake up?"
3. User confirms → Sleep session ends
4. Calculates duration and updates energy cap
5. Button returns to "Sleep" (🛏️)
6. Shows daily total: "7.2h today"

## Benefits Over Simple Tracking

### **1. Realistic Sleep Patterns**
- Handles overnight sleep (11 PM → 7 AM)
- Supports multiple sleep sessions (naps)
- Accounts for irregular sleep schedules
- Proper date assignment for shift workers

### **2. Accurate Energy Calculations**
- Real sleep duration vs estimated
- Handles accumulated sleep throughout day
- Proper bonus energy for good total sleep
- No more guessing sleep hours

### **3. Better User Engagement**
- Active tracking feels more involved
- Real-time feedback during sleep
- Clear visual states (sleeping vs awake)
- Confirmation dialogs prevent accidents

### **4. Data Integrity**
- Precise timestamps for analytics
- Session-based data for insights
- No manual hour entry errors
- Automatic duration calculation

## Example Usage Scenarios

### **Scenario 1: Normal Night Sleep**
```
10:30 PM: User taps "Sleep" → Session starts
7:00 AM: User taps "Sleeping..." → Session ends
Result: 8.5h sleep → Normal energy cap + 10 bonus energy
```

### **Scenario 2: Short Sleep + Nap**
```
12:00 AM: Sleep session starts
5:30 AM: Sleep session ends (5.5h)
2:00 PM: Nap session starts  
3:30 PM: Nap session ends (1.5h)
Total: 7h sleep → Normal energy cap
```

### **Scenario 3: Shift Worker**
```
2:00 AM: Sleep session starts (counts toward previous day)
10:00 AM: Sleep session ends (8h)
Result: Previous day gets 8h sleep credit
```

## Technical Implementation

### **Files Modified:**
- `quillby-app/app/core/types.ts` - Added SleepSession interface
- `quillby-app/app/core/engine.ts` - Added getTodaysSleepHours()
- `quillby-app/app/state/store.ts` - Replaced logSleep with startSleep/endSleep
- `quillby-app/app/components/SleepButton.tsx` - New sleep tracking UI

### **Data Migration:**
Existing users with `sleepHours` will need migration:
```typescript
// Convert old sleepHours to sleepSessions array
if (userData.sleepHours && !userData.sleepSessions) {
  userData.sleepSessions = [];
  // Old data is lost, but new tracking begins fresh
}
```

### **Persistence:**
Sleep sessions are automatically persisted via Zustand middleware:
- Sessions stored in AsyncStorage
- Survives app restarts
- Active sessions resume properly

## Future Enhancements

### **Sleep Analytics**
- Weekly sleep patterns
- Average sleep duration
- Sleep quality scoring
- Bedtime consistency tracking

### **Smart Notifications**
- Bedtime reminders based on patterns
- Wake-up optimization (light sleep phases)
- Sleep debt calculations
- Weekly sleep reports

### **Integration Features**
- Health app sync (iOS/Android)
- Wearable device integration
- Smart alarm functionality
- Sleep environment tracking

## Testing Checklist

- [ ] Start sleep session creates activeSleepSession
- [ ] End sleep session calculates correct duration
- [ ] Sleep before 6 AM assigns to previous day
- [ ] Sleep after 6 AM assigns to current day
- [ ] Multiple sessions accumulate correctly
- [ ] Energy cap updates based on total sleep
- [ ] Bonus energy awarded for 8+ hours
- [ ] Sleep button shows correct states
- [ ] Confirmation dialogs work properly
- [ ] Data persists across app restarts
- [ ] Active sessions resume after restart
- [ ] Daily reset doesn't affect sleep sessions

This implementation provides a much more realistic and engaging sleep tracking system that accurately reflects how people actually sleep.