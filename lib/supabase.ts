// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Try to get from process.env first, then from Constants.expoConfig.extra
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   Constants.expoConfig?.extra?.supabaseUrl || 
                   'https://kkhruuvwqodyhmspqlma.supabase.co';

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       Constants.expoConfig?.extra?.supabaseAnonKey || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtraHJ1dXZ3cW9keWhtc3BxbG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjA4NTgsImV4cCI6MjA4MTczNjg1OH0.caBiIn3_dcTOPOoucVW_D47UY36q8sLVZUGlf5pvg3c';

console.log('[Supabase] Initializing with URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('[Supabase] Anon key:', supabaseAnonKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables - using fallback values');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = any; // You can generate types later with Supabase CLI
