# Achievements System Implementation

## Overview
Added a complete achievements and badges system to track user accomplishments and reward progress.

## Features Implemented

### 1. Achievement Types
- **Study Achievements**: Focus sessions, streaks, study hours
- **Habit Achievements**: Hydration, cleaning, meal tracking
- **Premium Achievements**: Coffee usage, special items
- **Special Achievements**: Night owl, early bird, unique accomplishments

### 2. Rarity System
- **Common**: 100 XP (gray badge)
- **Rare**: 300 XP (blue badge)
- **Epic**: 500 XP (purple badge)
- **Legendary**: 1000 XP (orange badge)

### 3. Achievements List

| Achievement | Description | Reward | Rarity |
|------------|-------------|---------|---------|
| 🎯 First Steps | Complete first focus session | +100 XP + badge | Common |
| 🔥 Week Warrior | 7-day perfect study streak | +500 XP + outfit | Rare |
| ☕ Espresso Addict | Use premium coffee 10 times | +200 XP + outfit | Common |
| ✨ Perfectionist | 5 sessions with 0 distractions | +300 XP + color | Rare |
| ⚡ Speed Demon | Earn 200 focus score in one session | +400 XP + outfit | Epic |
| 🏆 Deadline Crusher | Complete 5 deadlines on-time | +500 XP + decoration | Epic |
| 🦉 Night Owl | Study 10 PM - 6 AM (3 times) | +200 XP + decoration | Rare |
| 🏃 Marathon Runner | Accumulate 100 hours of study | +1000 XP + plant | Legendary |
| 🌅 Early Bird | Study 5 AM - 8 AM (5 times) | +250 XP + decoration | Rare |
| 💧 Hydration Hero | Reach water goal for 7 days | +300 XP + decoration | Rare |
| ✨ Clean Freak | Clean room 20 times | +200 XP + effect | Common |
| 🧘 Zen Master | 10 sessions with 0 distractions | +600 XP + yoga | Epic |

## Files Created

### 1. Core Types (`app/core/types.ts`)
```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  icon: string;
  category: 'study' | 'habits' | 'premium' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementProgress {
  [achievementId: string]: {
    progress: number;
    unlocked: boolean;
    unlockedAt?: string;
  };
}
```

### 2. Achievements Configuration (`app/core/achievements.ts`)
- Defines all 12 achievements
- XP rewards by rarity
- Helper functions:
  - `getAllAchievements()`
  - `getAchievementsByCategory()`
  - `getAchievementsByRarity()`
  - `getUnlockedAchievements()`
  - `getLockedAchievements()`
  - `calculateTotalXP()`

### 3. Achievements State Slice (`app/state/slices/achievementsSlice.ts`)
- `checkAchievements()` - Check all achievement conditions
- `unlockAchievement(id)` - Unlock specific achievement
- `getAchievementProgress(id)` - Get progress for achievement
- `isAchievementUnlocked(id)` - Check if unlocked
- `getTotalXP()` - Get total XP earned
- `getUnlockedCount()` - Get count of unlocked achievements

### 4. Achievements Modal UI (`app/components/modals/AchievementsModal.tsx`)
- Beautiful modal with stats header
- Shows unlocked/total count
- Total XP display
- Completion percentage
- Achievement cards with:
  - Icon and unlock badge
  - Name and description
  - Progress bar (for locked achievements)
  - Rarity badge (color-coded)
  - Reward description
  - Unlock date (for unlocked achievements)

## Integration

### Store Integration
Added to `store-modular.ts`:
```typescript
import { AchievementsSlice, createAchievementsSlice } from './slices/achievementsSlice';

export type QuillbyStore = UserSlice & SessionSlice & HabitsSlice & 
                           DeadlinesSlice & ShopSlice & AchievementsSlice & {...}

// In store creation:
...createAchievementsSlice(...args),
```

### UserData Extension
Added to UserData type:
```typescript
achievements?: AchievementProgress;
totalXP?: number;
```

## Usage

### Check Achievements
```typescript
const { checkAchievements } = useQuillbyStore();

// Call after completing a focus session
checkAchievements();
```

### Show Achievements Modal
```typescript
import AchievementsModal from './components/modals/AchievementsModal';

const [showAchievements, setShowAchievements] = useState(false);

<AchievementsModal 
  visible={showAchievements}
  onClose={() => setShowAchievements(false)}
/>
```

### Get Achievement Data
```typescript
const { 
  getTotalXP, 
  getUnlockedCount, 
  isAchievementUnlocked,
  getAchievementProgress 
} = useQuillbyStore();

const totalXP = getTotalXP();
const unlockedCount = getUnlockedCount();
const isUnlocked = isAchievementUnlocked('first-focus');
const progress = getAchievementProgress('coffee-addict');
```

## Next Steps

### 1. Add Achievement Triggers
Update these locations to check achievements:

**Session Completion** (`sessionSlice.ts`):
```typescript
completeSession: () => {
  // ... existing code ...
  
  // Check achievements
  get().checkAchievements();
}
```

**Coffee/Apple Usage** (`sessionSlice.ts`):
```typescript
useCoffee: () => {
  // ... existing code ...
  
  // Track coffee usage for achievement
  const userData = get().userData;
  if (!userData.achievements) userData.achievements = {};
  if (!userData.achievements['coffee-addict']) {
    userData.achievements['coffee-addict'] = { progress: 0, unlocked: false };
  }
  userData.achievements['coffee-addict'].progress++;
  
  get().checkAchievements();
}
```

**Cleaning** (`index.tsx`):
```typescript
handleFinishCleaning: () => {
  // ... existing code ...
  
  // Track cleaning for achievement
  const { userData, checkAchievements } = useQuillbyStore.getState();
  if (!userData.achievements) userData.achievements = {};
  if (!userData.achievements['clean-freak']) {
    userData.achievements['clean-freak'] = { progress: 0, unlocked: false };
  }
  userData.achievements['clean-freak'].progress++;
  
  checkAchievements();
}
```

### 2. Add Achievements Button
Add to stats tab or settings:
```typescript
<TouchableOpacity onPress={() => setShowAchievements(true)}>
  <Text>🏆 Achievements ({unlockedCount}/{totalCount})</Text>
</TouchableOpacity>
```

### 3. Achievement Notifications
Show toast/notification when achievement is unlocked:
```typescript
unlockAchievement: (achievementId: string) => {
  // ... existing code ...
  
  // Show notification
  Alert.alert(
    '🏆 Achievement Unlocked!',
    `${achievement.name}\n${achievement.reward}`,
    [{ text: 'Awesome!', style: 'default' }]
  );
}
```

## Status

✅ Achievement types defined
✅ 12 achievements configured
✅ State management implemented
✅ UI modal created
✅ Store integration complete
✅ Progress tracking system
✅ XP reward system
✅ Rarity system with color coding

Ready to integrate into the app!
