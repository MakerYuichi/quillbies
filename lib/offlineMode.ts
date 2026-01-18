// Offline mode utilities
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_ONBOARDING_KEY = 'quillby_offline_onboarding_completed';
const OFFLINE_USER_DATA_KEY = 'quillby_offline_user_data';

/**
 * Check if onboarding is completed in offline mode
 */
export const isOfflineOnboardingCompleted = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(OFFLINE_ONBOARDING_KEY);
    return completed === 'true';
  } catch (err) {
    console.warn('[OfflineMode] Error checking onboarding:', err);
    return false;
  }
};

/**
 * Mark onboarding as completed in offline mode
 */
export const markOfflineOnboardingCompleted = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_ONBOARDING_KEY, 'true');
    console.log('[OfflineMode] Onboarding marked as completed offline');
  } catch (err) {
    console.warn('[OfflineMode] Error marking onboarding completed:', err);
  }
};

/**
 * Check if user has existing data in offline mode
 */
export const hasOfflineUserData = async (): Promise<boolean> => {
  try {
    const userData = await AsyncStorage.getItem(OFFLINE_USER_DATA_KEY);
    if (!userData) return false;
    
    const parsed = JSON.parse(userData);
    return !!(parsed.buddyName || parsed.userName);
  } catch (err) {
    console.warn('[OfflineMode] Error checking offline user data:', err);
    return false;
  }
};

/**
 * Save user data for offline mode
 */
export const saveOfflineUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_USER_DATA_KEY, JSON.stringify(userData));
    console.log('[OfflineMode] User data saved offline');
  } catch (err) {
    console.warn('[OfflineMode] Error saving offline user data:', err);
  }
};

/**
 * Get offline user data
 */
export const getOfflineUserData = async (): Promise<any | null> => {
  try {
    const userData = await AsyncStorage.getItem(OFFLINE_USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (err) {
    console.warn('[OfflineMode] Error getting offline user data:', err);
    return null;
  }
};