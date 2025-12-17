# Exercise Tracking System Implementation

## 🏃 Exercise System Overview

### Timer-Based Exercise Tracking
The exercise system works like the sleep system with start/finish functionality and accumulated daily tracking.

## 🎯 Key Features

### 1. Exercise Button (Always Available)
- **Visibility**: Only appears when exercise habit is enabled in onboarding
- **States**: 
  - Normal: "🏃 Exercise" with daily progress (e.g., "45m today")
  - Active: "✅ Finish" with "Tap when done" message
- **Colors**: Green (normal) → Orange (active)

### 2. Timer Functionality
- **Start Exercise**: Tap button → Timer starts, hamster shows jumping animation
- **Finish Exercise**: Tap "Finish" → Duration calculated, rewards given
- **Minimum Duration**: 1 minute minimum for rewards
- **Daily Accumulation**: Multiple exercise sessions add up throughout the day

### 3. Smart Animation System
Uses the jumping GIF for all exercise types with different contextual meanings:
- **Walking**: Slow, steady jumps
- **Stretching**: Small, reaching jumps  
- **Cardio**: Fast, energetic jumps
- **Energizer**: Bouncy morning jumps

## 📐 Implementation Architecture

### Store Integration (state/store.ts)
```tsx
// New UserData fields
exerciseMinutes: number; // Accumulated exercise minutes today
lastExerciseReset: string; // Date when exercise was last reset

// New action
logExercise: (minutes: number) => void;
```

### Exercise Hook (hooks/useExerciseTracking.tsx)
```tsx
const {
  isExercising,           // Boolean: currently exercising
  exerciseDisplay,        // String: "45m today" 
  handleStartExercise,    // Function: start exercise timer
  handleFinishExercise,   // Function: finish and calculate rewards
  exerciseAnimation,      // String: 'exercising' | 'exercise-complete' | 'idle'
  exerciseMessage,        // String: feedback message
  exerciseMessageTimestamp, // Number: for message priority
} = useExerciseTracking(buddyName);
```

### Exercise Button Component (components/ExerciseButton.tsx)
```tsx
<ExerciseButton 
  isExercising={isExercising}
  exerciseDisplay={exerciseDisplay}
  onStartExercise={() => handleStartExercise('walk')}
  onFinishExercise={handleFinishExercise}
/>
```

## 🎮 Reward System

### Energy & Coins Calculation
```tsx
// Base rewards (per minute)
const baseEnergy = Math.min(minutes * 2, 30); // 2 energy/min, max 30
const coinReward = Math.min(minutes, 20);     // 1 coin/min, max 20

// Bonus for longer sessions (15+ minutes)
const bonusEnergy = minutes >= 15 ? 10 : 0;
```

### Reward Examples
- **5 min session**: +10 Energy, +5 Coins
- **10 min session**: +20 Energy, +10 Coins  
- **15 min session**: +30 Energy + 10 bonus = +40 Energy, +15 Coins
- **30 min session**: +30 Energy + 10 bonus = +40 Energy, +20 Coins (max)

## 🎨 UI States & Behavior

### Button States
```tsx
// Normal State (Green)
🏃 Exercise
45m today

// Active State (Orange) 
✅ Finish
Tap when done
```

### Button Visibility Logic
```tsx
{!isSleeping && !isExercising ? (
  // Show all buttons including exercise (if habit enabled)
  <>
    <WaterButton />
    <MealButton />
    {userData.enabledHabits?.includes('exercise') && <ExerciseButton />}
    <SleepButton />
  </>
) : isExercising ? (
  // Show only exercise button when exercising
  <ExerciseButton isExercising={true} />
) : isSleeping ? (
  // Show only sleep button when sleeping
  <SleepButton isSleeping={true} />
) : null}
```

## 🐹 Character Animation Integration

### Animation Priority System
```tsx
// Priority: sleep > exercise > meal > water
const currentAnimation = sleepAnimation !== 'idle' ? sleepAnimation : 
                        (exerciseAnimation !== 'idle' ? exerciseAnimation : 
                        (mealAnimation !== 'idle' ? mealAnimation : waterAnimation));
```

### Exercise Animations
- **exercising**: Shows jumping.gif during exercise session
- **exercise-complete**: Shows jumping.gif for 3 seconds after finishing
- **idle**: Returns to normal idle animation

## 📱 User Experience Flow

### Starting Exercise
1. User taps "🏃 Exercise" button
2. Button changes to "✅ Finish" (orange)
3. Hamster starts jumping animation
4. Speech bubble shows "🏃 Buddy is walking... Tap 'Finish' when done!"
5. Timer starts in background

### Finishing Exercise  
1. User taps "✅ Finish" button
2. Duration calculated automatically
3. Rewards calculated and applied
4. Hamster shows completion animation (3 seconds)
5. Speech bubble shows results: "💪 Walking 15m (45m today) Good workout! +30 Energy, +15 Coins"
6. Button returns to normal state with updated daily total

## 🔄 Daily Reset System

### Automatic Reset
- Resets at midnight (same as sleep/meals)
- `exerciseMinutes` resets to 0
- `lastExerciseReset` updates to current date
- Integrated with existing `resetDay()` function

### Accumulation Logic
```tsx
// Multiple sessions accumulate throughout day
Session 1: 15 minutes → Total: 15m today
Session 2: 10 minutes → Total: 25m today  
Session 3: 20 minutes → Total: 45m today
```

## ✅ Integration Benefits

### Habit System Integration
- Only appears when user enables exercise in onboarding
- Seamlessly integrates with existing habit tracking
- Consistent with other habit buttons (water, meals, sleep)

### Message Priority System
- Exercise messages integrate with existing timestamp-based priority
- Most recent message (exercise, sleep, meal, water) appears in speech bubble
- No conflicts with other system messages

### Animation System
- Reuses existing jumping.gif asset
- Integrates with existing animation priority system
- No new assets required

This exercise system provides a complete, timer-based exercise tracking experience that integrates seamlessly with the existing Quillby ecosystem!