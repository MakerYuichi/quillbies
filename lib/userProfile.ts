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

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
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