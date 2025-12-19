import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SleepButtonProps {
  isSleeping: boolean;
  sleepDisplay: string; // "7h today" format from useSleepTracking
  onSleep: () => void;
  onWakeUp: () => void;
}

export default function SleepButton({ isSleeping, sleepDisplay, onSleep, onWakeUp }: SleepButtonProps) {
  const handlePress = () => {
    if (isSleeping) {
      onWakeUp();
    } else {
      onSleep();
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.sleepButton,
        isSleeping && styles.sleepButtonActive
      ]} 
      onPress={handlePress}
    >
      <Text style={styles.sleepTitle}>
        {isSleeping ? '😴 Wake Up' : '🛏️ Sleep'}
      </Text>
      <Text style={styles.sleepSubtitle}>
        {isSleeping ? 'Tap when awake' : sleepDisplay}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sleepButton: {
    flex: 1,
    backgroundColor: '#6A5ACD', // Purple for sleep
    paddingVertical: (SCREEN_HEIGHT * 12) / 852,
    paddingHorizontal: (SCREEN_WIDTH * 8) / 393,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#483D8B',
  },
  sleepButtonActive: {
    backgroundColor: '#FF6B35', // Orange when sleeping (like exercise active)
    borderColor: '#E55100',
  },

  sleepTitle: {
    fontFamily: 'Chakra Petch',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  sleepSubtitle: {
    fontFamily: 'Chakra Petch',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});