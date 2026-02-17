import { StateCreator } from 'zustand';
import { UserData, AchievementProgress } from '../../core/types';
import { ACHIEVEMENTS } from '../../core/achievements';

export interface AchievementsSlice {
  // Check and unlock achievements
  checkAchievements: () => void;
  unlockAchievement: (achievementId: string) => void;
  
  // Get achievement data
  getAchievementProgress: (achievementId: string) => number;
  isAchievementUnlocked: (achievementId: string) => boolean;
  getTotalXP: () => number;
  getUnlockedCount: () => number;
}

export const createAchievementsSlice: StateCreator<
  { userData: UserData } & AchievementsSlice,
  [],
  [],
  AchievementsSlice
> = (set, get) => ({
  checkAchievements: () => {
    const state = get();
    const userData = state.userData;
    
    if (!userData.achievements) {
      userData.achievements = {};
    }
    
    // Check first-focus
    if (!userData.achievements['first-focus']?.unlocked) {
      const completedSessions = userData.completedFocusSessions?.length || 0;
      if (completedSessions >= 1) {
        state.unlockAchievement('first-focus');
      }
    }
    
    // Check week-warrior
    if (!userData.achievements['week-warrior']?.unlocked) {
      if (userData.currentStreak >= 7) {
        state.unlockAchievement('week-warrior');
      }
    }
    
    // Check coffee-addict
    if (!userData.achievements['coffee-addict']?.unlocked) {
      const coffeeUses = userData.achievements['coffee-addict']?.progress || 0;
      if (coffeeUses >= 10) {
        state.unlockAchievement('coffee-addict');
      }
    }
    
    // Check perfectionist
    if (!userData.achievements['perfectionist']?.unlocked) {
      const perfectSessions = userData.achievements['perfectionist']?.progress || 0;
      if (perfectSessions >= 5) {
        state.unlockAchievement('perfectionist');
      }
    }
    
    // Check marathon-runner
    if (!userData.achievements['marathon-runner']?.unlocked) {
      const totalHours = (userData.studyMinutesToday || 0) / 60;
      if (totalHours >= 100) {
        state.unlockAchievement('marathon-runner');
      }
    }
    
    // Check clean-freak
    if (!userData.achievements['clean-freak']?.unlocked) {
      const cleanCount = userData.achievements['clean-freak']?.progress || 0;
      if (cleanCount >= 20) {
        state.unlockAchievement('clean-freak');
      }
    }
    
    // Check hydration-hero
    if (!userData.achievements['hydration-hero']?.unlocked) {
      const hydrationStreak = userData.achievements['hydration-hero']?.progress || 0;
      if (hydrationStreak >= 7) {
        state.unlockAchievement('hydration-hero');
      }
    }
  },
  
  unlockAchievement: (achievementId: string) => {
    set((state) => {
      const achievement = ACHIEVEMENTS[achievementId];
      if (!achievement) {
        console.log('[Achievements] ❌ Achievement not found:', achievementId);
        return state;
      }
      
      // Create completely new userData object (deep copy)
      const userData = {
        ...state.userData,
        achievements: {
          ...(state.userData.achievements || {}),
        }
      };
      
      // Check if already unlocked
      if (userData.achievements[achievementId]?.unlocked) {
        console.log('[Achievements] ⚠️ Already unlocked:', achievementId);
        return state;
      }
      
      // Unlock achievement with new object
      userData.achievements[achievementId] = {
        progress: achievement.target || 1,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
      
      // Add Gems reward (xpReward now represents Gems)
      userData.totalXP = (userData.totalXP || 0) + achievement.xpReward;
      
      // Add Q-Bies reward (coinReward now represents Q-Bies)
      userData.qCoins = (userData.qCoins || 0) + achievement.coinReward;
      
      console.log(`[Achievements] 🏆 Unlocked: ${achievement.name} (+${achievement.xpReward} Gems, +${achievement.coinReward} Q-Bies)`);
      console.log('[Achievements] New state:', {
        id: achievementId,
        unlocked: userData.achievements[achievementId].unlocked,
        totalGems: userData.totalXP,
        qBies: userData.qCoins
      });
      
      return { userData };
    });
  },
  
  getAchievementProgress: (achievementId: string) => {
    const userData = get().userData;
    return userData.achievements?.[achievementId]?.progress || 0;
  },
  
  isAchievementUnlocked: (achievementId: string) => {
    const userData = get().userData;
    return userData.achievements?.[achievementId]?.unlocked || false;
  },
  
  getTotalXP: () => {
    const userData = get().userData;
    return userData.totalXP || 0;
  },
  
  getUnlockedCount: () => {
    const userData = get().userData;
    if (!userData.achievements) return 0;
    
    return Object.values(userData.achievements).filter(a => a.unlocked).length;
  },
});
