# Achievements System - Complete Implementation

## ✅ All Features Implemented

### 1. XP + Q-Coins Rewards
Every achievement now awards both XP and Q-Coins:

| Rarity | XP Range | Q-Coins Range |
|--------|----------|---------------|
| Common | 100-200 | 50-100 |
| Rare | 250-500 | 125-200 |
| Epic | 400-600 | 200-300 |
| Legendary | 1000 | 500 |

### 2. Achievement Unlock Celebration Modal
Beautiful animated modal that shows when an achievement is unlocked:
- 🎉 Confetti/stars animation
- 🏆 Bouncing achievement icon
- 🌟 Rarity-colored glow effect
- ⭐ XP and Q-Coins rewards display
- 📱 Smooth pop-in animation

**File**: `app/components/modals/AchievementUnlockedModal.tsx`

### 3. Achievements Section for Stats
Dedicated section component for the stats screen:
- 📊 Stats cards (Unlocked, Total XP, Completion %)
- 📈 Progress bar showing completion
- 🎯 Recently unlocked achievements carousel
- 👁️ "View All" button to open full modal
- 💫 Empty state for new users

**File**: `app/components/stats/AchievementsSection.tsx`

## Files Created/Updated

### New Files:
1. `app/components/modals/AchievementUnlockedModal.tsx` - Celebration modal
2. `app/components/stats/AchievementsSection.tsx` - Stats section component

### Updated Files:
1. `app/core/types.ts` - Updated Achievement interface with xpReward and coinReward
2. `app/core/achievements.ts` - Added XP and coin rewards to all achievements
3. `app/state/slices/achievementsSlice.ts` - Awards Q-Coins when unlocking
4. `app/components/modals/AchievementsModal.tsx` - Updated to show XP and coins

## Achievement List with Rewards

| Achievement | Icon | XP | Q-Coins | Target |
|------------|------|----|---------| -------|
| First Steps | 🎯 | 100 | 50 | 1 session |
| Week Warrior | 🔥 | 500 | 200 | 7 day streak |
| Espresso Addict | ☕ | 200 | 100 | 10 coffees |
| Perfectionist | ✨ | 300 | 150 | 5 perfect sessions |
| Speed Demon | ⚡ | 400 | 200 | 200 focus score |
| Deadline Crusher | 🏆 | 500 | 250 | 5 deadlines |
| Night Owl | 🦉 | 200 | 100 | 3 night sessions |
| Marathon Runner | 🏃 | 1000 | 500 | 100 hours |
| Early Bird | 🌅 | 250 | 125 | 5 morning sessions |
| Hydration Hero | 💧 | 300 | 150 | 7 day water streak |
| Clean Freak | 🧹 | 200 | 100 | 20 cleanings |
| Zen Master | 🧘 | 600 | 300 | 10 perfect sessions |

## Usage Examples

### 1. Show Celebration Modal When Achievement Unlocks

```typescript
import { useState } from 'react';
import AchievementUnlockedModal from './components/modals/AchievementUnlockedModal';
import { ACHIEVEMENTS } from './core/achievements';

const [showCelebration, setShowCelebration] = useState(false);
const [unlockedAchievement, setUnlockedAchievement] = useState(null);

// When unlocking achievement
const handleUnlock = (achievementId: string) => {
  const { unlockAchievement } = useQuillbyStore.getState();
  unlockAchievement(achievementId);
  
  // Show celebration
  setUnlockedAchievement(ACHIEVEMENTS[achievementId]);
  setShowCelebration(true);
};

// In render
<AchievementUnlockedModal
  visible={showCelebration}
  achievement={unlockedAchievement}
  onClose={() => {
    setShowCelebration(false);
    setUnlockedAchievement(null);
  }}
/>
```

### 2. Add Achievements Section to Stats Screen

```typescript
import AchievementsSection from '../components/stats/AchievementsSection';

// In stats screen
<ScrollView>
  <AchievementsSection />
  {/* Other stats sections */}
</ScrollView>
```

### 3. Check and Unlock Achievements

```typescript
// After completing a focus session
const { checkAchievements } = useQuillbyStore();
checkAchievements();

// Or manually unlock
const { unlockAchievement } = useQuillbyStore();
unlockAchievement('first-focus');
```

## Integration Steps

### Step 1: Add to Stats Screen
```typescript
// In app/(tabs)/stats.tsx
import AchievementsSection from '../components/stats/AchievementsSection';

<ScrollView>
  <AchievementsSection />
  {/* Rest of stats */}
</ScrollView>
```

### Step 2: Add Celebration Modal to App Root
```typescript
// In app/_layout.tsx or main app component
import { useState, useEffect } from 'react';
import AchievementUnlockedModal from './components/modals/AchievementUnlockedModal';
import { useQuillbyStore } from './state/store-modular';

const [showCelebration, setShowCelebration] = useState(false);
const [celebrationAchievement, setCelebrationAchievement] = useState(null);

// Listen for achievement unlocks
useEffect(() => {
  // Subscribe to store changes
  const unsubscribe = useQuillbyStore.subscribe((state, prevState) => {
    const newAchievements = state.userData.achievements || {};
    const oldAchievements = prevState.userData.achievements || {};
    
    // Check for newly unlocked achievements
    Object.keys(newAchievements).forEach(id => {
      if (newAchievements[id].unlocked && !oldAchievements[id]?.unlocked) {
        // Achievement just unlocked!
        setCelebrationAchievement(ACHIEVEMENTS[id]);
        setShowCelebration(true);
      }
    });
  });
  
  return unsubscribe;
}, []);

<AchievementUnlockedModal
  visible={showCelebration}
  achievement={celebrationAchievement}
  onClose={() => {
    setShowCelebration(false);
    setCelebrationAchievement(null);
  }}
/>
```

### Step 3: Trigger Achievement Checks

**After Session Completion**:
```typescript
// In sessionSlice.ts - completeSession()
get().checkAchievements();
```

**After Cleaning**:
```typescript
// In index.tsx - handleFinishCleaning()
const { checkAchievements } = useQuillbyStore.getState();
checkAchievements();
```

**After Coffee/Apple Use**:
```typescript
// Track usage and check
const userData = get().userData;
if (!userData.achievements['coffee-addict']) {
  userData.achievements['coffee-addict'] = { progress: 0, unlocked: false };
}
userData.achievements['coffee-addict'].progress++;
get().checkAchievements();
```

## Features

### Celebration Modal Features:
- ✨ Animated confetti/stars
- 🎨 Rarity-colored glow effects
- 🎯 Bouncing icon animation
- 📊 Clear XP and Q-Coins display
- 🎉 Smooth pop-in animation
- 👆 Easy dismiss button

### Stats Section Features:
- 📊 Three stat cards (Unlocked, XP, Completion)
- 📈 Visual progress bar
- 🎯 Recently unlocked carousel
- 👁️ Quick access to full modal
- 💫 Beautiful empty state

### Full Modal Features:
- 📋 Complete achievement list
- 🔒 Locked/unlocked states
- 📊 Progress bars for locked achievements
- 🎨 Rarity badges with colors
- 📅 Unlock dates
- 🔍 Easy scrolling

## Status

✅ XP + Q-Coins rewards added
✅ Celebration modal created
✅ Stats section component created
✅ All achievements updated with rewards
✅ State management updated
✅ No TypeScript errors
✅ Ready to integrate!

## Next Steps

1. Add AchievementsSection to stats screen
2. Add celebration modal to app root with store subscription
3. Add checkAchievements() calls after key actions
4. Test achievement unlocking flow
5. Enjoy the celebration! 🎉
