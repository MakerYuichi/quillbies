// Global state management with Zustand

import { create } from 'zustand';
import { UserData, SessionData } from '../core/types';
import {
  calculateMaxEnergyCap,
  calculateEnergyDrain,
  rechargeEnergy,
  canStartSession,
  startSessionEnergyCost,
  updateFocusScore,
  drainFocusScore,
  calculateSessionRewards,
  addMessForSkippedTask,
  removeMessAfterSession,
  getMinutesElapsed,
  getSecondsElapsed,
  getMessEnergyPenalty
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
  skipTask: () => void;
  resetDay: () => void;
  // Onboarding actions
  setCharacter: (character: string) => void;
  setBuddyName: (name: string) => void;
  setProfile: (userName: string, studentLevel: string, country: string, timezone: string) => void;
  setHabits: (habits: string[]) => void;
}

export const useQuillbyStore = create<QuillbyStore>((set, get) => ({
  userData: {
    energy: 100,
    maxEnergyCap: 100,
    qCoins: 0,
    messPoints: 0,
    lastActiveTimestamp: Date.now(),
    sleepHours: 7,
    ateBreakfast: false,
    waterGlasses: 0,
    currentStreak: 0,
    lastCheckInDate: new Date().toDateString()
  },
  
  session: null,
  
  // Initialize user with default values
  initializeUser: () => {
    const now = Date.now();
    set({
      userData: {
        energy: 100,
        maxEnergyCap: 100,
        qCoins: 0,
        messPoints: 0,
        lastActiveTimestamp: now,
        sleepHours: 7,
        ateBreakfast: false,
        waterGlasses: 0,
        currentStreak: 0,
        lastCheckInDate: new Date().toDateString()
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
    
    set({
      userData: {
        ...userData,
        qCoins: userData.qCoins + rewards.qCoinsEarned,
        messPoints: newMessPoints
      },
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
    
    if (userData.waterGlasses >= 8) return; // Max 8 glasses
    
    set({
      userData: {
        ...userData,
        waterGlasses: userData.waterGlasses + 1,
        qCoins: userData.qCoins + 5 // 5 coins per glass
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
  
  // Log sleep hours
  logSleep: (hours: number) => {
    const { userData } = get();
    
    // 1. Create temp data with new sleep hours
    const tempData = { ...userData, sleepHours: hours };
    
    // 2. Calculate NEW max cap
    const newMaxCap = calculateMaxEnergyCap(tempData);
    
    console.log(`[Sleep] ${hours}h → New max cap: ${newMaxCap} (was ${userData.maxEnergyCap})`);
    
    // 3. CAP current energy to new max (if it's higher)
    const newEnergy = Math.min(userData.energy, newMaxCap);
    
    console.log(`[Sleep] Energy capped: ${userData.energy} → ${newEnergy}`);
    
    set({
      userData: {
        ...userData,
        sleepHours: hours,
        maxEnergyCap: newMaxCap,
        energy: newEnergy, // CRITICAL: Cap the energy!
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
  
  // Reset daily values (for testing)
  resetDay: () => {
    const { userData } = get();
    
    set({
      userData: {
        ...userData,
        ateBreakfast: false,
        waterGlasses: 0,
        sleepHours: 7,
        maxEnergyCap: calculateMaxEnergyCap({
          ...userData,
          ateBreakfast: false,
          waterGlasses: 0,
          sleepHours: 7
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
  }
}));
