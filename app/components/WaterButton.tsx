// Water tracking button component
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WaterButtonProps {
  waterGlasses: number;
  onPress: () => void;
}

export default function WaterButton({ waterGlasses, onPress }: WaterButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.waterButton}
      onPress={onPress}
    >
      <Text style={styles.waterButtonText}>
        💧 Water ({waterGlasses}/8+)
      </Text>
      <Text style={styles.waterButtonSubtext}>
        {waterGlasses < 8 
          ? `${8 - waterGlasses} to go!`
          : 'Goal met! 🎉'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  waterButton: {
    flex: 1,
    backgroundColor: '#4FC3F7',
    padding: (SCREEN_WIDTH * 12) / 393,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0288D1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  waterButtonText: {
    color: '#FFFFFF',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    fontWeight: '700',
    marginBottom: 3,
  },
  waterButtonSubtext: {
    color: '#FFFFFF',
    fontSize: (SCREEN_WIDTH * 11) / 393,
    opacity: 0.9,
  },
});
