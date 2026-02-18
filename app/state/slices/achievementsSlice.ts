import { StateCreator } from 'zustand';
import { UserData, AchievementProgress } from '../../core/types';
import { ACHIEVEMENTS } from '../../core/achievements';

export interface AchievementsSlice {
  // Check and unlock achievements
  checkAchievements: () => void;
  checkSpecificAchievement: (achievementId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  
  // Get achievement data
  getAchievementProgress: (achievementId: string) => number;
  isAchievementUnlocked: (achievementId: string) => boolean;
  getTotalXP: () => number;
  getUnlockedCount: () => number;
  
  // Reset achievements for new periods
  resetDailyAchievements: () => void;
  resetWeeklyAchievements: () => void;
  resetMonthlyAchievements: () => void;
}

export const createAchievementsSlice: StateCreator<
  { userData: UserData } & AchievementsSlice,
  [],
  [],
  AchievementsSlice
> = (set, get) => ({
  checkSpecificAchievement: (achievementId: string) => {
    const state = get();
    const userData = state.userData;
    const deadlines = (state as any).deadlines || [];
    
    if (!userData.achievements) {
      userData.achievements = {};
    }
    
    // If already unlocked, don't check again
    if (userData.achievements[achievementId]?.unlocked) {
      console.log(`[Achievements] ${achievementId} already unlocked, skipping`);
      return;
    }
    
    console.log(`[Achievements] 🎯 Checking specific achievement: ${achievementId}`);
    
    let shouldUnlock = false;
    
    switch (achievementId) {
      case 'secret-first-deadline':
        shouldUnlock = deadlines.length >= 1;
        break;
      case 'secret-first-session':
        shouldUnlock = (userData.completedFocusSessions?.length || 0) >= 1;
        break;
      case 'secret-first-clean':
        shouldUnlock = (userData.achievements?.['secret-first-clean']?.progress || 0) >= 1;
        break;
      case 'daily-water':
        shouldUnlock = userData.waterGlasses >= 8;
        break;
      case 'daily-meals':
        shouldUnlock = userData.mealsLogged >= 3;
        break;
      case 'daily-session':
        const sessionsToday = userData.completedFocusSessions?.filter((s: any) => {
          const sessionDate = new Date(s.timestamp).toDateString();
          const today = new Date().toDateString();
          return sessionDate === today;
        }).length || 0;
        shouldUnlock = sessionsToday >= 1;
        break;
      case 'daily-hours':
        shouldUnlock = ((userData.studyMinutesToday || 0) / 60) >= 2;
        break;
      case 'weekly-streak':
        shouldUnlock = userData.currentStreak >= 7;
        break;
      case 'secret-clean-freak':
        shouldUnlock = (userData.achievements?.['secret-clean-freak']?.progress || 0) >= 30;
        break;
      default:
        console.log(`[Achievements] No specific check for ${achievementId}, running full check`);
        state.checkAchievements();
        return;
    }
    
    if (shouldUnlock) {
      console.log(`[Achievements] ✅ ${achievementId} conditions met, unlocking!`);
      state.unlockAchievement(achievementId);
    } else {
      console.log(`[Achievements] ❌ ${achievementId} conditions not met yet`);
    }
  },
  
  checkAchievements: () => {
    const state = get();
    const userData = state.userData;
    const deadlines = (state as any).deadlines || [];
    
    if (!userData.achievements) {
      userData.achievements = {};
    }
    
    console.log('[Achievements] 🔍 Checking all achievements...');
    
    // Helper to track progress for achievements that need it
    const updateProgress = (id: string, current: number) => {
      if (!userData.achievements) {
        userData.achievements = {};
      }
      if (!userData.achievements[id]) {
        userData.achievements[id] = { progress: current, unlocked: false };
      } else if (!userData.achievements[id].unlocked) {
        userData.achievements[id].progress = current;
      }
    };
    
    // ========== DAILY CHALLENGES ==========
    
    // daily-session: Complete 1 focus session today
    const sessionsToday = userData.completedFocusSessions?.filter((s: any) => {
      const sessionDate = new Date(s.timestamp).toDateString();
      const today = new Date().toDateString();
      return sessionDate === today;
    }).length || 0;
    
    if (!userData.achievements['daily-session']?.unlocked && sessionsToday >= 1) {
      console.log('[Achievements] ✅ Daily session unlocked!');
      state.unlockAchievement('daily-session');
      return;
    }
    
    // daily-water: Drink 8 glasses today
    if (!userData.achievements['daily-water']?.unlocked && userData.waterGlasses >= 8) {
      console.log('[Achievements] ✅ Daily water unlocked!');
      state.unlockAchievement('daily-water');
      return;
    }
    
    // daily-meals: Log 3 meals today
    if (!userData.achievements['daily-meals']?.unlocked && userData.mealsLogged >= 3) {
      console.log('[Achievements] ✅ Daily meals unlocked!');
      state.unlockAchievement('daily-meals');
      return;
    }
    
    // daily-hours: Study 2 hours today
    const hoursToday = (userData.studyMinutesToday || 0) / 60;
    if (!userData.achievements['daily-hours']?.unlocked && hoursToday >= 2) {
      console.log('[Achievements] ✅ Daily hours unlocked!');
      state.unlockAchievement('daily-hours');
      return;
    }
    
    // daily-early: Start session before 9 AM (checked in session start)
    
    // ========== WEEKLY CHALLENGES ==========
    
    // weekly-streak: 7 consecutive days
    if (!userData.achievements['weekly-streak']?.unlocked && userData.currentStreak >= 7) {
      console.log('[Achievements] ✅ Weekly streak unlocked!');
      state.unlockAchievement('weekly-streak');
      return;
    }
    
    // weekly-sessions, weekly-hours, weekly-clean, weekly-hydration
    // These need weekly tracking - will be checked by weekly reset system
    
    // ========== BEGINNER SECRETS ==========
    
    // secret-first-session: First focus session ever
    const totalSessions = userData.completedFocusSessions?.length || 0;
    if (!userData.achievements['secret-first-session']?.unlocked && totalSessions >= 1) {
      console.log('[Achievements] ✅ First session unlocked!');
      state.unlockAchievement('secret-first-session');
      return;
    }
    
    // secret-first-deadline: First deadline created
    if (!userData.achievements['secret-first-deadline']?.unlocked && deadlines.length >= 1) {
      console.log('[Achievements] ✅ First deadline unlocked!');
      state.unlockAchievement('secret-first-deadline');
      return;
    }
    
    // secret-first-perfect: First perfect session (0 distractions)
    const perfectSessions = userData.completedFocusSessions?.filter((s: any) => s.distractions === 0).length || 0;
    if (!userData.achievements['secret-first-perfect']?.unlocked && perfectSessions >= 1) {
      console.log('[Achievements] ✅ First perfect session unlocked!');
      state.unlockAchievement('secret-first-perfect');
      return;
    }
    
    // secret-first-clean: First room cleaning
    const cleanCount = userData.achievements['secret-first-clean']?.progress || 0;
    if (!userData.achievements['secret-first-clean']?.unlocked && cleanCount >= 1) {
      console.log('[Achievements] ✅ First clean unlocked!');
      state.unlockAchievement('secret-first-clean');
      return;
    }
    
    // ========== CONSUMPTION SECRETS ==========
    
    // secret-coffee-lover: Use 25 coffees
    const coffeeCount = userData.achievements['secret-coffee-lover']?.progress || 0;
    updateProgress('secret-coffee-lover', coffeeCount);
    if (!userData.achievements['secret-coffee-lover']?.unlocked && coffeeCount >= 25) {
      console.log('[Achievements] ✅ Coffee lover unlocked!');
      state.unlockAchievement('secret-coffee-lover');
      return;
    }
    
    // secret-apple-fan: Use 25 apples
    const appleCount = userData.achievements['secret-apple-fan']?.progress || 0;
    updateProgress('secret-apple-fan', appleCount);
    if (!userData.achievements['secret-apple-fan']?.unlocked && appleCount >= 25) {
      console.log('[Achievements] ✅ Apple fan unlocked!');
      state.unlockAchievement('secret-apple-fan');
      return;
    }
    
    // secret-shopaholic: Purchase 30 items
    const purchaseCount = userData.purchasedItems?.length || 0;
    if (!userData.achievements['secret-shopaholic']?.unlocked && purchaseCount >= 30) {
      console.log('[Achievements] ✅ Shopaholic unlocked!');
      state.unlockAchievement('secret-shopaholic');
      return;
    }
    
    // ========== TIME-BASED SECRETS ==========
    // These are checked when sessions start/end based on time
    
    // ========== PROGRESS MILESTONES ==========
    
    // secret-perfectionist: 10 perfect sessions
    updateProgress('secret-perfectionist', perfectSessions);
    if (!userData.achievements['secret-perfectionist']?.unlocked && perfectSessions >= 10) {
      console.log('[Achievements] ✅ Perfectionist unlocked!');
      state.unlockAchievement('secret-perfectionist');
      return;
    }
    
    // secret-speed-demon: 250 focus score in one session (checked in session end)
    
    // secret-clean-freak: Clean room 30 times
    const totalCleans = userData.achievements['secret-clean-freak']?.progress || 0;
    updateProgress('secret-clean-freak', totalCleans);
    if (!userData.achievements['secret-clean-freak']?.unlocked && totalCleans >= 30) {
      console.log('[Achievements] ✅ Clean freak unlocked!');
      state.unlockAchievement('secret-clean-freak');
      return;
    }
    
    // secret-deadline-master: Complete 15 deadlines on time
    const completedDeadlines = deadlines.filter((d: any) => d.isCompleted).length;
    if (!userData.achievements['secret-deadline-master']?.unlocked && completedDeadlines >= 15) {
      console.log('[Achievements] ✅ Deadline master unlocked!');
      state.unlockAchievement('secret-deadline-master');
      return;
    }
    
    // ========== EPIC MILESTONES ==========
    
    // secret-century: 100 total sessions
    if (!userData.achievements['secret-century']?.unlocked && totalSessions >= 100) {
      console.log('[Achievements] ✅ Century club unlocked!');
      state.unlockAchievement('secret-century');
      return;
    }
    
    // secret-marathon: 100 total hours
    // Calculate total hours from completed sessions (assuming each session has duration)
    const totalMinutes = userData.completedFocusSessions?.reduce((sum: number, session: any) => {
      return sum + (session.duration || 0);
    }, 0) || 0;
    const totalHours = totalMinutes / 60;
    if (!userData.achievements['secret-marathon']?.unlocked && totalHours >= 100) {
      console.log('[Achievements] ✅ Marathon runner unlocked!');
      state.unlockAchievement('secret-marathon');
      return;
    }
    
    // secret-zen-master: 25 perfect sessions
    if (!userData.achievements['secret-zen-master']?.unlocked && perfectSessions >= 25) {
      console.log('[Achievements] ✅ Zen master unlocked!');
      state.unlockAchievement('secret-zen-master');
      return;
    }
    
    // ========== LEGENDARY SECRETS ==========
    
    // secret-scholar: 500 total hours (reuse totalHours from above)
    if (!userData.achievements['secret-scholar']?.unlocked && totalHours >= 500) {
      console.log('[Achievements] ✅ The Scholar unlocked!');
      state.unlockAchievement('secret-scholar');
      return;
    }
    
    // secret-legend: 1000 total hours (reuse totalHours from above)
    if (!userData.achievements['secret-legend']?.unlocked && totalHours >= 1000) {
      console.log('[Achievements] ✅ Living Legend unlocked!');
      state.unlockAchievement('secret-legend');
      return;
    }
    
    // secret-completionist: Unlock all other 32 achievements
    const unlockedCount = Object.values(userData.achievements).filter((a: any) => a.unlocked).length;
    if (!userData.achievements['secret-completionist']?.unlocked && unlockedCount >= 32) {
      console.log('[Achievements] ✅ Ultimate Master unlocked!');
      state.unlockAchievement('secret-completionist');
      return;
    }
    
    console.log('[Achievements] No new achievements unlocked this check');
  },
  
  unlockAchievement: (achievementId: string) => {
    console.log('[Achievements] 🔓 unlockAchievement called for:', achievementId);
    
    set((state) => {
      const achievement = ACHIEVEMENTS[achievementId];
      if (!achievement) {
        console.log('[Achievements] ❌ Achievement not found:', achievementId);
        return state;
      }
      
      console.log('[Achievements] Found achievement:', achievement.name);
      
      // Initialize achievements if needed
      if (!state.userData.achievements) {
        console.log('[Achievements] Initializing achievements object');
        state.userData.achievements = {};
      }
      
      // Check if already unlocked
      if (state.userData.achievements[achievementId]?.unlocked) {
        console.log('[Achievements] ⚠️ Already unlocked:', achievementId);
        return state;
      }
      
      console.log('[Achievements] 🎉 Unlocking achievement:', achievement.name);
      
      // Determine achievement type
      let achievementType: 'daily' | 'weekly' | 'monthly' | 'secret' = 'secret';
      if (achievementId.startsWith('daily-')) achievementType = 'daily';
      else if (achievementId.startsWith('weekly-')) achievementType = 'weekly';
      else if (achievementId.startsWith('monthly-')) achievementType = 'monthly';
      
      // Save to history (async, don't wait)
      const getUserId = async () => {
        try {
          const { supabase } = await import('../../../lib/supabase');
          const { data } = await supabase.auth.getUser();
          return data.user?.id;
        } catch (error: any) {
          console.error('[Achievements] Error getting user ID:', error);
          return null;
        }
      };
      
      getUserId().then(async (userId) => {
        if (userId) {
          try {
            const { saveAchievementToHistory } = await import('../../../lib/achievementHistory');
            await saveAchievementToHistory(
              userId,
              achievementId,
              achievement.name,
              achievementType,
              achievement.xpReward, // Gems
              achievement.coinReward // Q-Bies
            );
          } catch (err: any) {
            console.error('[Achievements] Failed to save to history:', err);
          }
        }
      });
      
      // Create completely new userData object (deep copy)
      const newUserData = {
        ...state.userData,
        achievements: {
          ...state.userData.achievements,
          [achievementId]: {
            progress: achievement.target || 1,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          }
        },
        // Add Gems reward (xpReward now represents Gems)
        gems: (state.userData.gems || 0) + achievement.xpReward,
        // Add Q-Bies reward (coinReward now represents Q-Bies)
        qCoins: (state.userData.qCoins || 0) + achievement.coinReward,
      };
      
      console.log(`[Achievements] 🏆 Unlocked: ${achievement.name}`);
      console.log(`[Achievements] Rewards: +${achievement.xpReward} Gems, +${achievement.coinReward} Q-Bies`);
      console.log('[Achievements] New totals:', {
        gems: newUserData.gems,
        qBies: newUserData.qCoins,
        achievementUnlocked: newUserData.achievements[achievementId].unlocked
      });
      
      return { userData: newUserData };
    });
    
    console.log('[Achievements] ✅ State updated, modal should appear');
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
    return userData.gems || 0;
  },
  
  getUnlockedCount: () => {
    const userData = get().userData;
    if (!userData.achievements) return 0;
    
    return Object.values(userData.achievements).filter(a => a.unlocked).length;
  },
  
  // Reset daily achievements (called at midnight)
  resetDailyAchievements: () => {
    console.log('[Achievements] 🌅 Resetting daily achievements for new day');
    
    set((state) => {
      const dailyAchievementIds = [
        'daily-session',
        'daily-water',
        'daily-meals',
        'daily-hours',
        'daily-early'
      ];
      
      const newAchievements = { ...state.userData.achievements };
      
      // Reset each daily achievement (keep unlocked status but reset progress)
      dailyAchievementIds.forEach(id => {
        if (newAchievements[id]) {
          newAchievements[id] = {
            progress: 0,
            unlocked: false, // Reset unlock status for new day
          };
          console.log(`[Achievements] Reset ${id}`);
        }
      });
      
      return {
        userData: {
          ...state.userData,
          achievements: newAchievements
        }
      };
    });
    
    console.log('[Achievements] ✅ Daily achievements reset complete');
  },
  
  // Reset weekly achievements (called at start of new week)
  resetWeeklyAchievements: () => {
    console.log('[Achievements] 📅 Resetting weekly achievements for new week');
    
    set((state) => {
      const weeklyAchievementIds = [
        'weekly-streak',
        'weekly-sessions',
        'weekly-hours',
        'weekly-clean',
        'weekly-hydration'
      ];
      
      const newAchievements = { ...state.userData.achievements };
      
      // Reset each weekly achievement
      weeklyAchievementIds.forEach(id => {
        if (newAchievements[id]) {
          newAchievements[id] = {
            progress: 0,
            unlocked: false,
          };
          console.log(`[Achievements] Reset ${id}`);
        }
      });
      
      return {
        userData: {
          ...state.userData,
          achievements: newAchievements
        }
      };
    });
    
    console.log('[Achievements] ✅ Weekly achievements reset complete');
  },
  
  // Reset monthly achievements (called at start of new month)
  resetMonthlyAchievements: () => {
    console.log('[Achievements] 👑 Resetting monthly achievements for new month');
    
    set((state) => {
      const monthlyAchievementIds = [
        'monthly-hours',
        'monthly-streak',
        'monthly-deadlines',
        'monthly-perfect',
        'monthly-sessions'
      ];
      
      const newAchievements = { ...state.userData.achievements };
      
      // Reset each monthly achievement
      monthlyAchievementIds.forEach(id => {
        if (newAchievements[id]) {
          newAchievements[id] = {
            progress: 0,
            unlocked: false,
          };
          console.log(`[Achievements] Reset ${id}`);
        }
      });
      
      return {
        userData: {
          ...state.userData,
          achievements: newAchievements
        }
      };
    });
    
    console.log('[Achievements] ✅ Monthly achievements reset complete');
  },
});
