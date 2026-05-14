// lib/networkWarmup.ts
// Warms up the connection to Supabase before any auth/data calls.
// On some ISP networks (home broadband with DPI), the first POST to an unknown
// domain gets held for inspection. A cheap GET request first causes the ISP to
// whitelist the domain so subsequent POSTs (signInAnonymously, etc.) go through immediately.

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://kkhruuvwqodyhmspqlma.supabase.co';

export const warmupSupabaseConnection = async (): Promise<void> => {
  try {
    console.log('[Network] Warming up Supabase connection...');

    // First test basic internet connectivity using native OkHttp
    try {
      const { nativeFetch } = await import('./nativeFetch');
      const connectTest = await Promise.race([
        nativeFetch('https://www.google.com', { method: 'HEAD' }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);
      if (!connectTest) {
        console.warn('[Network] Basic internet check timed out — device may have no internet on this WiFi');
      } else {
        console.log('[Network] Basic internet: OK');
      }
    } catch (e) {
      console.warn('[Network] Basic internet check failed:', e);
    }

    const { nativeFetch } = await import('./nativeFetch');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await nativeFetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('[Network] Supabase connection warmed up successfully');
  } catch (e: any) {
    if (e?.name !== 'AbortError') {
      console.log('[Network] Warmup completed (with expected auth error — that is fine)');
    } else {
      console.warn('[Network] Supabase warmup timed out — WiFi may be blocking Supabase specifically');
    }
  }
};
