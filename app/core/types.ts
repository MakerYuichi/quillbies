// Core type definitions for Quillby

export interface UserData {
  energy: number;
  maxEnergyCap: number;
  qCoins: number;
  messPoints: number;
  lastActiveTimestamp: number;
  
  // Onboarding
  selectedCharacter?: string; // 'casual' | 'energetic' | 'scholar'
  buddyName?: string;
  
  // Profile
  userName?: string;
  studentLevel?: string; // 'highschool' | 'university' | 'graduate' | 'learner'
  country?: string;
  timezone?: string;
  
  // Habits
  enabledHabits?: string[]; // ['study', 'meals', 'hydration', 'sleep', 'exercise']
  
  // Daily habit tracking
  sleepHours: number; // Accumulated sleep hours today
  ateBreakfast: boolean;
  waterGlasses: number;
  
  // Streaks
  currentStreak: number;
  lastCheckInDate: string;
  lastSleepReset?: string; // Date when sleep was last reset (for daily accumulation)
}

export interface SessionData {
  focusScore: number;
  startTime: number;
  duration: number; // in seconds
  isActive: boolean;
  distractionCount: number;
  // Smart distraction system
  lastDistractionTime: number | null;
  distractionWarnings: number;
  isInGracePeriod: boolean;
}

export interface EnergyModifiers {
  sleepPenalty: number;
  breakfastPenalty: number;
  hydrationPenalty: number;
  streakBonus: number;
}

export interface SessionRewards {
  qCoinsEarned: number;
  xpEarned: number;
  messPointsRemoved: number;
}