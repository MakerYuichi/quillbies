// lib/deviceAuth.ts
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

const DEVICE_ID_KEY = 'quillby_device_id';

/**
 * Generate a simple unique device ID without crypto
 * Format: timestamp-random
 */
const generateDeviceId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
};

/**
 * Get or create a device ID for this device
 * Device ID is stored securely and persists across app restarts
 */
export const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    // Try to get existing device ID from secure storage
    const existingId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    if (existingId) {
      console.log(`[DeviceAuth] Using existing device ID: ${existingId.substring(0, 8)}...`);
      return existingId;
    }
    
    // Generate new device ID
    const newDeviceId = generateDeviceId();
    console.log(`[DeviceAuth] Generated new device ID: ${newDeviceId.substring(0, 8)}...`);
    
    // Store securely
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newDeviceId);
    
    return newDeviceId;
  } catch (err) {
    console.error('[DeviceAuth] Error managing device ID:', err);
    throw err;
  }
};

/**
 * Authenticate device using Supabase Anonymous Auth
 * - Gets or creates device ID
 * - Signs in with anonymous auth
 * - User profiles will be created on first sync
 * 
 * No email/password needed!
 */
export const authenticateDevice = async () => {
  try {
    console.log('[DeviceAuth] Starting device authentication...');
    
    // Get device ID
    const deviceId = await getOrCreateDeviceId();
    console.log('[DeviceAuth] Device ID:', deviceId.substring(0, 8) + '...');
    
    // Try anonymous sign in (checks if already authenticated)
    const { data: { user: existingUser } } = await supabase.auth.getUser();
    
    if (existingUser && existingUser.is_anonymous) {
      console.log('[DeviceAuth] Already authenticated as anonymous user');
      return { userId: existingUser.id, deviceId };
    }
    
    // Sign in anonymously
    console.log('[DeviceAuth] Signing in anonymously...');
    const { data: { user }, error: signInError } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          device_id: deviceId,
          device_type: 'mobile',
        }
      }
    });
    
    if (signInError) {
      console.error('[DeviceAuth] Anonymous sign in error:', signInError);
      throw signInError;
    }
    
    if (!user) {
      throw new Error('No user returned from anonymous sign in');
    }
    
    const userId = user.id;
    console.log('[DeviceAuth] Anonymous sign in successful! User ID:', userId.substring(0, 8) + '...');
    console.log('[DeviceAuth] User profiles will be created on first sync operation');
    
    return { userId, deviceId };
  } catch (err) {
    console.error('[DeviceAuth] Authentication failed:', err);
    throw err;
  }
};

/**
 * Check if device is already authenticated
 */
export const isDeviceAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (err) {
    console.warn('[DeviceAuth] Error checking auth (offline mode):', err);
    // Return true to skip auth in offline mode
    return true;
  }
};

/**
 * Get current authenticated device user
 */
export const getDeviceUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('[DeviceAuth] getDeviceUser called');
    console.log('[DeviceAuth] Supabase auth response:', { user: user ? { id: user.id, is_anonymous: user.is_anonymous } : null, error });
    
    if (error || !user) {
      console.log('[DeviceAuth] No user or error, returning null');
      return null;
    }
    
    console.log('[DeviceAuth] Returning user with ID:', user.id);
    return user;
  } catch (err) {
    console.error('[DeviceAuth] Error getting device user:', err);
    return null;
  }
};

/**
 * Sign out device (optional - usually not needed for device auth)
 */
export const signOutDevice = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[DeviceAuth] Sign out error:', error);
      throw error;
    }
    
    console.log('[DeviceAuth] Signed out');
    return { success: true };
  } catch (err) {
    console.error('[DeviceAuth] Sign out failed:', err);
    return { success: false, error: String(err) };
  }
};

/**
 * Export device ID for backup (optional feature)
 */
export const exportDeviceId = async (): Promise<string | null> => {
  try {
    const id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    return id;
  } catch (err) {
    console.error('[DeviceAuth] Error exporting device ID:', err);
    return null;
  }
};

/**
 * Import device ID for restore (optional feature)
 */
export const importDeviceId = async (deviceId: string): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    console.log('[DeviceAuth] Device ID imported successfully');
    return true;
  } catch (err) {
    console.error('[DeviceAuth] Error importing device ID:', err);
    return false;
  }
};
