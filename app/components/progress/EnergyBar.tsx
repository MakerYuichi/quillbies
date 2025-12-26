import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EnergyBarProps {
  current: number;
  max: number;
}

export default function EnergyBar({ current, max }: EnergyBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  
  // Gradient colors based on energy level
  const getGradientColors = () => {
    if (percentage > 60) return ['#66BB6A', '#43A047']; // Green gradient
    if (percentage > 30) return ['#FFA726', '#FB8C00']; // Orange gradient
    return ['#EF5350', '#E53935']; // Red gradient
  };
  
  // Glow color for the bar
  const getGlowColor = () => {
    if (percentage > 60) return '#4CAF50';
    if (percentage > 30) return '#FF9800';
    return '#F44336';
  };

  const gradientColors = getGradientColors();
  const glowColor = getGlowColor();
  
  return (
    <View style={styles.container}>
      {/* Energy icon and label */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚡</Text>
        </View>
        <Text style={styles.label}>Energy</Text>
        <Text style={styles.value}>{Math.round(current)}/{max}</Text>
      </View>
      
      {/* Energy bar with gradient */}
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          {/* Animated gradient fill */}
          {percentage > 0 && (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.barFill,
                { 
                  width: `${percentage}%`,
                  shadowColor: glowColor,
                }
              ]}
            >
              {/* Shine effect overlay */}
              <View style={styles.shineOverlay} />
            </LinearGradient>
          )}
        </View>
        
        {/* Percentage indicator */}
        {percentage > 15 && (
          <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#F57F17',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  barContainer: {
    position: 'relative',
    width: '100%',
  },
  barBackground: {
    width: '100%',
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  percentageText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
