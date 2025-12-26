# Study Session Tutorial System

## Overview
An interactive, step-by-step tutorial that automatically guides first-time users through all the features of the study session screen.

## How It Works

### 1. Trigger
- Tutorial activates **automatically** when a user enters their **first focus session**
- Uses AsyncStorage to track if user has seen the tutorial (`hasSeenStudyTutorial`)
- Starts 1 second after the study session screen loads (to ensure UI is rendered)

### 2. Tutorial Flow (7 Steps)

#### Step 1: Welcome
- **Title**: 🎯 Welcome to Focus Mode!
- **Description**: Introduction to the study session
- **Highlight**: None (general welcome)

#### Step 2: Coffee Button
- **Title**: ☕ Coffee Boost
- **Description**: Explains coffee boost (+6 focus for 3min, 3 free uses/day)
- **Highlight**: Left habit button with green glowing border

#### Step 3: Apple Button
- **Title**: 🍎 Apple Snack
- **Description**: Explains apple snack (+3 focus instant, 5 free uses/day)
- **Highlight**: Right habit button with green glowing border

#### Step 4: Focus Score
- **Title**: 📊 Focus Score
- **Description**: Explains focus score and staying in app
- **Highlight**: Focus score display

#### Step 5: Break Button
- **Title**: ⏸️ Take a Break
- **Description**: Explains break system (5-minute breaks, limited time)
- **Highlight**: Break button

#### Step 6: Done Button
- **Title**: ✅ Finish Session
- **Description**: Explains finishing session and earning rewards
- **Highlight**: Done button

#### Step 7: Final Message
- **Title**: 🚀 Ready to Focus!
- **Description**: Final encouragement and reminder to stay in app
- **Highlight**: None (general message)

### 3. Visual Features

#### Dark Overlay
- 80% black overlay covers entire screen
- Creates spotlight effect on highlighted elements

#### Green Glowing Border
- 3px green border around highlighted button
- Glowing shadow effect (shadowRadius: 10)
- Makes it crystal clear which button is being explained

#### Tooltip Dialogue Box
- White card with rounded corners
- Arrow pointing to highlighted element
- Contains:
  - Title (emoji + text)
  - Description (clear explanation)
  - Progress dots (showing current step)
  - Skip button (exit tutorial)
  - Next button (advance to next step)

### 4. User Controls

#### Next Button
- Advances to next tutorial step
- Changes to "Got it! 🚀" on final step
- Automatically saves completion state

#### Skip Button
- Exits tutorial immediately
- Marks tutorial as seen (won't show again)
- User can start using the session

### 5. Technical Implementation

#### Components
- **InteractiveTooltip.tsx**: Reusable tooltip component with highlight system
- **study-session.tsx**: Integrates tooltip and manages tutorial state

#### State Management
- `showTooltip`: Boolean to show/hide tutorial
- `tooltipStep`: Current step index (0-6)
- AsyncStorage: Persists tutorial completion

#### Positioning System
Each step defines:
```typescript
{
  id: string;                    // Unique identifier
  title: string;                 // Tooltip title
  description: string;           // Explanation text
  position: {                    // Tooltip box position
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  arrowDirection: 'up' | 'down' | 'left' | 'right';  // Arrow direction
  highlightArea?: {              // Optional highlight box
    top: number;
    left: number;
    width: number;
    height: number;
  };
}
```

## User Experience Flow

1. User completes onboarding
2. User taps "Focus" button on home screen for first time
3. Session starts normally
4. **Tutorial automatically appears after 1 second**
5. User sees welcome message
6. User taps "Next"
7. Coffee button is highlighted with explanation
8. User taps "Next"
9. Apple button is highlighted with explanation
10. ... continues through all buttons
11. User taps "Got it! 🚀" on final step
12. Tutorial disappears
13. User can now use all features
14. Tutorial never shows again (saved in AsyncStorage)

## Benefits

### For Users
- ✅ No confusion about what buttons do
- ✅ Learn by seeing (visual highlights)
- ✅ Can skip if already familiar
- ✅ Only shows once (not annoying)
- ✅ Clear progress indication

### For Developers
- ✅ Reusable tooltip component
- ✅ Easy to add/remove steps
- ✅ Flexible positioning system
- ✅ Clean separation of concerns
- ✅ Persistent state management

## Future Enhancements

### Possible Additions
1. **Animations**: Fade in/out transitions for tooltips
2. **Sound Effects**: Gentle "ding" on each step
3. **Replay Option**: Button in settings to replay tutorial
4. **Interactive Elements**: Let users tap the actual button during tutorial
5. **Contextual Tips**: Show mini-tooltips when user first uses a feature
6. **Video Tutorial**: Optional video walkthrough
7. **Localization**: Multi-language support

### Analytics to Track
- Tutorial completion rate
- Which step users skip at
- Time spent on each step
- Feature usage after tutorial

## Testing Checklist

- [ ] Tutorial shows on first session entry
- [ ] Tutorial doesn't show on subsequent sessions
- [ ] All 7 steps display correctly
- [ ] Highlights appear on correct buttons
- [ ] Skip button works
- [ ] Next button advances steps
- [ ] Final step closes tutorial
- [ ] AsyncStorage saves completion state
- [ ] Tutorial works on different screen sizes
- [ ] No performance issues with overlay

## Code Locations

- **Tutorial Component**: `app/components/ui/InteractiveTooltip.tsx`
- **Integration**: `app/study-session.tsx` (lines ~40-120)
- **Storage Key**: `hasSeenStudyTutorial` in AsyncStorage
- **Tutorial Steps**: Defined in `study-session.tsx` tooltipSteps array
