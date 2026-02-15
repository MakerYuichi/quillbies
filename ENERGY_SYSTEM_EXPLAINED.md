# Energy System - Complete Explanation

## Overview
The energy system in Quillby has two components:
1. **Current Energy** - Your available energy (0-100)
2. **Max Energy Cap** - The maximum energy you can have (50-100)

## 🔋 When Energy INCREASES

### 1. Natural Regeneration (Every 2 Minutes)
- **Rate**: +1 energy per 2 minutes
- **When**: Only when app is open and energy < max cap
- **Location**: `app/state/slices/userSlice.ts` - `updateEnergy()` function
- **Trigger**: Automatic interval every 30 seconds (checks minutes elapsed)

```typescript
// Natural energy regeneration (1 energy per 2 minutes when not at cap)
if (newEnergy < newMaxCap) {
  const energyToAdd = Math.floor(minutesElapsed / 2);
  newEnergy = Math.min(newMaxCap, newEnergy + energyToAdd);
}
```

### 2. After Completing Focus Session
- **Amount**: Based on focus score and distractions
  - Perfect (0 distractions): Focus Score × 0.3
  - Some distractions (1-2): Focus Score × 0.2
  - Many distractions (3+): Focus Score × 0.1
- **Example**: 100 focus score with 0 distractions = +30 energy
- **Location**: `app/core/engine.ts` - `calculateSessionRewards()`

### 3. After Logging Habits
- **Water**: +2 energy per glass (max 8 glasses)
- **Meals**: +5 energy per meal
- **Exercise**: +10-30 energy based on duration
- **Sleep**: +20-50 energy based on hours slept
- **Location**: `app/state/slices/habitsSlice.ts`

### 4. After Cleaning Room
- **Amount**: 5 energy per mess point removed
- **Example**: Clean 4 mess points = +20 energy
- **Location**: `app/state/slices/habitsSlice.ts` - `cleanRoom()`

## ⚡ When Energy DECREASES

### 1. Starting a Focus Session
- **Base Cost**: 20 energy
- **Reduced by preparation**:
  - Ate breakfast: -5 energy cost
  - Exercised today: -5 energy cost
  - Drank 4+ glasses water: -5 energy cost
  - Slept 7+ hours: -5 energy cost
- **Best case**: 0 energy cost (with all 4 preparations)
- **Location**: `app/core/engine.ts` - `calculateFocusEnergyCost()`

```typescript
// Example calculations:
// No preparation: 20 energy cost
// Breakfast only: 15 energy cost
// Breakfast + water: 10 energy cost
// All 4 preparations: 0 energy cost
```

### 2. Daily Breakfast Penalty (11 AM)
- **Amount**: -10 energy
- **When**: If you didn't eat breakfast by 11 AM
- **Frequency**: Once per day
- **Location**: `app/core/engine.ts` - `shouldApplyDailyDrains()`

### 3. Daily Mess Penalty (6 PM)
- **Amount**: Based on mess points
  - 6-10 mess: -5 energy/day
  - 11-15 mess: -10 energy/day
  - 16-20 mess: -15 energy/day
  - 21+ mess: -20 energy/day
- **When**: Once per day at 6 PM
- **Location**: `app/core/engine.ts` - `calculateMessEnergyDrain()`

### 4. During Focus Session (If Distracted)
- **Amount**: Based on preparation level
  - Poor prep (0-1 habits): -2 energy/minute away
  - Okay prep (2 habits): -1.5 energy/minute away
  - Good prep (3 habits): -1 energy/minute away
  - Perfect prep (4 habits): -0.5 energy/minute away
- **Location**: `app/core/engine.ts` - `calculateDistractionDrain()`

## 🎯 Max Energy Cap System

### How Max Cap Works
The max energy cap determines the highest energy you can have. It starts at 100 and decreases based on mess points.

### Max Cap Formula
```typescript
messEnergyCapPenalty = Math.floor(messPoints / 3) × 5
maxEnergyCap = Math.max(50, 100 - messEnergyCapPenalty)
```

### Max Cap Examples

| Mess Points | Penalty Calculation | Max Energy Cap |
|-------------|---------------------|----------------|
| 0-2         | 0 × 5 = 0          | 100            |
| 3-5         | 1 × 5 = 5          | 95             |
| 6-8         | 2 × 5 = 10         | 90             |
| 9-11        | 3 × 5 = 15         | 85             |
| 12-14       | 4 × 5 = 20         | 80             |
| 15-17       | 5 × 5 = 25         | 75             |
| 18-20       | 6 × 5 = 30         | 70             |
| 21-23       | 7 × 5 = 35         | 65             |
| 24-26       | 8 × 5 = 40         | 60             |
| 27-29       | 9 × 5 = 45         | 55             |
| 30+         | 10 × 5 = 50        | 50 (minimum)   |

### When Max Cap Decreases
- **Trigger**: When mess points increase
- **Calculation**: Every 3 mess points = -5 max energy cap
- **Minimum**: 50 (never goes below 50)
- **Location**: `app/state/slices/userSlice.ts` - `updateEnergy()`

### When Max Cap Increases
- **Trigger**: When mess points decrease (by completing focus sessions or cleaning)
- **Calculation**: Every 3 mess points removed = +5 max energy cap
- **Maximum**: 100 (never goes above 100)

## 📊 Mess Points System

### How Mess Points Increase
1. **Missing Study Checkpoints**: +1 mess point per missed checkpoint
2. **Skipping Tasks**: +1 mess point per skipped task
3. **Behind Schedule**: Accumulates when falling behind study goals

### How Mess Points Decrease
1. **Completing Focus Sessions**: -2 mess points per session
2. **Cleaning Room**: Variable amount (user choice)

### Mess Point Thresholds

| Mess Points | Room State | Energy Cap | Daily Energy Drain |
|-------------|------------|------------|-------------------|
| 0-3         | Clean      | 100-95     | 0                 |
| 4-7         | Messy      | 95-85      | 0                 |
| 8-10        | Dirty      | 85-80      | 0                 |
| 11-15       | Disaster   | 80-75      | -10/day           |
| 16-20       | Very Bad   | 75-70      | -15/day           |
| 21+         | Critical   | 70-50      | -20/day           |

## 🔄 Energy Update Cycle

### Update Frequency
- **Check**: Every 30 seconds (when app is open)
- **Update**: Only if 1+ minutes have passed
- **Sync**: Only if energy changed by 5+ or max cap changed

### Update Process
1. Calculate minutes elapsed since last update
2. Calculate mess penalty on max cap
3. Add natural regeneration (if below cap)
4. Cap energy at max capacity
5. Update state if changed
6. Sync to database if significant change

## 💡 Energy Management Tips

### To Maximize Energy
1. ✅ Complete all 4 daily preparations (breakfast, water, exercise, sleep)
2. ✅ Keep mess points low (complete focus sessions regularly)
3. ✅ Don't miss study checkpoints
4. ✅ Clean room when mess gets high

### To Minimize Energy Loss
1. ✅ Eat breakfast before 11 AM
2. ✅ Stay focused during sessions (avoid distractions)
3. ✅ Complete focus sessions to remove mess
4. ✅ Keep mess below 6 points (no daily drain)

### Energy Efficiency
- **Best prep**: All 4 habits = 0 energy cost to start session
- **No prep**: 20 energy cost to start session
- **Difference**: 20 energy saved with good preparation!

## 📍 Code Locations

### Energy Increase
- Natural regeneration: `app/state/slices/userSlice.ts` line 124-127
- Session rewards: `app/core/engine.ts` line 270-295
- Habit rewards: `app/state/slices/habitsSlice.ts`

### Energy Decrease
- Session start cost: `app/core/engine.ts` line 165-177
- Daily penalties: `app/core/engine.ts` line 130-162
- Distraction drain: `app/core/engine.ts` line 75-95

### Max Energy Cap
- Calculation: `app/state/slices/userSlice.ts` line 120-122
- Formula: `Math.max(50, 100 - Math.floor(messPoints / 3) * 5)`

## 🎮 Example Scenarios

### Scenario 1: Perfect Day
- Start: 100 energy, 0 mess, 100 max cap
- Breakfast + water + exercise + sleep ✅
- Start session: 0 energy cost (100 energy remaining)
- Complete 30-min session: +15 energy, -2 mess
- End: 100 energy, 0 mess, 100 max cap

### Scenario 2: Messy Room
- Start: 70 energy, 15 mess, 75 max cap
- No breakfast ❌
- 11 AM penalty: -10 energy (60 energy)
- 6 PM mess penalty: -10 energy (50 energy)
- Complete session: +10 energy, -2 mess (60 energy, 13 mess)
- Max cap increases: 75 → 80 (mess decreased)

### Scenario 3: High Mess Recovery
- Start: 50 energy, 30 mess, 50 max cap
- Complete 3 focus sessions: -6 mess, +30 energy
- New state: 80 energy, 24 mess, 60 max cap
- Clean room (10 mess): +50 energy, +50 max cap
- Final: 100 energy, 14 mess, 85 max cap

## Summary

### Energy Increases When:
✅ Time passes (natural regeneration)
✅ Complete focus sessions
✅ Log healthy habits
✅ Clean room

### Energy Decreases When:
❌ Start focus session (20 energy base)
❌ Skip breakfast (11 AM penalty)
❌ High mess points (6 PM penalty)
❌ Get distracted during session

### Max Cap Decreases When:
❌ Mess points increase (every 3 mess = -5 cap)

### Max Cap Increases When:
✅ Mess points decrease (every 3 mess removed = +5 cap)

The key to maintaining high energy is keeping mess points low and completing daily habits!
