import { supabase } from './supabase';

export interface AchievementHistoryRecord {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_name: string;
  achievement_type: 'daily' | 'weekly' | 'monthly' | 'secret';
  unlocked_at: string;
  period_date: string;
  gems_earned: number;
  qbies_earned: number;
  created_at: string;
}

/**
 * Save an achievement unlock to history
 */
export async function saveAchievementToHistory(
  userId: string,
  achievementId: string,
  achievementName: string,
  achievementType: 'daily' | 'weekly' | 'monthly' | 'secret',
  gemsEarned: number,
  qbiesEarned: number
): Promise<boolean> {
  try {
    const now = new Date();
    const periodDate = getPeriodDate(achievementType, now);
    
    console.log(`[AchievementHistory] Saving ${achievementId} to history for period ${periodDate}`);
    
    const { error } = await supabase
      .from('achievement_history')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        achievement_name: achievementName,
        achievement_type: achievementType,
        unlocked_at: now.toISOString(),
        period_date: periodDate,
        gems_earned: gemsEarned,
        qbies_earned: qbiesEarned
      });
    
    if (error) {
      console.error('[AchievementHistory] Error saving to history:', error);
      return false;
    }
    
    console.log('[AchievementHistory] ✅ Saved to history successfully');
    return true;
  } catch (err) {
    console.error('[AchievementHistory] Exception saving to history:', err);
    return false;
  }
}

/**
 * Get achievement history for a user
 */
export async function getAchievementHistory(
  userId: string,
  options?: {
    achievementType?: 'daily' | 'weekly' | 'monthly' | 'secret';
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<AchievementHistoryRecord[]> {
  try {
    let query = supabase
      .from('achievement_history')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });
    
    if (options?.achievementType) {
      query = query.eq('achievement_type', options.achievementType);
    }
    
    if (options?.startDate) {
      query = query.gte('period_date', options.startDate.toISOString().split('T')[0]);
    }
    
    if (options?.endDate) {
      query = query.lte('period_date', options.endDate.toISOString().split('T')[0]);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[AchievementHistory] Error fetching history:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('[AchievementHistory] Exception fetching history:', err);
    return [];
  }
}

/**
 * Get achievement statistics
 */
export async function getAchievementStats(userId: string): Promise<{
  totalUnlocked: number;
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  secretCount: number;
  totalGemsEarned: number;
  totalQbiesEarned: number;
}> {
  try {
    const { data, error } = await supabase
      .from('achievement_history')
      .select('achievement_type, gems_earned, qbies_earned')
      .eq('user_id', userId);
    
    if (error || !data) {
      console.error('[AchievementHistory] Error fetching stats:', error);
      return {
        totalUnlocked: 0,
        dailyCount: 0,
        weeklyCount: 0,
        monthlyCount: 0,
        secretCount: 0,
        totalGemsEarned: 0,
        totalQbiesEarned: 0
      };
    }
    
    const stats = {
      totalUnlocked: data.length,
      dailyCount: data.filter(a => a.achievement_type === 'daily').length,
      weeklyCount: data.filter(a => a.achievement_type === 'weekly').length,
      monthlyCount: data.filter(a => a.achievement_type === 'monthly').length,
      secretCount: data.filter(a => a.achievement_type === 'secret').length,
      totalGemsEarned: data.reduce((sum, a) => sum + (a.gems_earned || 0), 0),
      totalQbiesEarned: data.reduce((sum, a) => sum + (a.qbies_earned || 0), 0)
    };
    
    return stats;
  } catch (err) {
    console.error('[AchievementHistory] Exception fetching stats:', err);
    return {
      totalUnlocked: 0,
      dailyCount: 0,
      weeklyCount: 0,
      monthlyCount: 0,
      secretCount: 0,
      totalGemsEarned: 0,
      totalQbiesEarned: 0
    };
  }
}

/**
 * Get achievements for a specific period
 */
export async function getAchievementsForPeriod(
  userId: string,
  periodDate: string,
  achievementType: 'daily' | 'weekly' | 'monthly'
): Promise<AchievementHistoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from('achievement_history')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_type', achievementType)
      .eq('period_date', periodDate)
      .order('unlocked_at', { ascending: false });
    
    if (error) {
      console.error('[AchievementHistory] Error fetching period achievements:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('[AchievementHistory] Exception fetching period achievements:', err);
    return [];
  }
}

/**
 * Helper: Get the period date for an achievement type
 */
function getPeriodDate(achievementType: 'daily' | 'weekly' | 'monthly' | 'secret', date: Date): string {
  if (achievementType === 'daily' || achievementType === 'secret') {
    // For daily and secret, use the exact date
    return date.toISOString().split('T')[0];
  } else if (achievementType === 'weekly') {
    // For weekly, use the Monday of that week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  } else {
    // For monthly, use the first day of the month
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  }
}
