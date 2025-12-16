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
    sleepHours: 0, // Accumulated sleep today (starts at 0)
    ateBreakfast: false,
    waterGlasses: 0,
    currentStreak: 0,
    lastCheckInDate: new Date().toDateString(),
    lastSleepReset: new Date().toDateString() // Track when sleep was last reset
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
        currentStreak: 0,
        lastCheckInDate: today,
        lastSleepReset: today
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
    const { userData } = get();
    const today = new Date().toDateString();
    
    set({
      userData: {
        ...userData,
        ateBreakfast: false,
        waterGlasses: 0,
        sleepHours: 0, // Reset accumulated sleep
        lastSleepReset: today,
        maxEnergyCap: calculateMaxEnergyCap({
          ...userData,
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
