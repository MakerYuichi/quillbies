// Utility functions for database synchronization
import { UserData } from '../../core/types';
import { getDeviceUser } from '../../../lib/deviceAuth';
import { syncAllUserData } from '../../../lib/syncManager';

export const syncToDatabase = async (userData: UserData) => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      console.log('[Sync] No authenticated user, skipping database sync');
      return;
    }

    await syncAllUserData(userData);
    console.log('[Sync] Comprehensive sync completed successfully');
  } catch (error) {
    console.error('[Sync] Failed to sync to database:', error);
  }
};