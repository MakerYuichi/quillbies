// lib/deviceOnboarding.ts
import { supabase } from './supabase';
import { getOrCreateDeviceId } from './deviceAuth';
import { 
  isOfflineOnboardingCompleted, 
  markOfflineOnboardingCompleted, 
  hasOfflineUserData 
} from './offlineMode';

/**
 * Check if onboarding has been completed for this device
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    // Try online check first
    try {
      const { data, error } = await supabase
        .from('device_onboarding')
        .select('completed_at')
        .eq('device_id', deviceId)
        .eq('completed', true)
        .maybeSingle();
      
      if (!error && data) {
        console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding completed (online)`);
        return true;
      }
    } catch (onlineError) {
      console.warn('[DeviceOnboarding] Online check failed, using offline mode');
    }
    
    // Fallback to offline mode
    const offlineCompleted = await isOfflineOnboardingCompleted();
    if (offlineCompleted) {
      console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding completed (offline)`);
      return true;
    }
    
    // Check for existing user data (legacy users)
    const hasExistingData = await checkForExistingUserData();
    if (hasExistingData) {
      console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... has existing data, marking as completed`);
      // Mark as completed in both online and offline
      try {
        await markOnboardingCompleted();
      } catch (err) {
        console.warn('[DeviceOnboarding] Could not mark online, using offline');
        await markOfflineOnboardingCompleted();
      }
      return true;
    }
    
    console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding not completed`);
    return false;
  } catch (err) {
    console.warn('[DeviceOnboarding] Exception checking completion, using offline fallback:', err);
    // Final fallback: check offline mode
    return await isOfflineOnboardingCompleted();
  }
};

/**
 * Check if user has existing data (for legacy users who didn't go through new onboarding)
 */
const checkForExistingUserData = async (): Promise<boolean> => {
  // First check offline data
  try {
    const hasOfflineData = await hasOfflineUserData();
    if (hasOfflineData) {
      console.log('[DeviceOnboarding] Found existing offline user data');
      return true;
    }
  } catch (err) {
    console.warn('[DeviceOnboarding] Error checking offline data:', err);
  }
  
  // Then try online check
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[DeviceOnboarding] No authenticated user found');
      return false;
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, buddy_name, user_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('[DeviceOnboarding] Could not check user profile (offline mode):', error.message);
      return false;
    }

    const hasExistingData = !!profile && (profile.buddy_name || profile.user_name);
    console.log(`[DeviceOnboarding] Existing online user data check:`, hasExistingData);
    
    return hasExistingData;
  } catch (err) {
    console.warn('[DeviceOnboarding] Error checking existing user data (offline mode):', err);
    return false;
  }
};

/**
 * Mark onboarding as completed for this device
 */
export const markOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    // Try online first
    try {
      const { error } = await supabase
        .from('device_onboarding')
        .upsert({
          device_id: deviceId,
          completed: true,
          completed_at: new Date().toISOString(),
          app_version: '1.0.0',
        }, {
          onConflict: 'device_id'
        });
      
      if (!error) {
        console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding marked as completed (online)`);
        // Also mark offline for redundancy
        await markOfflineOnboardingCompleted();
        return true;
      }
    } catch (onlineError) {
      console.warn('[DeviceOnboarding] Online marking failed, using offline mode');
    }
    
    // Fallback to offline mode
    await markOfflineOnboardingCompleted();
    console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding marked as completed (offline)`);
    return true;
  } catch (err) {
    console.warn('[DeviceOnboarding] Exception marking completion:', err);
    // Final fallback
    try {
      await markOfflineOnboardingCompleted();
      return true;
    } catch (offlineErr) {
      console.error('[DeviceOnboarding] Failed to mark completion even offline:', offlineErr);
      return false;
    }
  }
};

/**
 * Reset onboarding for this device (for testing purposes)
 */
export const resetOnboarding = async (): Promise<boolean> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    const { error } = await supabase
      .from('device_onboarding')
      .delete()
      .eq('device_id', deviceId);
    
    if (error) {
      console.error('[DeviceOnboarding] Error resetting onboarding:', error);
      return false;
    }
    
    console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding reset`);
    return true;
  } catch (err) {
    console.error('[DeviceOnboarding] Exception resetting onboarding:', err);
    return false;
  }
};

/**
 * Get onboarding info for this device
 */
export const getOnboardingInfo = async () => {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    const { data, error } = await supabase
      .from('device_onboarding')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();
    
    if (error) {
      console.error('[DeviceOnboarding] Error getting info:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('[DeviceOnboarding] Exception getting info:', err);
    return null;
  }
};