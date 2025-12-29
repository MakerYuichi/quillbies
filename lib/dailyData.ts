// lib/dailyData.ts
// lib/dailyData.ts
import { supabase } from './supabase';

// Get today's data
export const getTodayData = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_data')
      .select('*')
      .eq('user_id', userId)
      .eq('date_tracked', today)
      .single();

    if (error && error.code === 'PGRST116') {
      // No data for today, create it
      console.log('[DailyData] No record for today, creating new one');
      return createTodayData(userId, today);
    }

    if (error) {
      console.error('GetTodayData Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('GetTodayData Exception:', err);
    return null;
  }
};

// Create today's data - with user profile validation
const createTodayData = async (userId: string, date: string) => {
  try {
    // First ensure user profile exists
    await ensureUserProfileExists(userId);
    
    const { data, error } = await supabase
      .from('daily_data')
      .insert([
        {
          user_id: userId,
          date_tracked: date,
          study_minutes_today: 0,
          missed_checkpoints: 0,
          ate_breakfast: false,
          water_glasses: 0,
          meals_logged: 0,
          exercise_minutes: 0,
          apple_taps_today: 0,
          coffee_taps_today: 0,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('CreateTodayData Error:', error);
      return null;
    }

    console.log('[DailyData] Created new daily record');
    return data;
  } catch (err) {
    console.error('CreateTodayData Exception:', err);
    return null;
  }
};

// Ensure user profile exists before creating daily data
const ensureUserProfileExists = async (userId: string) => {
  try {
    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create minimal profile
      console.log('[DailyData] Creating user profile for daily data:', userId);
      
      const { error: createError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: null,
            buddy_name: 'Hammy',
            selected_character: 'casual',
            student_level: 'university',
            country: 'Unknown',
            timezone: 'UTC',
            energy: 100,
            max_energy_cap: 100,
            q_coins: 100,
            mess_points: 0,
            current_streak: 0,
            enabled_habits: ['study', 'hydration', 'sleep', 'exercise'],
            study_goal_hours: 3,
            exercise_goal_minutes: 30,
            hydration_goal_glasses: 8,
            sleep_goal_hours: 8,
            weight_goal: 'maintain',
            meal_portion_size: 1.0,
            light_type: 'lamp',
            plant_type: 'plant',
            created_at: new Date(),
            updated_at: new Date(),
          }
        ]);

      if (createError) {
        console.error('[DailyData] Failed to create user profile:', createError);
        throw createError;
      }
      
      console.log('[DailyData] User profile created successfully');
    } else if (profileError) {
      console.error('[DailyData] Error checking user profile:', profileError);
      throw profileError;
    } else {
      console.log('[DailyData] User profile already exists');
    }
  } catch (err) {
    console.error('[DailyData] Exception ensuring user profile:', err);
    throw err;
  }
};

// Update daily data - FIXED VERSION
export const updateDailyData = async (userId: string, updates: any) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // First, make sure today's data exists
    let todayData = await getTodayData(userId);
        
    if (!todayData) {
      console.error('[DailyData] Failed to get or create today data');
      return null;
    }

    // For study_minutes_today, we want to accumulate, not replace
    if (updates.study_minutes_today !== undefined) {
      updates.study_minutes_today = (todayData.study_minutes_today || 0) + updates.study_minutes_today;
    }

    // Now update the existing record
    const { data, error } = await supabase
      .from('daily_data')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('user_id', userId)
      .eq('date_tracked', today)
      .select()
      .single();

    if (error) {
      console.error('UpdateDailyData Error:', error);
      return null;
    }

    console.log('[DailyData] Updated:', Object.keys(updates));
    return data;
  } catch (err) {
    console.error('UpdateDailyData Exception:', err);
    return null;
  }
};

// Increment apple taps
export const incrementAppleTaps = async (userId: string) => {
  try {
    // Ensure today's data exists first
    const today = await getTodayData(userId);
        
    if (!today) {
      console.error('[AppleTaps] Failed to get today data');
      return null;
    }

    return updateDailyData(userId, {
      apple_taps_today: (today.apple_taps_today || 0) + 1,
    });
  } catch (err) {
    console.error('IncrementAppleTaps Exception:', err);
    return null;
  }
};

// Increment coffee taps
export const incrementCoffeeTaps = async (userId: string) => {
  try {
    // Ensure today's data exists first
    const today = await getTodayData(userId);
        
    if (!today) {
      console.error('[CoffeeTaps] Failed to get today data');
      return null;
    }

    return updateDailyData(userId, {
      coffee_taps_today: (today.coffee_taps_today || 0) + 1,
    });
  } catch (err) {
    console.error('IncrementCoffeeTaps Exception:', err);
    return null;
  }
};

// Add water
export const addWater = async (userId: string) => {
  try {
    const today = await getTodayData(userId);
        
    if (!today) {
      console.error('[Water] Failed to get today data');
      return null;
    }

    const newWaterGlasses = (today.water_glasses || 0) + 1;
        
    if (newWaterGlasses > 8) {
      console.log('[Water] Daily limit reached (8 glasses)');
      return null;
    }

    return updateDailyData(userId, {
      water_glasses: newWaterGlasses,
    });
  } catch (err) {
    console.error('AddWater Exception:', err);
    return null;
  }
};

// Add meal
export const addMeal = async (userId: string) => {
  try {
    const today = await getTodayData(userId);
        
    if (!today) {
      console.error('[Meal] Failed to get today data');
      return null;
    }

    const newMeals = (today.meals_logged || 0) + 1;
        
    if (newMeals > 3) {
      console.log('[Meal] Daily limit reached (3 meals)');
      return null;
    }

    return updateDailyData(userId, {
      meals_logged: newMeals,
    });
  } catch (err) {
    console.error('AddMeal Exception:', err);
    return null;
  }
};

// Add exercise
export const addExercise = async (userId: string, minutes: number) => {
  try {
    const today = await getTodayData(userId);
        
    if (!today) {
      console.error('[Exercise] Failed to get today data');
      return null;
    }

    return updateDailyData(userId, {
      exercise_minutes: (today.exercise_minutes || 0) + minutes,
    });
  } catch (err) {
    console.error('AddExercise Exception:', err);
    return null;
  }
};