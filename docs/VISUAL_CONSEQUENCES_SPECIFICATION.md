# Visual Consequences System - Complete Specification

## 🗑️ **Mess Points Accumulation**

### **Formula:**
```
Mess added = Missing study hours at each checkpoint
```

### **Example (3h goal, studied 0.5h by 3 PM):**
```
Expected at 3 PM: 3 × (15/24) = 1.875h
Actual: 0.5h
Missing: 1.375h → +1.375 mess points
```

### **Implementation:**
```typescript
// In checkStudyCheckpoints():
const expectedHours = goalHours * (checkpointHour / 24);
const actualHours = studyHours;
const missingHours = expectedHours - actualHours;

// In addMissedCheckpoint():
const messPointsIncrease = Math.max(0.5, missingHours);
```

## 🏠 **Room States**

| **Total Mess** | **Room State** | **Visual Description** | **Assets Used** |
|----------------|----------------|------------------------|-----------------|
| 0-5 | Clean | Spotless | `walls.png` + `floor.png` |
| 6-10 | Messy 1 | Light dust, few items | `walls-messy1.png` + `floor-messy1.png` |
| 11-20 | Messy 2 | Visible clutter, books | `walls-messy2.png` + `floor-messy2.png` |
| 21-30 | Messy 3 | Very messy, scattered items | `walls-messy3.png` + `floor-messy3.png` |
| 31+ | Messy 3+ | Maximum mess | `walls-messy3.png` + `floor-messy3.png` |

### **Implementation:**
```typescript
// In RoomLayers.tsx:
if (messPoints <= 5) return 'clean assets';
else if (messPoints <= 10) return 'messy1 assets';
else if (messPoints <= 20) return 'messy2 assets';
else return 'messy3 assets';
```

## ⚡ **Energy Cap Penalty**

| **Total Mess** | **Penalty** | **Max Energy** | **Visual Cue** |
|----------------|-------------|----------------|----------------|
| 0-5 | 0% | 100% | ✅ Full |
| 6-10 | 5% | 95% | ⚠️ Slight |
| 11-15 | 10% | 90% | ⚠️ Noticeable |
| 16-20 | 15% | 85% | ❌ Significant |
| 21-25 | 20% | 80% | ❌ Heavy |
| 26-30 | 25% | 75% | ❌ Severe |
| 31+ | 30% | 70% | ❌ Maximum |

### **Implementation:**
```typescript
// In calculateMaxEnergyCap():
if (messPoints > 5) {
  let messPenalty = 0;
  if (messPoints <= 10) messPenalty = 5;
  else if (messPoints <= 15) messPenalty = 10;
  else if (messPoints <= 20) messPenalty = 15;
  else if (messPoints <= 25) messPenalty = 20;
  else if (messPoints <= 30) messPenalty = 25;
  else messPenalty = 30; // Maximum penalty
  
  cap -= messPenalty;
}
```

## 🎮 **User Experience Flow**

### **Normal Study Day:**
1. **Morning**: Clean room (0 mess), 100% energy cap
2. **12 PM Checkpoint**: Expected 1.5h, Actual 1.2h → Behind by 0.3h → +0.3 mess
3. **Room Update**: Still clean (0.3 mess < 5)
4. **6 PM Checkpoint**: Expected 2.25h, Actual 1.8h → Behind by 0.45h → +0.45 mess
5. **Total Mess**: 0.75 mess → Room still clean, no energy penalty

### **Struggling Study Day:**
1. **Morning**: Clean room (0 mess), 100% energy cap
2. **12 PM Checkpoint**: Expected 1.5h, Actual 0.2h → Behind by 1.3h → +1.3 mess
3. **Room Update**: Still clean (1.3 mess < 5)
4. **3 PM Checkpoint**: Expected 1.875h, Actual 0.5h → Behind by 1.375h → +1.375 mess
5. **Total Mess**: 2.675 mess → Room still clean
6. **6 PM Checkpoint**: Expected 2.25h, Actual 0.8h → Behind by 1.45h → +1.45 mess
7. **Total Mess**: 4.125 mess → Room still clean
8. **9 PM Checkpoint**: Expected 2.625h, Actual 1.0h → Behind by 1.625h → +1.625 mess
9. **Final Mess**: 5.75 mess → **Room becomes Messy 1**, Energy cap drops to 95%

### **Crisis Study Day:**
1. **Multiple missed checkpoints** → Mess accumulates rapidly
2. **15+ mess points** → Room becomes Messy 2, Energy cap drops to 90%
3. **25+ mess points** → Room becomes Messy 3, Energy cap drops to 80%
4. **Cleaning Required** → User must clean room to restore energy cap

## 🧹 **Recovery Through Cleaning**

### **Cleaning Stages:**
- **Messy 1 → Clean**: 1 stage (10 taps)
- **Messy 2 → Messy 1 → Clean**: 2 stages (15 + 10 taps)
- **Messy 3 → Messy 2 → Messy 1 → Clean**: 3 stages (15 + 15 + 10 taps)

### **Immediate Benefits:**
- **Visual**: Room improves after each stage
- **Functional**: Energy cap increases as mess decreases
- **Rewarding**: Energy + coins earned for cleaning effort

## 📊 **Visual Feedback System**

### **StudyProgress Component:**
- **Progress Bar**: Shows daily study advancement
- **Status Indicator**: "On track" vs "Behind by X.X hours"
- **Energy Cap Warning**: Shows when mess affects energy cap
- **Mess Points Display**: Current mess level with visual cue

### **Room Visual Changes:**
- **Immediate**: Room changes as soon as mess thresholds crossed
- **Progressive**: Each cleaning stage shows improvement
- **Contextual**: Different mess levels show appropriate clutter

### **Energy System Integration:**
- **Real-time**: Energy cap updates immediately with mess changes
- **Visual**: Energy bar shows reduced maximum when messy
- **Functional**: Lower energy cap limits focus session availability

## 🎯 **Psychological Impact**

### **Positive Reinforcement:**
- **Clean room** = Sense of accomplishment and control
- **Full energy cap** = Maximum potential and capability
- **Progress bar advancement** = Visible daily achievement

### **Negative Consequences:**
- **Messy room** = Visual representation of falling behind
- **Reduced energy cap** = Tangible limitation on abilities
- **Warning indicators** = Clear feedback on performance gaps

### **Recovery Motivation:**
- **Cleaning mini-game** = Engaging way to improve situation
- **Immediate visual improvement** = Satisfying progress feedback
- **Energy restoration** = Functional benefit for effort invested

This system creates a complete feedback loop where study habits directly impact the visual environment and functional capabilities, motivating consistent behavior through both positive and negative reinforcement.