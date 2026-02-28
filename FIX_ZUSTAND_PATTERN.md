# Zustand 5 Pattern for React 19 Compatibility

## Problem
Using `const { userData } = useQuillbyStore()` without `useShallow` can cause unnecessary re-renders in Zustand 5 + React 19.

## Solution (Zustand 5)
Use selector functions OR use `useShallow` for destructuring multiple values.

## Files to Fix (30 total)

### ✅ FIXED
1. `app/(tabs)/_layout.tsx:18` - Fixed
2. `app/welcome-back.tsx:10` - Fixed
3. `app/(tabs)/index.tsx:65` - Fixed (using individual selectors)
4. `app/(tabs)/focus.tsx:27` - Fixed (using individual selectors)
5. `app/(tabs)/shop.tsx:17` - Fixed (using individual selectors)
6. `app/(tabs)/stats.tsx:17` - Fixed (using individual selectors)
7. `app/(tabs)/settings.tsx:39` - Fixed (using individual selectors)
8. `app/study-session.tsx:51` - Fixed (using individual selectors)

### 🔴 NEEDS FIX

#### Core App Files (High Priority)
9. `app/index.tsx:14` - `} = useQuillbyStore();`
10. `app/session-customization.tsx:64` - `const { userData, startFocusSession } = useQuillbyStore();`

#### Components
11. `app/components/ui/RealTimeClock.tsx:14` - `const { userData } = useQuillbyStore();`
12. `app/components/room/RoomLayers.tsx:21` - `const { userData } = useQuillbyStore();`
13. `app/components/progress/StudyProgress.tsx:7` - `const { userData, checkStudyCheckpoints } = useQuillbyStore();`
14. `app/components/modals/DeadlineDetailModal.tsx:38` - `const { updateReminders, userData } = useQuillbyStore();`
15. `app/components/modals/DayDetailsModal.tsx:22` - `const { userData, deadlines, deleteDeadline, startFocusSession } = useQuillbyStore();`
16. `app/components/modals/PremiumPaywallModal.tsx:31` - `const { setPremiumStatus } = useQuillbyStore();`
17. `app/components/modals/AchievementsModal.tsx:75` - `const { userData, getTotalXP, getUnlockedCount } = useQuillbyStore();`
18. `app/components/modals/AchievementUnlockedModal.tsx:168` - `const { userData } = require('../../state/store-modular').useQuillbyStore();`
19. `app/components/themed/ThemedScreen.tsx:14` - `const { userData } = useQuillbyStore();`
20. `app/components/ImagePreloader.tsx:17` - `const { userData } = useQuillbyStore();`
21. `app/components/stats/AchievementsSection.tsx:66` - `const { userData } = useQuillbyStore();`
22. `app/components/stats/StreakCalendar.tsx:23` - `const { deadlines } = useQuillbyStore();`

#### Hooks
23. `app/hooks/useDayEvaluationMessages.ts:11` - `const store = useQuillbyStore();`
24. `app/hooks/useNotifications.tsx:20` - `const { userData, checkStudyCheckpoints, deadlines } = useQuillbyStore();`
25. `app/hooks/useSleepTracking.tsx:8` - `const { userData, startSleep, endSleep, getTodaysSleepHours } = useQuillbyStore();`
26. `app/hooks/useExerciseTracking.tsx:8` - `const { userData, logExercise, resetDay } = useQuillbyStore();`
27. `app/hooks/useWaterTracking.tsx:7` - `const { userData, logWater } = useQuillbyStore();`
28. `app/hooks/useIdleMessages.tsx:104` - `const { userData } = useQuillbyStore();`
29. `app/hooks/useRandomReminders.tsx:81` - `const { userData } = useQuillbyStore();`
30. `app/hooks/useTimeBasedHabitFeedback.tsx:7` - `const { userData, getTodaysSleepHours } = useQuillbyStore();`
31. `app/hooks/useMealTracking.tsx:7` - `const { userData, logMeal } = useQuillbyStore();`

#### Onboarding
32. `app/onboarding/tutorial.tsx:96` - `const { completeOnboarding } = useQuillbyStore();`

## Zustand 5 Pattern Examples

### Single property (both work):
```tsx
// ✅ Option 1: Selector (recommended for performance)
const userData = useQuillbyStore((state) => state.userData);

// ✅ Option 2: Direct destructuring (works in Zustand 5)
const { userData } = useQuillbyStore();
```

### Multiple properties:
```tsx
// ✅ Option 1: Individual selectors (best performance)
const userData = useQuillbyStore((state) => state.userData);
const deadlines = useQuillbyStore((state) => state.deadlines);
const startFocusSession = useQuillbyStore((state) => state.startFocusSession);

// ✅ Option 2: useShallow for destructuring (Zustand 5)
import { useShallow } from 'zustand/react/shallow';

const { userData, deadlines, startFocusSession } = useQuillbyStore(
  useShallow((state) => ({ 
    userData: state.userData, 
    deadlines: state.deadlines,
    startFocusSession: state.startFocusSession 
  }))
);

// ⚠️ Works but may cause unnecessary re-renders
const { userData, deadlines, startFocusSession } = useQuillbyStore();
```

### Entire store (rare cases):
```tsx
// ❌ Avoid - causes re-renders on any state change
const store = useQuillbyStore();

// ✅ Better: Extract only what you need
const userData = useQuillbyStore((state) => state.userData);
const someMethod = useQuillbyStore((state) => state.someMethod);
```

## Key Differences: Zustand 4 vs 5

### Zustand 4
- Destructuring `const { x } = useStore()` caused "stale" errors with React 19
- MUST use selectors: `const x = useStore((state) => state.x)`

### Zustand 5
- Destructuring works but may cause unnecessary re-renders
- Use `useShallow` for multiple values to optimize re-renders
- Selectors still recommended for best performance

## Recommendation
For this codebase, continue using individual selectors as they provide the best performance and are already implemented in critical files.
