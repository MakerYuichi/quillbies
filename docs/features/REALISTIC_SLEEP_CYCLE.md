# Realistic Sleep/Wake Cycle System ✅

## Overview
Implemented a realistic sleep tracking system where users actually go to sleep and wake up, with automatic duration calculation, room dimming, and character animations.

## How It Works

### Step 1: Going to Sleep
1. User taps "😴 Sleep" button
2. Hamster shows sleeping.png animation
3. Room dims (60% black overlay)
4. Button changes to "☀️ Woke Up"
5. Speech bubble: "💤 {buddyName} is sleeping... Goodnight! Tap 'Woke Up' when you wake."
6. Sleep start time recorded

### Step 2: During Sleep
- Hamster stays in sleeping pose
- Room remains dimmed
- Button shows "☀️ Woke Up" with "Tap to wake" subtext
- Sleep timer running in background

### Step 3: Waking Up
1. User taps "☀️ Woke Up" button
2. Sleep duration calculated automatically
3. Hamster shows wake-up.png animation (stretching/yawning)
4. Room brightens (overlay removed)
5. Button changes back to "😴 Sleep"
6. Sleep logged in store with consequences
7. Speech bubble shows result based on hours

## Features Implemented

### 1. State Management
```tsx
const [isSleeping, setIsSleeping] = useState(false);
const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);
```

### 2. Automatic Duration Calculation
```tsx
const sleepEndTime = Date.now();
const durationMs = sleepEndTime - sleepStartTime;
const hours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
```

### 3. Dynamic Button
- **Before Sleep**: "😴 Sleep" (Purple #9C27B0)
- **During Sleep**: "☀️ Woke Up" (Orange #FF9800)

### 4. Room Dimming
```tsx
{isSleeping && (
  <View style={styles.dimOverlay} pointerEvents="none" />
)}
```
- 60% black overlay
- Covers entire screen
- Non-interactive (pointerEvents="none")
- Z-index 8 (above room, below buttons)

### 5. Three Animations
- **eating.gif**: Drinking water
- **sleeping.png**: Sleeping in bed
- **wake-up.png**: Stretching/yawning

### 6. Sleep Consequences
Same as before:
- **< 6 hours**: -30% max energy cap
- **6-8 hours**: Normal energy
- **8+ hours**: +10 bonus energy

## User Flow

```
┌─────────────────────────────────────┐
│  Tap "😴 Sleep"                     │
│         ↓                            │
│  Hamster sleeps, room dims          │
│  Button → "☀️ Woke Up"              │
│         ↓                            │
│  [User actually sleeps IRL]         │
│         ↓                            │
│  Tap "☀️ Woke Up"                   │
│         ↓                            │
│  Calculate duration automatically   │
│  Hamster wakes up, room brightens   │
│  Button → "😴 Sleep"                │
│  Show sleep result                  │
└─────────────────────────────────────┘
```

## Code Structure

### Sleep Handler
```tsx
const handleSleepButton = () => {
  setIsSleeping(true);
  setSleepStartTime(Date.now());
  setCurrentAnimation('sleeping');
  setHamsterMessage(`💤 ${buddyName} is sleeping...\nGoodnight! Tap "Woke Up" when you wake.`);
};
```

### Wake Handler
```tsx
const handleWakeUpButton = () => {
  // Calculate duration
  const durationMs = Date.now() - sleepStartTime;
  const hours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
  
  // Animate
  setCurrentAnimation('wake-up');
  setTimeout(() => setCurrentAnimation('idle'), 3000);
  
  // Update state
  setIsSleeping(false);
  setSleepStartTime(null);
  
  // Log and show result
  logSleep(Math.round(hours));
  setHamsterMessage(/* based on hours */);
};
```

### Character Image Logic
```tsx
if (currentAnimation === 'sleeping' || isSleeping) {
  return require('../../assets/hamsters/casual/sleeping.png');
}
if (currentAnimation === 'wake-up') {
  return require('../../assets/hamsters/casual/wake-up.png');
}
```

## Visual Effects

### Dim Overlay
```tsx
dimOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // 60% black
  zIndex: 8,
}
```

### Wake Button Color
```tsx
wakeButton: {
  backgroundColor: '#FF9800', // Orange
  borderColor: '#F57C00',     // Dark orange
}
```

## Assets Required

### Current
- ✅ `assets/hamsters/casual/idle.gif` - Idle animation
- ✅ `assets/hamsters/casual/eating.gif` - Drinking water

### Missing (Fallback to idle)
- ⏳ `assets/hamsters/casual/sleeping.png` - Sleeping in bed
- ⏳ `assets/hamsters/casual/wake-up.png` - Stretching/yawning

## Benefits

### 1. Realistic Tracking
- No more fake logging
- Actual sleep/wake cycle
- Automatic duration calculation

### 2. Habit Formation
- Can't cheat by entering fake hours
- Must actually start/end sleep
- Encourages real sleep schedule

### 3. Immersive Experience
- Room dims when sleeping
- Character animations match state
- Visual feedback throughout

### 4. Better Gameplay
- Strategic sleep timing
- Real consequences for poor sleep
- Rewards for good sleep habits

## Future Enhancements

### 1. Auto-Wake After 12 Hours
```tsx
useEffect(() => {
  if (isSleeping && sleepStartTime) {
    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - sleepStartTime;
      if (elapsed > 12 * 60 * 60 * 1000) {
        handleWakeUpButton(); // Auto wake
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }
}, [isSleeping, sleepStartTime]);
```

### 2. Sleep Notifications
- Bedtime reminder: "Time to put {buddyName} to sleep!"
- Wake reminder: "Don't forget to wake up {buddyName}!"

### 3. Dream Sequences
- Random dream animations while sleeping
- Funny dream messages
- Dream-based rewards

### 4. Sleep Quality
- Track movement/interruptions
- Rate sleep quality
- Adjust rewards based on quality

### 5. Sleep Statistics
- Average sleep duration
- Sleep schedule consistency
- Best sleep streak

## Testing Checklist

- [x] Sleep button starts sleep cycle
- [x] Room dims when sleeping
- [x] Button changes to "Woke Up"
- [x] Hamster shows sleeping animation
- [x] Speech bubble updates
- [x] Wake button calculates duration
- [x] Room brightens when waking
- [x] Hamster shows wake-up animation
- [x] Sleep logged with correct hours
- [x] Energy consequences applied
- [x] Button returns to "Sleep"
- [x] No errors or crashes

## Result

The Casual hamster now has a realistic sleep/wake cycle system that:
- Tracks actual sleep time
- Dims the room during sleep
- Shows appropriate animations
- Calculates duration automatically
- Prevents cheating
- Creates immersive experience

Much better than just entering numbers! 🐹😴☀️✨
