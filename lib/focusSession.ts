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
    // Validate UUID format for deadlineId if provided
    let validDeadlineId = null;
    if (deadlineId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(deadlineId)) {
        validDeadlineId = deadlineId;
        console.log('[CreateSession] Valid deadline ID provided:', deadlineId);
      } else {
        console.warn('[CreateSession] Invalid deadline ID format, ignoring:', deadlineId);
        validDeadlineId = null;
      }
    }

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([
        {
          user_id: userId,
          deadline_id: validDeadlineId,
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

    console.log('[CreateSession] Focus session created successfully:', data.id);
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
    distractionWarnings: number;
    totalBreakTime: number;
    applePremiumUsed: boolean;
    coffeePremiumUsed: boolean;
    coffeeBonus: number;
    interactionBoosts: number;
    durationSeconds: number;
    lastDistractionTime?: number;
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

    // Update session with all results
    const { error: updateSessionError } = await supabase
      .from('focus_sessions')
      .update({
        end_time: new Date(),
        duration_seconds: results.durationSeconds,
        focus_score: results.focusScore,
        distraction_count: results.distractionCount,
        distraction_warnings: results.distractionWarnings,
        total_break_time: results.totalBreakTime,
        apple_premium_used: results.applePremiumUsed,
        coffee_premium_used: results.coffeePremiumUsed,
        coffee_bonus: results.coffeeBonus,
        interaction_boosts: results.interactionBoosts,
        last_distraction_time: results.lastDistractionTime ? new Date(results.lastDistractionTime) : null,
        is_completed: true,
      })
      .eq('id', sessionId);

    if (updateSessionError) {
      console.error('UpdateSession Error:', updateSessionError);
      return null;
    }

    // Update user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('energy, q_coins, messPoints')
      .eq('id', userId)
      .single();

    await updateUserProfile(userId, {
      energy: Math.min((profile?.energy || 0) + energyGained, 100),
      q_coins: (profile?.q_coins || 0) + qCoinsEarned,
      messPoints: Math.max((profile?.messPoints || 0) - messRemoved, 0),
    });

    // Update daily data - INCREMENT study minutes, don't replace
    const { data: dailyData } = await supabase
      .from('daily_data')
      .select('study_minutes_today')
      .eq('user_id', userId)
      .eq('date_tracked', new Date().toISOString().split('T')[0])
      .single();

    const currentStudyMinutes = dailyData?.study_minutes_today || 0;
    const newStudyMinutes = currentStudyMinutes + Math.round(studyHours * 60);

    await updateDailyData(userId, {
      study_minutes_today: newStudyMinutes,
    });

    console.log(`[EndSession] Study minutes: ${currentStudyMinutes} + ${Math.round(studyHours * 60)} = ${newStudyMinutes}`);

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