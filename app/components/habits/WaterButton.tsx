// Water tracking button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WaterButtonProps {
  waterGlasses: number;
  hydrationGoal?: number;
  onPress: () => void;
  textColor?: string;
}

export default function WaterButton({ waterGlasses, hydrationGoal = 8, onPress, textColor }: WaterButtonProps) {
  const HARD_LIMIT = 16; // Maximum glasses allowed per day
  const isAtLimit = waterGlasses >= HARD_LIMIT;
  const progress = Math.min(waterGlasses / hydrationGoal, 1);
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={isAtLimit ? 1 : 0.7}
      disabled={isAtLimit}
    >
      {/* Circular icon with progress ring */}
      <View style={styles.iconContainer}>
        {/* Progress ring background */}
        <View style={[styles.progressRingBg, isAtLimit && { borderColor: 'rgba(150, 150, 150, 0.3)' }]} />
        {/* Progress ring fill */}
        <View style={[styles.progressRing, { 
          borderColor: isAtLimit ? '#999' : '#29B6F6',
          borderTopWidth: 4,
          borderRightWidth: progress > 0.25 ? 4 : 0,
          borderBottomWidth: progress > 0.5 ? 4 : 0,
          borderLeftWidth: progress > 0.75 ? 4 : 0,
        }]} />
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: isAtLimit ? '#999' : '#29B6F6' }]}>
          <Text style={styles.iconEmoji}>💧</Text>
        </View>
      </View>
      
      {/* Label */}
      <Text style={[styles.label, textColor && { color: textColor }, isAtLimit && { color: '#999' }]}>
        {waterGlasses}/{hydrationGoal}
        {isAtLimit && '\n(Max)'}
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
  progressRingBg: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 60) / 393,
    height: (SCREEN_WIDTH * 60) / 393,
    borderRadius: (SCREEN_WIDTH * 30) / 393,
    borderWidth: 4,
    borderColor: 'rgba(41, 182, 246, 0.2)',
  },
  progressRing: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 60) / 393,
    height: (SCREEN_WIDTH * 60) / 393,
    borderRadius: (SCREEN_WIDTH * 30) / 393,
    transform: [{ rotate: '-90deg' }],
  },
  iconCircle: {
    width: (SCREEN_WIDTH * 50) / 393,
    height: (SCREEN_WIDTH * 50) / 393,
    borderRadius: (SCREEN_WIDTH * 25) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#01579B',
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
