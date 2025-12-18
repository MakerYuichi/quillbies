// Global state management with Zustand + Data Persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserData, SessionData, CheckpointResult, CheckpointNotification } from '../core/types';

// Temporary fallback storage for development (until AsyncStorage is properly linked)
const tempStorage = {
  data: {} as Record<string, string>,
  getItem: async (key: string) => {
    console.log('[TempStorage] Getting:', key);
    return tempStorage.data[key] || null;
  },
  setItem: async (key: string, value: string) => {
    console.log('[TempStorage] Setting:', key, 'Size:', value.length);
    tempStorage.data[key] = value;
  },
  removeItem: async (key: string) => {
    console.log('[TempStorage] Removing:', key);
    delete tempStorage.data[key];
  },
};

// Try to use AsyncStorage, fallback to tempStorage if not available
let storage;
try {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
  console.log('[Storage] Using AsyncStorage');
} catch (error) {
  storage = tempStorage;
  console.log('[Storage] Using temporary fallback storage');
}
import {
  calculateMaxEnergyCap,
  canStartSession,
  startSessionEnergyCost,
  updateFocusScore,
  drainFocusScore,
  calculateSessionRewards,
  addMessForSkippedTask,
  removeMessAfterSession,
  getSecondsElapsed
} from '../core/engine';

interface QuillbyStore {
  // User state
  userData: UserData;
  
  // Session state
  session: SessionData | null;
  
  // Actions
  initializeUser: () => void;
  updateEnergy: () => void;
  startFocusSession: () => boolean;
  endFocusSession: () => void;
  updateFocusDuringSession: () => void;
  handleDistraction: () => void;
  logWater: () => void;
  logBreakfast: () => void;
  logSleep: (hours: number) => void;
  logMeal: () => void;
  logExercise: (minutes: number) => void;
  skipTask: () => void;
  resetDay: () => void;
  // Onboarding actions
  setCharacter: (character: string) => void;
  setBuddyName: (name: string) => void;
  setProfile: (userName: string, studentLevel: string, country: string, timezone: string) => void;
  setWeightGoal: (weightGoal: 'lose' | 'maintain' | 'gain') => void;
  setStudyGoal: (hours: number, checkpoints: string[]) => void;
  setHabits: (habits: string[]) => void;
  checkStudyCheckpoints: () => CheckpointResult;
  addMissedCheckpoint: (missingHours?: number) => void;
  checkAndProcessCheckpoints: () => CheckpointNotification;
  getMessEnergyCapPenalty: () => number;
  cleanRoom: (messPointsReduced: number) => void;
  applyDailyMessDecay: () => void;
  generateDailySummary: () => string;
}

export const useQuillbyStore = create<QuillbyStore>()(
  persist(
    (set, get) => ({
  userData: {
    energy: 100,
    maxEnergyCap: 100,
    qCoins: 0,
    messPoints: 0,
    lastActiveTimestamp: Date.now(),
    sleepHours: 0, // Accumulated sleep today (starts at 0)
    ateBreakfast: false,
    waterGlasses: 0,
    mealsLogged: 0, // 0-3 meals per day
    weightGoal: 'maintain', // Default weight goal
    mealPortionSize: 1.0, // Default normal portions
    currentStreak: 0,
    lastCheckInDate: new Date().toDateString(),
    lastSleepReset: new Date().toDateString(), // Track when sleep was last reset
    exerciseMinutes: 0, // Accumulated exercise minutes today
    lastExerciseReset: new Date().toDateString(), // Track when exercise was last reset
    studyMinutesToday: 0, // Accumulated study minutes today
    lastStudyReset: new Date().toDateString(), // Track when study was last reset
    missedCheckpoints: 0 // Count of missed checkpoints today
  },
  
  session: null,
  
  // Initialize user with default values
  initializeUser: () => {
    const now = Date.now();
    const today = new Date().toDateString();
    set({
      userData: {
        energy: 100,
        maxEnergyCap: 100,
        qCoins: 0,
        messPoints: 0,
        lastActiveTimestamp: now,
        sleepHours: 0,
        ateBreakfast: false,
        waterGlasses: 0,
        mealsLogged: 0,
        weightGoal: 'maintain',
        mealPortionSize: 1.0,
        currentStreak: 0,
        lastCheckInDate: today,
        lastSleepReset: today,
        exerciseMinutes: 0,
        lastExerciseReset: today,
        studyMinutesToday: 0,
        lastStudyReset: today,
        missedCheckpoints: 0
      }
    });
  },
  
  // Update energy - SIMPLE: Just ensure energy doesn't exceed max cap
  updateEnergy: () => {
    const { userData } = get();
    
    // No automatic drain on home screen
    // Energy only drains during study sessions when distracted
    const cappedEnergy = Math.min(userData.energy, userData.maxEnergyCap);
    
    if (cappedEnergy !== userData.energy) {
      console.log(`[Energy] Capped at ${cappedEnergy}/${userData.maxEnergyCap}`);
      set({
        userData: {
          ...userData,
          energy: cappedEnergy,
        }
      });
    }
  },
  
  // Start a focus session
  startFocusSession: () => {
    const { userData } = get();
    
    if (!canStartSession(userData.energy)) {
      return false; // Not enough energy
    }
    
    const newEnergy = startSessionEnergyCost(userData.energy);
    
    console.log('[Session] Starting new focus session');
    
    set({
      userData: {
        ...userData,
        energy: newEnergy
      },
      session: {
        focusScore: 0,
        startTime: Date.now(),
        duration: 0,
        isActive: true,
        distractionCount: 0,
        lastDistractionTime: null,
        distractionWarnings: 0,
        isInGracePeriod: false
      }
    });
    
    return true;
  },
  
  // End focus session and calculate rewards
  endFocusSession: () => {
    const { userData, session } = get();
    
    if (!session) return;
    
    const rewards = calculateSessionRewards(session.focusScore);
    const newMessPoints = removeMessAfterSession(userData.messPoints, rewards.messPointsRemoved);
    
    // Calculate session duration in minutes for study tracking
    const sessionDurationMinutes = Math.floor(session.duration / 60);
    
    // If study habit is enabled, log this focus session as study time
    const studyEnabled = userData.enabledHabits?.includes('study');
    let updatedUserData = {
      ...userData,
      qCoins: userData.qCoins + rewards.qCoinsEarned,
      messPoints: newMessPoints
    };
    
    if (studyEnabled && sessionDurationMinutes > 0) {
      // Check if it's a new day - reset study if so
      const today = new Date().toDateString();
      const isNewDay = userData.lastStudyReset !== today;
      
      // Calculate accumulated study (reset if new day)
      const accumulatedMinutes = isNewDay ? sessionDurationMinutes : (userData.studyMinutesToday || 0) + sessionDurationMinutes;
      
      console.log(`[Focus→Study] Adding ${sessionDurationMinutes}min → Total today: ${accumulatedMinutes}min`);
      
      updatedUserData = {
        ...updatedUserData,
        studyMinutesToday: accumulatedMinutes,
        lastStudyReset: today
      };
    }
    
    set({
      userData: updatedUserData,
      session: null
    });
  },
  
  // Update focus score during active session
  updateFocusDuringSession: () => {
    const { session } = get();
    
    if (!session || !session.isActive) return;
    
    // PAUSE timer if in grace period
    if (session.isInGracePeriod) {
      console.log('[Focus] Timer paused during grace period');
      return;
    }
    
    const secondsElapsed = getSecondsElapsed(session.startTime);
    const newScore = updateFocusScore(0, secondsElapsed);
    
    set({
      session: {
        ...session,
        focusScore: newScore,
        duration: secondsElapsed
      }
    });
  },
  
  // Handle user distraction (leaving app) - SMART SYSTEM
  handleDistraction: () => {
    const { session, userData } = get();
    
    if (!session) return;
    
    const now = Date.now();
    
    // If this is the first distraction or returning from grace period
    if (!session.lastDistractionTime) {
      console.log('[Distraction] First distraction - starting 30s grace period');
      set({
        session: {
          ...session,
          lastDistractionTime: now,
          isInGracePeriod: true
        }
      });
      return;
    }
    
    // Check if user returned within grace period (30 seconds)
    const timeAway = (now - session.lastDistractionTime) / 1000; // in seconds
    
    if (timeAway <= 30) {
      console.log(`[Distraction] Returned within grace period (${timeAway.toFixed(1)}s)`);
      // Reset grace period
      set({
        session: {
          ...session,
          lastDistractionTime: null,
          isInGracePeriod: false
        }
      });
      return;
    }
    
    // User was away longer than 30 seconds - issue warning or penalty
    const currentWarnings = session.distractionWarnings;
    
    if (currentWarnings < 3) {
      // Issue warning
      console.log(`[Distraction] Warning ${currentWarnings + 1}/3 - away for ${timeAway.toFixed(1)}s`);
      set({
        session: {
          ...session,
          distractionWarnings: currentWarnings + 1,
          lastDistractionTime: null,
          isInGracePeriod: false
        }
      });
    } else {
      // Apply penalty after 3rd warning
      const minutesAway = Math.floor(timeAway / 60);
      const newScore = drainFocusScore(session.focusScore, minutesAway);
      
      console.log(`[Distraction] PENALTY! Away ${minutesAway}min - Focus: ${session.focusScore} → ${newScore}`);
      
      set({
        session: {
          ...session,
          focusScore: newScore,
          distractionCount: session.distractionCount + 1,
          distractionWarnings: 0, // Reset warnings after penalty
          lastDistractionTime: null,
          isInGracePeriod: false
        }
      });
    }
  },
  
  // Log water intake
  logWater: () => {
    const { userData } = get();
    const newCount = userData.waterGlasses + 1;
    
    // Base rewards
    const energyGain = 5;
    const coinGain = 5;
    
    // Bonus for reaching exactly 8 glasses (daily goal)
    const bonusEnergy = newCount === 8 ? 20 : 0;
    const bonusCoins = newCount === 8 ? 10 : 0;
    
    set({
      userData: {
        ...userData,
        waterGlasses: newCount,
        energy: Math.min(
          userData.energy + energyGain + bonusEnergy,
          userData.maxEnergyCap
        ),
        qCoins: userData.qCoins + coinGain + bonusCoins
      }
    });
  },
  
  // Log breakfast
  logBreakfast: () => {
    const { userData } = get();
    const newMaxCap = calculateMaxEnergyCap({ ...userData, ateBreakfast: true });
    
    set({
      userData: {
        ...userData,
        ateBreakfast: true,
        maxEnergyCap: newMaxCap,
        energy: Math.min(userData.energy, newMaxCap) // Cap current energy if needed
      }
    });
  },
  
  // Log sleep hours - ACCUMULATES throughout the day
  logSleep: (hours: number) => {
    const { userData } = get();
    
    // Check if it's a new day - reset sleep if so
    const today = new Date().toDateString();
    const isNewDay = userData.lastSleepReset !== today;
    
    // 1. Calculate accumulated sleep (reset if new day)
    const accumulatedSleep = isNewDay ? hours : userData.sleepHours + hours;
    
    console.log(`[Sleep] Adding ${hours}h → Total today: ${accumulatedSleep}h (was ${userData.sleepHours}h)`);
    
    // 2. Create temp data with accumulated sleep hours
    const tempData = { ...userData, sleepHours: accumulatedSleep };
    
    // 3. Calculate NEW max cap based on total sleep
    const newMaxCap = calculateMaxEnergyCap(tempData);
    
    console.log(`[Sleep] New max cap: ${newMaxCap} (was ${userData.maxEnergyCap})`);
    
    // 4. CAP current energy to new max (if it's higher)
    const newEnergy = Math.min(userData.energy, newMaxCap);
    
    // 5. Add bonus energy for good sleep (if total >= 8h)
    const bonusEnergy = accumulatedSleep >= 8 ? 10 : 0;
    const finalEnergy = Math.min(newEnergy + bonusEnergy, newMaxCap);
    
    set({
      userData: {
        ...userData,
        sleepHours: accumulatedSleep, // ACCUMULATE, don't replace
        maxEnergyCap: newMaxCap,
        energy: finalEnergy,
        lastSleepReset: today // Update reset date
      }
    });
  },

  // Log meal intake - weight-based portions with overeating consequences
  logMeal: () => {
    const { userData } = get();
    const mealCount = userData.mealsLogged + 1;
    const weightGoal = userData.weightGoal || 'maintain';
    
    let energyChange = 0;
    let coinsGained = 0;
    
    // Calculate energy and coins based on meal count and weight goal
    if (mealCount <= 3) {
      // Normal meals (1-3)
      const baseEnergy = 15;
      const portionMultiplier = userData.mealPortionSize || 1.0;
      energyChange = Math.round(baseEnergy * portionMultiplier);
      coinsGained = 8;
    } else {
      // Overeating consequences (4+)
      switch (weightGoal) {
        case 'lose':
          if (mealCount === 4) energyChange = -5;
          else if (mealCount === 5) energyChange = -10;
          else energyChange = -15; // 6+
          break;
        case 'maintain':
          if (mealCount === 4) energyChange = 0;
          else if (mealCount === 5) energyChange = -5;
          else energyChange = -10; // 6+
          break;
        case 'gain':
          if (mealCount === 4) energyChange = 3;
          else if (mealCount === 5) energyChange = 0;
          else energyChange = -5; // 6+
          break;
      }
      coinsGained = 0; // No coins for overeating
    }
    
    console.log(`[Meal] Logged meal ${mealCount} (${weightGoal}) - Energy: ${energyChange > 0 ? '+' : ''}${energyChange}`);
    
    set({
      userData: {
        ...userData,
        mealsLogged: mealCount,
        energy: Math.max(0, Math.min(userData.energy + energyChange, userData.maxEnergyCap)),
        qCoins: userData.qCoins + coinsGained
      }
    });
  },

  // Log exercise minutes - accumulates throughout the day
  logExercise: (minutes: number) => {
    const { userData } = get();
    
    // Check if it's a new day - reset exercise if so
    const today = new Date().toDateString();
    const isNewDay = userData.lastExerciseReset !== today;
    
    // Calculate accumulated exercise (reset if new day)
    const accumulatedMinutes = isNewDay ? minutes : userData.exerciseMinutes + minutes;
    
    console.log(`[Exercise] Adding ${minutes}min → Total today: ${accumulatedMinutes}min (was ${userData.exerciseMinutes}min)`);
    
    // Calculate rewards based on session duration
    const baseEnergy = Math.min(minutes * 2, 30); // 2 energy per minute, max 30
    const coinReward = Math.min(minutes, 20); // 1 coin per minute, max 20
    
    // Bonus for longer sessions (15+ minutes)
    const bonusEnergy = minutes >= 15 ? 10 : 0;
    const finalEnergyGain = baseEnergy + bonusEnergy;
    
    console.log(`[Exercise] Rewards: +${finalEnergyGain} Energy, +${coinReward} Coins`);
    
    set({
      userData: {
        ...userData,
        exerciseMinutes: accumulatedMinutes,
        energy: Math.min(userData.energy + finalEnergyGain, userData.maxEnergyCap),
        qCoins: userData.qCoins + coinReward,
        lastExerciseReset: today
      }
    });
  },
  
  // Skip a task (adds mess)
  skipTask: () => {
    const { userData } = get();
    const newMessPoints = addMessForSkippedTask(userData.messPoints);
    
    set({
      userData: {
        ...userData,
        messPoints: newMessPoints
      }
    });
  },
  
  // Reset daily values (for testing or new day)
  resetDay: () => {
    const { userData, applyDailyMessDecay } = get();
    const today = new Date().toDateString();
    
    // Apply mess decay before reset
    applyDailyMessDecay();
    
    // Get updated mess after decay
    const updatedUserData = get().userData;
    
    set({
      userData: {
        ...updatedUserData,
        ateBreakfast: false,
        waterGlasses: 0,
        mealsLogged: 0, // Reset meals
        sleepHours: 0, // Reset accumulated sleep
        exerciseMinutes: 0, // Reset exercise
        studyMinutesToday: 0, // Reset study
        missedCheckpoints: 0, // Reset missed checkpoints
        lastSleepReset: today,
        lastExerciseReset: today,
        lastStudyReset: today,
        maxEnergyCap: calculateMaxEnergyCap({
          ...updatedUserData,
          ateBreakfast: false,
          waterGlasses: 0,
          sleepHours: 0
        })
      }
    });
  },
  
  // Onboarding: Set selected character
  setCharacter: (character: string) => {
    const { userData } = get();
    console.log(`[Onboarding] Character selected: ${character}`);
    
    set({
      userData: {
        ...userData,
        selectedCharacter: character
      }
    });
  },
  
  // Onboarding: Set buddy name
  setBuddyName: (name: string) => {
    const { userData } = get();
    console.log(`[Onboarding] Buddy named: ${name}`);
    
    set({
      userData: {
        ...userData,
        buddyName: name
      }
    });
  },
  
  // Onboarding: Set profile information
  setProfile: (userName: string, studentLevel: string, country: string, timezone: string) => {
    const { userData } = get();
    console.log(`[Onboarding] Profile set: ${userName || 'Anonymous'}, ${studentLevel}, ${country}, ${timezone}`);
    
    set({
      userData: {
        ...userData,
        userName: userName || undefined,
        studentLevel,
        country,
        timezone
      }
    });
  },

  // Onboarding: Set weight goal (called from habit setup)
  setWeightGoal: (weightGoal: 'lose' | 'maintain' | 'gain') => {
    const { userData } = get();
    console.log(`[Onboarding] Weight goal set: ${weightGoal}`);
    
    // Set portion size based on weight goal
    let portionSize = 1.0; // Default maintain
    if (weightGoal === 'lose') portionSize = 0.7;
    if (weightGoal === 'gain') portionSize = 1.3;
    
    set({
      userData: {
        ...userData,
        weightGoal,
        mealPortionSize: portionSize
      }
    });
  },
  
  // Onboarding: Set enabled habits
  setHabits: (habits: string[]) => {
    const { userData } = get();
    console.log(`[Onboarding] Habits enabled: ${habits.join(', ')}`);
    
    set({
      userData: {
        ...userData,
        enabledHabits: habits
      }
    });
  },

  // Onboarding: Set study goal and checkpoints
  setStudyGoal: (hours: number, checkpoints: string[]) => {
    const { userData } = get();
    console.log(`[Onboarding] Study goal set: ${hours}h/day, checkpoints: ${checkpoints.join(', ')}`);
    
    set({
      userData: {
        ...userData,
        studyGoalHours: hours,
        studyCheckpoints: checkpoints
      }
    });
  },



  // Check study progress at checkpoints with proper time-based formula
  checkStudyCheckpoints: () => {
    const { userData } = get();
    
    if (!userData.studyGoalHours || !userData.studyCheckpoints) return { isBehind: false };
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeDecimal = currentHour + (currentMinute / 60); // e.g., 9:30 AM = 9.5
    
    const studyHours = (userData.studyMinutesToday || 0) / 60; // Convert to hours
    const goalHours = userData.studyGoalHours;
    
    // Checkpoint time mapping
    const checkpointTimes = {
      '9 AM': 9,
      '12 PM': 12,
      '3 PM': 15,
      '6 PM': 18,
      '9 PM': 21
    };
    
    // Find current checkpoint (most recent passed checkpoint)
    let currentCheckpoint = null;
    let checkpointHour = 0;
    
    for (const checkpoint of userData.studyCheckpoints) {
      const hour = checkpointTimes[checkpoint as keyof typeof checkpointTimes];
      if (currentTimeDecimal >= hour && hour > checkpointHour) {
        currentCheckpoint = checkpoint;
        checkpointHour = hour;
      }
    }
    
    if (!currentCheckpoint) return { isBehind: false }; // No checkpoint reached yet
    
    // Calculate expected progress using time-based formula
    // Expected hours = Goal × (Checkpoint time / 24)
    const expectedHours = goalHours * (checkpointHour / 24);
    const actualHours = studyHours;
    
    // Check if behind schedule
    if (actualHours < expectedHours) {
      const missingHours = expectedHours - actualHours;
      
      console.log(`[Study] Checkpoint ${currentCheckpoint}: Expected ${expectedHours.toFixed(1)}h, Actual ${actualHours.toFixed(1)}h, Missing ${missingHours.toFixed(1)}h`);
      
      return {
        isBehind: true,
        checkpoint: currentCheckpoint,
        checkpointHour,
        expected: expectedHours,
        actual: actualHours,
        missing: missingHours
      };
    }
    
    return { isBehind: false };
  },

  // Add missed checkpoint with mess points based on missing hours
  addMissedCheckpoint: (missingHours: number = 1) => {
    const { userData } = get();
    const newMissedCount = (userData.missedCheckpoints || 0) + 1;
    
    // Mess points = missing hours (1 hour behind = 1 mess point)
    const messPointsIncrease = Math.max(0.5, missingHours); // Minimum 0.5 mess points
    const newMessPoints = userData.messPoints + messPointsIncrease;
    
    console.log(`[Study] Missed checkpoint ${newMissedCount} - ${missingHours.toFixed(1)}h behind = +${messPointsIncrease.toFixed(1)} mess (${userData.messPoints.toFixed(1)} → ${newMessPoints.toFixed(1)})`);
    
    // Recalculate max energy cap based on new mess points
    const newMaxCap = calculateMaxEnergyCap({
      ...userData,
      messPoints: newMessPoints
    });
    
    set({
      userData: {
        ...userData,
        missedCheckpoints: newMissedCount,
        messPoints: newMessPoints,
        maxEnergyCap: newMaxCap,
        energy: Math.min(userData.energy, newMaxCap) // Cap current energy if needed
      }
    });
  },

  // Check and process checkpoints (call this periodically)
  checkAndProcessCheckpoints: () => {
    const { checkStudyCheckpoints, addMissedCheckpoint } = get();
    
    const checkResult = checkStudyCheckpoints();
    
    if (checkResult.isBehind && checkResult.missing && checkResult.expected && checkResult.actual && checkResult.checkpoint) {
      // Add mess points based on missing hours
      addMissedCheckpoint(checkResult.missing);
      
      // Return notification data for UI
      return {
        shouldNotify: true,
        checkpoint: checkResult.checkpoint,
        expected: checkResult.expected,
        actual: checkResult.actual,
        missing: checkResult.missing,
        message: `Study Checkpoint: ${checkResult.checkpoint}\n` +
                `Expected: ${checkResult.expected.toFixed(1)}h, Actual: ${checkResult.actual.toFixed(1)}h\n` +
                `Missing: ${checkResult.missing.toFixed(1)}h added to mess`
      };
    }
    
    return { shouldNotify: false };
  },

  // Get energy cap penalty from mess points
  getMessEnergyCapPenalty: () => {
    const { userData } = get();
    const mess = userData.messPoints;
    
    if (mess <= 5) return 0;   // No penalty for clean room
    if (mess <= 10) return 5;  // -5 energy cap for light mess
    if (mess <= 15) return 10; // -10 energy cap for medium mess
    if (mess <= 20) return 15; // -15 energy cap for heavy mess
    if (mess <= 25) return 20; // -20 energy cap for very messy
    if (mess <= 30) return 25; // -25 energy cap for extremely messy
    return 30; // -30 energy cap maximum penalty
  },

  // Clean room (reduces mess points with efficiency-based rewards)
  cleanRoom: (messPointsReduced: number) => {
    const { userData } = get();
    const newMessPoints = Math.max(0, userData.messPoints - messPointsReduced);
    
    console.log(`[Cleaning] Reduced mess by ${messPointsReduced.toFixed(1)} points (${userData.messPoints.toFixed(1)} → ${newMessPoints.toFixed(1)})`);
    
    // Recalculate max energy cap based on reduced mess
    const newMaxCap = calculateMaxEnergyCap({
      ...userData,
      messPoints: newMessPoints
    });
    
    // Energy reward scales with mess reduction (5 energy per mess point)
    const energyReward = Math.floor(messPointsReduced * 5);
    const coinReward = Math.floor(messPointsReduced * 3);
    
    set({
      userData: {
        ...userData,
        messPoints: newMessPoints,
        maxEnergyCap: newMaxCap,
        energy: Math.min(userData.energy + energyReward, newMaxCap),
        qCoins: userData.qCoins + coinReward
      }
    });
  },

  // Apply daily mess decay (20% automatic cleaning each day)
  applyDailyMessDecay: () => {
    const { userData } = get();
    const currentMess = userData.messPoints;
    const newMess = currentMess * 0.8; // 20% decay
    
    console.log(`[Daily] Mess decay: ${currentMess.toFixed(1)} → ${newMess.toFixed(1)} (-20%)`);
    
    // Recalculate energy cap with reduced mess
    const newMaxCap = calculateMaxEnergyCap({
      ...userData,
      messPoints: newMess
    });
    
    set({
      userData: {
        ...userData,
        messPoints: newMess,
        maxEnergyCap: newMaxCap,
        energy: Math.min(userData.energy, newMaxCap)
      }
    });
  },

  // Generate end-of-day summary
  generateDailySummary: () => {
    const { userData } = get();
    
    if (!userData.studyGoalHours) return '';
    
    const studyHours = (userData.studyMinutesToday || 0) / 60;
    const goalHours = userData.studyGoalHours;
    const progressPercent = Math.round((studyHours / goalHours) * 100);
    const missingHours = Math.max(0, goalHours - studyHours);
    
    // Determine room state
    const mess = userData.messPoints;
    let roomState = 'Clean';
    if (mess > 30) roomState = 'Messy 3+';
    else if (mess > 20) roomState = 'Messy 3';
    else if (mess > 10) roomState = 'Messy 2';
    else if (mess > 5) roomState = 'Messy 1';
    
    const summary = `Daily Summary:
Goal: ${goalHours} hours
Studied: ${studyHours.toFixed(1)} hours (${progressPercent}%)
${missingHours > 0 ? `Missing: ${missingHours.toFixed(1)} hours` : 'Goal achieved! 🎉'}
${missingHours > 0 ? `Mess added: +${missingHours.toFixed(1)}` : 'No mess added'}
Total mess: ${mess.toFixed(1)}
Room: ${roomState}`;
    
    return summary;
  }
}),
{
  name: 'quillby-storage', // Storage key
  storage: createJSONStorage(() => storage),
  
  // Only persist essential user data, not temporary session data
  partialize: (state) => ({
    userData: state.userData,
    // Don't persist session data - it should reset on app restart
  }),
  
  // Handle data migration for future updates
  version: 1,
  migrate: (persistedState: any, version: number) => {
    console.log(`[Storage] Migrating from version ${version}`);
    
    // Future migration logic will go here
    if (version === 0) {
      // Example: Add new fields with defaults
      // persistedState.userData.newField = defaultValue;
    }
    
    return persistedState;
  },
  
  // Handle storage errors gracefully
  onRehydrateStorage: () => {
    console.log('[Storage] Starting data rehydration...');
    return (state, error) => {
      if (error) {
        console.error('[Storage] Rehydration failed:', error);
        // Could show user notification about data loss
      } else {
        console.log('[Storage] Data rehydrated successfully');
        console.log('[Storage] User data loaded:', state?.userData?.buddyName || 'No buddy name');
      }
    };
  },
}
)
);
