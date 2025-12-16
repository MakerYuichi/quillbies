import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FocusMeterProps {
  score: number;
  duration: number; // in seconds
}

export default function FocusMeter({ score, duration }: FocusMeterProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Focus Session</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Focus Score</Text>
        <Text style={styles.scoreValue}>{Math.round(score)}</Text>
      </View>
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Duration</Text>
        <Text style={styles.timeValue}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6200EA',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#E1BEE7',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#E1BEE7',
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
  },
});
