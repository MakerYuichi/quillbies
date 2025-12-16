# Smart Distraction System - Testing Guide

## What Changed

The distraction system is now **forgiving** instead of harsh. Users get grace periods and warnings before penalties are applied.

## How It Works

### 1. Grace Period (30 seconds)
- When you leave the app for the **first time**, a 30-second grace period starts
- **Timer pauses** during grace period
- If you return within 30 seconds: **No penalty, no warning**
- Blue indicator shows: "⏱️ Grace Period Active"

### 2. Warning System (3 warnings)
- If you're away **longer than 30 seconds**, you get a **warning**
- You can get up to **3 warnings** before any penalty
- Yellow indicator shows: "⚠️ Warning X/3"
- Each warning resets the grace period for next distraction

### 3. Penalty (After 3rd warning)
- **Only after 3 warnings** do you get a penalty
- Penalty: Focus score drains based on time away
- Red indicator shows: "🚨 Penalties Applied"
- Warnings reset to 0 after penalty

## Visual Indicators

| State | Color | Message |
|-------|-------|---------|
| Grace Period | Blue | "⏱️ Grace Period Active - Return within 30s" |
| Warning 1-2 | Yellow | "⚠️ Warning X/3 - Y warnings left" |
| Warning 3 | Yellow | "⚠️ Warning 3/3 - Next distraction will drain focus!" |
| Penalty | Red | "🚨 Penalties Applied: X" |

## Testing Scenarios

### Scenario 1: Quick Check (No Penalty)
1. Start a study session
2. Leave the app (switch to another app)
3. Return **within 30 seconds**
4. ✅ **Expected**: No warning, no penalty, timer continues

### Scenario 2: First Long Distraction (Warning 1)
1. Start a study session
2. Leave the app
3. Wait **more than 30 seconds**
4. Return to app
5. ✅ **Expected**: Yellow warning "⚠️ Warning 1/3"

### Scenario 3: Multiple Quick Checks (No Penalty)
1. Start a study session
2. Leave and return within 30s (repeat 5 times)
3. ✅ **Expected**: No warnings, no penalties

### Scenario 4: Three Warnings Then Penalty
1. Start a study session
2. Leave for 40 seconds → Return (Warning 1)
3. Leave for 40 seconds → Return (Warning 2)
4. Leave for 40 seconds → Return (Warning 3)
5. Leave for 40 seconds → Return (PENALTY!)
6. ✅ **Expected**: Red penalty indicator, focus score drained

### Scenario 5: Timer Pauses During Grace Period
1. Start a study session
2. Note your focus score
3. Leave the app (grace period starts)
4. Wait 20 seconds
5. Return to app
6. ✅ **Expected**: Focus score should be same or only slightly higher (timer was paused)

## Console Logs to Watch

Enable console logs to see the system working:

```
[Session] Starting new focus session
[AppState] active → background
[Distraction] User left the app - starting grace period
[Distraction] First distraction - starting 30s grace period
[Focus] Timer paused during grace period
[AppState] background → active
[Distraction] User returned to app - checking grace period
[Distraction] Returned within grace period (15.2s)
```

Or for warnings:

```
[Distraction] Warning 1/3 - away for 45.3s
[Distraction] Warning 2/3 - away for 52.1s
[Distraction] Warning 3/3 - away for 38.7s
[Distraction] PENALTY! Away 1min - Focus: 45 → 30
```

## Key Formulas

- **Grace Period**: 30 seconds
- **Warning Threshold**: 3 warnings
- **Focus Drain**: -15 points per minute away (only after 3rd warning)
- **Timer Behavior**: Pauses during grace period

## User Experience Goals

✅ **Forgiving**: Quick checks don't hurt you
✅ **Clear Feedback**: Visual indicators show your status
✅ **Fair**: Multiple chances before penalty
✅ **Transparent**: Console logs show exactly what's happening
