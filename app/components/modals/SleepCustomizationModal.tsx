import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SleepCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  onStartSleep: (duration: number | null) => void;
}

export default function SleepCustomizationModal({ 
  visible, 
  onClose, 
  onStartSleep 
}: SleepCustomizationModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const durations = [
    { label: 'Power Nap (20 min)', value: 20 },
    { label: 'Short Nap (45 min)', value: 45 },
    { label: 'Quick Sleep (2 hours)', value: 120 },
    { label: 'Normal Sleep (6 hours)', value: 360 },
    { label: 'Long Sleep (8 hours)', value: 480 },
    { label: 'Stopwatch', value: null },
  ];

  const handleStart = () => {
    onStartSleep(selectedDuration);
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
            <Text style={styles.title}>💤 Sleep Session</Text>
            
            {/* Duration Selection */}
            <Text style={styles.sectionTitle}>How long do you want to sleep?</Text>
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
                  ? '⏱️ Stopwatch mode: Timer counts up. Tap "Wake Up" when you wake up.'
                  : `⏰ Timer mode: Counts up to ${selectedDuration >= 60 ? `${Math.floor(selectedDuration / 60)}h ${selectedDuration % 60}m` : `${selectedDuration}m`}.`
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
              <Text style={styles.startButtonText}>Start Sleeping 😴</Text>
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
    backgroundColor: '#F3E5F5',
    borderColor: '#7E57C2',
  },
  durationButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#666',
  },
  durationButtonTextSelected: {
    color: '#7E57C2',
  },
  infoBox: {
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#CE93D8',
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
    backgroundColor: '#7E57C2',
    alignItems: 'center',
  },
  startButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});