# 🧪 Mess Points Testing Guide

## Quick Test with New Debug Buttons

I've added temporary debug buttons to your home screen to help test mess points:

### 1. **⏰ Force Daily Reset**
- Triggers immediate daily reset
- Tests energy drain from current mess points
- Check your energy before/after to see the drain

### 2. **🗑️ Add 5 Mess**
- Instantly adds 5 mess points
- Tests room visual changes
- Watch the room background change color/assets

### 3. **⚡ 10x Time Speed (24h)**
- Accelerates time by 10x for 24 hours
- Simulates a full day in ~14 seconds
- Tests all daily systems including mess energy drain

## Step-by-Step Testing Process

### Test 1: Basic Mess Point Changes
1. Open your app and go to **Home tab**
2. Note current mess points in **Stats tab**
3. Tap **"🗑️ Add 5 Mess"** button
4. Check **Stats tab** → mess points should increase by +5
5. Return to **Home tab** → room should look messier

### Test 2: Energy Drain from Mess
1. Use **"🗑️ Add 5 Mess"** until you have 10+ mess points
2. Note your current energy level
3. Tap **"⏰ Force Daily Reset"** button
4. Check your energy → should decrease based on mess level:
   - 6-10 mess: -5 energy
   - 11-15 mess: -10 energy
   - 16-20 mess: -15 energy
   - 21+ mess: -20 energy

### Test 3: Room Visual Changes
Test the room visual thresholds:
1. Start with clean room (0-5 mess)
2. Add mess and watch for changes:
   - **6-10 mess**: Light mess (yellow tint, messy1 assets)
   - **11-20 mess**: Medium mess (orange tint, messy2 assets)  
   - **21+ mess**: Heavy mess (red tint, messy3 assets)

### Test 4: Time Acceleration
1. Add some mess points first (5-10 points)
2. Tap **"⚡ 10x Time Speed (24h)"** button
3. Watch the console logs for time progression
4. After 14 seconds, check if daily reset occurred
5. Verify energy drained based on mess level

## Console Logs to Watch

Open your development console and look for:

```
[TEST] Daily reset triggered - check energy drain from mess points
[TEST] Added 5 mess points - check room visuals and energy drain
[TEST] Starting 10x time acceleration - will simulate 24 hours in ~14 seconds
[TEST] Time acceleration: X.X hours advanced
[Daily] Mess penalty: -X energy (X.X mess points)
```

## Expected Behavior

### Mess Point Calculation
- Skip task: +1 mess point
- Complete study session: -2 mess points
- Minimum: 0 mess points (can't go negative)

### Energy Drain (Daily)
- 0-5 mess: No drain
- 6-10 mess: -5 energy/day
- 11-15 mess: -10 energy/day
- 16-20 mess: -15 energy/day
- 21+ mess: -20 energy/day

### Room Visuals
- Clean (0-5): Green background, clean assets
- Light mess (6-10): Yellow background, messy1 assets
- Medium mess (11-20): Orange background, messy2 assets
- Heavy mess (21+): Red background, messy3 assets

## Troubleshooting

### If mess points don't change:
- Check console for error messages
- Verify store state is updating
- Try restarting the app

### If room visuals don't change:
- Check if mess assets exist in `/assets/rooms/mess/`
- Verify RoomLayers component is receiving mess points
- Check console for asset loading errors

### If energy doesn't drain:
- Verify mess points are > 5
- Check if daily reset is being triggered
- Look for "[Daily] Mess penalty" log messages

## Removing Test Buttons

When you're done testing, you can remove the debug buttons by deleting the "testButtonSection" code block from `app/(tabs)/index.tsx`.

The test buttons are clearly marked with yellow background and "🧪 Debug Tools" header for easy identification.

## Quick Validation Checklist

- [ ] Mess points increase when adding mess
- [ ] Room visuals change at correct thresholds (6, 11, 21)
- [ ] Energy drains correctly during daily reset
- [ ] Console logs show correct calculations
- [ ] Stats tab displays accurate mess points
- [ ] Time acceleration works smoothly

Use these tools to quickly verify that your mess points system is working correctly!