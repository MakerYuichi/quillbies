// lib/dailyProgress.ts
import { supabase } from './supabase';

// Get today's daily progress
export const getTodayProgress = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code === 'PGRST116') {
      // No data for today, create it
      console.log('[DailyProgress] No record for today, creating new one');
      return createTodayProgress(userId, today);
    }

    if (error) {
      console.error('GetTodayProgress Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('GetTodayProgress Exception:', err);
    return null;
  }
};

// Create today's daily progress - with proper user validation
const createTodayProgress = async (userId: string, date: string) => {
  try {
    // First ensure the user exists in profiles table
    await ensureUserInProfiles(userId);
    
    const { data, error } = await supabase
      .from('daily_progress')
      .insert([
        {
          user_id: userId,
          date: date,
          energy: 100,
          q_coins: 0,
          mess_points: 0,
          ate_breakfast: false,
          water_glasses: 0,
          meals_logged: 0,
          exercise_minutes: 0,
          study_minutes_today: 0,
          missed_checkpoints: 0,
          current_streak: 0,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('CreateTodayProgress Error:', error);
      return null;
    }

    console.log('[DailyProgress] Created new daily progress record');
    return data;
  } catch (err) {
    console.error('CreateTodayProgress Exception:', err);
    return null;
  }
};

// Ensure user exists in profiles table (required for foreign key) - Now with RLS disabled
const ensureUserInProfiles = async (userId: string) => {
  try {
    // Check if user exists in profiles
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create minimal profile
      console.log('[DailyProgress] Creating profile for user:', userId);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: null,
            buddy_name: 'Quillby',
            selected_character: 'casual',
            user_name: null,
            student_level: 'university',
            country: null,
            timezone: 'UTC',
            data_synced: true,
            last_sync_at: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          }
        ]);

      if (insertError) {
        console.error('[DailyProgress] Failed to create profile:', insertError);
        throw insertError; // Now we can throw since RLS is disabled
      } else {
        console.log('[DailyProgress] Profile created successfully');
      }
    } else if (checkError) {
      console.error('[DailyProgress] Error checking profile:', checkError);
      throw checkError;
    } else {
      console.log('[DailyProgress] User profile already exists');
    }
  } catch (err) {
    console.error('[DailyProgress] Exception ensuring user in profiles:', err);
    throw err; // Re-throw since this should work now
  }
};

// Update daily progress - Now more robust with RLS disabled
export const updateDailyProgress = async (userId: string, updates: any) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // First, make sure today's progress exists
    let todayProgress = await getTodayProgress(userId);
        
    if (!todayProgress) {
      console.error('[DailyProgress] Failed to get or create today progress');
      return null;
    }

    // Now update the existing record
    const { data, error } = await supabase
      .from('daily_progress')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('user_id', userId)
      .eq('date', today)
      .select()
      .single();

    if (error) {
      console.error('UpdateDailyProgress Error:', error);
      return null;
    }

    console.log('[DailyProgress] Updated:', Object.keys(updates));
    return data;
  } catch (err) {
    console.error('UpdateDailyProgress Exception:', err);
    return null;
  }
};

// Sync user profile data to daily progress - with error handling
export const syncUserToProgress = async (userId: string, userData: any) => {
  try {
    // Ensure water_glasses is a valid number between 0 and 8
    const waterGlasses = Math.max(0, Math.min(8, userData.waterGlasses || 0));
    
    return updateDailyProgress(userId, {
      energy: userData.energy,
      q_coins: userData.qCoins,
      mess_points: userData.messPoints,
      ate_breakfast: userData.ateBreakfast,
      water_glasses: waterGlasses,
      meals_logged: userData.mealsLogged,
      exercise_minutes: userData.exerciseMinutes,
      study_minutes_today: userData.studyMinutesToday,
      missed_checkpoints: userData.missedCheckpoints,
      current_streak: userData.currentStreak,
      last_check_in_date: userData.lastCheckInDate,
    });
  } catch (err) {
    console.error('SyncUserToProgress Exception:', err);
    return null;
  }
};