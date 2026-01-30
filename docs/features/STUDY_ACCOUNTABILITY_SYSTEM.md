# Study Accountability System

## Overview
Study tracking system integrated with focus sessions, featuring goal setting, checkpoint monitoring, and mess point consequences for missed targets.

## Features

### 1. Study Goal Setup (Onboarding)
- **Location**: `app/onboarding/habit-setup.tsx`
- **Goal Options**: 1-4 hours per day
- **Checkpoint Selection**: Choose from 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
- **Default**: 3 hours/day with checkpoints at 12 PM, 6 PM, 9 PM

### 2. Study Session Tracking
- **Integration**: Study time is automatically tracked through focus sessions
- **No Separate Button**: Study tracking happens when user completes focus sessions
- **Automatic Logging**: Each completed focus session adds to daily study minutes
- **Seamless Experience**: No additional UI needed - existing focus system handles everything

### 3. Progress Monitoring
- **Display**: Shows current progress (e.g., "📚 Study (45/180min)")
- **Progress Bar**: Percentage completion of daily goal
- **Real-time Updates**: Accumulates throughout the day

### 4. Checkpoint System
- **Automatic Checking**: Every minute, checks if user is behind schedule
- **Expected Progress**: Evenly distributed across selected checkpoints
- **Behind Schedule Detection**: Compares actual vs expected progress at each checkpoint

### 5. Accountability & Consequences
- **Missed Checkpoints**: +5 mess points per missed checkpoint
- **Warning Messages**: Speech bubble alerts when behind schedule
- **Visual Feedback**: Room gets messier with higher mess points (future feature)

### 6. Rewards System
- **Base Rewards**: 1.5 energy per minute (max 25) + 1 coin per minute (max 15)
- **Bonus Rewards**: +15 energy for sessions 30+ minutes
- **Progress Feedback**: Shows percentage completion and rewards earned

## Technical Implementation

### Data Structure
```typescript
// UserData interface additions
studyGoalHours?: number; // 1-4 hours daily goal
studyCheckpoints?: string[]; // ['9 AM', '12 PM', etc.]
studyMinutesToday?: number; // Accumulated study minutes
lastStudyReset?: string; // Daily reset tracking
missedCheckpoints?: number; // Count of missed checkpoints
```

### Store Actions
- `setStudyGoal(hours, checkpoints)` - Save onboarding selections
- `logStudySession(minutes)` - Record completed study session
- `checkStudyCheckpoints()` - Evaluate progress vs schedule
- `addMissedCheckpoint()` - Add mess points for missed targets

### Integration Points
- `endFocusSession()` - Automatically logs study minutes when focus session ends
- Study tracking only active when study habit is enabled in onboarding
- No additional UI components needed - uses existing focus session system

### Checkpoint Logic
```typescript
// Example: 3-hour goal with 3 checkpoints
// 9 AM checkpoint: expect 60min (1/3 of 180min)
// 3 PM checkpoint: expect 120min (2/3 of 180min)  
// 9 PM checkpoint: expect 180min (3/3 of 180min)
```

## User Experience

### Normal Flow
1. User selects study goal and checkpoints in onboarding
2. User starts focus sessions as normal (existing focus system)
3. When focus session ends → study minutes automatically added to daily total
4. Progress accumulates throughout day toward daily goal
5. Checkpoint system monitors progress and provides accountability

### Accountability Flow
1. System checks progress every minute
2. If behind schedule at checkpoint time → warning message
3. Mess points added for each missed checkpoint
4. User motivated to catch up to avoid further consequences

### Integration
- **Seamless**: Study tracking happens automatically through focus sessions
- **No UI Changes**: Uses existing focus session interface
- **Persistent**: Progress accumulates throughout day, resets daily
- **Conditional**: Only tracks study when study habit is enabled in onboarding
- **Transparent**: User doesn't need to think about study vs focus - they're the same thing

## Future Enhancements
- Visual mess effects on room based on mess points
- Study streak tracking and rewards
- Different study environments (library, cafe, etc.)
- Pomodoro timer integration with break reminders
- Study subject categorization and tracking