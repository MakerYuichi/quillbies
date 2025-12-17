# Daily & Auto Systems - Complete Implementation

## 🔄 **Automatic Mess Decay**

### **Formula:**
```
Every midnight: messPoints = messPoints × 0.8 (20% automatic cleaning each day)
```

### **Implementation:**
```typescript
applyDailyMessDecay: () => {
  const currentMess = userData.messPoints;
  const newMess = currentMess * 0.8; // 20% decay
  
  // Recalculate energy cap with reduced mess
  const newMaxCap = calculateMaxEnergyCap({
    ...userData,
    messPoints: newMess
  });
}
```

### **Purpose:**
- **Prevents infinite accumulation** - Room doesn't stay messy forever
- **Rewards consistency** - Daily study habits prevent mess buildup
- **Natural recovery** - Even bad days can be recovered from
- **Motivation maintenance** - System doesn't become hopeless

## 📢 **Checkpoint Notifications**

### **30-Minute Reminders:**
```
"Study checkpoint in 30 minutes!
Current: X.Xh / Expected: X.Xh"
```

### **At Checkpoint:**
```
"Checkpoint reached! Studied: X.Xh / Expected: X.Xh
Missing: X.Xh → +X.X mess"
```

### **Implementation:**
```typescript
// Check every minute for notification triggers
const reminderTime = checkpointHour - 0.5; // 30 minutes before
if (Math.abs(currentTime - reminderTime) < 0.017) { // ~1 minute tolerance
  // Send reminder notification
}

if (Math.abs(currentTime - checkpointHour) < 0.017) {
  // Send checkpoint result notification
}
```

### **Notification Types:**
- **⏰ Reminder**: Blue background, 30 minutes before checkpoint
- **📚 Behind**: Orange background, shows deficit and mess added
- **✅ On Track**: Green background, positive reinforcement
- **📊 Daily Summary**: Purple background, end-of-day report

## 📊 **End-of-Day Summary**

### **Format:**
```
"Daily Summary:
Goal: 3 hours
Studied: 2.1 hours (70%)
Missing: 0.9 hours
Mess added: +0.9
Total mess: X.X
Room: [Clean/Messy 1/etc.]"
```

### **Implementation:**
```typescript
generateDailySummary: () => {
  const studyHours = (userData.studyMinutesToday || 0) / 60;
  const goalHours = userData.studyGoalHours;
  const progressPercent = Math.round((studyHours / goalHours) * 100);
  const missingHours = Math.max(0, goalHours - studyHours);
  
  // Determine room state based on mess points
  let roomState = 'Clean';
  if (mess > 30) roomState = 'Messy 3+';
  else if (mess > 20) roomState = 'Messy 3';
  else if (mess > 10) roomState = 'Messy 2';
  else if (mess > 5) roomState = 'Messy 1';
}
```

### **Triggers:**
- **Midnight (00:00)** - Automatic daily summary
- **Manual** - User can request summary anytime
- **App close** - Summary on significant app usage end

## 🎮 **User Flow Examples**

### **Example 1: Morning Student**
```
Checkpoints selected: 9 AM, 12 PM
Goal: 3 hours

Timeline:
8:30 AM: "Study checkpoint in 30 minutes! Current: 0h / Expected: 1.125h"
9:00 AM: Studied 1.5h / Expected 1.125h → Good! ✅
11:30 AM: "Study checkpoint in 30 minutes! Current: 1.8h / Expected: 1.5h"  
12:00 PM: Studied 2.0h / Expected 1.5h → Good! ✅

End of day: Studied 3.5h → Exceeded goal! 🎉
Result: Room clean, full energy, positive reinforcement
```

### **Example 2: Evening Crammer**
```
Checkpoints: 6 PM, 9 PM
Goal: 4 hours

Timeline:
5:30 PM: "Study checkpoint in 30 minutes! Current: 0h / Expected: 3.0h"
6:00 PM: Studied 0h / Expected 3.0h → Missing 3.0h → +3.0 mess
8:30 PM: "Study checkpoint in 30 minutes! Current: 0.5h / Expected: 3.5h"
9:00 PM: Studied 1.0h / Expected 3.5h → Missing 2.5h → +2.5 mess

Total: +5.5 mess → Room Messy 1, energy cap 95%
Clean game: 10 taps → Removes ~3 mess, restores energy
Midnight: Mess decay 5.5 → 4.4 (20% reduction)
```

### **Example 3: Balanced User**
```
Checkpoints: All five (9,12,3,6,9)
Goal: 2 hours

Timeline:
8:30 AM: "Study checkpoint in 30 minutes! Current: 0h / Expected: 0.75h"
9:00 AM: Studied 0.5h / Expected 0.75h → Missing 0.25h → +0.25 mess
11:30 AM: "Study checkpoint in 30 minutes! Current: 0.8h / Expected: 1.0h"
12:00 PM: Studied 1.0h / Expected 1.0h → On track! ✅

Progressive learning: User adapts to consistent study habits
Can clean anytime mess > 5
Teaches sustainable study patterns
```

## 🔧 **Technical Implementation**

### **Notification System:**
- **useNotifications Hook**: Manages notification state and timing
- **NotificationBanner Component**: Displays notifications with appropriate styling
- **Integration**: Seamlessly integrated into home screen layout

### **Daily Reset Automation:**
- **Midnight Detection**: Checks every minute for 00:00 time
- **Automatic Execution**: Applies mess decay and resets daily counters
- **State Management**: Preserves long-term progress while resetting daily metrics

### **Performance Optimization:**
- **Interval Management**: Efficient use of setInterval with proper cleanup
- **State Updates**: Batched updates to prevent excessive re-renders
- **Memory Management**: Proper cleanup of intervals and event listeners

## 🎯 **Psychological Design**

### **Positive Reinforcement:**
- **Success Notifications**: Green checkmarks for meeting checkpoints
- **Progress Tracking**: Visual progress bars and percentage completion
- **Achievement Recognition**: Celebration messages for exceeding goals

### **Gentle Accountability:**
- **Advance Warning**: 30-minute reminders allow course correction
- **Clear Consequences**: Transparent mess accumulation system
- **Recovery Opportunities**: Daily decay and cleaning mini-game

### **Habit Formation:**
- **Consistent Timing**: Regular checkpoint intervals
- **Visual Feedback**: Immediate room state changes
- **Long-term Perspective**: Daily summaries show progress over time

### **Motivation Maintenance:**
- **Automatic Recovery**: Mess decay prevents hopeless situations
- **Flexible Goals**: Multiple checkpoint options for different schedules
- **Engaging Mechanics**: Cleaning mini-game makes recovery fun

This system creates a complete daily cycle that encourages consistent study habits while providing gentle accountability and engaging recovery mechanisms.