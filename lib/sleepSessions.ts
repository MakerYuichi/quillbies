// lib/sleepSessions.ts
import { supabase } from './supabase';

// Create a new sleep session
export const createSleepSession = async (userId: string, sessionData: any) => {
  try {
    // Calculate duration in minutes if not provided
    const durationMinutes = sessionData.durationMinutes || Math.round((sessionData.duration || 0) * 60);
    
    const { data, error } = await supabase
      .from('sleep_sessions')
      .insert([
        {
          user_id: userId,
          start_time: sessionData.start,
          end_time: sessionData.end,
          duration_hours: sessionData.duration,
          date_assigned: sessionData.date,
          quality: sessionData.quality || 'good',
          coins_earned: sessionData.coinsEarned || 0,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('CreateSleepSession Error:', error);
      return null;
    }

    console.log(`[CreateSleepSession] Created: ${sessionData.duration}h (${durationMinutes}min)`);
    return data;
  } catch (err) {
    console.error('CreateSleepSession Exception:', err);
    return null;
  }
};

// Get user's sleep sessions
export const getSleepSessions = async (userId: string, limit?: number) => {
  try {
    let query = supabase
      .from('sleep_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('GetSleepSessions Error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('GetSleepSessions Exception:', err);
    return [];
  }
};

// Get today's sleep sessions
export const getTodaySleepSessions = async (userId: string) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('sleep_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date_assigned', today);

    if (error) {
      console.error('GetTodaySleepSessions Error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('GetTodaySleepSessions Exception:', err);
    return [];
  }
};