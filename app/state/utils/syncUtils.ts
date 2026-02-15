// Utility functions for database synchronization with smart performance optimizations
import { UserData } from '../../core/types';
import { getDeviceUser } from '../../../lib/deviceAuth';
import { syncAllUserData } from '../../../lib/syncManager';

// Smart throttling for better performance
let lastSyncTime = 0;
let syncTimeout: NodeJS.Timeout | null = null;
const SYNC_THROTTLE_MS = 15000; // Only sync every 15 seconds max
let pendingUserData: UserData | null = null;

export const syncToDatabase = async (userData: UserData) => {
  try {
    const now = Date.now();
    
    // Store the latest data
    pendingUserData = userData;
    
    // Clear any pending sync
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      console.log('[Sync] Cleared previous pending sync');
    }
    
    // If we synced recently, schedule a delayed sync instead
    if (now - lastSyncTime < SYNC_THROTTLE_MS) {
      const delayMs = SYNC_THROTTLE_MS - (now - lastSyncTime);
      console.log(`[Sync] Throttling - will sync in ${Math.round(delayMs / 1000)}s`);
      syncTimeout = setTimeout(() => {
        if (pendingUserData) {
          console.log('[Sync] Executing delayed sync...');
          performSync(pendingUserData);
        }
      }, delayMs);
      return;
    }
    
    // Perform immediate sync
    console.log('[Sync] Performing immediate sync...');
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
    pendingUserData = null;
    
    // Run sync in background without blocking UI
    setTimeout(async () => {
      try {
        await syncAllUserData(userData);
        console.log('[Sync] Background sync completed');
      } catch (error) {
        console.warn('[Sync] Background sync failed:', error);
      }
    }, 50); // Small delay to not block UI
    
  } catch (error) {
    console.warn('[Sync] Sync operation failed (offline mode):', error);
  }
};