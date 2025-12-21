// lib/focusSession.ts
// lib/focusSession.ts
import { supabase } from './supabase';
import { updateUserProfile } from './userProfile';
import { updateDailyData } from './dailyData';

// Create focus session
export const createFocusSession = async (
  userId: string,
  deadlineId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([
        {
          user_id: userId,
          deadline_id: deadlineId || null,
          start_time: new Date(),
          focus_score: 0,
          is_completed: false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('CreateSession Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('CreateSession Exception:', err);
    return null;
  }
};

// End focus session & save results
export const endFocusSession = async (
  sessionId: string,
  results: {
    focusScore: number;
    distractionCount: number;
    totalBreakTime: number;
    applePremiumUsed: boolean;
    coffeePremiumUsed: boolean;
  }
) => {
  try {
    // Get session details
    const { data: session, error: fetchError } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError) {
      console.error('FetchSession Error:', fetchError);
      return null;
    }

    const userId = session.user_id;

    // Calculate rewards
    const qCoinsEarned = Math.round(results.focusScore * 0.5);
    const studyHours = results.focusScore / 120;
    const energyMultiplier =
      results.distractionCount === 0 ? 0.3 :
      results.distractionCount <= 2 ? 0.2 : 0.1;
    const energyGained = Math.round(results.focusScore * energyMultiplier);
    const messRemoved = 2;

    // Update session
    const { error: updateSessionError } = await supabase
      .from('focus_sessions')
      .update({
        end_time: new Date(),
        is_completed: true,
        ...results,
      })
      .eq('id', sessionId);

    if (updateSessionError) {
      console.error('UpdateSession Error:', updateSessionError);
      return null;
    }

    // Update user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('energy, q_coins, mess_points')
      .eq('id', userId)
      .single();

    await updateUserProfile(userId, {
      energy: Math.min((profile?.energy || 0) + energyGained, 100),
      q_coins: (profile?.q_coins || 0) + qCoinsEarned,
      mess_points: Math.max((profile?.mess_points || 0) - messRemoved, 0),
    });

    // Update daily data
    await updateDailyData(userId, {
      study_minutes_today: (session.study_minutes_today || 0) + Math.round(studyHours * 60),
    });

    // Update deadline if applicable
    if (session.deadline_id) {
      const { data: deadline } = await supabase
        .from('deadlines')
        .select('work_completed, estimated_hours')
        .eq('id', session.deadline_id)
        .single();

      const newWorkCompleted = (deadline?.work_completed || 0) + studyHours;
      const isCompleted = newWorkCompleted >= (deadline?.estimated_hours || 0);

      await supabase
        .from('deadlines')
        .update({
          work_completed: newWorkCompleted,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date() : null,
        })
        .eq('id', session.deadline_id);
    }

    return {
      qCoinsEarned,
      energyGained,
      studyHours,
      messRemoved,
    };
  } catch (err) {
    console.error('EndSession Exception:', err);
    return null;
  }
};