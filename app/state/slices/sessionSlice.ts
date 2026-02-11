// Focus session-related state and actions
import { StateCreator } from 'zustand';
import { SessionData } from '../../core/types';
import { UserSlice } from './userSlice';

export interface SessionConfig {
  duration: number; // in minutes
  breakDuration: number; // in minutes
  sessionType: 'pomodoro' | 'custom' | 'flow' | 'premium';
  autoBreak: boolean;
  soundEnabled: boolean;
  customName?: string;
  backgroundMusic?: boolean;
  strictMode?: boolean;
}

export interface SessionSlice {
  session: SessionData | null;
  currentSessionId: string | null;
  selectedDeadlineId: string | null;
  
  // Session actions
  startFocusSession: (deadlineId?: string, config?: SessionConfig) => boolean;
  endFocusSession: () => void;
  updateFocusDuringSession: () => void;
  handleDistraction: () => void;
  startBreak: () => boolean;
  endBreak: (breakDuration: number) => void;
  
  // Session interactions
  tapAppleInSession: (isPremium?: boolean) => boolean;
  tapCoffeeInSession: (isPremium?: boolean) => boolean;
}

export const createSessionSlice: StateCreator<
  SessionSlice & UserSlice,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  session: null,
  currentSessionId: null,
  selectedDeadlineId: null,

  startFocusSession: (deadlineId?: string, config?: SessionConfig) => {
    const { userData } = get();
    
    // Check energy requirements
    if (userData.energy < 20) {
      console.log(`[Session] Not enough energy: Need 20, Have ${userData.energy}`);
      return false;
    }
    
    const newEnergy = userData.energy - 20;
    
    const updatedUserData = {
      ...userData,
      energy: newEnergy
    };
    
    // Use config values or defaults
    const sessionDuration = config ? config.duration * 60 : 25 * 60; // Convert minutes to seconds
    const maxBreakTime = config ? (sessionDuration * 0.2) : (25 * 60 * 0.2); // 20% of session duration
    
    console.log(`[Session] Starting with config:`, {
      duration: config?.duration || 25,
      breakDuration: config?.breakDuration || 5,
      sessionType: config?.sessionType || 'pomodoro',
      maxBreakTime: Math.floor(maxBreakTime / 60)
    });
    
    set({
      userData: updatedUserData,
      selectedDeadlineId: deadlineId || null,
      currentSessionId: null,
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
        maxBreakTime: maxBreakTime,
        applePremiumUsedThisSession: false,
        coffeePremiumUsedThisSession: false,
        coffeeBoostEndTime: null,
        coffeeBoostStartTime: null,
        interactionBoosts: 0,
        // Store session config for reference
        config: config || {
          duration: 25,
          breakDuration: 5,
          sessionType: 'pomodoro',
          autoBreak: true,
          soundEnabled: true
        }
      }
    });
    
    return true;
  },

  endFocusSession: () => {
    const { userData, session, selectedDeadlineId } = get();
    
    if (!session) return;
    
    // Calculate session duration in minutes and hours
    const sessionMinutes = Math.floor(session.duration / 60);
    const sessionHours = session.duration / 3600;
    
    // Calculate rewards
    const qCoinsEarned = Math.floor(session.focusScore / 10);
    const energyGained = Math.min(15, Math.floor(session.focusScore / 20));
    
    // Update user data with session results
    const updatedUserData = {
      ...userData,
      qCoins: userData.qCoins + qCoinsEarned,
      energy: Math.min(userData.energy + energyGained, 100),
      studyMinutesToday: (userData.studyMinutesToday || 0) + sessionMinutes,
      totalStudyMinutes: (userData.totalStudyMinutes || 0) + sessionMinutes
    };
    
    console.log(`[Session] Ended - Duration: ${sessionMinutes}min, Focus: ${session.focusScore}, Coins: +${qCoinsEarned}, Energy: +${energyGained}`);
    
    // Update deadline progress if one was selected
    if (selectedDeadlineId && sessionHours > 0) {
      console.log(`[Session→Deadline] Adding ${sessionHours.toFixed(2)}h to deadline ${selectedDeadlineId}`);
      const { addWorkToDeadline } = get() as any;
      if (addWorkToDeadline) {
        addWorkToDeadline(selectedDeadlineId, sessionHours);
      }
    }
    
    set({
      userData: updatedUserData,
      session: null,
      selectedDeadlineId: null,
      currentSessionId: null
    });
  },

  updateFocusDuringSession: () => {
    const { session } = get();
    
    if (!session || !session.isActive) {
      console.log('[Focus] No active session, skipping update');
      return;
    }
    
    // PAUSE timer if in grace period
    if (session.isInGracePeriod) {
      console.log('[Focus] Timer paused during grace period');
      return;
    }
    
    const secondsElapsed = Math.floor((Date.now() - session.startTime) / 1000);
    
    // Calculate base focus score (10 points per minute)
    const baseScore = Math.floor(secondsElapsed / 60) * 10;
    
    // Add interaction boosts (apple/coffee taps)
    const totalScore = baseScore + session.interactionBoosts;
    
    // Apply coffee boost if active
    let finalScore = totalScore;
    if (session.coffeeBoostEndTime && Date.now() < session.coffeeBoostEndTime) {
      // Coffee boost adds 50% more points during boost period
      const boostMultiplier = 1.5;
      finalScore = Math.floor(totalScore * boostMultiplier);
    }
    
    set({
      session: {
        ...session,
        focusScore: finalScore,
        duration: secondsElapsed
      }
    });
  },

  handleDistraction: () => {
    const { session } = get();
    
    if (!session || !session.isActive) {
      console.log('[Distraction] No active session, ignoring distraction');
      return;
    }
    
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
      const penalty = minutesAway * 10; // 10 points per minute away
      const newScore = Math.max(0, session.focusScore - penalty);
      
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

  startBreak: () => {
    const { session } = get();
    
    if (!session) return false;
    
    const breakTimeRemaining = session.maxBreakTime - session.totalBreakTime;
    return breakTimeRemaining > 0;
  },

  endBreak: (breakDuration: number) => {
    const { session } = get();
    
    if (!session) return;
    
    const newTotalBreakTime = session.totalBreakTime + breakDuration;
    
    set({
      session: {
        ...session,
        totalBreakTime: Math.min(newTotalBreakTime, session.maxBreakTime)
      }
    });
  },

  tapAppleInSession: (isPremium: boolean = false) => {
    const { session, userData } = get();
    
    if (!session) return false;
    
    const cost = isPremium ? 10 : 2;
    const boost = isPremium ? 10 : 3;
    
    if (userData.qCoins < cost) return false;
    
    if (isPremium && session.applePremiumUsedThisSession) return false;
    
    const newInteractionBoosts = session.interactionBoosts + boost;
    
    set({
      session: {
        ...session,
        interactionBoosts: newInteractionBoosts,
        applePremiumUsedThisSession: isPremium ? true : session.applePremiumUsedThisSession
      },
      userData: {
        ...userData,
        qCoins: userData.qCoins - cost,
        appleTapsToday: isPremium ? userData.appleTapsToday : userData.appleTapsToday + 1
      }
    });
    
    return true;
  },

  tapCoffeeInSession: (isPremium: boolean = false) => {
    const { session, userData } = get();
    
    if (!session) return false;
    
    const cost = isPremium ? 15 : 3;
    const boost = isPremium ? 15 : 6;
    
    if (userData.qCoins < cost) return false;
    
    if (isPremium && session.coffeePremiumUsedThisSession) return false;
    
    const now = Date.now();
    const boostDuration = isPremium ? 5 * 60 * 1000 : 3 * 60 * 1000;
    
    set({
      session: {
        ...session,
        interactionBoosts: session.interactionBoosts + boost,
        coffeePremiumUsedThisSession: isPremium ? true : session.coffeePremiumUsedThisSession,
        coffeeBoostStartTime: now,
        coffeeBoostEndTime: now + boostDuration
      },
      userData: {
        ...userData,
        qCoins: userData.qCoins - cost,
        coffeeTapsToday: isPremium ? userData.coffeeTapsToday : userData.coffeeTapsToday + 1
      }
    });
    
    return true;
  }
});