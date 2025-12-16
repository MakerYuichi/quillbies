import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { useQuillbyStore } from '../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StatsScreen() {
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
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your journey with {buddyName}</Text>
      </View>

      {/* Current Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Current Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Energy:</Text>
          <Text style={styles.statValue}>⚡ {Math.round(userData.energy)} / {userData.maxEnergyCap}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Q-Coins:</Text>
          <Text style={styles.statValue}>🪙 {userData.qCoins}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Streak:</Text>
          <Text style={styles.statValue}>🔥 {userData.currentStreak} days</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Mess Points:</Text>
          <Text style={styles.statValue}>🧹 {userData.messPoints}</Text>
        </View>
      </View>

      {/* Today's Progress */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Breakfast:</Text>
          <Text style={styles.statValue}>{userData.ateBreakfast ? '✅ Logged' : '⬜ Not logged'}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Water:</Text>
          <Text style={styles.statValue}>💧 {userData.waterGlasses} / 8 glasses</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Sleep:</Text>
          <Text style={styles.statValue}>😴 {userData.sleepHours} hours</Text>
        </View>
      </View>

      {/* Coming Soon */}
      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonTitle}>📊 More Stats Coming Soon!</Text>
        <Text style={styles.comingSoonText}>• Study time analytics</Text>
        <Text style={styles.comingSoonText}>• Focus session history</Text>
        <Text style={styles.comingSoonText}>• Weekly/monthly reports</Text>
        <Text style={styles.comingSoonText}>• Habit completion rates</Text>
        <Text style={styles.comingSoonText}>• Achievement badges</Text>
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
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  statsCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  cardTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  statLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  statValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  comingSoonCard: {
    backgroundColor: '#E3F2FD',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  comingSoonTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  comingSoonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#1976D2',
    marginVertical: SCREEN_HEIGHT * 0.005,
  },
});
