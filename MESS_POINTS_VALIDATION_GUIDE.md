# 🧹 Mess Points Validation Guide

## Overview
Mess points represent the cleanliness of your virtual room and create visual consequences for your study habits. This guide helps you verify that mess points are calculating correctly.

## 📊 How Mess Points Work

### Calculation Rules
- **Skip Task**: +1 mess point per skipped task
- **Complete Session**: -2 mess points per completed study session  
- **Minimum**: Mess points cannot go below 0
- **Daily Persistence**: Mess points carry over between days (they don't reset)

### Energy Drain (Daily Penalty)
- **0-5 points**: Clean room → No energy drain
- **6-10 points**: Light mess → -5 energy per day
- **11-15 points**: Medium mess → -10 energy per day  
- **16-20 points**: Medium-high mess → -15 energy per day
- **21+ points**: Heavy mess → -20 energy per day

### Room Visual States
- **0-5 points**: Clean room (green background, clean walls/floor)
- **6-10 points**: Light mess (yellow background, messy1 assets)
- **11-20 points**: Medium mess (orange background, messy2 assets)
- **21+ points**: Heavy mess (red background, messy3 assets)

## 🔍 How to Test Mess Points

### 1. Check Current State
1. Open the **Stats tab** in your app
2. Look for "Mess Points: X.X" value
3. Note the room status (Clean/Light Mess/Medium Mess/Heavy Mess)
4. Check your current energy level

### 2. Test Mess Point Increases
1. Go to **Focus tab**
2. Start a study session
3. Immediately tap **"Skip Task"** button
4. Return to **Stats tab**
5. **Expected**: Mess points should increase by +1

### 3. Test Mess Point Decreases  
1. Start a study session
2. Study for at least 1 minute (build some focus score)
3. Complete the session normally
4. Check **Stats tab**
5. **Expected**: Mess points should decrease by -2

### 4. Test Visual Changes
1. Note your current mess points
2. Skip enough tasks to cross thresholds (6, 11, 21 points)
3. Return to **Home tab**
4. **Expected**: Room background should change color and show different wall/floor assets

### 5. Test Energy Drain
1. Note current energy and mess points
2. Force a daily reset (change device date or wait for midnight)
3. **Expected**: Energy should decrease based on mess level

## 🧮 Quick Calculation Examples

```
Starting: 0 mess points
Skip 3 tasks: 0 + 3 = 3 points (Clean, no energy drain)
Complete 1 session: 3 - 2 = 1 point (Clean, no energy drain)
Skip 8 more tasks: 1 + 8 = 9 points (Light Mess, -5 energy/day)
Complete 2 sessions: 9 - 4 = 5 points (Clean, no energy drain)
```

## 🐛 Common Issues & Debugging

### Issue: Mess points not updating after skip
**Check:**
- Console logs for "[Study] Missed checkpoint" messages
- Verify `skipTask()` function is being called
- Check if store state is updating properly

### Issue: Mess points not decreasing after session
**Check:**
- Console logs for session completion messages
- Verify `calculateSessionRewards()` returns `messPointsRemoved: 2`
- Check if `completeSession()` is being called

### Issue: Energy not draining daily
**Check:**
- Console logs for "[Daily] Mess penalty" messages
- Verify `shouldApplyDailyDrains()` detects new day
- Check if `calculateMessEnergyDrain()` returns correct value

### Issue: Room visual not matching mess level
**Check:**
- Verify mess points are passed to `RoomLayers` component
- Check if correct wall/floor assets exist in `/assets/rooms/mess/`
- Verify `getRoomWall()` and `getRoomFloor()` functions

## 📝 Console Logs to Watch

When testing, look for these key console messages:

```
[Study] Missed checkpoint X - Yh behind = +Z mess (A → B)
[Session] Completed - Focus: X, Rewards: Y coins, -2 mess
[Daily] Mess penalty: -X energy (Y mess points)
[Cleaning] Reduced mess by X points (Y → Z)
```

## 🧪 Test Scripts

Run these test scripts to validate calculations:

```bash
# Test mess point calculations
node test-mess-points.js

# Get debugging checklist
node debug-mess-points.js
```

## ✅ Validation Checklist

- [ ] Skip task increases mess by +1
- [ ] Complete session decreases mess by -2  
- [ ] Mess points cannot go below 0
- [ ] Energy drains correctly based on mess level
- [ ] Room visuals change at correct thresholds (6, 11, 21 points)
- [ ] Console logs show correct calculations
- [ ] Stats tab displays accurate mess points
- [ ] Daily energy drain applies once per day

## 🔧 Implementation Files

Key files involved in mess points:

- `app/core/engine.ts` - Calculation functions
- `app/state/store.ts` - State management  
- `app/components/room/RoomLayers.tsx` - Visual effects
- `app/(tabs)/stats.tsx` - Display mess points
- `lib/syncManager.ts` - Database sync

The mess points system is working correctly if all tests pass and the visual/energy consequences match the calculated values.