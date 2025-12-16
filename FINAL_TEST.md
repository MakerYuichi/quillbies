# ✅ Final Test - Simplified Energy System

## What Changed

1. **No drain on home screen** - Energy stays static when not in session
2. **Sleep penalty visible** - Yellow capacity bar shows penalties
3. **Quillby reacts to max cap** - Expression changes based on sleep/habits
4. **Energy only drains during sessions** - When you get distracted

---

## 🧪 Test 1: Home Screen (No Drain)

### Steps:
1. Open app
2. Wait 2 minutes
3. Touch the screen, scroll around
4. Check energy

### Expected:
- ✅ Energy stays at 100
- ✅ No drain messages in console
- ✅ Quillby stays happy (◕‿◕)

---

## 🧪 Test 2: Sleep Penalty (Visual)

### Steps:
1. Energy at 100, Max cap at 100
2. Tap "Log Sleep" → Enter "5"
3. Watch the changes

### Expected Console:
```
[Sleep] 5h → New max cap: 70 (was 100)
[Sleep] Energy capped: 100 → 70
```

### Expected UI:
- ✅ **Energy Capacity bar** shows 70/100 ⚠️ Penalty Active
- ✅ Capacity bar is 70% full (yellow)
- ✅ Energy drops from 100 to 70
- ✅ Quillby expression changes to (╥_╥) "Feeling sluggish today..."

---

## 🧪 Test 3: Sleep Bonus (Recovery)

### Steps:
1. From previous test (max cap 70)
2. Tap "Log Sleep" → Enter "8"
3. Watch recovery

### Expected Console:
```
[Sleep] 8h → New max cap: 100 (was 70)
[Sleep] Energy capped: 70 → 70
```

### Expected UI:
- ✅ Capacity bar returns to 100/100
- ✅ Bar is 100% full
- ✅ Energy stays at 70 (doesn't auto-fill)
- ✅ Quillby becomes happy (◕‿◕) "I'm ready to focus!"

---

## 🧪 Test 4: Session Energy Cost

### Steps:
1. Energy at 70
2. Tap "Start Focus Session"
3. Check energy

### Expected:
- ✅ Energy drops by 20 (70 → 50)
- ✅ Session screen appears
- ✅ Focus meter starts at 0

---

## 🧪 Test 5: Habit Stacking

### Steps:
1. Log sleep: 5 hours
2. Don't log breakfast (skip it)
3. Log water: 3 glasses
4. Check capacity bar

### Expected:
- Sleep penalty: -30% (100 → 70)
- Breakfast penalty: -20% (70 → 50)
- Water penalty: -15% (50 → 35)
- **Final capacity: 35/100**

### Expected UI:
- ✅ Capacity bar shows 35/100 ⚠️
- ✅ Bar is 35% full
- ✅ Quillby looks exhausted (×_×)
- ✅ Message: "I need proper rest to help you..."

---

## 🧪 Test 6: Can't Start Session (Low Energy)

### Steps:
1. From previous test (energy at 35)
2. Start a session (costs 20, leaves 15)
3. Try to start another session

### Expected:
- ✅ First session: Success (35 → 15)
- ✅ Second session: Alert "Not enough energy!"
- ✅ Button shows "😴 Too Tired to Focus"

---

## ✅ Success Criteria

All tests pass if:

1. **Home screen:** No energy drain while using app
2. **Sleep penalty:** Visible in capacity bar and Quillby expression
3. **Energy capping:** Current energy drops when max cap decreases
4. **Visual feedback:** Capacity bar, Quillby expression, and messages all update
5. **Habit stacking:** Multiple penalties combine correctly
6. **Session cost:** Starting session costs 20 energy

---

## 📊 Visual Guide

### Good Sleep (8h):
```
Energy Capacity: 100/100
[████████████████████] 100%
Quillby: (◕‿◕) "I'm ready to focus!"
```

### Poor Sleep (5h):
```
Energy Capacity: 70/100 ⚠️ Penalty Active
[██████████████      ] 70%
Quillby: (╥_╥) "Feeling sluggish today..."
```

### Terrible Habits (5h sleep, no breakfast, 3 water):
```
Energy Capacity: 35/100 ⚠️ Penalty Active
[███████             ] 35%
Quillby: (×_×) "I need proper rest to help you..."
```

---

## 🎯 The Psychology

This creates the emotional loop:

```
Poor Sleep → Low Max Cap → Quillby Tired → You Feel Responsible
     ↓
Better Sleep → High Max Cap → Quillby Happy → You Feel Accomplished
```

The capacity bar makes the penalty **tangible and visible**, not just a hidden number.

---

**Test all 6 scenarios and confirm they work!** 🚀
