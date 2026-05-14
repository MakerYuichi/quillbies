// app/components/ads/BannerAdView.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNITS, isAdsReady, onAdsReady } from '../../../lib/adManager';

interface Props {
  isPremium?: boolean;
  size?: BannerAdSize;
  style?: object;
}

export default function BannerAdView({
  isPremium = false,
  size = BannerAdSize.BANNER,
  style,
}: Props) {
  const [sdkReady, setSdkReady] = useState(isAdsReady());

  useEffect(() => {
    if (!sdkReady) {
      onAdsReady(() => setSdkReady(true));
    }
  }, []);

  if (isPremium || !sdkReady) return null;

  console.log('[Ads] Rendering BannerAd with unit:', AD_UNITS.BANNER);
  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={AD_UNITS.BANNER}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => console.log('[Ads] Banner loaded ✓')}
        onAdFailedToLoad={(error) => console.warn('[Ads] Banner failed:', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    minHeight: 50, // Reserve space so layout doesn't jump when ad loads
    backgroundColor: '#f0f0f0',
  },
});
