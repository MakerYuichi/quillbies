// lib/adManager.ts
// Central ad management — handles loading, frequency limits, and premium gating

import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
  MobileAds,
} from 'react-native-google-mobile-ads';

// ─── Ad Unit IDs ────────────────────────────────────────────────────────────
const IS_PRODUCTION = true; // flip to false to use Google test ad IDs

export const AD_UNITS = {
  BANNER: IS_PRODUCTION
    ? (process.env.EXPO_PUBLIC_ADMOB_BANNER_ID ?? TestIds.ADAPTIVE_BANNER)
    : TestIds.ADAPTIVE_BANNER,

  INTERSTITIAL: IS_PRODUCTION
    ? (process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID ?? TestIds.INTERSTITIAL)
    : TestIds.INTERSTITIAL,

  REWARDED: IS_PRODUCTION
    ? (process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID ?? TestIds.REWARDED)
    : TestIds.REWARDED,
};

// ─── Init state ──────────────────────────────────────────────────────────────
let adsReady = false;
const readyCallbacks: Array<() => void> = [];

export const isAdsReady = () => adsReady;

export const onAdsReady = (cb: () => void) => {
  if (adsReady) {
    cb();
  } else {
    readyCallbacks.push(cb);
  }
};

// ─── Frequency limits ────────────────────────────────────────────────────────
const INTERSTITIAL_COOLDOWN_MS = 5 * 60 * 1000; // 5 min between interstitials
let lastInterstitialTime = 0;
let sessionInterstitialCount = 0;
const MAX_INTERSTITIALS_PER_SESSION = 3;

// ─── Interstitial ────────────────────────────────────────────────────────────
let interstitialAd: InterstitialAd | null = null;
let interstitialLoaded = false;

export const preloadInterstitial = () => {
  try {
    interstitialAd = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: false,
    });

    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
      console.log('[Ads] Interstitial loaded');
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      interstitialLoaded = false;
      console.warn('[Ads] Interstitial error:', error);
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoaded = false;
      // Preload next one
      preloadInterstitial();
    });

    interstitialAd.load();
  } catch (e) {
    console.warn('[Ads] Failed to preload interstitial:', e);
  }
};

/**
 * Show interstitial if:
 * - User is not premium
 * - Cooldown has passed
 * - Session limit not reached
 * - Ad is loaded
 */
export const showInterstitial = async (isPremium: boolean): Promise<boolean> => {
  if (isPremium) return false;

  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
    console.log('[Ads] Interstitial skipped — cooldown active');
    return false;
  }

  if (sessionInterstitialCount >= MAX_INTERSTITIALS_PER_SESSION) {
    console.log('[Ads] Interstitial skipped — session limit reached');
    return false;
  }

  if (!interstitialLoaded || !interstitialAd) {
    console.log('[Ads] Interstitial not ready');
    preloadInterstitial(); // try to load for next time
    return false;
  }

  try {
    lastInterstitialTime = now;
    sessionInterstitialCount++;
    await interstitialAd.show();
    return true;
  } catch (e) {
    console.warn('[Ads] Failed to show interstitial:', e);
    return false;
  }
};

// ─── Rewarded ────────────────────────────────────────────────────────────────
let rewardedAd: RewardedAd | null = null;
let rewardedLoaded = false;

export const preloadRewarded = () => {
  try {
    rewardedAd = RewardedAd.createForAdRequest(AD_UNITS.REWARDED, {
      requestNonPersonalizedAdsOnly: false,
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      rewardedLoaded = true;
      console.log('[Ads] Rewarded ad loaded');
    });

    rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      rewardedLoaded = false;
      console.warn('[Ads] Rewarded error:', error.message ?? error, '| code:', (error as any).code ?? 'unknown');
    });

    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      rewardedLoaded = false;
      preloadRewarded();
    });

    rewardedAd.load();
  } catch (e) {
    console.warn('[Ads] Failed to preload rewarded:', e);
  }
};

// How long to wait for a rewarded ad to load before giving up (ms)
const REWARDED_LOAD_TIMEOUT_MS = 10_000;

/**
 * Show rewarded ad. Returns the reward amount if earned, null otherwise.
 * If the ad isn't loaded yet, waits up to REWARDED_LOAD_TIMEOUT_MS for it.
 */
export const showRewardedAd = (isPremium: boolean): Promise<number | null> => {
  return new Promise((resolve) => {
    // Premium users can still watch rewarded ads for bonuses

    const showAd = () => {
      let rewardEarned = false;
      let rewardAmount = 0;

      const earnListener = rewardedAd!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          rewardEarned = true;
          rewardAmount = reward.amount;
          console.log('[Ads] Reward earned:', reward.amount, reward.type);
        }
      );

      const closeListener = rewardedAd!.addAdEventListener(AdEventType.CLOSED, () => {
        earnListener();
        closeListener();
        resolve(rewardEarned ? rewardAmount : null);
      });

      const errorListener = rewardedAd!.addAdEventListener(AdEventType.ERROR, (e) => {
        console.warn('[Ads] Rewarded show error:', e);
        earnListener();
        closeListener();
        errorListener();
        resolve(null);
      });

      try {
        rewardedAd!.show();
      } catch (e) {
        console.warn('[Ads] Failed to show rewarded:', e);
        resolve(null);
      }
    };

    if (rewardedLoaded && rewardedAd) {
      // Ad is already ready — show immediately
      showAd();
    } else {
      // Ad not ready yet — wait for the existing load or kick off a new one
      console.log('[Ads] Rewarded ad not ready — waiting for load...');

      // Only call preloadRewarded if there's no ad instance at all
      if (!rewardedAd) {
        preloadRewarded();
      }

      let settled = false;

      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          console.log('[Ads] Rewarded ad load timed out');
          resolve(null);
        }
      }, REWARDED_LOAD_TIMEOUT_MS);

      // Listen directly on the current ad instance for load/error
      const currentAd = rewardedAd;
      if (currentAd) {
        const loadedUnsub = currentAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            loadedUnsub();
            errorUnsub();
            showAd();
          }
        });

        const errorUnsub = currentAd.addAdEventListener(AdEventType.ERROR, () => {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            loadedUnsub();
            errorUnsub();
            console.log('[Ads] Rewarded ad failed to load');
            resolve(null);
          }
        });
      } else {
        // No ad instance at all — poll as fallback
        const poll = setInterval(() => {
          if (settled) { clearInterval(poll); return; }
          if (rewardedLoaded && rewardedAd) {
            settled = true;
            clearTimeout(timeout);
            clearInterval(poll);
            showAd();
          }
        }, 250);
      }
    }
  });
};

// ─── Initialize ──────────────────────────────────────────────────────────────
export const initializeAds = async () => {
  try {
    await MobileAds().initialize();
    console.log('[Ads] MobileAds initialized');
    adsReady = true;
    readyCallbacks.forEach(cb => cb());
    readyCallbacks.length = 0;
    preloadInterstitial();
    preloadRewarded();
  } catch (e) {
    console.warn('[Ads] Failed to initialize:', e);
  }
};
