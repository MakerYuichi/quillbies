// Exercise button component with timer functionality
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseButtonProps {
  isExercising: boolean;
  exerciseDisplay: string;
  onStartExercise: () => void;
  onFinishExercise: () => void;
}

export default function ExerciseButton({ 
  isExercising, 
  exerciseDisplay, 
  onStartExercise, 
  onFinishExercise 
}: ExerciseButtonProps) {
  
  return (
    <TouchableOpacity
      style={[
        styles.exerciseButton,
        isExercising && styles.exerciseButtonActive
      ]}
      onPress={isExercising ? onFinishExercise : onStartExercise}
    >
      <Text style={[
        styles.exerciseButtonText,
        isExercising && styles.exerciseButtonTextActive
      ]}>
        {isExercising ? '✅ Finish' : '🏃 Exercise'}
      </Text>
      <Text style={[
        styles.exerciseButtonSubtext,
        isExercising && styles.exerciseButtonSubtextActive
      ]}>
        {isExercising ? 'Tap when done' : exerciseDisplay}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  exerciseButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // Green for exercise
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
    borderColor: '#388E3C',
  },
  exerciseButtonActive: {
    backgroundColor: '#FF9800', // Orange when exercising
    borderColor: '#F57C00',
  },
  exerciseButtonText: {
    fontFamily: 'Chakra Petch',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  exerciseButtonTextActive: {
    color: '#FFFFFF',
  },
  exerciseButtonSubtext: {
    fontFamily: 'Chakra Petch',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  exerciseButtonSubtextActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});