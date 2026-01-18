// Utility functions for database synchronization
import { UserData } from '../../core/types';
import { getDeviceUser } from '../../../lib/deviceAuth';
import { syncAllUserData } from '../../../lib/syncManager';

// Throttle sync operations to prevent excessive database calls
let lastSyncTime = 0;
let syncTimeout: NodeJS.Timeout | null = null;
const SYNC_THROTTLE_MS = 5000; // Only sync every 5 seconds max

export const syncToDatabase = async (userData: UserData) => {
  try {
    const now = Date.now();
    
    // Clear any pending sync
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    
    // If we synced recently, schedule a delayed sync instead
    if (now - lastSyncTime < SYNC_THROTTLE_MS) {
      syncTimeout = setTimeout(() => {
        performSync(userData);
      }, SYNC_THROTTLE_MS - (now - lastSyncTime));
      return;
    }
    
    // Perform immediate sync
    await performSync(userData);
  } catch (error) {
    console.warn('[Sync] Failed to sync to database:', error);
  }
};

const performSync = async (userData: UserData) => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[Sync] No authenticated user, skipping database sync');
      return;
    }

    lastSyncTime = Date.now();
    await syncAllUserData(userData);
    console.log('[Sync] Comprehensive sync completed successfully');
  } catch (error) {
    console.warn('[Sync] Sync operation failed (offline mode):', error);
  }
};