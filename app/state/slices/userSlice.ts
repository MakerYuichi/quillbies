// User-related state and actions
import { StateCreator } from 'zustand';
import { UserData } from '../../core/types';
import { syncToDatabase } from '../utils/syncUtils';

export interface UserSlice {
  userData: UserData;
  
  // User actions
  initializeUser: () => void;
  updateEnergy: () => void;
  resetDay: () => void;
  addGems: (amount: number, reason?: string) => void;
  spendGems: (amount: number, reason?: string) => boolean;
  
  // Onboarding actions
  completeOnboarding: () => Promise<void>;
  setCharacter: (character: string) => void;
  setBuddyName: (name: string) => void;
  setProfile: (userName: string, studentLevel: string, country: string, timezone: string) => void;
  setWeightGoal: (weightGoal: 'lose' | 'maintain' | 'gain') => void;
  setHabits: (habits: string[]) => void;
  setStudyGoal: (hours: number, checkpoints: string[]) => void;
  setExerciseGoal: (minutes: number) => void;
  setHydrationGoal: (glasses: number) => void;
  setMealGoal: (count: number) => void;
  setSleepGoal: (hours: number) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  userData: {
    energy: 100,
    maxEnergyCap: 100,
    qCoins: 100,
    gems: 0, // Start with 0 gems
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
    signupDate: new Date().toDateString()
  },

  initializeUser: () => {
    const { userData } = get();
    
    // Check if user data already exists and is properly initialized
    if (userData && 
        userData.signupDate && 
        userData.lastActiveTimestamp && 
        typeof userData.energy === 'number' &&
        typeof userData.qCoins === 'number') {
      console.log('[User] User data already properly initialized, skipping');
      return;
    }
    
    console.log('[User] Initializing new user data');
    const now = Date.now();
    const today = new Date().toDateString();
    
    // Create new user data, preserving any existing values
    const newUserData = {
      energy: userData?.energy ?? 100,
      maxEnergyCap: userData?.maxEnergyCap ?? 100,
      qCoins: userData?.qCoins ?? 100,
      gems: userData?.gems ?? 0,
      messPoints: userData?.messPoints ?? 0,
      lastActiveTimestamp: now,
      onboardingCompleted: userData?.onboardingCompleted ?? false,
      sleepSessions: userData?.sleepSessions ?? [],
      ateBreakfast: userData?.ateBreakfast ?? false,
      waterGlasses: userData?.waterGlasses ?? 0,
      mealsLogged: userData?.mealsLogged ?? 0,
      weightGoal: userData?.weightGoal ?? 'maintain',
      mealPortionSize: userData?.mealPortionSize ?? 1.0,
      currentStreak: userData?.currentStreak ?? 0,
      lastCheckInDate: userData?.lastCheckInDate ?? today,
      lastSleepReset: userData?.lastSleepReset ?? today,
      exerciseMinutes: userData?.exerciseMinutes ?? 0,
      lastExerciseReset: userData?.lastExerciseReset ?? today,
      studyMinutesToday: userData?.studyMinutesToday ?? 0,
      lastStudyReset: userData?.lastStudyReset ?? today,
      missedCheckpoints: userData?.missedCheckpoints ?? 0,
      appleTapsToday: userData?.appleTapsToday ?? 0,
      coffeeTapsToday: userData?.coffeeTapsToday ?? 0,
      lastConsumableReset: userData?.lastConsumableReset ?? today,
      purchasedItems: userData?.purchasedItems ?? [],
      signupDate: userData?.signupDate ?? today,
      // Preserve any other existing fields
      ...userData
    };
    
    set({ userData: newUserData });
    console.log('[User] User initialization completed');
  },

  updateEnergy: () => {
    const { userData } = get();
    const now = Date.now();
    const minutesElapsed = Math.floor((now - userData.lastActiveTimestamp) / (1000 * 60));
    
    if (minutesElapsed < 1) return; // Don't update if less than 1 minute has passed
    
    let newEnergy = userData.energy;
    let newMaxCap = userData.maxEnergyCap;
    
    // Calculate mess penalty on energy cap
    const messEnergyCapPenalty = Math.floor(userData.messPoints / 3) * 5;
    newMaxCap = Math.max(50, 100 - messEnergyCapPenalty);
    
    // Natural energy regeneration (1 energy per 2 minutes when not at cap)
    if (newEnergy < newMaxCap) {
      const energyToAdd = Math.floor(minutesElapsed / 2);
      newEnergy = Math.min(newMaxCap, newEnergy + energyToAdd);
    }
    
    // Cap energy at max capacity
    newEnergy = Math.min(newMaxCap, newEnergy);
    
    // Only update if there are actual changes
    if (userData.energy === newEnergy && userData.maxEnergyCap === newMaxCap) {
      // Just update timestamp without triggering re-renders
      set({ 
        userData: { 
          ...userData, 
          lastActiveTimestamp: now 
        } 
      });
      return;
    }
    
    // Update state
    const updatedUserData = {
      ...userData,
      energy: newEnergy,
      maxEnergyCap: newMaxCap,
      lastActiveTimestamp: now
    };
    
    set({ userData: updatedUserData });
    
    // Sync to database only for significant changes (throttled)
    if (Math.abs(userData.energy - newEnergy) >= 5 || userData.maxEnergyCap !== newMaxCap) {
      syncToDatabase(updatedUserData);
    }
  },

  resetDay: () => {
    const { userData } = get();
    const today = new Date().toDateString();
    
    // END-OF-DAY EVALUATION - Check for bad day consequences
    const studyGoal = userData.studyGoalHours || 3;
    const studyHours = (userData.studyMinutesToday || 0) / 60;
    const waterGoal = userData.hydrationGoalGlasses || 8;
    const mealGoal = userData.mealGoalCount || 3;
    
    // Calculate mess points for unmet study goal
    const studyDeficit = Math.max(0, studyGoal - studyHours);
    const messPointsToAdd = studyDeficit * 2; // 2 mess points per hour of unmet study goal
    const newMessPoints = userData.messPoints + messPointsToAdd;
    
    if (messPointsToAdd > 0) {
      console.log(`[Daily] 🧹 Adding ${messPointsToAdd.toFixed(1)} mess points for unmet study goal (${studyHours.toFixed(1)}h/${studyGoal}h)`);
      console.log(`[Daily] Mess points: ${userData.messPoints.toFixed(1)} → ${newMessPoints.toFixed(1)}`);
    }
    
    // Determine if this was a terrible day
    const isTerribleDay = studyHours === 0; // No studying at all
    const isBadDay = studyHours < (studyGoal * 0.3); // Less than 30% of study goal
    const isPoorHabits = userData.waterGlasses < (waterGoal * 0.5) || userData.mealsLogged < (mealGoal * 0.5);
    
    let streakBroken = false;
    let newStreak = userData.currentStreak;
    let qCoinsPenalty = 0;
    
    if (isTerribleDay) {
      // TERRIBLE DAY: No studying at all
      console.log('[Daily] 😔 TERRIBLE DAY DETECTED - No studying completed');
      console.log(`[Daily] Study: ${studyHours.toFixed(1)}h/${studyGoal}h, Water: ${userData.waterGlasses}/${waterGoal}, Meals: ${userData.mealsLogged}/${mealGoal}`);
      
      // Break streak and apply penalties
      streakBroken = true;
      newStreak = 0;
      qCoinsPenalty = 20; // Lose 20 Q-Coins for terrible day
      
      console.log('[Daily] 💔 Streak broken! No Q-Coins earned today');
      console.log('[Daily] 🎭 Quillby will show disappointed message');
      
    } else if (isBadDay && isPoorHabits) {
      // BAD DAY: Poor study + poor habits
      console.log('[Daily] 😟 BAD DAY DETECTED - Poor study and habits');
      console.log(`[Daily] Study: ${studyHours.toFixed(1)}h/${studyGoal}h, Water: ${userData.waterGlasses}/${waterGoal}, Meals: ${userData.mealsLogged}/${mealGoal}`);
      
      // Break streak but smaller penalty
      streakBroken = true;
      newStreak = 0;
      qCoinsPenalty = 10; // Lose 10 Q-Coins for bad day
      
      console.log('[Daily] 💔 Streak broken! Reduced Q-Coins earned today');
      
    } else if (studyHours >= (studyGoal * 0.8) && userData.waterGlasses >= (waterGoal * 0.7) && userData.mealsLogged >= (mealGoal * 0.7)) {
      // GOOD DAY: Met most goals
      newStreak = userData.currentStreak + 1;
      console.log(`[Daily] ✨ GOOD DAY! Streak continued: ${newStreak} days`);
      
    } else {
      // MEDIOCRE DAY: Some progress but not great
      // Keep streak but don't increase it
      console.log('[Daily] 😐 Mediocre day - streak maintained but not increased');
    }
    
    // Apply Q-Coins penalty if applicable
    let newQCoins = userData.qCoins;
    if (qCoinsPenalty > 0) {
      newQCoins = Math.max(0, userData.qCoins - qCoinsPenalty);
      console.log(`[Daily] 💰 Q-Coins penalty: -${qCoinsPenalty} (${userData.qCoins} → ${newQCoins})`);
    }
    
    const updatedUserData = {
      ...userData,
      ateBreakfast: false,
      waterGlasses: 0,
      mealsLogged: 0,
      exerciseMinutes: 0,
      studyMinutesToday: 0,
      appleTapsToday: 0,
      coffeeTapsToday: 0,
      missedCheckpoints: 0, // Reset missed checkpoints for new day
      processedCheckpoints: [], // Reset processed checkpoints for new day
      messPoints: newMessPoints, // Update mess points
      currentStreak: newStreak,
      qCoins: newQCoins,
      lastCheckInDate: today,
      lastSleepReset: today,
      lastExerciseReset: today,
      lastStudyReset: today,
      lastConsumableReset: today,
      // Store evaluation results for message system
      lastDayEvaluation: {
        date: today,
        wasTerribleDay: isTerribleDay,
        wasBadDay: isBadDay && isPoorHabits,
        streakBroken,
        qCoinsPenalty,
        studyHours: studyHours.toFixed(1),
        studyGoal: studyGoal.toString(),
        waterCount: userData.waterGlasses,
        waterGoal,
        mealCount: userData.mealsLogged,
        mealGoal
      }
    };
    
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
    
    if (isTerribleDay) {
      console.log('[Daily] 😔 Daily reset complete - Terrible day consequences applied');
    } else if (isBadDay && isPoorHabits) {
      console.log('[Daily] 😟 Daily reset complete - Bad day consequences applied');
    } else {
      console.log('[Daily] Daily habits reset for new day');
    }
  },

  // Onboarding actions
  completeOnboarding: async () => {
    try {
      const { userData } = get();
      const updatedUserData = {
        ...userData,
        onboardingCompleted: true
      };
      
      console.log('[Onboarding] Setting onboarding completed in state...');
      set({ userData: updatedUserData });
      
      // Try to sync to database but don't fail if it doesn't work
      try {
        console.log('[Onboarding] Syncing to database...');
        syncToDatabase(updatedUserData);
      } catch (syncError) {
        console.warn('[Onboarding] Database sync failed, continuing anyway:', syncError);
      }
      
      // Save offline data for offline mode
      try {
        console.log('[Onboarding] Saving offline data...');
        const { saveOfflineUserData } = await import('../../../lib/offlineMode');
        await saveOfflineUserData(updatedUserData);
        console.log('[Onboarding] Offline data saved successfully');
      } catch (offlineError) {
        console.warn('[Onboarding] Could not save offline data:', offlineError);
      }
      
      // Also mark device-level onboarding as completed
      try {
        console.log('[Onboarding] Marking device-level onboarding...');
        const { markOnboardingCompleted } = await import('../../../lib/deviceOnboarding');
        const success = await markOnboardingCompleted();
        if (success) {
          console.log('[Onboarding] Device-level onboarding marked as completed');
        } else {
          console.warn('[Onboarding] Failed to mark device-level onboarding as completed');
        }
      } catch (deviceError) {
        console.warn('[Onboarding] Error marking device-level onboarding:', deviceError);
      }
      
      console.log('[Onboarding] Completion process finished successfully');
    } catch (error) {
      console.error('[Onboarding] Critical error during completion:', error);
      
      // At minimum, set the onboarding completed flag
      const { userData } = get();
      set({ 
        userData: { 
          ...userData, 
          onboardingCompleted: true 
        } 
      });
      
      // Re-throw the error so the caller can handle it
      throw error;
    }
  },

  setCharacter: (character: string) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      selectedCharacter: character
    };
    set({ userData: updatedUserData });
    // Sync to database
    syncToDatabase(updatedUserData);
  },

  setBuddyName: (name: string) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      buddyName: name
    };
    set({ userData: updatedUserData });
    // Sync to database
    syncToDatabase(updatedUserData);
  },

  setProfile: (userName: string, studentLevel: string, country: string, timezone: string) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      userName: userName || undefined,
      studentLevel,
      country,
      timezone
    };
    set({ userData: updatedUserData });
    // Sync to database
    syncToDatabase(updatedUserData);
  },

  setWeightGoal: (weightGoal: 'lose' | 'maintain' | 'gain') => {
    const { userData } = get();
    let portionSize = 1.0;
    if (weightGoal === 'lose') portionSize = 0.7;
    if (weightGoal === 'gain') portionSize = 1.3;
    
    const updatedUserData = {
      ...userData,
      weightGoal,
      mealPortionSize: portionSize
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
  },

  setHabits: (habits: string[]) => {
    const { userData } = get();
    console.log('[UserSlice] setHabits called with habits:', habits);
    const updatedUserData = {
      ...userData,
      enabledHabits: habits
    };
    set({ userData: updatedUserData });
    console.log('[UserSlice] Calling syncToDatabase for habits...');
    syncToDatabase(updatedUserData);
  },

  setStudyGoal: (hours: number, checkpoints: string[]) => {
    const { userData } = get();
    console.log('[UserSlice] setStudyGoal called with hours:', hours);
    const updatedUserData = {
      ...userData,
      studyGoalHours: hours,
      studyCheckpoints: checkpoints
    };
    set({ userData: updatedUserData });
    console.log('[UserSlice] Calling syncToDatabase for study goal...');
    syncToDatabase(updatedUserData);
  },

  setExerciseGoal: (minutes: number) => {
    const { userData } = get();
    console.log('[UserSlice] setExerciseGoal called with minutes:', minutes);
    const updatedUserData = {
      ...userData,
      exerciseGoalMinutes: minutes
    };
    set({ userData: updatedUserData });
    console.log('[UserSlice] Calling syncToDatabase for exercise goal...');
    syncToDatabase(updatedUserData);
  },

  setHydrationGoal: (glasses: number) => {
    const { userData } = get();
    console.log('[UserSlice] setHydrationGoal called with glasses:', glasses);
    const updatedUserData = {
      ...userData,
      hydrationGoalGlasses: glasses
    };
    set({ userData: updatedUserData });
    console.log('[UserSlice] Calling syncToDatabase for hydration goal...');
    syncToDatabase(updatedUserData);
  },

  setMealGoal: (count: number) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      mealGoalCount: count
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
  },

  setSleepGoal: (hours: number) => {
    const { userData } = get();
    console.log('[UserSlice] setSleepGoal called with hours:', hours);
    const updatedUserData = {
      ...userData,
      sleepGoalHours: hours
    };
    set({ userData: updatedUserData });
    console.log('[UserSlice] Calling syncToDatabase for sleep goal...');
    syncToDatabase(updatedUserData);
  },

  addGems: (amount: number, reason?: string) => {
    const { userData } = get();
    const newGems = userData.gems + amount;
    console.log(`[Gems] Adding ${amount} gems. Reason: ${reason || 'N/A'}. Total: ${userData.gems} → ${newGems}`);
    
    const updatedUserData = {
      ...userData,
      gems: newGems
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
  },

  spendGems: (amount: number, reason?: string) => {
    const { userData } = get();
    
    if (userData.gems < amount) {
      console.log(`[Gems] Insufficient gems. Have: ${userData.gems}, Need: ${amount}`);
      return false;
    }
    
    const newGems = userData.gems - amount;
    console.log(`[Gems] Spending ${amount} gems. Reason: ${reason || 'N/A'}. Total: ${userData.gems} → ${newGems}`);
    
    const updatedUserData = {
      ...userData,
      gems: newGems
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
    return true;
  }
});