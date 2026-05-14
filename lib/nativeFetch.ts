/**
 * nativeFetch.ts
 *
 * A fetch-compatible wrapper that uses the NativeHttpModule (OkHttp directly)
 * instead of React Native's JS fetch bridge. This bypasses the broken fetch
 * behaviour on certain WiFi networks where the JS bridge hangs indefinitely.
 *
 * Falls back to the standard fetch if the native module is unavailable (iOS,
 * web, or environments where the module isn't loaded).
 */

import { NativeModules, Platform } from 'react-native';

const { NativeHttpModule } = NativeModules;

const isNativeAvailable = Platform.OS === 'android' && !!NativeHttpModule;

if (isNativeAvailable) {
  console.log('[NativeFetch] Using native OkHttp bridge for Android');
} else {
  console.log('[NativeFetch] Native module not available, using standard fetch');
}

/**
 * Converts a Headers object / plain object / array to a plain string record.
 */
const normalizeHeaders = (headers: HeadersInit | undefined): Record<string, string> => {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => { result[key] = value; });
    return result;
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers as Record<string, string>;
};

/**
 * fetch-compatible function backed by native OkHttp on Android.
 */
export const nativeFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  if (!isNativeAvailable) {
    console.log('[NativeFetch] Falling back to standard fetch for:', typeof input === 'string' ? input.substring(0, 50) : 'request');
    return fetch(input, init);
  }

  const url = typeof input === 'string'
    ? input
    : input instanceof URL
    ? input.href
    : (input as Request).url;

  const method = (init?.method || 'GET').toUpperCase();
  const headers = normalizeHeaders(init?.headers);
  const body = init?.body != null ? String(init.body) : null;

  console.log('[NativeFetch] Native OkHttp →', method, url.substring(0, 60));

  try {
    const result: { status: number; body: string; headers: Record<string, string> } =
      await NativeHttpModule.request(method, url, headers, body);

    console.log('[NativeFetch] ✓ Response:', result.status, url.substring(0, 60));

    const responseHeaders = new Headers(result.headers);
    const response = new Response(result.body, {
      status: result.status,
      headers: responseHeaders,
    });

    return response;
  } catch (err: any) {
    console.warn('[NativeFetch] ✗ Failed:', err?.message, 'for', url.substring(0, 60));
    throw new TypeError(err?.message || 'Network request failed');
  }
};
