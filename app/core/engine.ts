// The Core Math Engine - All formulas and game logic

import { UserData, SessionRewards, SleepSession } from './types';

// ============================================
// ENERGY SYSTEM CONSTANTS
// ============================================
const BASE_MAX_ENERGY = 100;
const ENERGY_DRAIN_INACTIVE = 5; // % per minute when app is inactive
const ENERGY_DRAIN_ACTIVE_DISTRACTED = 2; // % per minute when active but distracted
const ENERGY_RECHARGE_RATE = 20; // % per second when user returns

// Energy Cap Modifiers
const SLEEP_PENALTY = 30; // % reduction for <6 hours sleep
const BREAKFAST_PENALTY = 20; // % reduction for skipped breakfast
const HYDRATION_PENALTY = 15; // % reduction for <5 glasses water
const STREAK_BONUS = 10; // % increase for 3+ day streak

// ============================================
// FOCUS SYSTEM CONSTANTS
// ============================================
const FOCUS_START_COST = 20; // Energy required to start a session
const FOCUS_GAIN_RATE = 1; // Points per 30 seconds of focused work
const FOCUS_DRAIN_RATE = 5; // % per minute when distracted

// ============================================
// REWARD CONSTANTS
// ============================================
const QCOIN_MULTIPLIER = 0.5; // Focus Score * 0.5 = Q-Coins
const XP_MULTIPLIER = 1; // Focus Score * 1 = XP
const MESS_REMOVAL_PER_SESSION = 2; // Mess points removed per completed session

// ============================================
// ENERGY CALCULATIONS
// ============================================

/**
 * Calculate total sleep hours for today from sleep sessions
 */
export function getTodaysSleepHours(sleepSessions: SleepSession[]): number {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  return sleepSessions
    .filter(session => session.date === today)
    .reduce((total, session) => total + session.duration, 0);
}

/**
 * Calculate the maximum energy cap - SIMPLIFIED VERSION: ALWAYS 100
 */
export function calculateMaxEnergyCap(userData: UserData): number {
  // SIMPLIFIED: Energy cap is ALWAYS 100, never changes
  return BASE_MAX_ENERGY; // Always 100
}

/**
 * Calculate energy drain during focus sessions when distracted
 * @param minutesDistracted - How many minutes user was distracted
 * @param userData - User data for preparation bonuses
 */
export function calculateDistractionDrain(
  minutesDistracted: number,
  userData: UserData
): number {
  // Calculate preparation level for drain rate
  let drainRate = 2; // Poor prep: -2 energy/min
  
  const todaysSleepHours = getTodaysSleepHours(userData.sleepSessions || []);
  let prepCount = 0;
  
  if (userData.ateBreakfast) prepCount++;
  if (userData.exerciseMinutes > 0) prepCount++;
  if (userData.waterGlasses >= 4) prepCount++;
  if (todaysSleepHours >= 7) prepCount++;
  
  // Better prep = slower drain
  if (prepCount === 4) drainRate = 0.5; // Perfect prep: -0.5/min
  else if (prepCount === 3) drainRate = 1;   // Good prep: -1/min
  else if (prepCount === 2) drainRate = 1.5; // Okay prep: -1.5/min
  // else drainRate = 2 (poor prep)
  
  return drainRate * minutesDistracted;
}

/**
 * Calculate energy recovery during breaks based on preparation
 * @param minutesOnBreak - How many minutes user took a break
 * @param userData - User data for preparation bonuses
 */
export function calculateBreakRecovery(
  minutesOnBreak: number,
  userData: UserData
): number {
  // Calculate preparation level for recovery rate
  let recoveryRate = 2; // Poor prep: +2 energy/min
  
  const todaysSleepHours = getTodaysSleepHours(userData.sleepSessions || []);
  let prepCount = 0;
  
  if (userData.ateBreakfast) prepCount++;
  if (userData.exerciseMinutes > 0) prepCount++;
  if (userData.waterGlasses >= 4) prepCount++;
  if (todaysSleepHours >= 7) prepCount++;
  
  // Better prep = faster recovery
  if (prepCount === 4) recoveryRate = 5;   // Perfect prep: +5/min
  else if (prepCount === 3) recoveryRate = 4;   // Good prep: +4/min
  else if (prepCount === 2) recoveryRate = 3;   // Okay prep: +3/min
  // else recoveryRate = 2 (poor prep)
  
  return recoveryRate * minutesOnBreak;
}

/**
 * Calculate morning starting energy based on sleep quality
 */
export function calculateMorningEnergy(sleepHours: number): number {
  if (sleepHours >= 7) return 100;  // Good sleep: Start at 100
  if (sleepHours >= 5) return 85;   // Okay sleep: Start at 85  
  if (sleepHours >= 4) return 50;   // Poor sleep: Start at 50
  return 30; // Very poor sleep: Start at 30
}

/**
 * Check if daily drains should be applied (only once per condition per day)
 */
export function shouldApplyDailyDrains(userData: UserData): { shouldApply: boolean; drainAmount: number; drainType: string } {
  const now = new Date();
  const today = now.toDateString();
  
  // Check if breakfast drain should be applied (only once at 11 AM)
  if (!userData.ateBreakfast && now.getHours() >= 11) {
    const lastBreakfastDrain = (userData as any).lastBreakfastDrain;
    if (lastBreakfastDrain !== today) {
      return { shouldApply: true, drainAmount: 10, drainType: 'breakfast' };
    }
  }
  
  // Check if mess drain should be applied (only once per day at 6 PM)
  if (now.getHours() >= 18) {
    const lastMessDrain = (userData as any).lastMessDrain;
    if (lastMessDrain !== today) {
      const messDrain = calculateMessEnergyDrain(userData.messPoints);
      if (messDrain > 0) {
        return { shouldApply: true, drainAmount: messDrain, drainType: 'mess' };
      }
    }
  }
  
  return { shouldApply: false, drainAmount: 0, drainType: 'none' };
}

/**
 * Calculate energy needed to start focus session based on preparation
 */
export function calculateFocusEnergyCost(userData: UserData): number {
  let energyCost = FOCUS_START_COST; // Base 20 energy
  
  // Preparation bonuses (reduce energy needed)
  const todaysSleepHours = getTodaysSleepHours(userData.sleepSessions || []);
  
  if (userData.ateBreakfast) energyCost -= 5;           // Breakfast bonus
  if (userData.exerciseMinutes > 0) energyCost -= 5;   // Exercise bonus  
  if (userData.waterGlasses >= 4) energyCost -= 5;     // Hydration bonus
  if (todaysSleepHours >= 7) energyCost -= 5;          // Sleep bonus
  
  return Math.max(0, energyCost); // Can go to 0 with perfect prep
}

/**
 * Check if user has enough energy to start a focus session
 */
export function canStartSession(currentEnergy: number, userData: UserData): boolean {
  const energyNeeded = calculateFocusEnergyCost(userData);
  return currentEnergy >= energyNeeded;
}

/**
 * Deduct energy cost to start a session
 */
export function startSessionEnergyCost(currentEnergy: number, userData: UserData): number {
  const energyNeeded = calculateFocusEnergyCost(userData);
  return Math.max(0, currentEnergy - energyNeeded);
}

// ============================================
// FOCUS METER CALCULATIONS
// ============================================

/**
 * Calculate focus score during an active session
 * @param secondsFocused - Total seconds of focused work
 * @param coffeeBoostStartTime - When coffee boost started (null if no boost)
 * @param coffeeBoostEndTime - When coffee boost ends (null if no boost)
 * @param interactionBoosts - Total points from taps (water/meal/apple/coffee)
 */
export function calculateFocusScore(
  secondsFocused: number,
  coffeeBoostStartTime: number | null,
  coffeeBoostEndTime: number | null,
  interactionBoosts: number
): number {
  // Base focus: +1 point per 30 seconds
  const baseFocusScore = Math.floor(secondsFocused / 30);
  
  // Coffee bonus: +1 EXTRA per 30 seconds during boost period (not doubling!)
  let coffeeBonus = 0;
  if (coffeeBoostStartTime !== null && coffeeBoostEndTime !== null) {
    const now = Date.now();
    const boostStartSeconds = (coffeeBoostStartTime - (now - secondsFocused * 1000)) / 1000;
    const boostEndSeconds = Math.min(boostStartSeconds + 180, secondsFocused); // Max 3 min boost
    
    if (boostEndSeconds > boostStartSeconds && boostStartSeconds >= 0) {
      const secondsWithBoost = boostEndSeconds - boostStartSeconds;
      coffeeBonus = Math.floor(secondsWithBoost / 30); // Extra +1 per 30sec
    }
  }
  
  return baseFocusScore + coffeeBonus + interactionBoosts;
}

/**
 * Update focus score during an active session (DEPRECATED - use calculateFocusScore)
 */
export function updateFocusScore(
  currentScore: number,
  secondsFocused: number,
  hasCoffeeBoost: boolean = false
): number {
  // This is deprecated but kept for compatibility
  const pointsPerInterval = hasCoffeeBoost ? 2 : 1;
  const pointsGained = Math.floor(secondsFocused / 30) * pointsPerInterval;
  return currentScore + pointsGained;
}

/**
 * Drain focus score when user is distracted (4th offense)
 * @param currentScore - Current focus meter score
 * @param minutesDistracted - Minutes user has been away
 */
export function drainFocusScore(
  currentScore: number,
  minutesDistracted: number
): number {
  // Formula: Focus Score × 0.05 × minutes_away
  const drain = currentScore * 0.05 * minutesDistracted;
  return Math.max(0, currentScore - drain);
}

// ============================================
// REWARD CALCULATIONS
// ============================================

/**
 * Calculate rewards earned from completing a session
 * @param focusScore - Final focus score
 * @param distractionCount - Number of distraction penalties (4th+ offenses)
 */
export function calculateSessionRewards(
  focusScore: number, 
  distractionCount: number
): SessionRewards {
  // Q-Coins: Focus Score × 0.5
  const qCoinsEarned = Math.round(focusScore * 0.5);
  
  // Study Hours: (Focus Score / 120) × 1 hour
  // 120 points ≈ 1 hour of intense study
  const studyHours = focusScore / 120;
  
  // Energy: Based on distraction count
  let energyMultiplier = 0.3; // Perfect (0 distractions)
  if (distractionCount >= 3) {
    energyMultiplier = 0.1; // Many distractions (3+)
  } else if (distractionCount >= 1) {
    energyMultiplier = 0.2; // Some distractions (1-2)
  }
  const energyGained = Math.round(focusScore * energyMultiplier);
  
  return {
    qCoinsEarned,
    xpEarned: Math.round(focusScore), // XP = focus score
    messPointsRemoved: MESS_REMOVAL_PER_SESSION, // Always -2
    energyGained, // NEW: Energy calculated at end
    studyHours // NEW: Study time in hours
  };
}

// ============================================
// ROOM STATE CALCULATIONS
// ============================================

/**
 * Get room visual state based on mess points
 */
export function getRoomState(messPoints: number): 'clean' | 'messy' | 'dirty' | 'disaster' {
  if (messPoints <= 3) return 'clean';
  if (messPoints <= 7) return 'messy';
  if (messPoints <= 10) return 'dirty';
  return 'disaster';
}

/**
 * Calculate daily energy drain from mess (visual consequence of messy room)
 */
export function calculateMessEnergyDrain(messPoints: number): number {
  if (messPoints >= 21) return 20; // Heavy mess: -20 energy/day
  if (messPoints >= 16) return 15; // Medium-high mess: -15 energy/day
  if (messPoints >= 11) return 10; // Medium mess: -10 energy/day
  if (messPoints >= 6) return 5;   // Light mess: -5 energy/day
  return 0; // Clean room: no drain
}

/**
 * Add mess points for skipped task
 */
export function addMessForSkippedTask(currentMess: number): number {
  return currentMess + 1;
}

/**
 * Remove mess points after session completion
 */
export function removeMessAfterSession(currentMess: number, pointsToRemove: number): number {
  return Math.max(0, currentMess - pointsToRemove);
}

// ============================================
// DAILY HABIT LOGGING
// ============================================

/**
 * Calculate Q-Coins earned from logging water
 */
export function calculateWaterReward(glassesLogged: number): number {
  // 5 coins per glass, capped at 8 glasses (40 coins/day)
  const glasses = Math.min(8, glassesLogged);
  return glasses * 5;
}

/**
 * Check if user gets weekly sleep bonus
 */
export function checkWeeklySleepBonus(sleepHoursArray: number[]): boolean {
  // Must have 7+ hours for 7 consecutive nights
  return sleepHoursArray.length === 7 && sleepHoursArray.every(hours => hours >= 7);
}

// ============================================
// TIME UTILITIES
// ============================================

/**
 * Calculate minutes elapsed since last timestamp
 */
export function getMinutesElapsed(lastTimestamp: number): number {
  const now = Date.now();
  return Math.floor((now - lastTimestamp) / 1000 / 60);
}

/**
 * Calculate seconds elapsed since last timestamp
 */
export function getSecondsElapsed(lastTimestamp: number): number {
  const now = Date.now();
  return Math.floor((now - lastTimestamp) / 1000);
}
