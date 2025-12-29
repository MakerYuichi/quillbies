// lib/userProfile.ts
// lib/userProfile.ts
import { supabase } from './supabase';

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('GetProfile Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('GetProfile Exception:', err);
    return null;
  }
};

// Create new user profile (after sign up)
export const createUserProfile = async (userId: string, profile: any) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          email: profile.email,
          buddy_name: profile.buddy_name || 'Hammy',
          selected_character: profile.selected_character || 'casual',
          student_level: profile.student_level || 'university',
          country: profile.country,
          timezone: profile.timezone,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('CreateProfile Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('CreateProfile Exception:', err);
    return null;
  }
};

// Update user profile - with automatic creation if not exists
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    // First, try to update the existing profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it first
      console.log('[UpdateProfile] Profile not found, creating new profile for user:', userId);
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: updates.email || null,
            buddy_name: updates.buddy_name || 'Hammy',
            selected_character: updates.selected_character || 'casual',
            user_name: updates.user_name,
            student_level: updates.student_level || 'university',
            country: updates.country,
            timezone: updates.timezone || 'UTC',
            energy: updates.energy || 100,
            max_energy_cap: updates.max_energy_cap || 100,
            q_coins: updates.q_coins || 100,
            mess_points: updates.mess_points || 0,
            current_streak: updates.current_streak || 0,
            enabled_habits: updates.enabled_habits || ['study', 'hydration', 'sleep', 'exercise'],
            study_goal_hours: updates.study_goal_hours || 3,
            exercise_goal_minutes: updates.exercise_goal_minutes || 30,
            hydration_goal_glasses: updates.hydration_goal_glasses || 8,
            sleep_goal_hours: updates.sleep_goal_hours || 8,
            weight_goal: updates.weight_goal || 'maintain',
            meal_portion_size: updates.meal_portion_size || 1.0,
            light_type: updates.light_type || 'lamp',
            plant_type: updates.plant_type || 'plant',
            created_at: new Date(),
            updated_at: new Date(),
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('CreateProfile Error:', createError);
        return null;
      }

      console.log('[UpdateProfile] Profile created successfully');
      return newProfile;
    } else if (error) {
      console.error('UpdateProfile Error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('UpdateProfile Exception:', err);
    return null;
  }
};

// Add coins
export const addCoins = async (userId: string, amount: number) => {
  try {
    const profile = await getUserProfile(userId);
    
    return updateUserProfile(userId, {
      q_coins: (profile?.q_coins || 0) + amount,
    });
  } catch (err) {
    console.error('AddCoins Exception:', err);
    return null;
  }
};

// Update energy
export const updateEnergy = async (userId: string, newEnergy: number) => {
  try {
    const capped = Math.min(Math.max(newEnergy, 0), 100);
    
    return updateUserProfile(userId, {
      energy: capped,
    });
  } catch (err) {
    console.error('UpdateEnergy Exception:', err);
    return null;
  }
};

// Update mess points
export const updateMessPoints = async (userId: string, change: number) => {
  try {
    const profile = await getUserProfile(userId);
    const newMess = Math.max((profile?.mess_points || 0) + change, 0);
    
    return updateUserProfile(userId, {
      mess_points: newMess,
    });
  } catch (err) {
    console.error('UpdateMess Exception:', err);
    return null;
  }
};