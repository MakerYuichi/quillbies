// Core type definitions for Quillby

export interface CleaningStage {
  name: string;
  taps: number;
  targetMess: number;
  messReduction: number;
}

export interface CleaningPlan {
  stages: CleaningStage[];
  totalTaps: number;
  startMess: number;
}

export interface CheckpointResult {
  isBehind: boolean;
  checkpoint?: string;
  checkpointHour?: number;
  expected?: number;
  actual?: number;
  missing?: number;
}

export interface CheckpointNotification {
  shouldNotify: boolean;
  checkpoint?: string;
  expected?: number;
  actual?: number;
  missing?: number;
  message?: string;
}

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
  
  // Study accountability system
  studyGoalHours?: number; // Daily study goal (1-4 hours)
  studyCheckpoints?: string[]; // Selected checkpoint times ['9 AM', '12 PM', '3 PM', '6 PM', '9 PM']
  studyMinutesToday?: number; // Accumulated study minutes today
  lastStudyReset?: string; // Date when study was last reset
  missedCheckpoints?: number; // Count of missed checkpoints today
  
  // Daily habit tracking
  sleepHours: number; // Accumulated sleep hours today
  ateBreakfast: boolean;
  waterGlasses: number;
  mealsLogged: number; // 0-3 meals per day
  exerciseMinutes: number; // Accumulated exercise minutes today
  
  // Weight management
  weightGoal?: 'lose' | 'maintain' | 'gain';
  mealPortionSize?: number; // 0.7 (lose), 1.0 (maintain), 1.3 (gain)
  
  // Streaks
  currentStreak: number;
  lastCheckInDate: string;
  lastSleepReset?: string; // Date when sleep was last reset (for daily accumulation)
  lastExerciseReset?: string; // Date when exercise was last reset (for daily accumulation)
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