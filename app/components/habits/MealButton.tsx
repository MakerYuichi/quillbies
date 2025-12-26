// Meal tracking button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MealButtonProps {
  mealsLogged: number;
  portionDescription: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function MealButton({ mealsLogged, portionDescription, onPress, disabled }: MealButtonProps) {
  // Get color based on meal count
  const getColor = () => {
    if (mealsLogged < 3) return '#FB8C00'; // Orange
    if (mealsLogged === 3) return '#FFB300'; // Yellow warning
    return '#E53935'; // Red danger
  };

  const getEmoji = () => {
    if (mealsLogged < 3) return '🍎';
    if (mealsLogged === 3) return '🍽️';
    return '⚠️';
  };

  const color = getColor();
  const progress = Math.min(mealsLogged / 3, 1.33); // Allow overeating visual

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Circular icon with progress ring */}
      <View style={styles.iconContainer}>
        {/* Progress ring background */}
        <View style={[styles.progressRingBg, { borderColor: `${color}33` }]} />
        {/* Progress ring fill */}
        <View style={[styles.progressRing, { 
          borderColor: color,
          borderTopWidth: 4,
          borderRightWidth: progress > 0.25 ? 4 : 0,
          borderBottomWidth: progress > 0.5 ? 4 : 0,
          borderLeftWidth: progress > 0.75 ? 4 : 0,
        }]} />
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Text style={styles.iconEmoji}>{getEmoji()}</Text>
        </View>
      </View>
      
      {/* Label */}
      <Text style={styles.label}>{mealsLogged}/3</Text>
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
    shadowColor: '#BF360C',
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