import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SleepButtonProps {
  isSleeping: boolean;
  sleepDisplay: string;
  sleepElapsedTime?: string;
  onSleep: () => void;
  onWakeUp: () => void;
  textColor?: string;
}

export default function SleepButton({ 
  isSleeping, 
  sleepDisplay, 
  sleepElapsedTime = '00:00',
  onSleep, 
  onWakeUp,
  textColor
}: SleepButtonProps) {
  const handlePress = () => {
    if (isSleeping) {
      onWakeUp();
    } else {
      onSleep();
    }
  };

  const color = isSleeping ? '#FB8C00' : '#7E57C2';
  const emoji = isSleeping ? '😴' : '🛏️';

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Circular icon */}
      <View style={styles.iconContainer}>
        {/* Pulsing ring when sleeping */}
        {isSleeping && <View style={[styles.pulseRing, { borderColor: color }]} />}
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Text style={styles.iconEmoji}>{emoji}</Text>
        </View>
      </View>
      
      {/* Label */}
      <Text style={[styles.label, textColor && { color: textColor }]}>
        {isSleeping ? sleepElapsedTime : sleepDisplay}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: (SCREEN_WIDTH * 60) / 393,
    height: (SCREEN_WIDTH * 60) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pulseRing: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 60) / 393,
    height: (SCREEN_WIDTH * 60) / 393,
    borderRadius: (SCREEN_WIDTH * 30) / 393,
    borderWidth: 3,
    opacity: 0.5,
  },
  iconCircle: {
    width: (SCREEN_WIDTH * 50) / 393,
    height: (SCREEN_WIDTH * 50) / 393,
    borderRadius: (SCREEN_WIDTH * 25) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  iconEmoji: {
    fontSize: (SCREEN_WIDTH * 28) / 393,
  },
  label: {
    fontSize: (SCREEN_WIDTH * 12) / 393,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
});