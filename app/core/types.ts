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
  
  // Daily habit tracking
  sleepHours: number;
  ateBreakfast: boolean;
  waterGlasses: number;
  
  // Streaks
  currentStreak: number;
  lastCheckInDate: string;
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