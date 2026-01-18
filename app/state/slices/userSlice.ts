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
    const now = Date.now();
    const today = new Date().toDateString();
    set({
      userData: {
        energy: 100,
        maxEnergyCap: 100,
        qCoins: 100,
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
        signupDate: today
      }
    });
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
    
    const updatedUserData = {
      ...userData,
      ateBreakfast: false,
      waterGlasses: 0,
      mealsLogged: 0,
      exerciseMinutes: 0,
      studyMinutesToday: 0,
      appleTapsToday: 0,
      coffeeTapsToday: 0,
      lastCheckInDate: today,
      lastSleepReset: today,
      lastExerciseReset: today,
      lastStudyReset: today,
      lastConsumableReset: today,
    };
    
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
    
    console.log('[Daily] Daily habits reset for testing');
  },

  // Onboarding actions
  completeOnboarding: async () => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      onboardingCompleted: true
    };
    
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
    
    // Save offline data for offline mode
    try {
      const { saveOfflineUserData } = await import('../../../lib/offlineMode');
      await saveOfflineUserData(updatedUserData);
    } catch (err) {
      console.warn('[Onboarding] Could not save offline data:', err);
    }
    
    // Also mark device-level onboarding as completed
    try {
      const { markOnboardingCompleted } = await import('../../../lib/deviceOnboarding');
      const success = await markOnboardingCompleted();
      if (success) {
        console.log('[Onboarding] Device-level onboarding marked as completed');
      } else {
        console.warn('[Onboarding] Failed to mark device-level onboarding as completed');
      }
    } catch (err) {
      console.error('[Onboarding] Error marking device-level onboarding:', err);
    }
  },

  setCharacter: (character: string) => {
    const { userData } = get();
    set({
      userData: {
        ...userData,
        selectedCharacter: character
      }
    });
  },

  setBuddyName: (name: string) => {
    const { userData } = get();
    set({
      userData: {
        ...userData,
        buddyName: name
      }
    });
  },

  setProfile: (userName: string, studentLevel: string, country: string, timezone: string) => {
    const { userData } = get();
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
    const updatedUserData = {
      ...userData,
      enabledHabits: habits
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
  },

  setStudyGoal: (hours: number, checkpoints: string[]) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      studyGoalHours: hours,
      studyCheckpoints: checkpoints
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
  },

  setExerciseGoal: (minutes: number) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      exerciseGoalMinutes: minutes
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
  },

  setHydrationGoal: (glasses: number) => {
    const { userData } = get();
    const updatedUserData = {
      ...userData,
      hydrationGoalGlasses: glasses
    };
    set({ userData: updatedUserData });
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
    const updatedUserData = {
      ...userData,
      sleepGoalHours: hours
    };
    set({ userData: updatedUserData });
    syncToDatabase(updatedUserData);
  }
});