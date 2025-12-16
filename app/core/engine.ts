// The Core Math Engine - All formulas and game logic

import { UserData, SessionRewards } from './types';

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
 * Calculate the maximum energy cap based on daily habits
 */
export function calculateMaxEnergyCap(userData: UserData): number {
  let cap = BASE_MAX_ENERGY;
  
  // Sleep penalty: <6 hours reduces cap by 30%
  if (userData.sleepHours < 6) {
    cap -= (BASE_MAX_ENERGY * SLEEP_PENALTY) / 100;
  }
  
  // Breakfast penalty: skipping reduces cap by 20%
  if (!userData.ateBreakfast) {
    cap -= (BASE_MAX_ENERGY * BREAKFAST_PENALTY) / 100;
  }
  
  // Hydration penalty: <5 glasses reduces cap by 15%
  if (userData.waterGlasses < 5) {
    cap -= (BASE_MAX_ENERGY * HYDRATION_PENALTY) / 100;
  }
  
  // Streak bonus: 3+ days adds 10%
  if (userData.currentStreak >= 3) {
    cap += (BASE_MAX_ENERGY * STREAK_BONUS) / 100;
  }
  
  return Math.max(20, Math.round(cap)); // Minimum 20 energy
}

/**
 * Calculate energy drain when user is inactive
 * @param minutesInactive - How many minutes since last activity
 */
export function calculateEnergyDrain(
  currentEnergy: number,
  minutesInactive: number,
  isAppActive: boolean = false
): number {
  const drainRate = isAppActive ? ENERGY_DRAIN_ACTIVE_DISTRACTED : ENERGY_DRAIN_INACTIVE;
  const totalDrain = drainRate * minutesInactive;
  
  return Math.max(0, currentEnergy - totalDrain);
}

/**
 * Recharge energy when user returns
 * @param secondsActive - How many seconds user has been active
 */
export function rechargeEnergy(
  currentEnergy: number,
  maxCap: number,
  secondsActive: number
): number {
  const recharge = ENERGY_RECHARGE_RATE * secondsActive;
  return Math.min(maxCap, currentEnergy + recharge);
}

/**
 * Check if user has enough energy to start a focus session
 */
export function canStartSession(currentEnergy: number): boolean {
  return currentEnergy >= FOCUS_START_COST;
}

/**
 * Deduct energy cost to start a session
 */
export function startSessionEnergyCost(currentEnergy: number): number {
  return Math.max(0, currentEnergy - FOCUS_START_COST);
}

// ============================================
// FOCUS METER CALCULATIONS
// ============================================

/**
 * Update focus score during an active session
 * @param currentScore - Current focus meter score
 * @param secondsFocused - Seconds of focused work (app active, no distractions)
 */
export function updateFocusScore(
  currentScore: number,
  secondsFocused: number
): number {
  // Gain 1 point per 30 seconds
  const pointsGained = Math.floor(secondsFocused / 30) * FOCUS_GAIN_RATE;
  return currentScore + pointsGained;
}

/**
 * Drain focus score when user is distracted
 * @param currentScore - Current focus meter score
 * @param minutesDistracted - Minutes user has been away
 */
export function drainFocusScore(
  currentScore: number,
  minutesDistracted: number
): number {
  const drain = currentScore * (FOCUS_DRAIN_RATE / 100) * minutesDistracted;
  return Math.max(0, currentScore - drain);
}

// ============================================
// REWARD CALCULATIONS
// ============================================

/**
 * Calculate rewards earned from completing a session
 */
export function calculateSessionRewards(focusScore: number): SessionRewards {
  return {
    qCoinsEarned: Math.round(focusScore * QCOIN_MULTIPLIER),
    xpEarned: Math.round(focusScore * XP_MULTIPLIER),
    messPointsRemoved: MESS_REMOVAL_PER_SESSION
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
 * Check if mess affects energy recharge rate
 */
export function getMessEnergyPenalty(messPoints: number): number {
  // If mess > 10, energy recharge rate is halved (50% penalty)
  return messPoints > 10 ? 0.5 : 1;
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
