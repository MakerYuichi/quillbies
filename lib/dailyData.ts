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

// Create today's data
const createTodayData = async (userId: string, date: string) => {
  try {
    const { data, error } = await supabase
      .from('daily_data')
      .insert([
        {
          user_id: userId,
          date_tracked: date,
          study_minutes_today: 0,
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

    return data;
  } catch (err) {
    console.error('CreateTodayData Exception:', err);
    return null;
  }
};

// Update daily data
export const updateDailyData = async (userId: string, updates: any) => {
  try {
    const today = new Date().toISOString().split('T')[0];

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

    return data;
  } catch (err) {
    console.error('UpdateDailyData Exception:', err);
    return null;
  }
};

// Increment apple taps
export const incrementAppleTaps = async (userId: string) => {
  try {
    const today = await getTodayData(userId);
    
    return updateDailyData(userId, {
      apple_taps_today: (today?.apple_taps_today || 0) + 1,
    });
  } catch (err) {
    console.error('IncrementAppleTaps Exception:', err);
    return null;
  }
};

// Increment coffee taps
export const incrementCoffeeTaps = async (userId: string) => {
  try {
    const today = await getTodayData(userId);
    
    return updateDailyData(userId, {
      coffee_taps_today: (today?.coffee_taps_today || 0) + 1,
    });
  } catch (err) {
    console.error('IncrementCoffeeTaps Exception:', err);
    return null;
  }
};