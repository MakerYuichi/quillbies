// Exercise button component with timer functionality
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseButtonProps {
  isExercising: boolean;
  exerciseDisplay: string;
  exerciseElapsedTime?: string;
  onStartExercise: () => void;
  onFinishExercise: () => void;
  textColor?: string;
}

export default function ExerciseButton({ 
  isExercising, 
  exerciseDisplay,
  exerciseElapsedTime = '00:00',
  onStartExercise, 
  onFinishExercise,
  textColor
}: ExerciseButtonProps) {
  const color = isExercising ? '#FB8C00' : '#43A047';
  const emoji = isExercising ? '✅' : '🏃';
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={isExercising ? onFinishExercise : onStartExercise}
      activeOpacity={0.7}
    >
      {/* Circular icon */}
      <View style={styles.iconContainer}>
        {/* Pulsing ring when exercising */}
        {isExercising && <View style={[styles.pulseRing, { borderColor: color }]} />}
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Text style={styles.iconEmoji}>{emoji}</Text>
        </View>
      </View>
      
      {/* Label */}
      <Text style={[styles.label, textColor && { color: textColor }]}>
        {isExercising ? exerciseElapsedTime : exerciseDisplay}
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
    shadowColor: '#1B5E20',
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