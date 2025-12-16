// Speech bubble component with dynamic font sizing
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SpeechBubbleProps {
  message: string;
}

export default function SpeechBubble({ message }: SpeechBubbleProps) {
  // Calculate dynamic font size based on message length
  const getDynamicFontSize = () => {
    const length = message.length;
    if (length < 50) return (SCREEN_WIDTH * 20) / 393; // Normal size
    if (length < 100) return (SCREEN_WIDTH * 16) / 393; // Smaller
    if (length < 150) return (SCREEN_WIDTH * 14) / 393; // Even smaller
    return (SCREEN_WIDTH * 12) / 393; // Smallest
  };

  return (
    <View style={styles.speechBubble}>
      <Text style={[styles.speechText, { fontSize: getDynamicFontSize() }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  speechBubble: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 355) / 393,
    height: (SCREEN_HEIGHT * 87) / 852,
    left: (SCREEN_WIDTH * 17) / 393,
    top: (SCREEN_HEIGHT * 647) / 852,
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    padding: (SCREEN_WIDTH * 20) / 450,
    justifyContent: 'center',
    zIndex: 15,
  },
  speechText: {
    fontFamily: 'Chakra Petch',
    lineHeight: (SCREEN_HEIGHT * 26) / 852,
    color: '#000000',
    textAlign: 'center',
  },
});
