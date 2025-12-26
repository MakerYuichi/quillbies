import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  onStartExercise: (duration: number | null, type: 'walk' | 'stretch' | 'cardio' | 'energizer') => void;
}

export default function ExerciseCustomizationModal({ 
  visible, 
  onClose, 
  onStartExercise 
}: ExerciseCustomizationModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'walk' | 'stretch' | 'cardio' | 'energizer'>('walk');

  const durations = [
    { label: 'Quick (5 min)', value: 5 },
    { label: 'Short (10 min)', value: 10 },
    { label: 'Medium (15 min)', value: 15 },
    { label: 'Long (30 min)', value: 30 },
    { label: 'Stopwatch', value: null },
  ];

  const exerciseTypes = [
    { label: '🚶 Walk', value: 'walk' as const },
    { label: '🧘 Stretch', value: 'stretch' as const },
    { label: '💪 Cardio', value: 'cardio' as const },
    { label: '⚡ Energizer', value: 'energizer' as const },
  ];

  const handleStart = () => {
    onStartExercise(selectedDuration, selectedType);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>🏃 Exercise Session</Text>
            
            {/* Exercise Type Selection */}
            <Text style={styles.sectionTitle}>Choose Exercise Type:</Text>
            <View style={styles.optionsGrid}>
              {exerciseTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    selectedType === type.value && styles.typeButtonSelected
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    selectedType === type.value && styles.typeButtonTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration Selection */}
            <Text style={styles.sectionTitle}>Choose Duration:</Text>
            <View style={styles.optionsGrid}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration.label}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration.value && styles.durationButtonSelected
                  ]}
                  onPress={() => setSelectedDuration(duration.value)}
                >
                  <Text style={[
                    styles.durationButtonText,
                    selectedDuration === duration.value && styles.durationButtonTextSelected
                  ]}>
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {selectedDuration === null 
                  ? '⏱️ Stopwatch mode: Timer counts up. Tap "Finish" when done.'
                  : `⏰ Timer mode: Counts down from ${selectedDuration} minutes.`
                }
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start Exercise 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#555',
    marginTop: 16,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextSelected: {
    color: '#4CAF50',
  },
  durationButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  durationButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#666',
  },
  durationButtonTextSelected: {
    color: '#2196F3',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  infoText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#666',
  },
  startButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});
