// lib/deviceAuth.ts
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

const DEVICE_ID_KEY = 'quillby_device_id';
const OFFLINE_USER_KEY = 'quillby_offline_user_id';
const AUTH_TIMEOUT_MS = 8000; // 8s max for any auth network call

const generateDeviceId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
};

export const getOrCreateDeviceId = async (): Promise<string> => {
  try {
    const existingId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existingId) {
      console.log(`[DeviceAuth] Using existing device ID: ${existingId.substring(0, 8)}...`);
      return existingId;
    }
    const newDeviceId = generateDeviceId();
    console.log(`[DeviceAuth] Generated new device ID: ${newDeviceId.substring(0, 8)}...`);
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newDeviceId);
    return newDeviceId;
  } catch (err) {
    console.error('[DeviceAuth] Error managing device ID:', err);
    // Return a temporary ID rather than throwing — never block the app
    return generateDeviceId();
  }
};

const getOrCreateOfflineUserId = async (deviceId: string): Promise<string> => {
  try {
    const existing = await SecureStore.getItemAsync(OFFLINE_USER_KEY);
    if (existing) return existing;
    const offlineId = `offline_${deviceId}`;
    await SecureStore.setItemAsync(OFFLINE_USER_KEY, offlineId);
    return offlineId;
  } catch {
    return `offline_${deviceId}`;
  }
};

/** Wraps a promise with a timeout. Rejects with 'timeout' if it takes too long. */
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
};

/**
 * Authenticate device:
 * 1. Read persisted session from AsyncStorage (no network for returning users)
 * 2. If session valid → return immediately, zero network calls
 * 3. If no session → signInAnonymously with 8s timeout
 * 4. Any failure → stable offline ID, app continues normally
 */
export const authenticateDevice = async () => {
  const deviceId = await getOrCreateDeviceId();
  console.log('[DeviceAuth] Device ID:', deviceId.substring(0, 8) + '...');

  try {
    // getSession() reads AsyncStorage — no network call for returning users
    const { data: sessionData } = await withTimeout(
      supabase.auth.getSession(),
      5000 // 5s max even for AsyncStorage read
    );

    const session = sessionData?.session;
    if (session?.user) {
      const expiresAt = session.expires_at ?? 0;
      const nowSecs = Math.floor(Date.now() / 1000);
      if (expiresAt > nowSecs + 60) {
        console.log('[DeviceAuth] Valid session found, user:', session.user.id.substring(0, 8) + '...');
        return { userId: session.user.id, deviceId };
      }
      console.log('[DeviceAuth] Session expired, re-authenticating...');
    }

    // No valid session — sign in anonymously with hard timeout
    console.log('[DeviceAuth] Signing in anonymously...');
    const { data, error } = await withTimeout(
      supabase.auth.signInAnonymously({
        options: { data: { device_id: deviceId, device_type: 'mobile' } },
      }),
      AUTH_TIMEOUT_MS
    );

    if (error) {
      console.warn('[DeviceAuth] Sign in failed, offline mode:', error.message);
      return { userId: await getOrCreateOfflineUserId(deviceId), deviceId, offline: true };
    }

    if (!data?.user) {
      console.warn('[DeviceAuth] No user returned, offline mode');
      return { userId: await getOrCreateOfflineUserId(deviceId), deviceId, offline: true };
    }

    console.log('[DeviceAuth] Signed in! User:', data.user.id.substring(0, 8) + '...');
    return { userId: data.user.id, deviceId };

  } catch (err: any) {
    console.warn('[DeviceAuth] Auth failed, offline mode:', err?.message || err);
    return { userId: await getOrCreateOfflineUserId(deviceId), deviceId, offline: true };
  }
};

export const isDeviceAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await withTimeout(supabase.auth.getSession(), 5000);
    const session = data?.session;
    if (!session?.user) return false;
    const expiresAt = session.expires_at ?? 0;
    return expiresAt > Math.floor(Date.now() / 1000) + 60;
  } catch {
    return false;
  }
};

export const getDeviceUser = async () => {
  try {
    console.log('[DeviceAuth] getDeviceUser called');
    const { data, error } = await withTimeout(supabase.auth.getSession(), 5000);
    if (error) {
      console.warn('[DeviceAuth] Error getting session:', error.message);
      return null;
    }
    const user = data?.session?.user ?? null;
    if (user) {
      console.log('[DeviceAuth] Returning user with ID:', user.id.substring(0, 8) + '...');
    } else {
      console.log('[DeviceAuth] No active session');
    }
    return user;
  } catch (err) {
    console.warn('[DeviceAuth] getDeviceUser timed out or failed:', err);
    return null;
  }
};

export const signOutDevice = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('[DeviceAuth] Signed out');
    return { success: true };
  } catch (err) {
    console.error('[DeviceAuth] Sign out failed:', err);
    return { success: false, error: String(err) };
  }
};

export const exportDeviceId = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(DEVICE_ID_KEY);
  } catch {
    return null;
  }
};

export const importDeviceId = async (deviceId: string): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    console.log('[DeviceAuth] Device ID imported');
    return true;
  } catch {
    return false;
  }
};
