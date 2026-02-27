# Zustand Pattern Fix for React 19 Compatibility

## Problem
Using `const { userData } = useQuillbyStore()` causes "stale property" error with React 19.

## Solution
Use selector functions: `const userData = useQuillbyStore((state) => state.userData)`

## Files to Fix (30 total)

### ✅ FIXED
1. `app/(tabs)/_layout.tsx:18` - Fixed
2. `app/welcome-back.tsx:10` - Fixed

### 🔴 NEEDS FIX

#### Core App Files (High Priority)
3. `app/index.tsx:14` - `} = useQuillbyStore();`
4. `app/study-session.tsx:51` - `} = useQuillbyStore();`
5. `app/(tabs)/index.tsx:65` - `storeData = useQuillbyStore();`
6. `app/(tabs)/focus.tsx:27` - `} = useQuillbyStore();`
7. `app/(tabs)/shop.tsx:17` - `const { userData, getShopItems, purchaseItem, equipItem, unequipItem } = useQuillbyStore();`
8. `app/(tabs)/stats.tsx:17` - `const { userData, deadlines, session, getCompletedDeadlines, getUrgentDeadlines, getUpcomingDeadlines } = useQuillbyStore();`
9. `app/(tabs)/settings.tsx:39` - `} = useQuillbyStore();`
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

## Fix Pattern Examples

### Single property:
```tsx
// ❌ Bad
const { userData } = useQuillbyStore();

// ✅ Good
const userData = useQuillbyStore((state) => state.userData);
```

### Multiple properties:
```tsx
// ❌ Bad
const { userData, deadlines, startFocusSession } = useQuillbyStore();

// ✅ Good
const userData = useQuillbyStore((state) => state.userData);
const deadlines = useQuillbyStore((state) => state.deadlines);
const startFocusSession = useQuillbyStore((state) => state.startFocusSession);
```

### Entire store (rare cases):
```tsx
// ❌ Bad
const store = useQuillbyStore();

// ✅ Good - only if you truly need the entire store
const store = useQuillbyStore((state) => state);
// Or better: extract only what you need
const userData = useQuillbyStore((state) => state.userData);
const someMethod = useQuillbyStore((state) => state.someMethod);
```
