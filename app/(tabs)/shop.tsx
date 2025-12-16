import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { useQuillbyStore } from '../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ShopScreen() {
  const { userData } = useQuillbyStore();
  const buddyName = userData.buddyName || 'Quillby';

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Q-Coin Shop</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>🪙 {userData.qCoins}</Text>
        </View>
      </View>

      {/* Coming Soon */}
      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonEmoji}>🛍️</Text>
        <Text style={styles.comingSoonTitle}>Shop Coming Soon!</Text>
        <Text style={styles.comingSoonText}>
          Spend your Q-Coins on:
        </Text>
        <Text style={styles.featureText}>• Outfits for {buddyName}</Text>
        <Text style={styles.featureText}>• Room decorations</Text>
        <Text style={styles.featureText}>• Special accessories</Text>
        <Text style={styles.featureText}>• Power-ups and boosts</Text>
        <Text style={styles.featureText}>• Exclusive themes</Text>
      </View>

      {/* How to Earn */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How to Earn Q-Coins</Text>
        <Text style={styles.infoText}>💧 Log water: +5 coins per glass</Text>
        <Text style={styles.infoText}>📚 Complete focus sessions: +10-50 coins</Text>
        <Text style={styles.infoText}>🍎 Log meals: +10 coins</Text>
        <Text style={styles.infoText}>😴 Good sleep: +20 coins</Text>
        <Text style={styles.infoText}>🔥 Daily streaks: Bonus coins!</Text>
      </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.06,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: '700',
    color: '#333',
  },
  coinBadge: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  coinText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
  },
  comingSoonCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.06,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  comingSoonEmoji: {
    fontSize: SCREEN_WIDTH * 0.15,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  comingSoonTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  comingSoonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
  },
  featureText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    marginVertical: SCREEN_HEIGHT * 0.005,
    alignSelf: 'flex-start',
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  infoText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#2E7D32',
    marginVertical: SCREEN_HEIGHT * 0.005,
    lineHeight: SCREEN_WIDTH * 0.05,
  },
});
