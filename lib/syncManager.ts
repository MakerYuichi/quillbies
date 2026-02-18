// lib/syncManager.ts
// Comprehensive sync manager for all Supabase tables

import { supabase } from './supabase';
import { getDeviceUser } from './deviceAuth';
import { updateUserProfile } from './userProfile';
import { updateDailyData } from './dailyData';

// Sync all user data to all relevant tables
export const syncAllUserData = async (userData: any) => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[SyncAll] No authenticated user, skipping sync');
      return false;
    }

    console.log('[SyncAll] Starting comprehensive sync...');

    // CRITICAL: Ensure user profile exists in user_profiles table FIRST
    try {
      await ensureAllUserProfiles(user.id, userData);
      console.log('[SyncAll] ✅ User profile ensured');
    } catch (profileSetupError) {
      console.error('[SyncAll] ❌ Failed to ensure user profile:', profileSetupError);
      return false; // Can't continue without profile
    }

    // 1. Sync to user_profiles table (should work now)
    try {
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
        current_streak: userData.currentStreak || 0,
        last_check_in_date: userData.lastCheckInDate || new Date().toISOString().split('T')[0],
        last_active_timestamp: userData.lastActiveTimestamp || Date.now(),
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
      console.log('[SyncAll] ✅ user_profiles synced successfully');
    } catch (profileError) {
      console.error('[SyncAll] ❌ user_profiles sync failed:', profileError);
    }

    // 2. Sync to daily_data table (consolidated from daily_progress)
    // NOTE: mess_points is NOT synced here - user_profiles is the single source of truth
    try {
      // Ensure water_glasses is a valid number between 0 and 8
      const waterGlasses = Math.max(0, Math.min(8, userData.waterGlasses || 0));
      
      await updateDailyData(user.id, {
        study_minutes_today: userData.studyMinutesToday || 0,
        missed_checkpoints: userData.missedCheckpoints || 0,
        ate_breakfast: userData.ateBreakfast || false,
        water_glasses: waterGlasses,
        meals_logged: userData.mealsLogged || 0,
        exercise_minutes: userData.exerciseMinutes || 0,
        apple_taps_today: userData.appleTapsToday || 0,
        coffee_taps_today: userData.coffeeTapsToday || 0,
        // Consolidated fields from daily_progress (excluding mess_points)
        energy: userData.energy || 100,
        q_coins: userData.qCoins || 0,
        current_streak: userData.currentStreak || 0,
        last_check_in_date: userData.lastCheckInDate || new Date().toISOString().split('T')[0],
      });
      console.log('[SyncAll] ✅ daily_data synced successfully (mess_points excluded - using user_profiles as source of truth)');
    } catch (dailyDataError) {
      console.error('[SyncAll] ❌ daily_data sync failed:', dailyDataError);
    }

    console.log('[SyncAll] Comprehensive sync completed');
    return true;
  } catch (error) {
    console.error('[SyncAll] Failed to sync all data:', error);
    return false;
  }
};

// Load all user data from database - Now with profiles table accessible
export const loadAllUserData = async () => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[LoadAll] No authenticated user');
      return null;
    }

    console.log('[LoadAll] Loading all user data...');

    // Load from tables with proper error handling
    const results = await Promise.allSettled([
      // User profile (primary)
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      
      // Daily data (consolidated - includes fields from old daily_progress)
      supabase.from('daily_data').select('*').eq('user_id', user.id).eq('date_tracked', new Date().toISOString().split('T')[0]).single(),
      
      // Deadlines
      supabase.from('deadlines').select('*').eq('user_id', user.id).order('due_date', { ascending: true }),
      
      // Purchased items
      supabase.from('purchased_items').select('item_id').eq('user_id', user.id),
      
      // Sleep sessions (last 30 days)
      supabase.from('sleep_sessions').select('*').eq('user_id', user.id).gte('date_assigned', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      
      // Focus sessions (today)
      supabase.from('focus_sessions').select('*').eq('user_id', user.id).gte('start_time', new Date().toISOString().split('T')[0])
    ]);

    // Extract successful results
    const [userProfileResult, dailyDataResult, deadlinesResult, purchasedItemsResult, sleepSessionsResult, focusSessionsResult] = results;

    // Log results
    console.log('[LoadAll] Results:');
    console.log('- user_profiles:', userProfileResult.status === 'fulfilled' ? '✅' : '❌');
    console.log('- daily_data:', dailyDataResult.status === 'fulfilled' ? '✅' : '❌');
    console.log('- deadlines:', deadlinesResult.status === 'fulfilled' ? '✅' : '❌');
    console.log('- purchased_items:', purchasedItemsResult.status === 'fulfilled' ? '✅' : '❌');
    console.log('- sleep_sessions:', sleepSessionsResult.status === 'fulfilled' ? '✅' : '❌');
    console.log('- focus_sessions:', focusSessionsResult.status === 'fulfilled' ? '✅' : '❌');

    return {
      userProfile: userProfileResult.status === 'fulfilled' ? userProfileResult.value.data : null,
      dailyData: dailyDataResult.status === 'fulfilled' ? dailyDataResult.value.data : null,
      deadlines: deadlinesResult.status === 'fulfilled' ? (deadlinesResult.value.data || []) : [],
      purchasedItems: purchasedItemsResult.status === 'fulfilled' ? (purchasedItemsResult.value.data || []) : [],
      sleepSessions: sleepSessionsResult.status === 'fulfilled' ? (sleepSessionsResult.value.data || []) : [],
      focusSessions: focusSessionsResult.status === 'fulfilled' ? (focusSessionsResult.value.data || []) : [],
    };
  } catch (error) {
    console.error('[LoadAll] Failed to load all data:', error);
    return null;
  }
};

// Periodic sync function (call this every few minutes)
export const periodicSync = async (userData: any) => {
  try {
    console.log('[PeriodicSync] Running periodic sync...');
    await syncAllUserData(userData);
    console.log('[PeriodicSync] Periodic sync completed');
  } catch (error) {
    console.error('[PeriodicSync] Periodic sync failed:', error);
  }
};

// Ensure user profiles exist in all necessary tables before any operations
const ensureAllUserProfiles = async (userId: string, userData: any) => {
  try {
    console.log('[EnsureProfiles] Ensuring user_profiles entry exists...');

    // Ensure user_profiles entry exists
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userProfileError && userProfileError.code === 'PGRST116') {
      console.log('[EnsureProfiles] Creating user_profiles entry...');
      
      const { error: createUserProfileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: userData.email || null,
            buddy_name: userData.buddyName || 'Quillby',
            selected_character: userData.selectedCharacter || 'casual',
            user_name: userData.userName,
            student_level: userData.studentLevel || 'university',
            country: userData.country,
            timezone: userData.timezone || 'UTC',
            energy: userData.energy || 100,
            max_energy_cap: userData.maxEnergyCap || 100,
            q_coins: userData.qCoins || 100,
            mess_points: userData.messPoints || 0,
            current_streak: userData.currentStreak || 0,
            enabled_habits: userData.enabledHabits || ['study', 'hydration', 'sleep', 'exercise'],
            study_goal_hours: userData.studyGoalHours || 3,
            exercise_goal_minutes: userData.exerciseGoalMinutes || 30,
            hydration_goal_glasses: userData.hydrationGoalGlasses || 8,
            sleep_goal_hours: userData.sleepGoalHours || 8,
            weight_goal: userData.weightGoal || 'maintain',
            meal_portion_size: userData.mealPortionSize || 1.0,
            light_type: userData.roomCustomization?.lightType || 'lamp',
            plant_type: userData.roomCustomization?.plantType || 'plant',
            created_at: new Date(),
            updated_at: new Date(),
          }
        ]);

      if (createUserProfileError) {
        console.error('[EnsureProfiles] Failed to create user_profiles:', createUserProfileError);
        throw createUserProfileError;
      }
      
      console.log('[EnsureProfiles] ✅ user_profiles created');
    } else if (userProfileError) {
      console.error('[EnsureProfiles] Error checking user_profiles:', userProfileError);
      throw userProfileError;
    } else {
      console.log('[EnsureProfiles] ✅ user_profiles already exists');
    }

    console.log('[EnsureProfiles] User profile ensured successfully');
  } catch (err) {
    console.error('[EnsureProfiles] Exception ensuring user profile:', err);
    throw err;
  }
};