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
  onboardingCompleted?: boolean; // Track if user has completed onboarding
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
  
  // Exercise goal
  exerciseGoalMinutes?: number; // Daily exercise goal (15, 30, 45, 60 minutes)
  
  // Hydration goal
  hydrationGoalGlasses?: number; // Daily water intake goal (6, 8, 10 glasses)
  
  // Sleep goal
  sleepGoalHours?: number; // Nightly sleep goal (6, 7, 8, 9 hours)
  
  // Daily habit tracking
  sleepSessions: SleepSession[]; // Array of sleep sessions
  activeSleepSession?: Partial<SleepSession>; // Currently active sleep session
  ateBreakfast: boolean;
  waterGlasses: number;
  mealsLogged: number; // 0-3 meals per day
  exerciseMinutes: number; // Accumulated exercise minutes today
  
  // Daily consumable limits (shared across all sessions in a day)
  appleTapsToday: number; // Free apple uses today (max 5/day)
  coffeeTapsToday: number; // Free coffee uses today (max 3/day)
  lastConsumableReset?: string; // Date when consumables were last reset
  
  // Weight management
  weightGoal?: 'lose' | 'maintain' | 'gain';
  mealPortionSize?: number; // 0.7 (lose), 1.0 (maintain), 1.3 (gain)
  
  // Streaks
  currentStreak: number;
  lastCheckInDate: string;
  lastSleepReset?: string; // Date when sleep was last reset (for daily accumulation)
  lastExerciseReset?: string; // Date when exercise was last reset (for daily accumulation)
  signupDate?: string; // Date when user signed up
  
  // Meal tracking
  mealGoalCount?: number; // Daily meal goal count
  
  // End-of-day evaluation
  lastDayEvaluation?: {
    date: string;
    wasTerribleDay: boolean;
    wasBadDay: boolean;
    streakBroken: boolean;
    qCoinsPenalty: number;
    studyHours: string;
    studyGoal: string;
    waterCount: number;
    waterGoal: number;
    mealCount: number;
    mealGoal: number;
  };
  
  // Room Customization
  roomCustomization?: {
    lightType: 'lamp' | 'colored-fairy-lights'; // Default: 'lamp'
    plantType: 'plant' | 'succulent-plant' | 'swiss-cheese-plant'; // Default: 'plant'
  };
  
  // Shop Purchases
  purchasedItems?: string[]; // Array of purchased item IDs
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
  // Break tracking
  totalBreakTime: number; // Total break time taken in seconds
  maxBreakTime: number; // Maximum allowed break time (20% of session duration)
  // Session consumables tracking (per session)
  applePremiumUsedThisSession: boolean; // Premium apple used THIS SESSION (resets each session)
  coffeePremiumUsedThisSession: boolean; // Premium coffee used THIS SESSION (resets each session)
  coffeeBoostEndTime: number | null; // When coffee boost expires
  coffeeBoostStartTime: number | null; // When coffee boost started
  interactionBoosts: number; // Total points from apple/coffee taps
}

export interface EnergyModifiers {
  sleepPenalty: number;
  breakfastPenalty: number;
  hydrationPenalty: number;
  streakBonus: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'light' | 'plant' | 'decoration';
  assetPath: string;
  icon: string;
}

export interface SleepSession {
  id: string;
  start: string; // ISO timestamp when sleep started
  end: string; // ISO timestamp when sleep ended
  duration: number; // Duration in hours (calculated)
  durationMinutes?: number; // Duration in minutes (for better display)
  date: string; // Date string (YYYY-MM-DD) for the day this sleep counts toward
}

export interface SessionRewards {
  qCoinsEarned: number;
  xpEarned: number;
  messPointsRemoved: number;
  energyGained: number; // NEW: Energy calculated at session end
  studyHours: number; // NEW: Study time in hours
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string; // ISO date string
  dueTime?: string; // HH:MM format
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  category?: 'study' | 'work' | 'project' | 'other';
  workCompleted: number; // Hours completed
  isCompleted: boolean;
  createdAt: string; // ISO date string
  reminders: {
    oneDayBefore: boolean;
    threeDaysBefore: boolean;
  };
}

export interface DeadlineFormData {
  title: string;
  dueDate: string;
  dueTime: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: string;
  category: 'study' | 'work' | 'project' | 'other';
}