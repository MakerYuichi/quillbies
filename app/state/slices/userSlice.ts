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
    // Implementation moved from main store
    // ... (energy update logic)
  },

  resetDay: () => {
    // Implementation moved from main store
    // ... (daily reset logic)
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