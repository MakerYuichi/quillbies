// Habits-related state and actions
import { StateCreator } from 'zustand';
import { SleepSession } from '../../core/types';
import { UserSlice } from './userSlice';
import { syncToDatabase } from '../utils/syncUtils';

export interface HabitsSlice {
  // Habit actions
  logWater: () => void;
  logBreakfast: () => void;
  logMeal: () => void;
  logExercise: (minutes: number) => void;
  startSleep: () => string;
  endSleep: (sessionId: string) => void;
  getTodaysSleepHours: () => number;
  skipTask: () => void;
  cleanRoom: (messPointsReduced: number) => void;
}

export const createHabitsSlice: StateCreator<
  HabitsSlice & UserSlice & { checkAchievements?: () => void; checkSpecificAchievement?: (id: string) => void },
  [],
  [],
  HabitsSlice
> = (set, get) => ({
  logWater: () => {
    const { userData, checkSpecificAchievement } = get() as any;
    const hydrationGoal = userData.hydrationGoalGlasses || 8;
    const HARD_LIMIT = 16; // Maximum glasses allowed per day
    
    // Check if at hard limit
    if (userData.waterGlasses >= HARD_LIMIT) {
      console.log(`[Water] Hard limit reached (${userData.waterGlasses}/${HARD_LIMIT}), cannot log more`);
      return;
    }
    
    // Check if already at or above goal
    if (userData.waterGlasses >= hydrationGoal) {
      console.log(`[Water] Already at goal (${userData.waterGlasses}/${hydrationGoal}), no coins awarded`);
      
      // Still increment count but no rewards (up to hard limit)
      const newCount = userData.waterGlasses + 1;
      const updatedUserData = {
        ...userData,
        waterGlasses: newCount,
      };
      
      set({ userData: updatedUserData });
      syncToDatabase(updatedUserData);
      
      console.log(`[Water] Logged glass ${newCount} (goal: ${hydrationGoal}) - no rewards`);
      return;
    }
    
    // Below goal - give rewards
    // Calculate coins to ensure total is always 40 coins at goal
    const TOTAL_COINS_AT_GOAL = 40;
    const newCount = userData.waterGlasses + 1;
    
    // Calculate how many coins should have been earned by now
    const targetCoinsAtThisGlass = Math.floor((newCount / hydrationGoal) * TOTAL_COINS_AT_GOAL);
    
    // Calculate how many coins were earned in previous glasses
    const previousTargetCoins = Math.floor((userData.waterGlasses / hydrationGoal) * TOTAL_COINS_AT_GOAL);
    
    // The difference is what we should give now
    const coinsToGive = targetCoinsAtThisGlass - previousTargetCoins;
    
    const energyGain = 5;
    
    const updatedUserData = {
      ...userData,
      waterGlasses: newCount,
      energy: Math.min(userData.energy + energyGain, 100),
      qCoins: userData.qCoins + coinsToGive
    };
    
    set({ userData: updatedUserData });
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    console.log(`[Water] Logged glass ${newCount}/${hydrationGoal} - +5 energy, +${coinsToGive} coins (total will be ${TOTAL_COINS_AT_GOAL} at goal)`);
    
    // Check for daily-water achievement (8 glasses)
    if (newCount >= 8) {
      console.log('[Water] 8 glasses logged today - checking achievement');
      setTimeout(() => {
        checkSpecificAchievement?.('daily-water');
      }, 100);
    }
  },

  logBreakfast: () => {
    const { userData } = get();
    
    if (userData.ateBreakfast) {
      console.log('[Breakfast] Already logged today');
      return;
    }
    
    const energyGain = 10;
    
    const updatedUserData = {
      ...userData,
      ateBreakfast: true,
      energy: Math.min(userData.energy + energyGain, 100),
      qCoins: userData.qCoins + 10,
      maxEnergyCap: 100
    };
    
    set({ userData: updatedUserData });
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    console.log('[Breakfast] Logged breakfast');
  },

  logMeal: () => {
    const { userData, checkSpecificAchievement } = get() as any;
    const mealGoal = userData.mealGoalCount || 3;
    
    // Calculate hard limit based on meal goal
    // Lose weight (2 meal goal) -> max 2 meals (no extras)
    // Normal (3 meal goal) -> max 4 meals (1 extra allowed)
    // Gain weight (4 meal goal) -> max 5 meals (1 extra allowed)
    let hardLimit = 4;
    if (mealGoal === 2) {
      hardLimit = 2; // Lose weight: strict, no extras
    } else if (mealGoal === 3) {
      hardLimit = 4; // Normal: 3 goal + 1 extra = 4 max
    } else if (mealGoal >= 4) {
      hardLimit = 5; // Gain weight: 4 goal + 1 extra = 5 max
    }
    
    // Check if at hard limit
    if (userData.mealsLogged >= hardLimit) {
      console.log(`[Meal] Hard limit reached (${userData.mealsLogged}/${hardLimit}), cannot log more`);
      return;
    }
    
    const mealCount = userData.mealsLogged + 1;
    const energyGain = 10;
    const currentHour = new Date().getHours();
    
    // If it's morning (6-11 AM) and this is the first meal, mark breakfast as eaten
    const isBreakfastTime = currentHour >= 6 && currentHour <= 11;
    const shouldMarkBreakfast = isBreakfastTime && !userData.ateBreakfast;
    
    // Calculate coins proportionally like water (total 30 coins at goal)
    const TOTAL_COINS_AT_GOAL = 30;
    let coinsToGive = 0;
    
    if (mealCount <= mealGoal) {
      // Calculate how many coins should have been earned by now
      const targetCoinsAtThisMeal = Math.floor((mealCount / mealGoal) * TOTAL_COINS_AT_GOAL);
      
      // Calculate how many coins were earned in previous meals
      const previousTargetCoins = Math.floor((userData.mealsLogged / mealGoal) * TOTAL_COINS_AT_GOAL);
      
      // The difference is what we should give now
      coinsToGive = targetCoinsAtThisMeal - previousTargetCoins;
    }
    // If beyond goal, no coins
    
    const updatedUserData = {
      ...userData,
      mealsLogged: mealCount,
      ateBreakfast: shouldMarkBreakfast ? true : userData.ateBreakfast,
      energy: Math.min(userData.energy + energyGain, 100),
      qCoins: userData.qCoins + coinsToGive
    };
    
    set({ userData: updatedUserData });
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    if (shouldMarkBreakfast) {
      console.log('[Meal] Breakfast logged - reminder will stop');
    }
    
    if (coinsToGive > 0) {
      console.log(`[Meal] Logged meal ${mealCount}/${mealGoal} - +10 energy, +${coinsToGive} coins (total will be ${TOTAL_COINS_AT_GOAL} at goal)`);
    } else {
      console.log(`[Meal] Logged meal ${mealCount}/${mealGoal} (extra meal) - +10 energy, no coins`);
    }
    
    // Check for daily-meals achievement (3 meals logged)
    if (mealCount >= 3) {
      console.log('[Meal] 3 meals logged today - checking achievement');
      // Use setTimeout to ensure state is updated before checking
      setTimeout(() => {
        checkSpecificAchievement?.('daily-meals');
      }, 100);
    }
  },

  logExercise: (minutes: number) => {
    const { userData } = get();
    
    const today = new Date().toDateString();
    const isNewDay = userData.lastExerciseReset !== today;
    
    const accumulatedMinutes = isNewDay ? minutes : userData.exerciseMinutes + minutes;
    const energyGain = 15;
    
    const updatedUserData = {
      ...userData,
      exerciseMinutes: accumulatedMinutes,
      energy: Math.min(userData.energy + energyGain, 100),
      qCoins: userData.qCoins + Math.min(minutes, 30),
      lastExerciseReset: today
    };
    
    set({ userData: updatedUserData });
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    console.log(`[Exercise] Logged ${minutes} minutes (total today: ${accumulatedMinutes})`);
  },

  startSleep: () => {
    const { userData } = get();
    const now = new Date();
    const sessionId = `sleep-${Date.now()}`;
    
    const newSession: Partial<SleepSession> = {
      id: sessionId,
      start: now.toISOString(),
    };
    
    set({
      userData: {
        ...userData,
        activeSleepSession: newSession as Partial<SleepSession>
      }
    });
    
    return sessionId;
  },

  endSleep: (sessionId: string) => {
    const { userData } = get();
    const now = new Date();
    
    const activeSession = (userData as any).activeSleepSession;
    if (!activeSession || activeSession.id !== sessionId) {
      console.warn(`[Sleep] No active session found for ID: ${sessionId}`);
      return;
    }
    
    const startTime = new Date(activeSession.start);
    const duration = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Duration in hours with decimal precision
    
    const sleepDate = startTime.getHours() < 6 
      ? new Date(startTime.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : startTime.toISOString().split('T')[0];
    
    const completedSession: SleepSession = {
      id: sessionId,
      start: activeSession.start,
      end: now.toISOString(),
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places (includes minutes precision)
      date: sleepDate
    };
    
    const updatedSessions = [...(userData.sleepSessions || []), completedSession];
    
    // Calculate today's total sleep
    const today = new Date().toISOString().split('T')[0];
    const todaysSleep = updatedSessions
      .filter(session => session.date === today)
      .reduce((total, session) => total + session.duration, 0);
    
    // Calculate sleep coins
    let sleepCoins = 0;
    if (todaysSleep >= 8) sleepCoins = 25;
    else if (todaysSleep >= 7) sleepCoins = 20;
    else if (todaysSleep >= 6) sleepCoins = 10;
    
    const updatedUserData = {
      ...userData,
      sleepSessions: updatedSessions,
      maxEnergyCap: 100,
      qCoins: userData.qCoins + sleepCoins,
      activeSleepSession: undefined
    };
    
    set({ userData: updatedUserData });
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    console.log(`[Sleep] Ended session ${sessionId}, duration: ${duration.toFixed(2)}h, coins: ${sleepCoins}`);
  },

  getTodaysSleepHours: () => {
    const { userData } = get();
    const today = new Date().toISOString().split('T')[0];
    
    return (userData.sleepSessions || [])
      .filter(session => session.date === today)
      .reduce((total, session) => total + session.duration, 0);
  },

  skipTask: () => {
    const { userData } = get();
    const messIncrease = 1.0; // Simple mess increase for skipped tasks
    
    const updatedUserData = {
      ...userData,
      messPoints: userData.messPoints + messIncrease
    };
    
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
    
    console.log(`[SkipTask] Added ${messIncrease} mess points (${userData.messPoints} → ${updatedUserData.messPoints})`);
  },

  cleanRoom: (messPointsReduced: number) => {
    const { userData, checkSpecificAchievement } = get() as any;
    const newMessPoints = Math.max(0, userData.messPoints - messPointsReduced);
    
    const energyReward = Math.floor(messPointsReduced * 5);
    const coinReward = Math.floor(messPointsReduced * 3);
    
    // Track cleaning count for achievements
    const cleanCount = (userData.achievements?.['secret-first-clean']?.progress || 0) + 1;
    const cleanFreakCount = (userData.achievements?.['secret-clean-freak']?.progress || 0) + 1;
    
    const updatedUserData = {
      ...userData,
      messPoints: newMessPoints,
      maxEnergyCap: 100,
      energy: Math.min(userData.energy + energyReward, 100),
      qCoins: userData.qCoins + coinReward,
      achievements: {
        ...userData.achievements,
        'secret-first-clean': {
          ...userData.achievements?.['secret-first-clean'],
          progress: cleanCount,
          unlocked: userData.achievements?.['secret-first-clean']?.unlocked || false
        },
        'secret-clean-freak': {
          ...userData.achievements?.['secret-clean-freak'],
          progress: cleanFreakCount,
          unlocked: userData.achievements?.['secret-clean-freak']?.unlocked || false
        }
      }
    };
    
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
    
    console.log(`[CleanRoom] Reduced mess by ${messPointsReduced} points (${userData.messPoints} → ${newMessPoints})`);
    console.log(`[CleanRoom] Rewards: +${energyReward} energy, +${coinReward} coins`);
    console.log(`[CleanRoom] Clean count: ${cleanCount}, Clean freak count: ${cleanFreakCount}`);
    
    // Check achievements - first clean or clean freak
    setTimeout(() => {
      if (cleanCount === 1) {
        checkSpecificAchievement?.('secret-first-clean');
      } else if (cleanFreakCount >= 30) {
        checkSpecificAchievement?.('secret-clean-freak');
      }
    }, 100);
  }
});