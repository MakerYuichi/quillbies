import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { responsiveWidth, responsiveFontSize, fs } from '../../utils/responsive';

interface CleanButtonProps {
  messPoints: number;
  onPress: () => void;
  textColor?: string;
}

export default function CleanButton({ messPoints, onPress, textColor }: CleanButtonProps) {
  // Only show clean button when mess points > 5
  if (messPoints <= 5) return null;

  const getColor = () => {
    if (messPoints <= 10) return '#FFD54F'; // Yellow for light cleaning
    if (messPoints <= 20) return '#FF9800'; // Orange for medium cleaning
    return '#E53935'; // Red for deep cleaning needed
  };

  const getEmoji = () => {
    if (messPoints <= 10) return '🧹';
    if (messPoints <= 20) return '🧽';
    return '🚿';
  };

  const color = getColor();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Circular icon */}
      <View style={styles.iconContainer}>
        {/* Warning ring for high mess */}
        {messPoints > 15 && <View style={[styles.warningRing, { borderColor: color }]} />}
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Text style={styles.iconEmoji}>{getEmoji()}</Text>
        </View>
      </View>
      
      {/* Label */}
      <Text style={[styles.label, textColor && { color: textColor }]}>Clean</Text>
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
    width: responsiveWidth(60),
    height: responsiveWidth(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  warningRing: {
    position: 'absolute',
    width: responsiveWidth(60),
    height: responsiveWidth(60),
    borderRadius: responsiveWidth(30),
    borderWidth: 3,
    opacity: 0.6,
  },
  iconCircle: {
    width: responsiveWidth(50),
    height: responsiveWidth(50),
    borderRadius: responsiveWidth(25),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F57F17',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  iconEmoji: {
    fontSize: fs(7),
  },
  label: {
    fontSize: fs(3),
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
});