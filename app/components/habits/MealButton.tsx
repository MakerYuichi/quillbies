// Meal tracking button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MealButtonProps {
  mealsLogged: number;
  portionDescription: string; // "Small", "Normal", "Large"
  onPress: () => void;
  disabled?: boolean;
}

export default function MealButton({ mealsLogged, portionDescription, onPress, disabled }: MealButtonProps) {
  // Button text changes based on meal count
  const getButtonText = () => {
    if (mealsLogged < 3) {
      return `🍎 Meal (${mealsLogged}/3)`;
    } else if (mealsLogged === 3) {
      return `🍽️ Extra Meal`;
    } else {
      return `⚠️ Overeating (${mealsLogged})`;
    }
  };
  
  const getSubtext = () => {
    if (mealsLogged < 3) {
      return `${portionDescription} portion`;
    } else if (mealsLogged === 3) {
      return 'Proceed with caution';
    } else {
      return 'Consequences ahead!';
    }
  };
  
  // Button color changes based on meal count
  const getButtonStyle = () => {
    if (mealsLogged < 3) {
      return styles.mealButton; // Normal orange
    } else if (mealsLogged === 3) {
      return [styles.mealButton, styles.mealButtonWarning]; // Yellow warning
    } else {
      return [styles.mealButton, styles.mealButtonDanger]; // Red danger
    }
  };

  return (
    <TouchableOpacity 
      style={getButtonStyle()}
      onPress={onPress}
      // Never disabled - always allow pressing
    >
      <Text style={styles.mealButtonText}>
        {getButtonText()}
      </Text>
      <Text style={styles.mealButtonSubtext}>
        {getSubtext()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mealButton: {
    flex: 1,
    backgroundColor: '#FF9800', // Orange color
    padding: (SCREEN_WIDTH * 12) / 393,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F57C00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mealButtonText: {
    color: '#FFFFFF',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    fontWeight: '700',
    marginBottom: 3,
  },
  mealButtonSubtext: {
    color: '#FFFFFF',
    fontSize: (SCREEN_WIDTH * 11) / 393,
    opacity: 0.9,
  },
  mealButtonWarning: {
    backgroundColor: '#FFC107', // Yellow warning
    borderColor: '#FF8F00',
  },
  mealButtonDanger: {
    backgroundColor: '#F44336', // Red danger
    borderColor: '#D32F2F',
  },
});