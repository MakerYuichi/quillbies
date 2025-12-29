// Global state management with Zustand + Data Persistence + Database Sync

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserData, SessionData, CheckpointResult, CheckpointNotification, Deadline, DeadlineFormData, SleepSession, ShopItem } from '../core/types';

// Database sync functions
import { updateUserProfile, getUserProfile, addCoins } from '../../lib/userProfile';
import { updateDailyData, getTodayData, addMeal, incrementAppleTaps, incrementCoffeeTaps, addWater } from '../../lib/dailyData';
import { updateDailyProgress, syncUserToProgress } from '../../lib/dailyProgress';
import { syncAllUserData, loadAllUserData, periodicSync } from '../../lib/syncManager';
import { getDeviceUser } from '../../lib/deviceAuth';
import { createSleepSession } from '../../lib/sleepSessions';
import { createFocusSession, endFocusSession as endFocusSessionDB } from '../../lib/focusSession';
import { createDeadline, getUserDeadlines, updateDeadline as updateDeadlineDB, deleteDeadline as deleteDeadlineDB, markDeadlineComplete as markDeadlineCompleteDB, addWorkToDeadline as addWorkToDeadlineDB } from '../../lib/deadlines';
import { purchaseItem as purchaseItemDB, getUserPurchasedItems } from '../../lib/shop';

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

// Database sync helper function - Full sync with RLS disabled
const syncToDatabase = async (userData: UserData) => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[Sync] No authenticated user, skipping database sync');
      return;
    }

    // Use comprehensive sync manager now that RLS is disabled
    await syncAllUserData(userData);
    console.log('[Sync] Comprehensive sync completed successfully');
  } catch (error) {
    console.error('[Sync] Failed to sync to database:', error);
    // Don't throw - app should continue working even if sync fails
  }
};

// Load data from database on app startup - Full loading with RLS disabled
const loadFromDatabase = async () => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[Load] No authenticated user, using local data only');
      return null;
    }

    console.log('[Load] Loading comprehensive user data from database...');
    const allData = await loadAllUserData();

    if (allData && allData.userProfile) {
      console.log('[Load] Comprehensive user data loaded from database');
      return allData;
    }

    return null;
  } catch (error) {
    console.error('[Load] Failed to load from database:', error);
    return null;
  }
};
import {
  calculateMaxEnergyCap,
  canStartSession,
  startSessionEnergyCost,
  calculateFocusScore,
  drainFocusScore,
  calculateSessionRewards,
  addMessForSkippedTask,
  removeMessAfterSession,
  getSecondsElapsed,
  getTodaysSleepHours,
  calculateFocusEnergyCost,
  calculateDistractionDrain,
  calculateBreakRecovery,
  calculateMorningEnergy,
  shouldApplyDailyDrains,
  calculateMessEnergyDrain
} from '../core/engine';

interface QuillbyStore {
  // User state
  userData: UserData;
  
  // Session state
  session: SessionData | null;
  currentSessionId: string | null; // Track current database session ID
  
  // Deadline state
  deadlines: Deadline[];
  selectedDeadlineId: string | null; // For tracking which deadline a focus session is for
  
  // Actions
  initializeUser: () => void;
  loadFromDatabase: () => Promise<void>; // Load data from database
  updateEnergy: () => void;
  startFocusSession: (deadlineId?: string) => boolean;
  endFocusSession: () => void;
  updateFocusDuringSession: () => void;
  handleDistraction: () => void;
  startBreak: () => boolean; // Returns false if max break time reached
  endBreak: (breakDuration: number) => void; // Records break time taken
  // Session interactions (boost focus score)
  tapAppleInSession: (isPremium?: boolean) => boolean; // Returns false if limit/coins insufficient
  tapCoffeeInSession: (isPremium?: boolean) => boolean; // Returns false if limit/coins insufficient
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
  completeOnboarding: () => void;
  setCharacter: (character: string) => void;
  setBuddyName: (name: string) => void;
  setProfile: (userName: string, studentLevel: string, country: string, timezone: string) => void;
  setWeightGoal: (weightGoal: 'lose' | 'maintain' | 'gain') => void;
  setStudyGoal: (hours: number, checkpoints: string[]) => void;
  setExerciseGoal: (minutes: number) => void;
  setHydrationGoal: (glasses: number) => void;
  setMealGoal: (count: number) => void;
  setSleepGoal: (hours: number) => void;
  setHabits: (habits: string[]) => void;
  checkStudyCheckpoints: () => CheckpointResult;
  addMissedCheckpoint: (missingHours?: number) => void;
  checkAndProcessCheckpoints: () => CheckpointNotification;
  getMessEnergyCapPenalty: () => number; // Now returns daily drain amount, not cap penalty
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
  // Shop actions
  purchaseItem: (itemId: string, price: number) => boolean;
  getShopItems: () => ShopItem[];
  updateRoomCustomization: (lightType?: string, plantType?: string) => void;
}

export const useQuillbyStore = create<QuillbyStore>()(
  persist(
    (set, get) => ({
  userData: {
    energy: 100,
    maxEnergyCap: 100,
    qCoins: 100,
    messPoints: 0,
    lastActiveTimestamp: Date.now(),
    onboardingCompleted: false,
    sleepSessions: [],
    ateBreakfast: false,
    waterGlasses: 0,
    mealsLogged: 0,
    weightGoal: 'maintain',
    mealPortionSize: 1.0,
    currentStreak: 0,
    lastCheckInDate: new Date().toDateString(),
    lastSleepReset: new Date().toDateString(),
    exerciseMinutes: 0,
    lastExerciseReset: new Date().toDateString(),
    studyMinutesToday: 0,
    lastStudyReset: new Date().toDateString(),
    missedCheckpoints: 0,
    appleTapsToday: 0,
    coffeeTapsToday: 0,
    lastConsumableReset: new Date().toDateString(),
    purchasedItems: [],
    signupDate: new Date().toDateString() // Track when user signed up
  },
  
  session: null,
  currentSessionId: null,
  
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
        qCoins: 100, // Start with 100 coins
        messPoints: 0,
        lastActiveTimestamp: now,
        onboardingCompleted: false,
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
        missedCheckpoints: 0,
        appleTapsToday: 0,
        coffeeTapsToday: 0,
        lastConsumableReset: today,
        purchasedItems: [],
        signupDate: today // Track when user signed up
      }
    });
  },

  // Load data from database and merge with local data - Enhanced
  loadFromDatabase: async () => {
    try {
      const dbData = await loadFromDatabase();
      if (dbData && dbData.userProfile) {
        const { userData, deadlines } = get();
        
        // Merge database data with local data, prioritizing database for key fields
        const mergedUserData = {
          ...userData,
          // Profile data from database
          buddyName: dbData.userProfile.buddy_name || userData.buddyName,
          selectedCharacter: dbData.userProfile.selected_character || userData.selectedCharacter,
          userName: dbData.userProfile.user_name || userData.userName,
          studentLevel: dbData.userProfile.student_level || userData.studentLevel,
          country: dbData.userProfile.country || userData.country,
          timezone: dbData.userProfile.timezone || userData.timezone,
          qCoins: dbData.userProfile.q_coins ?? userData.qCoins,
          messPoints: dbData.userProfile.mess_points ?? userData.messPoints,
          currentStreak: dbData.userProfile.current_streak ?? userData.currentStreak,
          enabledHabits: dbData.userProfile.enabled_habits || userData.enabledHabits,
          studyGoalHours: dbData.userProfile.study_goal_hours ?? userData.studyGoalHours,
          exerciseGoalMinutes: dbData.userProfile.exercise_goal_minutes ?? userData.exerciseGoalMinutes,
          hydrationGoalGlasses: dbData.userProfile.hydration_goal_glasses ?? userData.hydrationGoalGlasses,
          sleepGoalHours: dbData.userProfile.sleep_goal_hours ?? userData.sleepGoalHours,
          weightGoal: dbData.userProfile.weight_goal || userData.weightGoal,
          mealPortionSize: dbData.userProfile.meal_portion_size ?? userData.mealPortionSize,
          purchasedItems: dbData.purchasedItems?.map((item: any) => item.item_id) || userData.purchasedItems,
          roomCustomization: {
            lightType: dbData.userProfile.light_type || userData.roomCustomization?.lightType,
            plantType: dbData.userProfile.plant_type || userData.roomCustomization?.plantType,
          },
          // Daily data from database (prioritize daily_data over daily_progress)
          ...(dbData.dailyData && {
            studyMinutesToday: dbData.dailyData.study_minutes_today ?? userData.studyMinutesToday,
            missedCheckpoints: dbData.dailyData.missed_checkpoints ?? userData.missedCheckpoints,
            ateBreakfast: dbData.dailyData.ate_breakfast ?? userData.ateBreakfast,
            waterGlasses: dbData.dailyData.water_glasses ?? userData.waterGlasses,
            mealsLogged: dbData.dailyData.meals_logged ?? userData.mealsLogged,
            exerciseMinutes: dbData.dailyData.exercise_minutes ?? userData.exerciseMinutes,
            appleTapsToday: dbData.dailyData.apple_taps_today ?? userData.appleTapsToday,
            coffeeTapsToday: dbData.dailyData.coffee_taps_today ?? userData.coffeeTapsToday,
          }),
          // Fallback to daily_progress if daily_data is not available
          ...(!dbData.dailyData && dbData.dailyProgress && {
            studyMinutesToday: dbData.dailyProgress.study_minutes_today ?? userData.studyMinutesToday,
            missedCheckpoints: dbData.dailyProgress.missed_checkpoints ?? userData.missedCheckpoints,
            ateBreakfast: dbData.dailyProgress.ate_breakfast ?? userData.ateBreakfast,
            waterGlasses: dbData.dailyProgress.water_glasses ?? userData.waterGlasses,
            mealsLogged: dbData.dailyProgress.meals_logged ?? userData.mealsLogged,
            exerciseMinutes: dbData.dailyProgress.exercise_minutes ?? userData.exerciseMinutes,
          }),
          // Sleep sessions from database
          sleepSessions: dbData.sleepSessions?.map((session: any) => ({
            id: session.id,
            start: session.start_time,
            end: session.end_time,
            duration: session.duration_hours,
            date: session.date_assigned,
          })) || userData.sleepSessions,
        };

        // Convert database deadlines to local format
        const mergedDeadlines = dbData.deadlines?.map((dbDeadline: any) => ({
          id: dbDeadline.id,
          title: dbDeadline.title,
          dueDate: dbDeadline.due_date,
          dueTime: dbDeadline.due_time,
          priority: dbDeadline.priority,
          category: dbDeadline.category,
          estimatedHours: dbDeadline.estimated_hours,
          workCompleted: dbDeadline.work_completed,
          isCompleted: dbDeadline.is_completed,
          createdAt: dbDeadline.created_at,
          reminders: {
            oneDayBefore: dbDeadline.reminder_one_day_before,
            threeDaysBefore: dbDeadline.reminder_three_days_before,
          }
        })) || deadlines;

        set({ 
          userData: mergedUserData,
          deadlines: mergedDeadlines
        });
        console.log('[Load] Comprehensive data merged from database successfully');
        
        // Start periodic sync
        setInterval(() => {
          const currentState = get();
          periodicSync(currentState.userData);
        }, 5 * 60 * 1000); // Sync every 5 minutes
      }
    } catch (error) {
      console.error('[Load] Failed to load from database:', error);
    }
  },
  
  // Update energy - Check for daily drains and cap at 100
  updateEnergy: () => {
    const { userData } = get();
    let newEnergy = userData.energy;
    let updatedUserData = { ...userData };
    
    // Check for daily drains (breakfast skip, mess penalty)
    const drainCheck = shouldApplyDailyDrains(userData);
    if (drainCheck.shouldApply) {
      newEnergy = Math.max(0, newEnergy - drainCheck.drainAmount);
      
      // Mark drain as applied for today
      const today = new Date().toDateString();
      if (drainCheck.drainType === 'breakfast') {
        (updatedUserData as any).lastBreakfastDrain = today;
        console.log(`[Daily] Breakfast skip penalty: -${drainCheck.drainAmount} energy`);
      } else if (drainCheck.drainType === 'mess') {
        (updatedUserData as any).lastMessDrain = today;
        console.log(`[Daily] Mess penalty: -${drainCheck.drainAmount} energy (${userData.messPoints.toFixed(1)} mess points)`);
      }
    }
    
    // Ensure energy doesn't exceed 100
    const cappedEnergy = Math.min(newEnergy, 100);
    
    if (cappedEnergy !== userData.energy || drainCheck.shouldApply) {
      set({
        userData: {
          ...updatedUserData,
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
    
    const updatedUserData = {
      ...userData,
      energy: newEnergy
    };
    
    set({
      userData: updatedUserData,
      selectedDeadlineId: deadlineId || null,
      currentSessionId: null, // Will be set by database response
      session: {
        focusScore: 0,
        startTime: Date.now(),
        duration: 0,
        isActive: true,
        distractionCount: 0,
        lastDistractionTime: null,
        distractionWarnings: 0,
        isInGracePeriod: false,
        totalBreakTime: 0,
        maxBreakTime: 25 * 60 * 0.2,
        applePremiumUsedThisSession: false,
        coffeePremiumUsedThisSession: false,
        coffeeBoostEndTime: null,
        coffeeBoostStartTime: null,
        interactionBoosts: 0
      }
    });
    
    // Sync focus session to database
    (async () => {
      try {
        console.log('[FocusSession] Starting database sync...');
        const user = await getDeviceUser();
        console.log('[FocusSession] User from getDeviceUser:', user);
        
        if (user && user.id) {
          console.log('[FocusSession] User ID:', user.id);
          console.log('[FocusSession] User ID type:', typeof user.id);
          console.log('[FocusSession] User ID length:', user.id.length);
          
          // Validate UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(user.id)) {
            console.error('[FocusSession] Invalid UUID format:', user.id);
            console.error('[FocusSession] Skipping database sync due to invalid user ID');
            return;
          }
          
          console.log('[FocusSession] About to call createFocusSession...');
          const sessionData = await createFocusSession(user.id, deadlineId);
          console.log('[FocusSession] createFocusSession completed successfully');
          
          if (sessionData && sessionData.id) {
            // Update the store with the database session ID
            set((state) => ({
              ...state,
              currentSessionId: sessionData.id
            }));
            console.log('[FocusSession] Session ID stored:', sessionData.id);
          }
          
          await syncToDatabase(updatedUserData);
        } else {
          console.log('[FocusSession] No valid user returned from getDeviceUser');
          console.log('[FocusSession] Skipping database sync - working in offline mode');
        }
      } catch (error) {
        console.error('[Session] Failed to sync focus session to database:', error);
      }
    })();
    
    return true;
  },
  
  // End focus session and calculate rewards
  endFocusSession: () => {
    const { userData, session, selectedDeadlineId, addWorkToDeadline, currentSessionId } = get();
    
    if (!session) return;
    
    // Calculate rewards based on focus score and distractions
    const rewards = calculateSessionRewards(session.focusScore, session.distractionCount);
    const newMessPoints = removeMessAfterSession(userData.messPoints, rewards.messPointsRemoved);
    
    // Calculate session duration in minutes for display
    const sessionDurationMinutes = Math.floor(session.duration / 60);
    
    // If this session was for a deadline, log the work (use study hours from rewards)
    if (selectedDeadlineId && rewards.studyHours > 0) {
      console.log(`[Focus→Deadline] Adding ${rewards.studyHours.toFixed(2)}h to deadline ${selectedDeadlineId}`);
      addWorkToDeadline(selectedDeadlineId, rewards.studyHours);
    }
    
    // If study habit is enabled, log this focus session as study time
    const studyEnabled = userData.enabledHabits?.includes('study');
    let updatedUserData = {
      ...userData,
      qCoins: userData.qCoins + rewards.qCoinsEarned,
      messPoints: newMessPoints,
      energy: Math.min(userData.energy + rewards.energyGained, 100) // Add energy, cap at 100
    };
    
    if (studyEnabled && sessionDurationMinutes > 0) {
      // Check if it's a new day - reset study if so
      const today = new Date().toDateString();
      const isNewDay = userData.lastStudyReset !== today;
      
      // Convert study hours to minutes for tracking
      const studyMinutes = Math.round(rewards.studyHours * 60);
      
      // Calculate accumulated study (reset if new day)
      const accumulatedMinutes = isNewDay ? studyMinutes : (userData.studyMinutesToday || 0) + studyMinutes;
      
      console.log(`[Focus→Study] Adding ${studyMinutes}min → Total today: ${accumulatedMinutes}min`);
      
      updatedUserData = {
        ...updatedUserData,
        studyMinutesToday: accumulatedMinutes,
        lastStudyReset: today
      };
    }
    
    console.log(`[Session End] Focus: ${session.focusScore}, Coins: +${rewards.qCoinsEarned}, Energy: +${rewards.energyGained}, Study: ${rewards.studyHours.toFixed(2)}h`);
    
    set({
      userData: updatedUserData,
      session: null,
      selectedDeadlineId: null,
      currentSessionId: null
    });
    
    // Sync session end to database
    (async () => {
      try {
        if (currentSessionId) {
          console.log('[FocusSession] Ending database session:', currentSessionId);
          await endFocusSessionDB(currentSessionId, {
            focusScore: session.focusScore,
            distractionCount: session.distractionCount,
            totalBreakTime: session.totalBreakTime,
            applePremiumUsed: session.applePremiumUsedThisSession,
            coffeePremiumUsed: session.coffeePremiumUsedThisSession,
            durationSeconds: session.duration,
          });
          console.log('[FocusSession] Database session ended successfully');
        } else {
          console.log('[FocusSession] No session ID to end in database');
        }
        
        // Sync updated user data
        await syncToDatabase(updatedUserData);
      } catch (error) {
        console.error('[Session] Failed to sync session end to database:', error);
      }
    })();
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
    
    // Calculate focus score with proper coffee boost handling
    const newScore = calculateFocusScore(
      secondsElapsed,
      session.coffeeBoostStartTime,
      session.coffeeBoostEndTime,
      session.interactionBoosts
    );
    
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

  // Start a break - returns false if max break time reached
  startBreak: () => {
    const { session } = get();
    
    if (!session) return false;
    
    // Check if user has break time remaining
    const breakTimeRemaining = session.maxBreakTime - session.totalBreakTime;
    
    if (breakTimeRemaining <= 0) {
      console.log('[Break] No break time remaining');
      return false;
    }
    
    console.log(`[Break] Starting break - ${Math.floor(breakTimeRemaining / 60)}m ${breakTimeRemaining % 60}s remaining`);
    return true;
  },

  // End a break and record the time taken
  endBreak: (breakDuration: number) => {
    const { session } = get();
    
    if (!session) return;
    
    const newTotalBreakTime = session.totalBreakTime + breakDuration;
    
    console.log(`[Break] Ended - Duration: ${breakDuration}s, Total: ${newTotalBreakTime}s / ${session.maxBreakTime}s`);
    
    set({
      session: {
        ...session,
        totalBreakTime: Math.min(newTotalBreakTime, session.maxBreakTime) // Cap at max
      }
    });
  },

  // Tap apple during session - boosts focus score (free or premium)
  tapAppleInSession: (isPremium: boolean = false) => {
    const { session, userData } = get();
    
    if (!session) return false;
    
    // Check if consumables need daily reset
    const today = new Date().toDateString();
    const needsReset = userData.lastConsumableReset !== today;
    
    if (needsReset) {
      // Reset daily counters
      set({
        userData: {
          ...userData,
          appleTapsToday: 0,
          coffeeTapsToday: 0,
          lastConsumableReset: today
        }
      });
    }
    
    const currentAppleTaps = needsReset ? 0 : userData.appleTapsToday;
    
    if (isPremium) {
      // PREMIUM: 1 use per SESSION (resets each session)
      if (session.applePremiumUsedThisSession) {
        console.log('[Session Apple] Premium already used this session');
        return false;
      }
      
      if (userData.qCoins < 10) {
        console.log('[Session Apple] Not enough coins for premium (need 10)');
        return false;
      }
      
      // Premium: +10 focus, -10 coins
      const newInteractionBoosts = session.interactionBoosts + 10;
      
      console.log(`[Session Apple] PREMIUM +10 focus boost, -10 coins`);
      
      set({
        session: {
          ...session,
          interactionBoosts: newInteractionBoosts,
          applePremiumUsedThisSession: true
        },
        userData: {
          ...userData,
          qCoins: userData.qCoins - 10
        }
      });
      
      return true;
    } else {
      // FREE: 5 uses per DAY (shared across all sessions)
      if (currentAppleTaps >= 5) {
        console.log('[Session Apple] Daily limit reached (5 taps)');
        return false;
      }
      
      if (userData.qCoins < 2) {
        console.log('[Session Apple] Not enough coins (need 2)');
        return false;
      }
      
      // Free: +3 focus, -2 coins
      const newInteractionBoosts = session.interactionBoosts + 3;
      
      console.log(`[Session Apple] +3 focus boost, -2 coins (${currentAppleTaps + 1}/5 today)`);
      
      const updatedUserData = {
        ...userData,
        qCoins: userData.qCoins - 2,
        appleTapsToday: currentAppleTaps + 1
      };
      
      set({
        session: {
          ...session,
          interactionBoosts: newInteractionBoosts
        },
        userData: updatedUserData
      });
      
      // Sync apple tap to database
      (async () => {
        try {
          const user = await getDeviceUser();
          if (user && user.id) {
            console.log('[Apple] Syncing apple tap to database...');
            await incrementAppleTaps(user.id);
            await syncToDatabase(updatedUserData);
            console.log('[Apple] Apple tap synced to database successfully');
          } else {
            console.log('[Apple] No user, working in offline mode');
          }
        } catch (error) {
          console.error('[Apple] Failed to sync apple tap to database:', error);
        }
      })();
      
      return true;
    }
  },

  // Tap coffee during session - boosts focus score + boost (free or premium)
  tapCoffeeInSession: (isPremium: boolean = false) => {
    const { session, userData } = get();
    
    if (!session) return false;
    
    // Check if consumables need daily reset
    const today = new Date().toDateString();
    const needsReset = userData.lastConsumableReset !== today;
    
    if (needsReset) {
      // Reset daily counters
      set({
        userData: {
          ...userData,
          appleTapsToday: 0,
          coffeeTapsToday: 0,
          lastConsumableReset: today
        }
      });
    }
    
    const currentCoffeeTaps = needsReset ? 0 : userData.coffeeTapsToday;
    const now = Date.now();
    
    if (isPremium) {
      // PREMIUM: 1 use per SESSION (resets each session)
      if (session.coffeePremiumUsedThisSession) {
        console.log('[Session Coffee] Premium already used this session');
        return false;
      }
      
      if (userData.qCoins < 15) {
        console.log('[Session Coffee] Not enough coins for premium (need 15)');
        return false;
      }
      
      // Premium: +15 focus, 5-minute boost, -15 coins
      const newInteractionBoosts = session.interactionBoosts + 15;
      const boostEndTime = now + (5 * 60 * 1000); // 5 minutes
      
      console.log(`[Session Coffee] PREMIUM +15 focus boost, 5min extra boost, -15 coins`);
      
      set({
        session: {
          ...session,
          interactionBoosts: newInteractionBoosts,
          coffeePremiumUsedThisSession: true,
          coffeeBoostStartTime: now,
          coffeeBoostEndTime: boostEndTime
        },
        userData: {
          ...userData,
          qCoins: userData.qCoins - 15
        }
      });
      
      return true;
    } else {
      // FREE: 3 uses per DAY (shared across all sessions)
      if (currentCoffeeTaps >= 3) {
        console.log('[Session Coffee] Daily limit reached (3 taps)');
        return false;
      }
      
      if (userData.qCoins < 3) {
        console.log('[Session Coffee] Not enough coins (need 3)');
        return false;
      }
      
      // Free: +6 focus, 3-minute boost, -3 coins
      const newInteractionBoosts = session.interactionBoosts + 6;
      const boostEndTime = now + (3 * 60 * 1000); // 3 minutes
      
      console.log(`[Session Coffee] +6 focus boost, 3min extra boost, -3 coins (${currentCoffeeTaps + 1}/3 today)`);
      
      const updatedUserData = {
        ...userData,
        qCoins: userData.qCoins - 3,
        coffeeTapsToday: currentCoffeeTaps + 1
      };
      
      set({
        session: {
          ...session,
          interactionBoosts: newInteractionBoosts,
          coffeeBoostStartTime: now,
          coffeeBoostEndTime: boostEndTime
        },
        userData: updatedUserData
      });
      
      // Sync coffee tap to database
      (async () => {
        try {
          const user = await getDeviceUser();
          if (user && user.id) {
            console.log('[Coffee] Syncing coffee tap to database...');
            await incrementCoffeeTaps(user.id);
            await syncToDatabase(updatedUserData);
            console.log('[Coffee] Coffee tap synced to database successfully');
          } else {
            console.log('[Coffee] No user, working in offline mode');
          }
        } catch (error) {
          console.error('[Coffee] Failed to sync coffee tap to database:', error);
        }
      })();
      
      return true;
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
    
    const updatedUserData = {
      ...userData,
      waterGlasses: newCount,
      energy: Math.min(userData.energy + energyGain, 100), // Cap at 100
      qCoins: userData.qCoins + 5 // +5 coins per glass
    };
    
    set({
      userData: updatedUserData
    });
    
    // Sync water to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user && user.id) {
          console.log('[Water] Syncing water to database...');
          await addWater(user.id);
          await syncToDatabase(updatedUserData);
          console.log('[Water] Water synced to database successfully');
        } else {
          console.log('[Water] No user, working in offline mode');
        }
      } catch (error) {
        console.error('[Water] Failed to sync water to database:', error);
      }
    })();
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

  // End a sleep session and calculate duration - Only records sleep, doesn't change energy
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
    
    // Award Q-coins for good sleep
    let sleepCoins = 0;
    if (todaysSleep >= 8) {
      sleepCoins = 25; // Excellent sleep
    } else if (todaysSleep >= 7) {
      sleepCoins = 20; // Good sleep
    } else if (todaysSleep >= 6) {
      sleepCoins = 10; // Decent sleep
    }
    
    console.log(`[Sleep] Completed: ${duration.toFixed(1)}h → Total today: ${todaysSleep.toFixed(1)}h → Coins: +${sleepCoins}`);
    console.log(`[Sleep] Energy NOT changed (current: ${userData.energy}) - Energy only resets on daily reset based on total sleep`);
    
    // IMPORTANT: Energy is NOT changed here!
    // Energy is only set during daily reset (resetDay) based on total sleep
    // This allows users to track sleep without accidentally resetting their energy
    const updatedUserData = {
      ...userData,
      sleepSessions: updatedSessions,
      maxEnergyCap: 100, // Always 100
      // energy: NOT CHANGED - stays at current value
      qCoins: userData.qCoins + sleepCoins, // Award sleep coins
      activeSleepSession: undefined // Clear active session
    };
    
    set({
      userData: updatedUserData
    });
    
    // Sync sleep session to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          // Calculate duration in minutes for database
          const durationMinutes = Math.round(duration * 60);
          
          await createSleepSession(user.id, {
            start: completedSession.start,
            end: completedSession.end,
            duration: completedSession.duration, // Hours for compatibility
            durationMinutes: durationMinutes, // Minutes for better display
            date: completedSession.date,
            quality: todaysSleep >= 8 ? 'excellent' : todaysSleep >= 7 ? 'good' : todaysSleep >= 6 ? 'fair' : 'poor',
            coinsEarned: sleepCoins
          });
          
          console.log(`[Sleep] Synced to database: ${completedSession.duration}h (${durationMinutes}min)`);
          
          // Also sync updated user data
          await syncToDatabase(updatedUserData);
        }
      } catch (error) {
        console.error('[Sleep] Failed to sync sleep session to database:', error);
  
      } 
    })();
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
    
    const updatedUserData = {
      ...userData,
      mealsLogged: mealCount,
      energy: Math.min(userData.energy + energyGain, 100), // Cap at 100
      qCoins: userData.qCoins + 10 // +10 coins per meal
    };
    
    set({
      userData: updatedUserData
    });
    
    // Sync meal to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user && user.id) {
          console.log('[Meal] Syncing meal to database...');
          await addMeal(user.id);
          await syncToDatabase(updatedUserData);
          console.log('[Meal] Meal synced to database successfully');
        } else {
          console.log('[Meal] No user, working in offline mode');
        }
      } catch (error) {
        console.error('[Meal] Failed to sync meal to database:', error);
      }
    })();
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
  
  // Reset daily values (for testing or new day) - NO AUTOMATIC MESS DECAY
  resetDay: () => {
    const { userData } = get();
    const today = new Date().toDateString();
    
    // NO automatic mess decay - mess persists until user actively cleans!
    // This forces accountability and makes cleaning meaningful
    
    // Calculate morning energy based on yesterday's sleep
    const todaysSleep = getTodaysSleepHours(userData.sleepSessions || []);
    const morningEnergy = calculateMorningEnergy(todaysSleep);
    
    console.log(`[Daily Reset] Sleep: ${todaysSleep.toFixed(1)}h → Morning energy: ${morningEnergy}/100`);
    console.log(`[Daily Reset] Mess persists: ${userData.messPoints.toFixed(1)} points (clean your room!)`);
    
    set({
      userData: {
        ...userData,
        energy: morningEnergy, // Set based on sleep quality
        ateBreakfast: false,
        waterGlasses: 0,
        mealsLogged: 0, // Reset meals
        // Note: sleepSessions are kept (they have dates), no need to reset
        // Note: messPoints are NOT reset - they persist until cleaned!
        exerciseMinutes: 0, // Reset exercise
        studyMinutesToday: 0, // Reset study
        missedCheckpoints: 0, // Reset missed checkpoints
        lastSleepReset: today,
        lastExerciseReset: today,
        lastStudyReset: today,
        maxEnergyCap: 100, // Always 100
        signupDate: (userData as any).signupDate || today // Preserve signup date
      }
    });
  },
  
  // Onboarding: Mark onboarding as complete
  completeOnboarding: () => {
    const { userData } = get();
    console.log('[Onboarding] Marking onboarding as complete');
    
    const updatedUserData = {
      ...userData,
      onboardingCompleted: true
    };
    
    set({
      userData: updatedUserData
    });
    
    // Sync to database
    syncToDatabase(updatedUserData);
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

  // Onboarding: Set exercise goal
  setExerciseGoal: (minutes: number) => {
    const { userData } = get();
    console.log(`[Onboarding] Exercise goal set: ${minutes} minutes/day`);
    
    set({
      userData: {
        ...userData,
        exerciseGoalMinutes: minutes
      }
    });
  },

  // Onboarding: Set hydration goal
  setHydrationGoal: (glasses: number) => {
    const { userData } = get();
    console.log(`[Onboarding] Hydration goal set: ${glasses} glasses/day`);
    
    set({
      userData: {
        ...userData,
        hydrationGoalGlasses: glasses
      }
    });
  },

  // Onboarding: Set meal goal
  setMealGoal: (count: number) => {
    const { userData } = get();
    console.log(`[Onboarding] Meal goal set: ${count} meals/day`);
    
    set({
      userData: {
        ...userData,
        mealGoalCount: count
      }
    });
  },

  // Onboarding: Set sleep goal
  setSleepGoal: (hours: number) => {
    const { userData } = get();
    console.log(`[Onboarding] Sleep goal set: ${hours} hours/night`);
    
    set({
      userData: {
        ...userData,
        sleepGoalHours: hours
      }
    });
  },



  // Check study progress at checkpoints with proper time-based formula
  checkStudyCheckpoints: () => {
    const { userData } = get();
    
    if (!userData.studyGoalHours || !userData.studyCheckpoints) return { isBehind: false };
    
    // Skip checkpoint checks on first day (user just signed up)
    const today = new Date().toDateString();
    const signupDate = (userData as any).signupDate || today;
    const isFirstDay = signupDate === today;
    
    if (isFirstDay) {
      console.log('[Study] First day after signup - skipping checkpoint penalties');
      return { isBehind: false };
    }
    
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

  // Get daily energy drain from mess points (visual consequence of messy room)
  getMessEnergyCapPenalty: () => {
    const { userData } = get();
    return calculateMessEnergyDrain(userData.messPoints);
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

  // Apply daily mess decay - REMOVED: Mess should only decrease through user actions
  applyDailyMessDecay: () => {
    // NO AUTOMATIC DECAY - mess only decreases through:
    // 1. Cleaning mini-game
    // 2. Completed focus sessions (-2 mess per session)
    // This forces users to actively clean their room!
    console.log(`[Daily] No automatic mess decay - clean your room to reduce mess!`);
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
    
    // Sync deadline to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          await createDeadline(user.id, {
            title: formData.title,
            description: '', // No description in form data
            dueDate: normalizedDueDate,
            dueTime: formData.dueTime,
            priority: formData.priority,
            category: formData.category,
            estimatedHours: parseFloat(formData.estimatedHours),
            reminderOneDayBefore: true,
            reminderThreeDaysBefore: true,
          });
        }
      } catch (error) {
        console.error('[Deadline] Failed to sync deadline to database:', error);
      }
    })();
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
    
    // Sync update to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          await updateDeadlineDB(id, normalizedUpdates);
        }
      } catch (error) {
        console.error('[Deadline] Failed to sync update to database:', error);
      }
    })();
  },

  // Delete deadline
  deleteDeadline: (id: string) => {
    const { deadlines } = get();
    
    set({
      deadlines: deadlines.filter(deadline => deadline.id !== id)
    });
    
    // Sync deletion to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          await deleteDeadlineDB(id);
        }
      } catch (error) {
        console.error('[Deadline] Failed to sync deletion to database:', error);
      }
    })();
  },

  // Mark deadline as complete
  markDeadlineComplete: (id: string) => {
    const { deadlines, userData } = get();
    const deadline = deadlines.find(d => d.id === id);
    
    if (deadline) {
      // Calculate completion bonus based on priority and hours
      let completionBonus = 50; // Base bonus
      if (deadline.priority === 'high') completionBonus += 30;
      else if (deadline.priority === 'medium') completionBonus += 20;
      else completionBonus += 10;
      
      // Bonus for completing on time
      const now = new Date();
      const dueDate = new Date(deadline.dueDate);
      if (now <= dueDate) {
        completionBonus += 25; // On-time bonus
      }
      
      // Update deadline and award coins
      const updatedDeadlines = deadlines.map(d => 
        d.id === id ? { ...d, isCompleted: true } : d
      );
      
      const updatedUserData = {
        ...userData,
        qCoins: userData.qCoins + completionBonus
      };
      
      set({
        deadlines: updatedDeadlines,
        userData: updatedUserData
      });
      
      console.log(`[Deadline] Completed "${deadline.title}" → +${completionBonus} Q-Coins!`);
      
      // Sync completion to database
      (async () => {
        try {
          const user = await getDeviceUser();
          if (user) {
            await markDeadlineCompleteDB(id);
            await syncToDatabase(updatedUserData);
          }
        } catch (error) {
          console.error('[Deadline] Failed to sync completion to database:', error);
        }
      })();
    }
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
      
      // Sync work addition to database
      (async () => {
        try {
          const user = await getDeviceUser();
          if (user) {
            await addWorkToDeadlineDB(id, hours);
          }
        } catch (error) {
          console.error('[Deadline] Failed to sync work addition to database:', error);
        }
      })();
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

  // Shop Functions
  getShopItems: () => {
    return [
      // Lights
      {
        id: 'colored-fairy-lights',
        name: 'Colored Fairy Lights',
        description: 'Magical colorful twinkling lights to brighten your room',
        price: 50,
        category: 'light' as const,
        assetPath: 'colored-fairy-lights',
        icon: '✨'
      },
      // Plants
      {
        id: 'succulent-plant',
        name: 'Succulent Plant',
        description: 'A cute succulent to freshen up your space',
        price: 30,
        category: 'plant' as const,
        assetPath: 'succulent-plant',
        icon: '🌵'
      },
      {
        id: 'swiss-cheese-plant',
        name: 'Swiss Cheese Plant',
        description: 'Beautiful monstera plant with unique leaves',
        price: 40,
        category: 'plant' as const,
        assetPath: 'swiss-cheese-plant',
        icon: '🌿'
      }
    ];
  },

  purchaseItem: (itemId: string, price: number) => {
    const { userData } = get();
    
    // Ensure qCoins is a number and price is valid
    const currentCoins = Number(userData.qCoins) || 0;
    const itemPrice = Number(price) || 0;
    
    console.log(`[Shop] Purchase attempt - Item: ${itemId}, Price: ${itemPrice}, Current coins: ${currentCoins}`);
    
    // Check if user has enough coins
    if (currentCoins < itemPrice) {
      console.log(`[Shop] Insufficient coins`);
      return false;
    }
    
    // Check if already purchased
    if (userData.purchasedItems?.includes(itemId)) {
      console.log(`[Shop] Already purchased`);
      return false;
    }
    
    // Deduct coins and add to purchased items
    const newCoins = Math.max(0, currentCoins - itemPrice); // Ensure never negative
    console.log(`[Shop] New coin balance: ${newCoins}`);
    
    const updatedUserData = {
      ...userData,
      qCoins: newCoins,
      purchasedItems: [...(userData.purchasedItems || []), itemId]
    };
    
    set({
      userData: updatedUserData
    });
    
    // Sync to database
    (async () => {
      try {
        const user = await getDeviceUser();
        if (user) {
          // Record purchase in database
          await purchaseItemDB(user.id, itemId);
          // Sync updated user data
          await syncToDatabase(updatedUserData);
        }
      } catch (error) {
        console.error('[Shop] Failed to sync purchase to database:', error);
      }
    })();
    
    console.log(`[Shop] Purchased ${itemId} for ${itemPrice} coins`);
    return true;
  },

  updateRoomCustomization: (lightType?: string, plantType?: string) => {
    const { userData } = get();
    
    // Build the new customization object
    const newCustomization: any = {};
    
    // Handle lightType: empty string = reset to default, undefined = keep existing, value = set new
    if (lightType !== undefined) {
      if (lightType !== '') {
        newCustomization.lightType = lightType as 'lamp' | 'colored-fairy-lights';
      }
      // Empty string means reset to default (don't set lightType)
    } else if (userData.roomCustomization?.lightType) {
      // Keep existing light type if not updating
      newCustomization.lightType = userData.roomCustomization.lightType;
    }
    
    // Handle plantType: empty string = reset to default, undefined = keep existing, value = set new
    if (plantType !== undefined) {
      if (plantType !== '') {
        newCustomization.plantType = plantType as 'plant' | 'succulent-plant' | 'swiss-cheese-plant';
      }
      // Empty string means reset to default (don't set plantType)
    } else if (userData.roomCustomization?.plantType) {
      // Keep existing plant type if not updating
      newCustomization.plantType = userData.roomCustomization.plantType;
    }
    
    set({
      userData: {
        ...userData,
        roomCustomization: Object.keys(newCustomization).length > 0 ? newCustomization : undefined
      }
    });
    
    console.log(`[Room] Updated customization - Light: ${lightType}, Plant: ${plantType}, Result:`, newCustomization);
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
