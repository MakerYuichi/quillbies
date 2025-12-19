import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface QuillbyPetProps {
  energy: number;
  maxEnergy: number;
  messPoints: number;
}

export default function QuillbyPet({ energy, maxEnergy, messPoints }: QuillbyPetProps) {
  const energyPercentage = (energy / maxEnergy) * 100;
  const capPercentage = (maxEnergy / 100) * 100; // Max cap as percentage of 100
  
  // Determine Quillby's expression based on MAX CAP (reflects sleep/habits)
  const getExpression = () => {
    if (capPercentage === 100 && energyPercentage > 70) return '(◕‿◕)'; // Full capacity & energized
    if (capPercentage >= 80) return '(・_・)'; // Small penalty
    if (capPercentage >= 60) return '(╥_╥)'; // Moderate penalty
    return '(×_×)'; // Severe penalty
  };
  
  const getMessage = () => {
    if (capPercentage === 100) return "I'm ready to focus!";
    if (capPercentage >= 80) return "A bit tired, but let's go!";
    if (capPercentage >= 60) return "Feeling sluggish today...";
    return "I need proper rest to help you...";
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.petContainer}>
        <Text style={styles.petFace}>{getExpression()}</Text>
        <Text style={styles.petName}>Quillby</Text>
      </View>
      <View style={styles.speechBubble}>
        <Text style={styles.message}>{getMessage()}</Text>
      </View>
      {messPoints > 3 && (
        <View style={styles.messIndicator}>
          <Text style={styles.messText}>🗑️ Room Mess: {messPoints}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  petContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 30,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FF9800',
  },
  petFace: {
    fontSize: 64,
    marginBottom: 10,
  },
  petName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E65100',
  },
  speechBubble: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  message: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  messIndicator: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  messText: {
    fontSize: 12,
    color: '#C62828',
  },
});
