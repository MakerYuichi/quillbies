# Sleep Accumulation - Quick Summary

## ✅ What Changed

Sleep hours now **accumulate** throughout the day instead of being replaced.

## Before vs After

### Before ❌
```
Sleep 4h → Shows "4h last"
Sleep 2h → Shows "2h last" (lost the 4h!)
Total: Only 2h counted
```

### After ✅
```
Sleep 4h → Shows "4h today"
Sleep 2h → Shows "6h today" (4h + 2h)
Total: 6h counted
```

## How It Works

1. **First sleep session**: 4h → Total: 4h today
2. **Second sleep session**: 2h → Total: 6h today (accumulated)
3. **Third sleep session**: 1h → Total: 7h today (accumulated)
4. **Midnight**: Resets to 0h (new day)

## Display

### Sleep Button
- Shows: "Xh today" (accumulated total)
- Example: "7h today"

### Wake Message
- Shows both session and total
- Example: "😊 Slept 2h 15m (7h total today)"

## Energy Consequences

Based on **total accumulated sleep**:
- **< 6h total**: -30% max energy cap
- **6-8h total**: Normal energy cap
- **8h+ total**: +10 bonus energy

## Benefits

1. ✅ Multiple naps count toward daily total
2. ✅ Fair energy calculation based on total sleep
3. ✅ Realistic sleep tracking
4. ✅ Automatic daily reset at midnight
5. ✅ Clear progress toward 8h goal

## Example Flow

```
User sleeps 4h:
  → Button shows: "4h today"
  → Energy: -30% cap (< 6h)
  → Message: "😴 Slept 4h 15m (4h total today)"

User naps 2h later:
  → Button shows: "6h today" ✅
  → Energy: Normal cap ✅
  → Message: "😊 Slept 2h 10m (6h total today)"

User naps 2h more:
  → Button shows: "8h today" ✅
  → Energy: +10 bonus ✅
  → Message: "⭐ Slept 2h 5m (8h total today) Perfect!"
```

## Files Modified

1. `app/state/store.ts` - Accumulate sleep instead of replace
2. `app/hooks/useSleepTracking.ts` - Track total and auto-reset
3. `app/components/SleepButton.tsx` - Display accumulated total
4. `app/(tabs)/index.tsx` - Pass sleepDisplay prop
5. `app/core/types.ts` - Add lastSleepReset field

## Testing

Try this:
1. Tap "😴 Sleep" → Wait 10 seconds → Tap "☀️ Woke Up"
2. Check button shows "0h today" (rounds down from seconds)
3. Tap "😴 Sleep" → Wait 1 minute → Tap "☀️ Woke Up"
4. Check button shows "0h today" (still rounds down)
5. Repeat a few times until you accumulate 1h+
6. Button should show "1h today" or more ✅

Now your sleep tracking is realistic and fair! 🐹💤✨
