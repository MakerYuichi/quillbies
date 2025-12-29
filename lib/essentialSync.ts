// lib/essentialSync.ts
// Essential sync functions that focus on core tables and handle failures gracefully

import { supabase } from './supabase';
import { getDeviceUser } from './deviceAuth';
import { updateUserProfile } from './userProfile';
import { updateDailyData } from './dailyData';

// Essential sync - only sync to tables that are guaranteed to work
export const essentialSync = async (userData: any) => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[EssentialSync] No authenticated user, skipping sync');
      return false;
    }

    console.log('[EssentialSync] Starting essential sync...');
    let successCount = 0;
    let totalAttempts = 0;

    // 1. Sync to user_profiles table (most important)
    try {
      totalAttempts++;
      await updateUserProfile(user.id, {
        buddy_name: userData.buddyName,
        selected_character: userData.selectedCharacter,
        user_name: userData.userName,
        student_level: userData.studentLevel,
        country: userData.country,
        timezone: userData.timezone,
        energy: userData.energy,
        max_energy_cap: userData.maxEnergyCap || 100,
        q_coins: userData.qCoins,
        mess_points: userData.messPoints,
        current_streak: userData.currentStreak,
        enabled_habits: userData.enabledHabits,
        study_goal_hours: userData.studyGoalHours,
        exercise_goal_minutes: userData.exerciseGoalMinutes,
        hydration_goal_glasses: userData.hydrationGoalGlasses,
        sleep_goal_hours: userData.sleepGoalHours,
        weight_goal: userData.weightGoal,
        meal_portion_size: userData.mealPortionSize,
        light_type: userData.roomCustomization?.lightType || 'lamp',
        plant_type: userData.roomCustomization?.plantType || 'plant',
      });
      successCount++;
      console.log('[EssentialSync] ✅ user_profiles synced');
    } catch (profileError) {
      console.error('[EssentialSync] ❌ user_profiles sync failed:', profileError);
    }

    // 2. Sync to daily_data table (important for daily tracking)
    try {
      totalAttempts++;
      await updateDailyData(user.id, {
        study_minutes_today: userData.studyMinutesToday || 0,
        missed_checkpoints: userData.missedCheckpoints || 0,
        ate_breakfast: userData.ateBreakfast || false,
        water_glasses: userData.waterGlasses || 0,
        meals_logged: userData.mealsLogged || 0,
        exercise_minutes: userData.exerciseMinutes || 0,
        apple_taps_today: userData.appleTapsToday || 0,
        coffee_taps_today: userData.coffeeTapsToday || 0,
      });
      successCount++;
      console.log('[EssentialSync] ✅ daily_data synced');
    } catch (dailyDataError) {
      console.error('[EssentialSync] ❌ daily_data sync failed:', dailyDataError);
    }

    console.log(`[EssentialSync] Completed: ${successCount}/${totalAttempts} tables synced successfully`);
    return successCount > 0; // Success if at least one table synced
  } catch (error) {
    console.error('[EssentialSync] Critical error:', error);
    return false;
  }
};

// Load essential data - only from tables that are guaranteed to work
export const loadEssentialData = async () => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[LoadEssential] No authenticated user');
      return null;
    }

    console.log('[LoadEssential] Loading essential data...');

    // Load from core tables with individual error handling
    const results = {
      userProfile: null,
      dailyData: null,
      deadlines: [],
      purchasedItems: [],
      sleepSessions: [],
    };

    // 1. Load user profile (most important)
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profileError) {
        results.userProfile = userProfile;
        console.log('[LoadEssential] ✅ user_profiles loaded');
      } else {
        console.error('[LoadEssential] ❌ user_profiles load failed:', profileError);
      }
    } catch (profileErr) {
      console.error('[LoadEssential] ❌ user_profiles exception:', profileErr);
    }

    // 2. Load daily data
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_tracked', today)
        .single();
      
      if (!dailyError) {
        results.dailyData = dailyData;
        console.log('[LoadEssential] ✅ daily_data loaded');
      } else if (dailyError.code !== 'PGRST116') { // Ignore "not found" errors
        console.error('[LoadEssential] ❌ daily_data load failed:', dailyError);
      }
    } catch (dailyErr) {
      console.error('[LoadEssential] ❌ daily_data exception:', dailyErr);
    }

    // 3. Load deadlines (if accessible)
    try {
      const { data: deadlines, error: deadlinesError } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (!deadlinesError) {
        results.deadlines = deadlines || [];
        console.log('[LoadEssential] ✅ deadlines loaded');
      } else {
        console.error('[LoadEssential] ❌ deadlines load failed:', deadlinesError);
      }
    } catch (deadlinesErr) {
      console.error('[LoadEssential] ❌ deadlines exception:', deadlinesErr);
    }

    // 4. Load purchased items (if accessible)
    try {
      const { data: purchasedItems, error: purchasedError } = await supabase
        .from('purchased_items')
        .select('item_id')
        .eq('user_id', user.id);
      
      if (!purchasedError) {
        results.purchasedItems = purchasedItems || [];
        console.log('[LoadEssential] ✅ purchased_items loaded');
      } else {
        console.error('[LoadEssential] ❌ purchased_items load failed:', purchasedError);
      }
    } catch (purchasedErr) {
      console.error('[LoadEssential] ❌ purchased_items exception:', purchasedErr);
    }

    // 5. Load sleep sessions (if accessible)
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: sleepSessions, error: sleepError } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date_assigned', thirtyDaysAgo);
      
      if (!sleepError) {
        results.sleepSessions = sleepSessions || [];
        console.log('[LoadEssential] ✅ sleep_sessions loaded');
      } else {
        console.error('[LoadEssential] ❌ sleep_sessions load failed:', sleepError);
      }
    } catch (sleepErr) {
      console.error('[LoadEssential] ❌ sleep_sessions exception:', sleepErr);
    }

    console.log('[LoadEssential] Essential data loading completed');
    return results;
  } catch (error) {
    console.error('[LoadEssential] Critical error:', error);
    return null;
  }
};

// Periodic essential sync (lightweight)
export const periodicEssentialSync = async (userData: any) => {
  try {
    console.log('[PeriodicEssential] Running periodic essential sync...');
    const success = await essentialSync(userData);
    if (success) {
      console.log('[PeriodicEssential] ✅ Periodic sync completed');
    } else {
      console.log('[PeriodicEssential] ⚠️ Periodic sync had issues');
    }
  } catch (error) {
    console.error('[PeriodicEssential] ❌ Periodic sync failed:', error);
  }
};