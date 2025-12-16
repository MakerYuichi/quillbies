// Sleep/Wake button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepButtonProps {
  isSleeping: boolean;
  sleepDisplay: string; // e.g., "7h today"
  onSleep: () => void;
  onWakeUp: () => void;
}

export default function SleepButton({ isSleeping, sleepDisplay, onSleep, onWakeUp }: SleepButtonProps) {
  if (isSleeping) {
    // Wake button - full width
    return (
      <TouchableOpacity 
        style={[styles.sleepButton, styles.wakeButton, styles.fullWidthButton]}
        onPress={onWakeUp}
      >
        <Text style={styles.sleepButtonText}>
          ☀️ Woke Up
        </Text>
        <Text style={styles.sleepButtonSubtext}>
          Tap when you wake up
        </Text>
      </TouchableOpacity>
    );
  }

  // Sleep button - half width
  return (
    <TouchableOpacity 
      style={styles.sleepButton}
      onPress={onSleep}
    >
      <Text style={styles.sleepButtonText}>
        😴 Sleep
      </Text>
      <Text style={styles.sleepButtonSubtext}>
        {sleepDisplay}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sleepButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    padding: (SCREEN_WIDTH * 12) / 393,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6A1B9A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sleepButtonText: {
    color: '#FFFFFF',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    fontWeight: '700',
    marginBottom: 3,
  },
  sleepButtonSubtext: {
    color: '#FFFFFF',
    fontSize: (SCREEN_WIDTH * 11) / 393,
    opacity: 0.9,
  },
  wakeButton: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00',
  },
  fullWidthButton: {
    flex: 1,
    width: '100%',
  },
});
