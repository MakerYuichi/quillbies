// lib/accountDeletion.ts
// Account deletion with 30-day grace period

import { supabase } from './supabase';
import { getDeviceUser } from './deviceAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const DELETION_REQUEST_KEY = 'quillby_deletion_request';

export interface DeletionRequest {
  requestedAt: string; // ISO timestamp
  scheduledFor: string; // ISO timestamp (30 days later)
  userId: string;
}

/**
 * Request account deletion
 * Marks account for deletion after 30 days
 */
export const requestAccountDeletion = async (): Promise<{ success: boolean; scheduledFor?: string; error?: string }> => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    const now = new Date();
    const scheduledDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const deletionRequest: DeletionRequest = {
      requestedAt: now.toISOString(),
      scheduledFor: scheduledDate.toISOString(),
      userId: user.id,
    };

    // Store deletion request in Supabase
    const { error: dbError } = await supabase
      .from('account_deletion_requests')
      .upsert([
        {
          user_id: user.id,
          requested_at: now.toISOString(),
          scheduled_for: scheduledDate.toISOString(),
          status: 'pending',
        }
      ], { onConflict: 'user_id' });

    if (dbError) {
      console.error('[AccountDeletion] Database error:', dbError);
      // Continue with local storage even if DB fails
    }

    // Store locally as backup
    await AsyncStorage.setItem(DELETION_REQUEST_KEY, JSON.stringify(deletionRequest));

    console.log('[AccountDeletion] Deletion request created, scheduled for:', scheduledDate.toISOString());
    return { success: true, scheduledFor: scheduledDate.toISOString() };
  } catch (error) {
    console.error('[AccountDeletion] Failed to request deletion:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Cancel account deletion request
 * User logged back in before 30 days
 */
export const cancelAccountDeletion = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      return { success: false, error: 'No authenticated user found' };
    }

    // Remove from Supabase
    const { error: dbError } = await supabase
      .from('account_deletion_requests')
      .delete()
      .eq('user_id', user.id);

    if (dbError) {
      console.error('[AccountDeletion] Database error:', dbError);
    }

    // Remove from local storage
    await AsyncStorage.removeItem(DELETION_REQUEST_KEY);

    console.log('[AccountDeletion] Deletion request cancelled');
    return { success: true };
  } catch (error) {
    console.error('[AccountDeletion] Failed to cancel deletion:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Check if account has pending deletion request
 */
export const getPendingDeletionRequest = async (): Promise<DeletionRequest | null> => {
  try {
    const user = await getDeviceUser();
    if (!user) {
      return null;
    }

    // Check Supabase first
    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (data && !error) {
      return {
        requestedAt: data.requested_at,
        scheduledFor: data.scheduled_for,
        userId: data.user_id,
      };
    }

    // Fallback to local storage
    const localRequest = await AsyncStorage.getItem(DELETION_REQUEST_KEY);
    if (localRequest) {
      return JSON.parse(localRequest);
    }

    return null;
  } catch (error) {
    console.error('[AccountDeletion] Failed to check deletion request:', error);
    return null;
  }
};

/**
 * Execute account deletion
 * Permanently deletes all user data
 * Should be called by a scheduled job after 30 days
 */
export const executeAccountDeletion = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('[AccountDeletion] Executing deletion for user:', userId);

    // Delete from all tables
    const deletionPromises = [
      // User data
      supabase.from('user_profiles').delete().eq('id', userId),
      supabase.from('daily_data').delete().eq('user_id', userId),
      
      // Activity data
      supabase.from('focus_sessions').delete().eq('user_id', userId),
      supabase.from('sleep_sessions').delete().eq('user_id', userId),
      supabase.from('deadlines').delete().eq('user_id', userId),
      
      // Shop and purchases
      supabase.from('user_shop_items').delete().eq('user_id', userId),
      supabase.from('gem_purchases').delete().eq('user_id', userId),
      
      // Deletion request
      supabase.from('account_deletion_requests').delete().eq('user_id', userId),
    ];

    const results = await Promise.allSettled(deletionPromises);
    
    // Log results
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`[AccountDeletion] Failed to delete from table ${index}:`, result.reason);
      }
    });

    // Clear local storage
    await AsyncStorage.clear();
    await SecureStore.deleteItemAsync('quillby_device_id');

    // Sign out from Supabase
    await supabase.auth.signOut();

    console.log('[AccountDeletion] Account deletion completed');
    return { success: true };
  } catch (error) {
    console.error('[AccountDeletion] Failed to execute deletion:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get days remaining until deletion
 */
export const getDaysUntilDeletion = (scheduledFor: string): number => {
  const now = new Date();
  const scheduled = new Date(scheduledFor);
  const diffMs = scheduled.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};
