import { Achievement } from './types';

// Complete Achievement System: 15 Visible Challenges + 18 Hidden Secrets = 33 Total

// ============================================
// 📅 VISIBLE CHALLENGES (15 Total)
// ============================================

// DAILY CHALLENGES (5 achievements - Reset every day at midnight)
const DAILY_CHALLENGES: { [key: string]: Achievement } = {
  'daily-session': {
    id: 'daily-session',
    name: 'Daily Grind',
    description: 'Complete 1 focus session today',
    xpReward: 2, // Gems
    coinReward: 25, // Qbies
    unlocked: false,
    target: 1,
    icon: '☀️',
    category: 'study',
    rarity: 'common',
  },
  'daily-water': {
    id: 'daily-water',
    name: 'Hydration Station',
    description: 'Drink 8 glasses of water today',
    xpReward: 1, // Gems
    coinReward: 15, // Qbies
    unlocked: false,
    target: 8,
    icon: '💧',
    category: 'habits',
    rarity: 'common',
  },
  'daily-meals': {
    id: 'daily-meals',
    name: 'Healthy Day',
    description: 'Log all 3 meals today',
    xpReward: 2, // Gems
    coinReward: 20, // Qbies
    unlocked: false,
    target: 3,
    icon: '🍎',
    category: 'habits',
    rarity: 'common',
  },
  'daily-hours': {
    id: 'daily-hours',
    name: 'Focus Sprint',
    description: 'Study for 2 hours today',
    xpReward: 3, // Gems
    coinReward: 40, // Qbies
    unlocked: false,
    target: 2,
    icon: '🎯',
    category: 'study',
    rarity: 'rare',
  },
  'daily-early': {
    id: 'daily-early',
    name: 'Early Riser',
    description: 'Start a session before 9 AM',
    xpReward: 2, // Gems
    coinReward: 25, // Qbies
    unlocked: false,
    target: 1,
    icon: '🌅',
    category: 'special',
    rarity: 'common',
  },
};

// WEEKLY CHALLENGES (5 achievements - Reset every Monday)
const WEEKLY_CHALLENGES: { [key: string]: Achievement } = {
  'weekly-streak': {
    id: 'weekly-streak',
    name: 'Week Warrior',
    description: 'Study for 7 consecutive days',
    xpReward: 15, // Gems
    coinReward: 200, // Qbies
    unlocked: false,
    target: 7,
    icon: '🔥',
    category: 'study',
    rarity: 'epic',
  },
  'weekly-sessions': {
    id: 'weekly-sessions',
    name: 'Weekly Grind',
    description: 'Complete 15 focus sessions',
    xpReward: 12, // Gems
    coinReward: 150, // Qbies
    unlocked: false,
    target: 15,
    icon: '💪',
    category: 'study',
    rarity: 'rare',
  },
  'weekly-hours': {
    id: 'weekly-hours',
    name: 'Study Master',
    description: 'Study for 20 hours this week',
    xpReward: 15, // Gems
    coinReward: 175, // Qbies
    unlocked: false,
    target: 20,
    icon: '🎓',
    category: 'study',
    rarity: 'epic',
  },
  'weekly-clean': {
    id: 'weekly-clean',
    name: 'Tidy Week',
    description: 'Clean your room 5 times',
    xpReward: 8, // Gems
    coinReward: 100, // Qbies
    unlocked: false,
    target: 5,
    icon: '🧼',
    category: 'habits',
    rarity: 'rare',
  },
  'weekly-hydration': {
    id: 'weekly-hydration',
    name: 'Hydration Hero',
    description: 'Drink 8 glasses daily for 7 days',
    xpReward: 10, // Gems
    coinReward: 125, // Qbies
    unlocked: false,
    target: 7,
    icon: '💧',
    category: 'habits',
    rarity: 'rare',
  },
};

// MONTHLY CHALLENGES (5 achievements - Reset on 1st of month)
const MONTHLY_CHALLENGES: { [key: string]: Achievement } = {
  'monthly-hours': {
    id: 'monthly-hours',
    name: 'Monthly Champion',
    description: 'Study for 80 hours this month',
    xpReward: 40, // Gems
    coinReward: 500, // Qbies
    unlocked: false,
    target: 80,
    icon: '👑',
    category: 'study',
    rarity: 'legendary',
  },
  'monthly-streak': {
    id: 'monthly-streak',
    name: 'Consistency King',
    description: 'Maintain 30-day study streak',
    xpReward: 30, // Gems
    coinReward: 375, // Qbies
    unlocked: false,
    target: 30,
    icon: '🔥',
    category: 'study',
    rarity: 'epic',
  },
  'monthly-deadlines': {
    id: 'monthly-deadlines',
    name: 'Deadline Dominator',
    description: 'Complete 8 deadlines this month',
    xpReward: 25, // Gems
    coinReward: 300, // Qbies
    unlocked: false,
    target: 8,
    icon: '🎯',
    category: 'study',
    rarity: 'epic',
  },
  'monthly-perfect': {
    id: 'monthly-perfect',
    name: 'Perfect Month',
    description: 'Complete 15 perfect sessions',
    xpReward: 30, // Gems
    coinReward: 400, // Qbies
    unlocked: false,
    target: 15,
    icon: '🌟',
    category: 'study',
    rarity: 'epic',
  },
  'monthly-sessions': {
    id: 'monthly-sessions',
    name: 'Marathon Month',
    description: 'Complete 40 sessions this month',
    xpReward: 25, // Gems
    coinReward: 350, // Qbies
    unlocked: false,
    target: 40,
    icon: '🏃',
    category: 'study',
    rarity: 'epic',
  },
};

// ============================================
// 🔒 HIDDEN SECRETS (18 Lifetime Achievements)
// ============================================

// BEGINNER SECRETS (First-time milestones)
const BEGINNER_SECRETS: { [key: string]: Achievement } = {
  'secret-first-session': {
    id: 'secret-first-session',
    name: 'First Steps',
    description: 'Complete your first focus session',
    xpReward: 1, // Gems
    coinReward: 50, // Qbies
    unlocked: false,
    target: 1,
    icon: '🎯',
    category: 'study',
    rarity: 'common',
  },
  'secret-first-deadline': {
    id: 'secret-first-deadline',
    name: 'Mission Starter',
    description: 'Create your first deadline',
    xpReward: 1, // Gems
    coinReward: 25, // Qbies
    unlocked: false,
    target: 1,
    icon: '📋',
    category: 'study',
    rarity: 'common',
  },
  'secret-first-perfect': {
    id: 'secret-first-perfect',
    name: 'Flawless Debut',
    description: 'Complete first perfect session',
    xpReward: 1, // Gems
    coinReward: 75, // Qbies
    unlocked: false,
    target: 1,
    icon: '✨',
    category: 'study',
    rarity: 'rare',
  },
  'secret-first-clean': {
    id: 'secret-first-clean',
    name: 'Squeaky Clean',
    description: 'Clean your room for the first time',
    xpReward: 1, // Gems
    coinReward: 25, // Qbies
    unlocked: false,
    target: 1,
    icon: '🧹',
    category: 'habits',
    rarity: 'common',
  },
};

// CONSUMPTION SECRETS (Item usage)
const CONSUMPTION_SECRETS: { [key: string]: Achievement } = {
  'secret-coffee-lover': {
    id: 'secret-coffee-lover',
    name: 'Espresso Addict',
    description: 'Use 25 coffees',
    xpReward: 20, // Gems
    coinReward: 100, // Qbies
    unlocked: false,
    target: 25,
    icon: '☕',
    category: 'premium',
    rarity: 'rare',
  },
  'secret-apple-fan': {
    id: 'secret-apple-fan',
    name: 'Health Nut',
    description: 'Use 25 apples',
    xpReward: 20, // Gems
    coinReward: 100, // Qbies
    unlocked: false,
    target: 25,
    icon: '🍎',
    category: 'premium',
    rarity: 'rare',
  },
  'secret-shopaholic': {
    id: 'secret-shopaholic',
    name: 'The Collector',
    description: 'Purchase 30 shop items',
    xpReward: 50, // Gems
    coinReward: 250, // Qbies
    unlocked: false,
    target: 30,
    icon: '🛍️',
    category: 'premium',
    rarity: 'epic',
  },
};

// TIME-BASED SECRETS (When you study)
const TIME_SECRETS: { [key: string]: Achievement } = {
  'secret-night-owl': {
    id: 'secret-night-owl',
    name: 'Night Owl',
    description: 'Complete 5 sessions after 10 PM',
    xpReward: 25, // Gems
    coinReward: 125, // Qbies
    unlocked: false,
    target: 5,
    icon: '🦉',
    category: 'special',
    rarity: 'rare',
  },
  'secret-early-bird': {
    id: 'secret-early-bird',
    name: 'Dawn Scholar',
    description: 'Complete 5 sessions before 7 AM',
    xpReward: 25, // Gems
    coinReward: 125, // Qbies
    unlocked: false,
    target: 5,
    icon: '🐦',
    category: 'special',
    rarity: 'rare',
  },
  'secret-midnight': {
    id: 'secret-midnight',
    name: 'Midnight Scholar',
    description: 'Study at exactly midnight',
    xpReward: 30, // Gems
    coinReward: 150, // Qbies
    unlocked: false,
    target: 1,
    icon: '🌙',
    category: 'special',
    rarity: 'epic',
  },
  'secret-all-nighter': {
    id: 'secret-all-nighter',
    name: 'Sleep is Overrated',
    description: 'Study for 6+ hours with <4 hours sleep',
    xpReward: 40, // Gems
    coinReward: 200, // Qbies
    unlocked: false,
    target: 1,
    icon: '😴',
    category: 'special',
    rarity: 'epic',
  },
};

// PROGRESS MILESTONES (Major achievements)
const PROGRESS_MILESTONES: { [key: string]: Achievement } = {
  'secret-perfectionist': {
    id: 'secret-perfectionist',
    name: 'Perfectionist',
    description: 'Complete 10 perfect sessions',
    xpReward: 35, // Gems
    coinReward: 175, // Qbies
    unlocked: false,
    target: 10,
    icon: '💎',
    category: 'study',
    rarity: 'epic',
  },
  'secret-speed-demon': {
    id: 'secret-speed-demon',
    name: 'Speed Demon',
    description: 'Achieve 250 focus score in one session',
    xpReward: 40, // Gems
    coinReward: 200, // Qbies
    unlocked: false,
    target: 250,
    icon: '⚡',
    category: 'study',
    rarity: 'epic',
  },
  'secret-clean-freak': {
    id: 'secret-clean-freak',
    name: 'Clean Freak',
    description: 'Clean your room 30 times',
    xpReward: 30, // Gems
    coinReward: 150, // Qbies
    unlocked: false,
    target: 30,
    icon: '🧼',
    category: 'habits',
    rarity: 'rare',
  },
  'secret-deadline-master': {
    id: 'secret-deadline-master',
    name: 'Deadline Crusher',
    description: 'Complete 15 deadlines on time',
    xpReward: 50, // Gems
    coinReward: 250, // Qbies
    unlocked: false,
    target: 15,
    icon: '🏆',
    category: 'study',
    rarity: 'epic',
  },
};

// EPIC MILESTONES (Long-term dedication)
const EPIC_MILESTONES: { [key: string]: Achievement } = {
  'secret-century': {
    id: 'secret-century',
    name: 'Century Club',
    description: 'Complete 100 total sessions',
    xpReward: 75, // Gems
    coinReward: 375, // Qbies
    unlocked: false,
    target: 100,
    icon: '🌟',
    category: 'study',
    rarity: 'epic',
  },
  'secret-marathon': {
    id: 'secret-marathon',
    name: 'Marathon Runner',
    description: 'Study for 100 total hours',
    xpReward: 100, // Gems
    coinReward: 500, // Qbies
    unlocked: false,
    target: 100,
    icon: '🏃',
    category: 'study',
    rarity: 'legendary',
  },
  'secret-zen-master': {
    id: 'secret-zen-master',
    name: 'Zen Master',
    description: 'Complete 25 perfect sessions',
    xpReward: 80, // Gems
    coinReward: 400, // Qbies
    unlocked: false,
    target: 25,
    icon: '🧘',
    category: 'study',
    rarity: 'epic',
  },
};

// LEGENDARY SECRETS (Ultimate achievements)
const LEGENDARY_SECRETS: { [key: string]: Achievement } = {
  'secret-scholar': {
    id: 'secret-scholar',
    name: 'The Scholar',
    description: 'Study for 500 total hours',
    xpReward: 150, // Gems
    coinReward: 750, // Qbies
    unlocked: false,
    target: 500,
    icon: '📚',
    category: 'study',
    rarity: 'legendary',
  },
  'secret-legend': {
    id: 'secret-legend',
    name: 'Living Legend',
    description: 'Study for 1000 total hours',
    xpReward: 250, // Gems
    coinReward: 1250, // Qbies
    unlocked: false,
    target: 1000,
    icon: '🎓',
    category: 'study',
    rarity: 'legendary',
  },
  'secret-completionist': {
    id: 'secret-completionist',
    name: 'Ultimate Master',
    description: 'Unlock all other achievements',
    xpReward: 500, // Gems
    coinReward: 2500, // Qbies
    unlocked: false,
    target: 32, // All other achievements
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
  },
};

// ============================================
// COMBINED ACHIEVEMENTS OBJECT
// ============================================

export const ACHIEVEMENTS: { [key: string]: Achievement } = {
  // Daily Challenges (5)
  ...DAILY_CHALLENGES,
  // Weekly Challenges (5)
  ...WEEKLY_CHALLENGES,
  // Monthly Challenges (5)
  ...MONTHLY_CHALLENGES,
  // Hidden Secrets (18)
  ...BEGINNER_SECRETS,
  ...CONSUMPTION_SECRETS,
  ...TIME_SECRETS,
  ...PROGRESS_MILESTONES,
  ...EPIC_MILESTONES,
  ...LEGENDARY_SECRETS,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get all achievements as array
export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS);
}

// Get visible challenges (daily + weekly + monthly)
export function getVisibleChallenges(): Achievement[] {
  return [
    ...Object.values(DAILY_CHALLENGES),
    ...Object.values(WEEKLY_CHALLENGES),
    ...Object.values(MONTHLY_CHALLENGES),
  ];
}

// Get hidden secrets
export function getHiddenSecrets(): Achievement[] {
  return [
    ...Object.values(BEGINNER_SECRETS),
    ...Object.values(CONSUMPTION_SECRETS),
    ...Object.values(TIME_SECRETS),
    ...Object.values(PROGRESS_MILESTONES),
    ...Object.values(EPIC_MILESTONES),
    ...Object.values(LEGENDARY_SECRETS),
  ];
}

// Get daily challenges
export function getDailyChallenges(): Achievement[] {
  return Object.values(DAILY_CHALLENGES);
}

// Get weekly challenges
export function getWeeklyChallenges(): Achievement[] {
  return Object.values(WEEKLY_CHALLENGES);
}

// Get monthly challenges
export function getMonthlyChallenges(): Achievement[] {
  return Object.values(MONTHLY_CHALLENGES);
}

// Get achievements by category
export function getAchievementsByCategory(category: string): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.category === category);
}

// Get achievements by rarity
export function getAchievementsByRarity(rarity: string): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => a.rarity === rarity);
}

// Get unlocked achievements
export function getUnlockedAchievements(achievements: { [key: string]: any }): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => achievements[a.id]?.unlocked);
}

// Get locked achievements
export function getLockedAchievements(achievements: { [key: string]: any }): Achievement[] {
  return Object.values(ACHIEVEMENTS).filter(a => !achievements[a.id]?.unlocked);
}

// Calculate total Gems from achievements
export function calculateTotalGems(achievements: { [key: string]: any }): number {
  let totalGems = 0;
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (achievements[achievement.id]?.unlocked) {
      totalGems += achievement.xpReward; // xpReward now represents Gems
    }
  });
  return totalGems;
}

// Calculate total Qbies from achievements
export function calculateTotalQbies(achievements: { [key: string]: any }): number {
  let totalQbies = 0;
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (achievements[achievement.id]?.unlocked) {
      totalQbies += achievement.coinReward; // coinReward now represents Qbies
    }
  });
  return totalQbies;
}

// Check if achievement is a daily challenge
export function isDailyChallenge(achievementId: string): boolean {
  return achievementId.startsWith('daily-');
}

// Check if achievement is a weekly challenge
export function isWeeklyChallenge(achievementId: string): boolean {
  return achievementId.startsWith('weekly-');
}

// Check if achievement is a monthly challenge
export function isMonthlyChallenge(achievementId: string): boolean {
  return achievementId.startsWith('monthly-');
}

// Check if achievement is a hidden secret
export function isHiddenSecret(achievementId: string): boolean {
  return achievementId.startsWith('secret-');
}
