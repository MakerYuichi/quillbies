import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FocusScreen() {
  const router = useRouter();
  const { userData, startFocusSession } = useQuillbyStore();
  
  const buddyName = userData.buddyName || 'Quillby';
  const userName = userData.userName || 'Friend';

  const handleStartSession = () => {
    const success = startFocusSession();
    if (success) {
      router.push('/study-session');
    } else {
      alert('Not enough energy! Quillby needs at least 20 energy to focus.');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Focus Session</Text>
        <Text style={styles.subtitle}>{buddyName} is ready to study with you!</Text>
      </View>

      {/* Energy Status */}
      <View style={styles.energyCard}>
        <Text style={styles.energyLabel}>Current Energy</Text>
        <Text style={styles.energyValue}>⚡ {Math.round(userData.energy)} / {userData.maxEnergyCap}</Text>
        <View style={styles.energyBar}>
          <View 
            style={[
              styles.energyFill, 
              { width: `${(userData.energy / userData.maxEnergyCap) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Start Session Button */}
      <TouchableOpacity
        style={[styles.startButton, userData.energy < 20 && styles.startButtonDisabled]}
        onPress={handleStartSession}
        disabled={userData.energy < 20}
      >
        <Text style={styles.startButtonText}>
          {userData.energy >= 20 ? '📚 Start Focus Session' : '😴 Too Tired to Focus'}
        </Text>
        <Text style={styles.startButtonSubtext}>
          {userData.energy >= 20 
            ? 'Begin a Pomodoro session' 
            : 'Need at least 20 energy'}
        </Text>
      </TouchableOpacity>

      {/* Session Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How Focus Sessions Work</Text>
        <Text style={styles.infoText}>• 25-minute focused study periods</Text>
        <Text style={styles.infoText}>• 5-minute breaks between sessions</Text>
        <Text style={styles.infoText}>• Earn Q-Coins for completing sessions</Text>
        <Text style={styles.infoText}>• Stay in the app to maintain focus</Text>
        <Text style={styles.infoText}>• {buddyName} will track your progress!</Text>
      </View>

      {/* Coming Soon */}
      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonTitle}>🚀 Coming Soon</Text>
        <Text style={styles.comingSoonText}>• Custom session lengths</Text>
        <Text style={styles.comingSoonText}>• Study goals and targets</Text>
        <Text style={styles.comingSoonText}>• Focus streaks</Text>
        <Text style={styles.comingSoonText}>• Study statistics</Text>
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
  energyCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.02,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  energyLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  energyValue: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  energyBar: {
    height: 10,
    backgroundColor: '#FFECB3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#FFB300',
    borderRadius: 5,
  },
  startButton: {
    backgroundColor: '#6200EA',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  startButtonSubtext: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  infoTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  infoText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    marginVertical: SCREEN_HEIGHT * 0.005,
    lineHeight: SCREEN_WIDTH * 0.05,
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
