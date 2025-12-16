# 🔋 Energy Drain Test - App State Fix

## What We Fixed

Energy now only drains when the app is **CLOSED/BACKGROUND**, not when you're actively using it.

---

## 🧪 Test Sequence

### Test 1: Active Use (No Drain)

1. **Open the app**
2. **Keep it open** and interact with it
3. **Watch console** for 60 seconds

**Expected Console:**
```
[App] State changed: active
[Energy] 0.02 min elapsed | App: active
[Energy] 0.05 min elapsed | App: active
[Energy] 0.10 min elapsed | App: active
...
[Energy] 1.00 min elapsed | App: active
```

**Expected Result:**
- ✅ Energy stays at 100 (no drain)
- ✅ Console shows "App: active"
- ✅ No "Drained" messages

---

### Test 2: Background Drain

1. **Open the app** (energy at 100)
2. **Close/minimize the app** (press home button)
3. **Wait 60 seconds** (use phone timer)
4. **Reopen the app**

**Expected Console:**
```
[App] State changed: background
[Energy] 0.02 min elapsed | App: background
[Energy] 0.05 min elapsed | App: background
...
[App] State changed: active
[Energy] 1.05 min elapsed | App: background
[Energy] Drained 5 (app inactive). 100 → 95
```

**Expected Result:**
- ✅ Energy drops from 100 to 95
- ✅ Console shows "App: background" while closed
- ✅ Shows "Drained 5" message when reopened

---

### Test 3: Multiple Drain Cycles

1. **Open app** (energy at 95)
2. **Close app** for 2 minutes
3. **Reopen app**

**Expected Console:**
```
[App] State changed: background
...
[App] State changed: active
[Energy] 2.10 min elapsed | App: background
[Energy] Drained 10 (app inactive). 95 → 85
```

**Expected Result:**
- ✅ Energy drops from 95 to 85 (2 minutes × 5 points)
- ✅ Drains 10 points total

---

### Test 4: Quick Switch (No Drain)

1. **Open app** (energy at 85)
2. **Close app** for only 30 seconds
3. **Reopen app**

**Expected Console:**
```
[App] State changed: background
...
[App] State changed: active
[Energy] 0.50 min elapsed | App: background
```

**Expected Result:**
- ✅ Energy stays at 85 (no drain, less than 1 minute)
- ✅ No "Drained" message

---

## ✅ Success Criteria

All tests pass if:

1. **Active use:** Energy doesn't drain while app is open
2. **Background drain:** Energy drains 5 points per minute when closed
3. **Timing:** Only drains after full minutes (not seconds)
4. **Console logs:** Show correct app state (active/background)

---

## 🐛 If Tests Fail

### Energy drains while active:
- Check console shows "App: active"
- Verify `setAppState('active')` is being called
- Check `updateEnergy` logic only drains when inactive

### Energy doesn't drain when closed:
- Check console shows "App: background"
- Verify AppState listener is working
- Make sure you fully close the app (home button)

### Drains too fast/slow:
- Check `drainPerMinute = 5` in store.ts
- Verify `Math.floor(minutesElapsed)` is used
- Check timestamp is being reset after drain

---

## 📊 Expected Timeline

```
Time    | Action        | Energy | Console
--------|---------------|--------|------------------
0:00    | Open app      | 100    | App: active
1:00    | Still open    | 100    | App: active (no drain)
1:00    | Close app     | 100    | App: background
2:00    | Still closed  | 95     | Drained 5
3:00    | Still closed  | 90     | Drained 5
3:00    | Reopen app    | 90     | App: active
4:00    | Still open    | 90     | App: active (no drain)
```

---

**This is the core mechanic!** Once this works, all other features will fall into place. 🚀
