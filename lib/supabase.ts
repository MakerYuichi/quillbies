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

// Custom fetch with retry logic for WiFi DNS issues
const customFetch = async (input: RequestInfo | URL, init?: RequestInit, retryCount = 0): Promise<Response> => {
  const maxRetries = 2;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Log the error for debugging
    console.error(`[Supabase] Fetch attempt ${retryCount + 1} failed:`, error.message || error);
    
    // Check if it's a DNS or network error
    const isDNSError = error.message?.includes('Network request failed') || 
                       error.message?.includes('Failed to fetch') ||
                       error.message?.includes('getaddrinfo') ||
                       error.name === 'AbortError' ||
                       error.name === 'TimeoutError';
    
    // Retry logic for DNS/network errors
    if (isDNSError && retryCount < maxRetries) {
      console.log(`[Supabase] Retrying request (attempt ${retryCount + 2}/${maxRetries + 1})...`);
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return customFetch(input, init, retryCount + 1);
    }
    
    // If all retries failed, throw descriptive error
    if (isDNSError) {
      console.error('[Supabase] All retry attempts failed. This may be due to:');
      console.error('  - WiFi DNS issues (try switching to mobile data temporarily)');
      console.error('  - Firewall/proxy blocking the connection');
      console.error('  - Network configuration issues');
      throw new Error('Unable to connect to server. Please check your network connection or try mobile data.');
    }
    
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'quillby-app',
      // Add cache control to prevent stale DNS
      'Cache-Control': 'no-cache',
    },
    // Use custom fetch with retry logic (correct location)
    fetch: customFetch,
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type Database = any; // You can generate types later with Supabase CLI
