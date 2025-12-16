import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRoomState } from '../core/engine';

interface RoomBackgroundProps {
  messPoints: number;
}

export default function RoomBackground({ messPoints }: RoomBackgroundProps) {
  const roomState = getRoomState(messPoints);
  
  const getRoomColor = () => {
    switch (roomState) {
      case 'clean': return '#E8F5E9';
      case 'messy': return '#FFF9C4';
      case 'dirty': return '#FFECB3';
      case 'disaster': return '#FFCCBC';
      default: return '#E8F5E9';
    }
  };
  
  const getRoomDescription = () => {
    switch (roomState) {
      case 'clean': return '✨ Spotless Room';
      case 'messy': return '📚 A few books scattered';
      case 'dirty': return '🗑️ Getting messy...';
      case 'disaster': return '🕸️ Disaster zone!';
      default: return 'Room';
    }
  };
  
  const getMessVisuals = () => {
    if (messPoints <= 3) return ''; // Clean
    if (messPoints <= 7) return '📄📄'; // Some papers
    if (messPoints <= 10) return '📄📄🗑️'; // Papers + trash
    return '📄📄🗑️🕸️'; // Full disaster
  };
  
  return (
    <View style={[styles.container, { backgroundColor: getRoomColor() }]}>
      <Text style={styles.description}>{getRoomDescription()}</Text>
      {getMessVisuals() && (
        <Text style={styles.messVisuals}>{getMessVisuals()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 10,
    minHeight: 100,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  messVisuals: {
    fontSize: 24,
  },
});
