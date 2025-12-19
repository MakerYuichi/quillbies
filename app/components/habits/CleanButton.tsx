import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CleanButtonProps {
  messPoints: number;
  onPress: () => void;
}

export default function CleanButton({ messPoints, onPress }: CleanButtonProps) {
  // Only show clean button when mess points > 5
  if (messPoints <= 5) return null;

  const getCleanButtonText = () => {
    const messText = messPoints.toFixed(1);
    if (messPoints <= 10) return `🧹 Tidy Up (${messText})`;
    if (messPoints <= 20) return `🧽 Clean Room (${messText})`;
    return `🚿 Deep Clean (${messText})`;
  };

  const getCleanButtonColor = () => {
    if (messPoints <= 10) return '#FFC107'; // Yellow for light cleaning
    if (messPoints <= 20) return '#FF9800'; // Orange for medium cleaning
    return '#F44336'; // Red for deep cleaning needed
  };

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: getCleanButtonColor() }]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: getCleanButtonColor() }]}>
        {getCleanButtonText()}
      </Text>
      <Text style={styles.messText}>
        Mess: {messPoints}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: (SCREEN_WIDTH * 12) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 8) / 393,
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: (SCREEN_WIDTH * 50) / 393,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  buttonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    textAlign: 'center',
    lineHeight: (SCREEN_WIDTH * 16) / 393,
  },
  messText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: '#666',
    marginTop: 2,
  },
});