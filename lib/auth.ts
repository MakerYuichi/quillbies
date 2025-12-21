// lib/auth.ts
import { supabase } from './supabase';

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('SignUp Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (err) {
    console.error('SignUp Exception:', err);
    return { success: false, error: String(err) };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('SignIn Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (err) {
    console.error('SignIn Exception:', err);
    return { success: false, error: String(err) };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('SignOut Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('SignOut Exception:', err);
    return { success: false, error: String(err) };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (err) {
    console.error('GetUser Exception:', err);
    return null;
  }
};