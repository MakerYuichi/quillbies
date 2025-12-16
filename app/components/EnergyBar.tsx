import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EnergyBarProps {
  current: number;
  max: number;
}

export default function EnergyBar({ current, max }: EnergyBarProps) {
  const percentage = (current / max) * 100;
  
  // Color based on energy level
  const getColor = () => {
    if (percentage > 60) return '#4CAF50'; // Green
    if (percentage > 30) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Energy</Text>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barFill, 
            { width: `${percentage}%`, backgroundColor: getColor() }
          ]} 
        />
      </View>
      <Text style={styles.value}>{Math.round(current)} / {max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  barBackground: {
    width: '100%',
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  value: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});
