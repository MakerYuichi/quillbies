# 🧪 Testing Checklist - After Bug Fixes

## How to Test

1. **Clear cache and restart:**
```bash
cd quillby-app
npx expo start --clear
```

2. **Open the app** and watch the console logs in your terminal

3. **Follow the test steps below** and check console output

---

## Test 1: Energy Drain ⏱️

### Steps:
1. Open app
2. Note starting energy (should be 100)
3. **Wait exactly 60 seconds** (use a timer)
4. Check energy value

### Expected Result:
- Console: `[Energy] 1 minutes elapsed since last update`
- Console: `[Energy] Drained 5 energy (100 → 95)`
- UI: Energy shows 95

### What to Check:
- [ ] Energy is 95 after 1 minute
- [ ] Energy is 90 after 2 minutes
- [ ] Energy is 85 after 3 minutes
- [ ] Console shows correct drain messages

---

## Test 2: Sleep Penalty 😴

### Steps:
1. Tap "Log Sleep"
2. Enter "5" (5 hours)
3. Tap OK
4. Check the yellow warning banner at top
5. Check stats at bottom

### Expected Result:
- Console: `[Sleep] Logged 5h sleep → Max cap: 100 → 70`
- UI: Yellow banner shows "⚠️ Max Energy Cap: 70 (Penalties Applied)"
- Stats: "Max Energy Cap: 70 (Penalties Applied)"

### What to Check:
- [ ] Console shows max cap changed to 70
- [ ] Yellow warning banner appears
- [ ] Stats show max cap = 70
- [ ] Current energy capped at 70 if it was higher

### Test Sleep Bonus:
1. Tap "Log Sleep" again
2. Enter "8" (8 hours)
3. Check console and UI

### Expected:
- Console: `[Sleep] Logged 8h sleep → Max cap: 70 → 100`
- Yellow banner disappears
- Max cap back to 100

---

## Test 3: End Session Button 🎯

### Steps:
1. Tap "Start Focus Session"
2. **Scroll down** on the study screen
3. Look for two buttons at bottom

### Expected Result:
- Green button: "✅ End Session & Collect Rewards"
- Transparent button: "← Cancel (No Rewards)"
- Both buttons visible after scrolling

### What to Check:
- [ ] Can scroll to see buttons
- [ ] Green button is visible
- [ ] Cancel button is visible
- [ ] Buttons are clickable

---

## Test 4: Session Flow 🎮

### Steps:
1. Start session (energy drops by 20)
2. Wait 30 seconds
3. Check focus score (should be 1)
4. Wait another 30 seconds
5. Check focus score (should be 2)
6. **Scroll down** and tap "End Session"
7. Check Q-Coins increased

### Expected Result:
- Energy: 100 → 80 (after start)
- Focus score: 0 → 1 → 2 (every 30s)
- Q-Coins: +1 (2 × 0.5)
- Mess points: -2

### What to Check:
- [ ] Energy drops by 20 on start
- [ ] Focus score increases every 30s
- [ ] Can tap End Session button
- [ ] Q-Coins increase
- [ ] Mess points decrease by 2

---

## Test 5: Distraction Detection 📱

### Steps:
1. Start a focus session
2. Wait 30 seconds (focus score = 1)
3. **Leave the app** (press home button or switch apps)
4. Wait 10 seconds
5. **Return to the app**
6. Check distraction counter

### Expected Result:
- Console: `[AppState] active → background`
- Console: `[Distraction] User left the app!`
- Console: `[AppState] background → active`
- Console: `[Distraction] User returned to app`
- UI: "⚠️ Distractions: 1"

### What to Check:
- [ ] Console shows app state changes
- [ ] Distraction counter increases
- [ ] Focus score drains slightly
- [ ] Warning appears in UI

---

## Test 6: Mess Cleanup 🧹

### Steps:
1. Tap "Skip Task" 5 times
2. Check room background (should be yellow/messy)
3. Start a focus session
4. Wait 30 seconds
5. End session
6. Check mess points decreased

### Expected Result:
- After 5 skips: Mess = 5, Room = "📚 A few books scattered"
- After session: Mess = 3 (5 - 2)
- Room slightly cleaner

### What to Check:
- [ ] Room gets messier with skips
- [ ] Mess points show in stats
- [ ] Session completion reduces mess by 2
- [ ] Room visual updates

---

## Test 7: Habit Stacking 📊

### Steps:
1. Log sleep: 5 hours
2. Skip breakfast (don't tap it)
3. Log water: 3 glasses
4. Check max energy cap

### Expected Result:
- Sleep penalty: -30% (100 → 70)
- Breakfast penalty: -20% (70 → 50)
- Water penalty: -15% (50 → 35)
- **Final max cap: 35**

### What to Check:
- [ ] Multiple penalties stack
- [ ] Max cap shows 35
- [ ] Yellow warning shows penalties
- [ ] Energy capped at 35

---

## Console Log Examples

### Good Energy Drain:
```
[Energy] 0 minutes elapsed since last update
[Energy] 0 minutes elapsed since last update
[Energy] 1 minutes elapsed since last update
[Energy] Drained 5 energy (100 → 95)
```

### Good Sleep Logging:
```
[Sleep] Logged 5h sleep → Max cap: 100 → 70
```

### Good Distraction:
```
[AppState] active → background
[Distraction] User left the app!
[AppState] background → active
[Distraction] User returned to app
```

---

## Success Criteria

All tests pass if:
- ✅ Energy drains 5 points per minute
- ✅ Sleep penalty shows in UI and console
- ✅ End Session button is scrollable and visible
- ✅ Sessions complete and give rewards
- ✅ Distractions are detected and logged
- ✅ Mess system works (accumulate and cleanup)
- ✅ Multiple penalties stack correctly

---

## If Tests Fail

### Energy not draining:
- Check console for `[Energy]` messages
- Verify 60 seconds passed (use phone timer)
- Check `lastActiveTimestamp` is updating

### Sleep penalty not showing:
- Check console for `[Sleep]` message
- Look for yellow warning banner at top
- Check stats section at bottom

### End button not visible:
- Try scrolling down on study screen
- Check if ScrollView is working
- Look for both green and transparent buttons

### Distraction not working:
- Check console for `[AppState]` messages
- Make sure you fully leave the app (home button)
- Wait a few seconds before returning

---

**After all tests pass, you're ready for Week 2!** 🎉
