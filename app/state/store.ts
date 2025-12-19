// Global state management with Zustand + Data Persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserData, SessionData, CheckpointResult, CheckpointNotification, Deadline, DeadlineFormData, SleepSession } from '../core/types';

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
  getSecondsElapsed,
  getTodaysSleepHours,
  calculateFocusEnergyCost,
  calculateDistractionDrain,
  calculateBreakRecovery,
  calculateMorningEnergy
} from '../core/engine';

interface QuillbyStore {
  // User state
  userData: UserData;
  
  // Session state
  session: SessionData | null;
  
  // Deadline state
  deadlines: Deadline[];
  selectedDeadlineId: string | null; // For tracking which deadline a focus session is for
  
  // Actions
  initializeUser: () => void;
  updateEnergy: () => void;
  startFocusSession: (deadlineId?: string) => boolean;
  endFocusSession: () => void;
  updateFocusDuringSession: () => void;
  handleDistraction: () => void;
  logWater: () => void;
  logBreakfast: () => void;
  startSleep: () => string; // Returns session ID
  endSleep: (sessionId: string) => void;
  getTodaysSleepHours: () => number;
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
  // Deadline actions
  createDeadline: (formData: DeadlineFormData) => void;
  updateDeadline: (id: string, updates: Partial<Deadline>) => void;
  deleteDeadline: (id: string) => void;
  markDeadlineComplete: (id: string) => void;
  addWorkToDeadline: (id: string, hours: number) => void;
  updateReminders: (id: string, reminders: { oneDayBefore: boolean; threeDaysBefore: boolean }) => void;
  getUpcomingDeadlines: () => Deadline[];
  getUrgentDeadlines: () => Deadline[];
  getCompletedDeadlines: () => Deadline[];
  createSampleDeadlines: () => void;
}

export const useQuillbyStore = create<QuillbyStore>()(
  persist(
    (set, get) => ({
  userData: {
    energy: 100, // Start with full energy
    maxEnergyCap: 100, // Always 100 in simplified system
    qCoins: 0,
    messPoints: 0,
    lastActiveTimestamp: Date.now(),
    sleepSessions: [], // Array of sleep sessions
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
  
  deadlines: [],
  selectedDeadlineId: null,
  
  // Initialize user with default values - SIMPLIFIED SYSTEM
  initializeUser: () => {
    const now = Date.now();
    const today = new Date().toDateString();
    set({
      userData: {
        energy: 100, // Start with full energy
        maxEnergyCap: 100, // Always 100 in simplified system
        qCoins: 0,
        messPoints: 0,
        lastActiveTimestamp: now,
        sleepSessions: [],
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
  
  // Update energy - SIMPLIFIED: No automatic drains, just cap at 100
  updateEnergy: () => {
    const { userData } = get();
    
    // Simply ensure energy doesn't exceed 100
    const cappedEnergy = Math.min(userData.energy, 100);
    
    if (cappedEnergy !== userData.energy) {
      set({
        userData: {
          ...userData,
          energy: cappedEnergy,
          maxEnergyCap: 100 // Always 100
        }
      });
    }
  },
  
  // Start a focus session - SMART ENERGY SYSTEM
  startFocusSession: (deadlineId?: string) => {
    const { userData } = get();
    
    if (!canStartSession(userData.energy, userData)) {
      const energyNeeded = calculateFocusEnergyCost(userData);
      console.log(`[Session] Not enough energy: Need ${energyNeeded}, Have ${userData.energy}`);
      return false; // Not enough energy
    }
    
    const newEnergy = startSessionEnergyCost(userData.energy, userData);
    const energyCost = calculateFocusEnergyCost(userData);
    
    console.log(`[Session] Starting focus session - Cost: ${energyCost} energy (${userData.energy} → ${newEnergy})`);
    
    set({
      userData: {
        ...userData,
        energy: newEnergy
      },
      selectedDeadlineId: deadlineId || null,
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
    const { userData, session, selectedDeadlineId, addWorkToDeadline } = get();
    
    if (!session) return;
    
    const rewards = calculateSessionRewards(session.focusScore);
    const newMessPoints = removeMessAfterSession(userData.messPoints, rewards.messPointsRemoved);
    
    // Calculate session duration in minutes/hours for tracking
    const sessionDurationMinutes = Math.floor(session.duration / 60);
    const sessionDurationHours = session.duration / 3600;
    
    // If this session was for a deadline, log the work
    if (selectedDeadlineId && sessionDurationHours > 0) {
      console.log(`[Focus→Deadline] Adding ${sessionDurationHours.toFixed(2)}h to deadline ${selectedDeadlineId}`);
      addWorkToDeadline(selectedDeadlineId, sessionDurationHours);
    }
    
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
      session: null,
      selectedDeadlineId: null
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
  
  // Log water intake - SIMPLIFIED: +5 energy per glass, max 8 glasses
  logWater: () => {
    const { userData } = get();
    
    if (userData.waterGlasses >= 8) {
      console.log('[Water] Already at daily limit (8 glasses)');
      return;
    }
    
    const newCount = userData.waterGlasses + 1;
    const energyGain = 5; // +5 energy per glass
    
    console.log(`[Water] Glass ${newCount}/8 logged: +${energyGain} energy`);
    
    set({
      userData: {
        ...userData,
        waterGlasses: newCount,
        energy: Math.min(userData.energy + energyGain, 100), // Cap at 100
        qCoins: userData.qCoins + 5 // +5 coins per glass
      }
    });
  },
  
  // Log breakfast - SIMPLIFIED: +10 energy, enables focus bonus
  logBreakfast: () => {
    const { userData } = get();
    
    if (userData.ateBreakfast) {
      console.log('[Breakfast] Already logged today');
      return;
    }
    
    const energyGain = 10;
    console.log(`[Breakfast] Logged: +${energyGain} energy + focus bonus enabled`);
    
    set({
      userData: {
        ...userData,
        ateBreakfast: true,
        energy: Math.min(userData.energy + energyGain, 100), // Cap at 100
        qCoins: userData.qCoins + 10, // +10 coins for breakfast
        maxEnergyCap: 100 // Always 100
      }
    });
  },
  
  // Start a new sleep session
  startSleep: () => {
    const { userData } = get();
    const now = new Date();
    const sessionId = `sleep-${Date.now()}`;
    
    // Create a new sleep session (will be completed when endSleep is called)
    const newSession: Partial<SleepSession> = {
      id: sessionId,
      start: now.toISOString(),
      // end and duration will be set when endSleep is called
    };
    
    console.log(`[Sleep] Started sleep session: ${sessionId} at ${now.toLocaleTimeString()}`);
    
    // Store the active session (we'll complete it later)
    set({
      userData: {
        ...userData,
        activeSleepSession: newSession as Partial<SleepSession>
      }
    });
    
    return sessionId;
  },

  // End a sleep session and calculate duration - SIMPLIFIED: Sets next morning energy
  endSleep: (sessionId: string) => {
    const { userData } = get();
    const now = new Date();
    
    // Find the active session
    const activeSession = (userData as any).activeSleepSession;
    if (!activeSession || activeSession.id !== sessionId) {
      console.warn(`[Sleep] No active session found for ID: ${sessionId}`);
      return;
    }
    
    const startTime = new Date(activeSession.start);
    const duration = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Hours
    
    // Determine which date this sleep counts toward
    // If sleep started before 6 AM, it counts toward the previous day
    const sleepDate = startTime.getHours() < 6 
      ? new Date(startTime.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : startTime.toISOString().split('T')[0];
    
    const completedSession: SleepSession = {
      id: sessionId,
      start: activeSession.start,
      end: now.toISOString(),
      duration: Math.round(duration * 10) / 10, // Round to 1 decimal
      date: sleepDate
    };
    
    const updatedSessions = [...(userData.sleepSessions || []), completedSession];
    
    // Calculate today's total sleep
    const todaysSleep = getTodaysSleepHours(updatedSessions);
    
    // SIMPLIFIED: Calculate morning energy based on sleep quality
    const morningEnergy = calculateMorningEnergy(todaysSleep);
    
    console.log(`[Sleep] Completed: ${duration.toFixed(1)}h → Total today: ${todaysSleep.toFixed(1)}h → Morning energy: ${morningEnergy}/100`);
    
    set({
      userData: {
        ...userData,
        sleepSessions: updatedSessions,
        maxEnergyCap: 100, // Always 100
        energy: morningEnergy, // Set energy based on sleep quality
        activeSleepSession: undefined // Clear active session
      }
    });
  },

  // Get today's total sleep hours
  getTodaysSleepHours: () => {
    const { userData } = get();
    return getTodaysSleepHours(userData.sleepSessions || []);
  },

  // Log meal intake - SIMPLIFIED: +10 energy per meal (breakfast, lunch, dinner)
  logMeal: () => {
    const { userData } = get();
    
    if (userData.mealsLogged >= 3) {
      console.log('[Meal] Already logged 3 meals today');
      return;
    }
    
    const mealCount = userData.mealsLogged + 1;
    const energyGain = 10; // +10 energy per meal
    
    console.log(`[Meal] Meal ${mealCount}/3 logged: +${energyGain} energy`);
    
    set({
      userData: {
        ...userData,
        mealsLogged: mealCount,
        energy: Math.min(userData.energy + energyGain, 100), // Cap at 100
        qCoins: userData.qCoins + 10 // +10 coins per meal
      }
    });
  },

  // Log exercise minutes - SIMPLIFIED: +15 energy per session, enables focus bonus
  logExercise: (minutes: number) => {
    const { userData } = get();
    
    // Check if it's a new day - reset exercise if so
    const today = new Date().toDateString();
    const isNewDay = userData.lastExerciseReset !== today;
    
    // Calculate accumulated exercise (reset if new day)
    const accumulatedMinutes = isNewDay ? minutes : userData.exerciseMinutes + minutes;
    
    const energyGain = 15; // +15 energy per exercise session
    
    console.log(`[Exercise] ${minutes}min session: +${energyGain} energy + focus bonus enabled`);
    
    set({
      userData: {
        ...userData,
        exerciseMinutes: accumulatedMinutes,
        energy: Math.min(userData.energy + energyGain, 100), // Cap at 100
        qCoins: userData.qCoins + Math.min(minutes, 30), // 1 coin per minute, max 30
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
  
  // Reset daily values (for testing or new day) - SIMPLIFIED
  resetDay: () => {
    const { userData, applyDailyMessDecay } = get();
    const today = new Date().toDateString();
    
    // Apply mess decay before reset
    applyDailyMessDecay();
    
    // Get updated mess after decay
    const updatedUserData = get().userData;
    
    // Calculate morning energy based on yesterday's sleep
    const todaysSleep = getTodaysSleepHours(updatedUserData.sleepSessions || []);
    const morningEnergy = calculateMorningEnergy(todaysSleep);
    
    console.log(`[Daily Reset] Sleep: ${todaysSleep.toFixed(1)}h → Morning energy: ${morningEnergy}/100`);
    
    set({
      userData: {
        ...updatedUserData,
        energy: morningEnergy, // Set based on sleep quality
        ateBreakfast: false,
        waterGlasses: 0,
        mealsLogged: 0, // Reset meals
        // Note: sleepSessions are kept (they have dates), no need to reset
        exerciseMinutes: 0, // Reset exercise
        studyMinutesToday: 0, // Reset study
        missedCheckpoints: 0, // Reset missed checkpoints
        lastSleepReset: today,
        lastExerciseReset: today,
        lastStudyReset: today,
        maxEnergyCap: 100 // Always 100
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

  // Add missed checkpoint with mess points based on missing hours - SIMPLIFIED
  addMissedCheckpoint: (missingHours: number = 1) => {
    const { userData } = get();
    const newMissedCount = (userData.missedCheckpoints || 0) + 1;
    
    // Mess points = missing hours (1 hour behind = 1 mess point)
    const messPointsIncrease = Math.max(0.5, missingHours); // Minimum 0.5 mess points
    const newMessPoints = userData.messPoints + messPointsIncrease;
    
    console.log(`[Study] Missed checkpoint ${newMissedCount} - ${missingHours.toFixed(1)}h behind = +${messPointsIncrease.toFixed(1)} mess (${userData.messPoints.toFixed(1)} → ${newMessPoints.toFixed(1)})`);
    
    set({
      userData: {
        ...userData,
        missedCheckpoints: newMissedCount,
        messPoints: newMessPoints,
        maxEnergyCap: 100, // Always 100
        energy: Math.min(userData.energy, 100) // Cap at 100
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

  // Clean room (reduces mess points with efficiency-based rewards) - SIMPLIFIED
  cleanRoom: (messPointsReduced: number) => {
    const { userData } = get();
    const newMessPoints = Math.max(0, userData.messPoints - messPointsReduced);
    
    console.log(`[Cleaning] Reduced mess by ${messPointsReduced.toFixed(1)} points (${userData.messPoints.toFixed(1)} → ${newMessPoints.toFixed(1)})`);
    
    // Energy reward scales with mess reduction (5 energy per mess point)
    const energyReward = Math.floor(messPointsReduced * 5);
    const coinReward = Math.floor(messPointsReduced * 3);
    
    set({
      userData: {
        ...userData,
        messPoints: newMessPoints,
        maxEnergyCap: 100, // Always 100
        energy: Math.min(userData.energy + energyReward, 100), // Cap at 100
        qCoins: userData.qCoins + coinReward
      }
    });
  },

  // Apply daily mess decay (20% automatic cleaning each day) - SIMPLIFIED
  applyDailyMessDecay: () => {
    const { userData } = get();
    const currentMess = userData.messPoints;
    const newMess = currentMess * 0.8; // 20% decay
    
    console.log(`[Daily] Mess decay: ${currentMess.toFixed(1)} → ${newMess.toFixed(1)} (-20%)`);
    
    set({
      userData: {
        ...userData,
        messPoints: newMess,
        maxEnergyCap: 100, // Always 100
        energy: Math.min(userData.energy, 100) // Cap at 100
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
  },

  // Create new deadline
  createDeadline: (formData: DeadlineFormData) => {
    const { deadlines } = get();
    // Normalize due date: if it's a plain YYYY-MM-DD, convert to end-of-day ISO
    let normalizedDueDate = formData.dueDate;
    if (normalizedDueDate && !normalizedDueDate.includes('T')) {
      const date = new Date(normalizedDueDate);
      // Set to end of the selected day so it counts as "today" until midnight
      date.setHours(23, 59, 59, 999);
      normalizedDueDate = date.toISOString();
    }

    const newDeadline: Deadline = {
      id: Date.now().toString(),
      title: formData.title,
      dueDate: normalizedDueDate,
      dueTime: formData.dueTime || undefined,
      priority: formData.priority,
      estimatedHours: parseFloat(formData.estimatedHours),
      category: formData.category,
      workCompleted: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      reminders: {
        oneDayBefore: true,
        threeDaysBefore: true,
      }
    };
    
    console.log('[Deadline] Created:', newDeadline.title);
    
    set({
      deadlines: [...deadlines, newDeadline]
    });
  },

  // Update existing deadline
  updateDeadline: (id: string, updates: Partial<Deadline>) => {
    const { deadlines } = get();
    let normalizedUpdates = { ...updates };

    // If dueDate is being updated and provided as YYYY-MM-DD, normalize it
    if (normalizedUpdates.dueDate && !normalizedUpdates.dueDate.includes('T')) {
      const date = new Date(normalizedUpdates.dueDate);
      date.setHours(23, 59, 59, 999);
      normalizedUpdates.dueDate = date.toISOString();
    }

    set({
      deadlines: deadlines.map(deadline => 
        deadline.id === id ? { ...deadline, ...normalizedUpdates } : deadline
      )
    });
  },

  // Delete deadline
  deleteDeadline: (id: string) => {
    const { deadlines } = get();
    
    set({
      deadlines: deadlines.filter(deadline => deadline.id !== id)
    });
  },

  // Mark deadline as complete
  markDeadlineComplete: (id: string) => {
    const { updateDeadline } = get();
    updateDeadline(id, { isCompleted: true });
  },

  // Add work hours to deadline
  addWorkToDeadline: (id: string, hours: number) => {
    const { deadlines } = get();
    const deadline = deadlines.find(d => d.id === id);
    
    if (deadline) {
      const newWorkCompleted = Math.min(
        deadline.workCompleted + hours,
        deadline.estimatedHours
      );
      
      // Auto-complete if all work is done
      const isCompleted = newWorkCompleted >= deadline.estimatedHours;
      
      set({
        deadlines: deadlines.map(d => 
          d.id === id 
            ? { ...d, workCompleted: newWorkCompleted, isCompleted }
            : d
        )
      });
    }
  },

  // Update reminder settings for a deadline
  updateReminders: (id: string, reminders: { oneDayBefore: boolean; threeDaysBefore: boolean }) => {
    const { deadlines } = get();
    
    set({
      deadlines: deadlines.map(d => 
        d.id === id 
          ? { ...d, reminders }
          : d
      )
    });
  },

  // Get upcoming deadlines (not urgent, not completed)
  getUpcomingDeadlines: () => {
    const { deadlines } = get();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    return deadlines
      .filter(deadline => {
        if (deadline.isCompleted) return false;
        const dueDate = new Date(deadline.dueDate);
        return dueDate > threeDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  // Get urgent deadlines (due within 3 days)
  getUrgentDeadlines: () => {
    const { deadlines } = get();
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    
    return deadlines
      .filter(deadline => {
        if (deadline.isCompleted) return false;
        const dueDate = new Date(deadline.dueDate);
        return dueDate <= threeDaysFromNow && dueDate >= now;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  // Get completed deadlines
  getCompletedDeadlines: () => {
    const { deadlines } = get();
    
    return deadlines
      .filter(deadline => deadline.isCompleted)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  },

  // Create sample deadlines for testing
  createSampleDeadlines: () => {
    const now = new Date();
    const sampleDeadlines: Deadline[] = [
      {
        id: 'sample-1',
        title: 'Math Final Exam',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
        dueTime: '14:00',
        priority: 'high',
        estimatedHours: 8,
        category: 'study',
        workCompleted: 2.5,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        reminders: { oneDayBefore: true, threeDaysBefore: true }
      },
      {
        id: 'sample-2',
        title: 'History Essay',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
        priority: 'medium',
        estimatedHours: 6,
        category: 'study',
        workCompleted: 1,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        reminders: { oneDayBefore: true, threeDaysBefore: true }
      },
      {
        id: 'sample-3',
        title: 'Chemistry Lab Report',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
        priority: 'low',
        estimatedHours: 4,
        category: 'study',
        workCompleted: 0,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        reminders: { oneDayBefore: true, threeDaysBefore: false }
      },
      {
        id: 'sample-4',
        title: 'Biology Quiz',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Completed
        priority: 'medium',
        estimatedHours: 3,
        category: 'study',
        workCompleted: 3,
        isCompleted: true,
        createdAt: new Date().toISOString(),
        reminders: { oneDayBefore: true, threeDaysBefore: true }
      }
    ];
    
    set({ deadlines: sampleDeadlines });
    console.log('[Deadlines] Sample deadlines created');
  }
}),
{
  name: 'quillby-storage', // Storage key
  storage: createJSONStorage(() => storage),
  
  // Only persist essential user data, not temporary session data
  partialize: (state) => ({
    userData: state.userData,
    deadlines: state.deadlines,
    // Don't persist session data or selectedDeadlineId - they should reset on app restart
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
