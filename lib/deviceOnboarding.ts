// lib/deviceOnboarding.ts
import { supabase } from './supabase';
import { getOrCreateDeviceId } from './deviceAuth';

/**
 * Check if onboarding has been completed for this device
 */
export const isOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    // Check if device onboarding record exists in Supabase
    const { data, error } = await supabase
      .from('device_onboarding')
      .select('completed_at')
      .eq('device_id', deviceId)
      .eq('completed', true)
      .maybeSingle();
    
    if (error) {
      console.error('[DeviceOnboarding] Error checking completion:', error);
      // If there's an error (like table doesn't exist), assume not completed
      return false;
    }
    
    const isCompleted = !!data;
    console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding completed:`, isCompleted);
    
    return isCompleted;
  } catch (err) {
    console.error('[DeviceOnboarding] Exception checking completion:', err);
    return false;
  }
};

/**
 * Mark onboarding as completed for this device
 */
export const markOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const deviceId = await getOrCreateDeviceId();
    
    // Insert or update device onboarding record
    const { error } = await supabase
      .from('device_onboarding')
      .upsert({
        device_id: deviceId,
        completed: true,
        completed_at: new Date().toISOString(),
        app_version: '1.0.0', // You can get this from app.json if needed
      }, {
        onConflict: 'device_id'
      });
    
    if (error) {
      console.error('[DeviceOnboarding] Error marking completion:', error);
      return false;
    }
    
    console.log(`[DeviceOnboarding] Device ${deviceId.substring(0, 8)}... onboarding marked as completed`);
    return true;
  } catch (err) {
    console.error('[DeviceOnboarding] Exception marking completion:', err);
    return false;
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