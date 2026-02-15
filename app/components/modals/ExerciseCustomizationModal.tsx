import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView, TextInput } from 'react-native';
import PremiumUpgradeModal from './PremiumUpgradeModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  onStartExercise: (duration: number | null, type: 'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom') => void;
  isPremium?: boolean;
}

export default function ExerciseCustomizationModal({ 
  visible, 
  onClose, 
  onStartExercise,
  isPremium = false
}: ExerciseCustomizationModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom'>('walk');
  const [customDuration, setCustomDuration] = useState<number>(20);
  const [customExerciseName, setCustomExerciseName] = useState<string>('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const durations = [
    { label: 'Quick (5 min)', value: 5, isPremium: false },
    { label: 'Short (10 min)', value: 10, isPremium: false },
    { label: 'Medium (15 min)', value: 15, isPremium: false },
    { label: 'Long (30 min)', value: 30, isPremium: false },
    { label: 'Stopwatch', value: null, isPremium: false },
    { label: '⭐ Custom Time', value: -1, isPremium: true },
  ];

  const exerciseTypes = [
    { label: '🚶 Walk', value: 'walk' as const, isPremium: false },
    { label: '🧘 Stretch', value: 'stretch' as const, isPremium: false },
    { label: '💪 Cardio', value: 'cardio' as const, isPremium: false },
    { label: '⚡ Energizer', value: 'energizer' as const, isPremium: false },
    { label: '⭐ Custom Exercise', value: 'custom' as const, isPremium: true },
  ];

  const handleUpgradePrompt = () => {
    setShowPremiumModal(true);
  };
  
  const handleUpgrade = () => {
    setShowPremiumModal(false);
    alert('🚀 Payment integration coming soon! This will open your app store payment flow.');
  };
  
  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const handleStart = () => {
    const finalDuration = selectedDuration === -1 ? customDuration : selectedDuration;
    onStartExercise(finalDuration, selectedType);
    onClose();
  };

  const isCustomTime = selectedDuration === -1;
  const isCustomExercise = selectedType === 'custom';

  return (
    <>
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
              {exerciseTypes.map((type) => {
                const isLocked = type.isPremium && !isPremium;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      selectedType === type.value && styles.typeButtonSelected,
                      isLocked && styles.typeButtonLocked
                    ]}
                    onPress={() => {
                      if (isLocked) {
                        handleUpgradePrompt();
                      } else {
                        setSelectedType(type.value);
                      }
                    }}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      selectedType === type.value && styles.typeButtonTextSelected,
                      isLocked && styles.typeButtonTextLocked
                    ]}>
                      {isLocked ? `🔒 ${type.label.replace('⭐ ', '')}` : type.label}
                    </Text>
                    {isLocked && (
                      <Text style={styles.premiumBadge}>PREMIUM</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Duration Selection */}
            <Text style={styles.sectionTitle}>Choose Duration:</Text>
            <View style={styles.optionsGrid}>
              {durations.map((duration) => {
                const isLocked = duration.isPremium && !isPremium;
                return (
                  <TouchableOpacity
                    key={duration.label}
                    style={[
                      styles.durationButton,
                      selectedDuration === duration.value && styles.durationButtonSelected,
                      isLocked && styles.durationButtonLocked
                    ]}
                    onPress={() => {
                      if (isLocked) {
                        handleUpgradePrompt();
                      } else {
                        setSelectedDuration(duration.value);
                      }
                    }}
                  >
                    <Text style={[
                      styles.durationButtonText,
                      selectedDuration === duration.value && styles.durationButtonTextSelected,
                      isLocked && styles.durationButtonTextLocked
                    ]}>
                      {isLocked ? `🔒 ${duration.label.replace('⭐ ', '')}` : duration.label}
                    </Text>
                    {isLocked && (
                      <Text style={styles.premiumBadge}>PREMIUM</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Exercise Name Input - Premium Feature */}
            {isPremium && isCustomExercise && (
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>⭐ Custom Exercise Name:</Text>
                <TextInput
                  style={styles.customInput}
                  value={customExerciseName}
                  onChangeText={setCustomExerciseName}
                  placeholder="e.g., Yoga, Swimming, Dancing..."
                  placeholderTextColor="#999"
                  maxLength={30}
                />
              </View>
            )}

            {/* Custom Duration Input - Premium Feature */}
            {isPremium && isCustomTime && (
              <View style={styles.customSection}>
                <Text style={styles.customSectionTitle}>⭐ Custom Duration (minutes):</Text>
                <View style={styles.customTimeContainer}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setCustomDuration(Math.max(1, customDuration - 5))}
                  >
                    <Text style={styles.timeButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.timeInput}
                    value={customDuration.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 1;
                      setCustomDuration(Math.min(120, Math.max(1, num)));
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setCustomDuration(Math.min(120, customDuration + 5))}
                  >
                    <Text style={styles.timeButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.customHint}>💡 Range: 1-120 minutes</Text>
              </View>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {isCustomExercise && isPremium
                  ? `⭐ Custom Exercise: ${customExerciseName || 'Enter exercise name'}`
                  : isCustomTime && isPremium
                  ? `⭐ Custom Duration: ${customDuration} minutes`
                  : selectedDuration === null 
                  ? '⏱️ Stopwatch Mode: Timer counts up. Perfect for flexible workouts!'
                  : selectedDuration === -1
                  ? `⭐ Premium Custom: ${customDuration} minutes`
                  : `⏰ Timer Mode: ${selectedDuration} minute ${selectedType} session`
                }
              </Text>
              {selectedDuration === null && (
                <Text style={[styles.infoText, { marginTop: 8, fontSize: 12, fontStyle: 'italic' }]}>
                  💡 Great for walks, stretches, or any exercise where you want to go at your own pace
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>
                {selectedDuration === null 
                  ? '⏱️ Start Stopwatch Exercise'
                  : isCustomTime && isPremium
                  ? `⭐ Start ${customDuration}min Exercise`
                  : selectedDuration === -1
                  ? `⭐ Start Custom Exercise`
                  : `🚀 Start ${selectedDuration}min Exercise`
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    
    {/* Premium Upgrade Modal */}
    <PremiumUpgradeModal
      visible={showPremiumModal}
      onClose={handleClosePremiumModal}
      onUpgrade={handleUpgrade}
      featureName="Custom Exercise"
    />
    </>
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
  typeButtonLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  typeButtonTextLocked: {
    color: '#999',
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
  durationButtonLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  durationButtonTextLocked: {
    color: '#999',
  },
  premiumBadge: {
    fontSize: 8,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 2,
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

  // Premium Custom Styles
  customSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#FFD54F',
  },

  customSectionTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#F57F17',
    marginBottom: 8,
  },

  customInput: {
    borderWidth: 2,
    borderColor: '#FFB74D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'ChakraPetch_400Regular',
    backgroundColor: '#FFF',
    color: '#333',
  },

  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },

  timeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },

  timeInput: {
    width: 80,
    height: 40,
    borderWidth: 2,
    borderColor: '#FFB74D',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FFF',
  },

  customHint: {
    fontSize: 12,
    color: '#F57F17',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'ChakraPetch_400Regular',
  },
});
