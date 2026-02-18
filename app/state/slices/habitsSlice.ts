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
    
    // Allow logging beyond goal (no hard limit)
    const newCount = userData.waterGlasses + 1;
    const energyGain = 5;
    
    set({
      userData: {
        ...userData,
        waterGlasses: newCount,
        energy: Math.min(userData.energy + energyGain, 100),
        qCoins: userData.qCoins + 5
      }
    });
    
    console.log(`[Water] Logged glass ${newCount} (goal: ${hydrationGoal})`);
    
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
    
    set({
      userData: {
        ...userData,
        ateBreakfast: true,
        energy: Math.min(userData.energy + energyGain, 100),
        qCoins: userData.qCoins + 10,
        maxEnergyCap: 100
      }
    });
  },

  logMeal: () => {
    const { userData, checkSpecificAchievement } = get() as any;
    
    if (userData.mealsLogged >= 3) {
      console.log('[Meal] Already logged 3 meals today');
      return;
    }
    
    const mealCount = userData.mealsLogged + 1;
    const energyGain = 10;
    const currentHour = new Date().getHours();
    
    // If it's morning (6-11 AM) and this is the first meal, mark breakfast as eaten
    const isBreakfastTime = currentHour >= 6 && currentHour <= 11;
    const shouldMarkBreakfast = isBreakfastTime && !userData.ateBreakfast;
    
    set({
      userData: {
        ...userData,
        mealsLogged: mealCount,
        ateBreakfast: shouldMarkBreakfast ? true : userData.ateBreakfast,
        energy: Math.min(userData.energy + energyGain, 100),
        qCoins: userData.qCoins + 10
      }
    });
    
    if (shouldMarkBreakfast) {
      console.log('[Meal] Breakfast logged - reminder will stop');
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
    
    set({
      userData: {
        ...userData,
        exerciseMinutes: accumulatedMinutes,
        energy: Math.min(userData.energy + energyGain, 100),
        qCoins: userData.qCoins + Math.min(minutes, 30),
        lastExerciseReset: today
      }
    });
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
    
    set({
      userData: {
        ...userData,
        sleepSessions: updatedSessions,
        maxEnergyCap: 100,
        qCoins: userData.qCoins + sleepCoins,
        activeSleepSession: undefined
      }
    });
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