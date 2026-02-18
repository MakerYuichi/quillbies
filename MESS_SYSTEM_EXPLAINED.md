# Mess System - Complete Guide

## Overview
The mess system in Quillby tracks how messy your virtual room gets based on your study habits and provides visual feedback to motivate you to stay on track.

---

## How Mess Points Accumulate

### 1. Missed Study Checkpoints (Primary Source)
When you miss your study checkpoints, mess points are added:

**Formula:** `messPointsIncrease = Math.max(0.5, missingHours)`

**Example:**
- You have a 3-hour study goal
- Checkpoint at 12 PM: Expected 1 hour, you have 0 hours
- Missing: 1 hour → **+1.0 mess points**
- Checkpoint at 6 PM: Expected 2.25 hours, you have 0.5 hours  
- Missing: 1.75 hours → **+1.75 mess points**

**Minimum:** 0.5 mess points per missed checkpoint

### 2. Skipped Tasks
When you skip a task:
- **+1.0 mess point** per skipped task

### 3. Completed Focus Sessions (Reduction)
When you complete a study session:
- **-2.0 mess points** per completed session
- This helps clean your room as you study!

---

## Mess Levels & Room States

### Visual States (from engine.ts)

| Mess Points | Room State | Visual Description |
|-------------|------------|-------------------|
| 0 - 3 | **Clean** | Tidy room, everything organized |
| 4 - 7 | **Messy** | Some clutter, papers scattered |
| 8 - 10 | **Dirty** | Noticeable mess, needs attention |
| 11+ | **Disaster** | Very messy, hard to focus |

### Cleaning Stages (from index.tsx)

When you tap the clean button, the stages depend on current mess:

#### Heavy Mess (20+ points) → 3 Stages
1. **🚿 Deep Clean** (15 taps) → Reduces to 15 mess points
2. **🧽 Scrubbing** (15 taps) → Reduces to 8 mess points  
3. **🧹 Sweeping** (10 taps) → Reduces to 3 mess points
- **Total:** 40 taps needed

#### Medium Mess (10-20 points) → 2 Stages
1. **🧽 Scrubbing** (15 taps) → Reduces to 8 mess points
2. **🧹 Sweeping** (10 taps) → Reduces to 3 mess points
- **Total:** 25 taps needed

#### Light Mess (5-10 points) → 1 Stage
1. **🧹 Tidying Up** (10 taps) → Reduces to 3 mess points
- **Total:** 10 taps needed

---

## Energy Impact

Mess points affect your daily energy through energy drain:

### Daily Energy Drain (from engine.ts)

| Mess Points | Energy Drain | Impact |
|-------------|--------------|--------|
| 0 - 5 | 0 energy/day | No penalty |
| 6 - 10 | -5 energy/day | Light penalty |
| 11 - 15 | -10 energy/day | Medium penalty |
| 16 - 20 | -15 energy/day | High penalty |
| 21+ | -20 energy/day | Severe penalty |

**When Applied:** Once per day at 6 PM (18:00)

---

## Cleaning Rewards

When you clean your room, you get rewards based on efficiency:

### Per Stage Completion
- **Energy Restored:** Up to 30% of max energy cap
- **Coins Earned:** Up to 20 Q-Bies
- **Mess Reduced:** Varies by stage (see cleaning stages above)

### Efficiency System
- **Perfect completion:** 100% efficiency = full rewards
- **Partial completion:** Minimum 30% completion required for rewards
- **Early exit:** Rewards scaled by completion percentage

---

## Stats Display (from stats.tsx)

Your stats screen shows room status:

| Mess Points | Status Display |
|-------------|----------------|
| 0 - 5 | "Clean" |
| 6 - 10 | "Light Mess" |
| 11 - 20 | "Medium Mess" |
| 21+ | "Heavy Mess" |

---

## Notifications

When mess points reach 4 or higher:
- System notification sent (if app is in background)
- Reminds you to clean your room
- Helps you stay aware of room state

---

## Best Practices

### To Keep Room Clean:
1. **Hit your study checkpoints** - This is the main way mess accumulates
2. **Complete focus sessions** - Each session removes 2 mess points
3. **Clean regularly** - Don't let it build up past 10 points
4. **Don't skip tasks** - Each skip adds 1 mess point

### Optimal Strategy:
- Keep mess below 5 points (no energy drain)
- Clean when you reach 8-10 points (before it gets too messy)
- Complete 1-2 focus sessions daily to offset checkpoint misses

---

## Technical Details

### Data Storage
- **Source of Truth:** `user_profiles.mess_points` in database
- **Synced:** After every change (checkpoint miss, cleaning, session complete)
- **Loaded:** On app startup from database

### Calculation Timing
- **Checkpoint checks:** Hourly (when app is active)
- **Energy drain:** Once per day at 6 PM
- **Session rewards:** Immediately after session completion
- **Cleaning:** Real-time during cleaning mini-game

---

## Example Scenario

**Morning (8 AM):**
- Mess points: 5 (Clean room)
- Energy: 100

**Noon (12 PM) - Checkpoint Missed:**
- Expected: 1 hour studied
- Actual: 0 hours
- Missing: 1 hour → **+1.0 mess points**
- New mess: 6 points (Light Mess)
- Energy drain scheduled: -5 energy at 6 PM

**Afternoon (2 PM) - Study Session:**
- Complete 1-hour focus session
- Reward: **-2.0 mess points**
- New mess: 4 points (Clean room)
- Energy drain cancelled (below 6 points)

**Evening (6 PM) - Checkpoint Missed:**
- Expected: 2.25 hours studied  
- Actual: 1 hour
- Missing: 1.25 hours → **+1.25 mess points**
- New mess: 5.25 points (Clean room, but close to threshold)

**Night (9 PM) - Clean Room:**
- Tap clean button
- 1 stage: Tidying Up (10 taps)
- Reward: +30 energy, +20 coins
- New mess: 3 points (Clean room)

**Result:** Ended day with clean room despite missing checkpoints!

---

## Summary

Mess points are a visual and mechanical representation of your study habits:
- **Miss checkpoints** → Mess increases
- **Complete sessions** → Mess decreases  
- **High mess** → Energy drain penalty
- **Clean room** → Energy and coin rewards

The system encourages consistent study habits while providing a fun cleaning mini-game to recover from setbacks.
