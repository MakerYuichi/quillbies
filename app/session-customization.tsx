import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ScrollView,
  TextInput,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';
import { SessionConfig } from './components/modals/SessionCustomizationModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRESET_SESSIONS = [
  {
    name: 'Pomodoro Classic',
    duration: 25,
    breakDuration: 5,
    sessionType: 'pomodoro' as const,
    autoBreak: true,
    description: '25 min focus + 5 min break',
    isCustom: false,
    isPremium: false
  },
  {
    name: 'Custom Time',
    duration: 30,
    breakDuration: 5,
    sessionType: 'custom' as const,
    autoBreak: true,
    description: 'Set your own focus and break time',
    isCustom: true,
    isPremium: false
  },
  {
    name: 'Deep Focus',
    duration: 50,
    breakDuration: 10,
    sessionType: 'custom' as const,
    autoBreak: true,
    description: '50 min focus + 10 min break',
    isCustom: false,
    isPremium: false
  },
  {
    name: 'Quick Sprint',
    duration: 15,
    breakDuration: 3,
    sessionType: 'custom' as const,
    autoBreak: true,
    description: '15 min focus + 3 min break',
    isCustom: false,
    isPremium: false
  },
];

export default function SessionCustomizationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userData, startFocusSession } = useQuillbyStore();
  
  const deadlineId = params.deadlineId as string | undefined;
  const isPremium = userData.purchasedItems?.includes('premium') || false;
  
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customDuration, setCustomDuration] = useState(30);
  const [customBreak, setCustomBreak] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleStartSession = () => {
    const preset = PRESET_SESSIONS[selectedPreset];
    const config: SessionConfig = {
      duration: preset.isCustom ? customDuration : preset.duration,
      breakDuration: preset.isCustom ? customBreak : preset.breakDuration,
      sessionType: preset.sessionType,
      autoBreak: preset.autoBreak,
      soundEnabled,
    };
    
    const success = startFocusSession(deadlineId, config);
    if (success) {
      router.push('/study-session');
    }
  };

  const isCustomSelected = PRESET_SESSIONS[selectedPreset]?.isCustom;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Customize Your Focus Session</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Session Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Session Type</Text>
          {PRESET_SESSIONS.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.presetCard,
                selectedPreset === index && styles.presetCardSelected,
              ]}
              onPress={() => setSelectedPreset(index)}
            >
              <View style={styles.presetHeader}>
                <Text style={styles.presetName}>{preset.name}</Text>
                <View style={styles.presetBadge}>
                  <Text style={styles.presetBadgeText}>
                    {preset.isCustom && selectedPreset === index ? `${customDuration}m` : `${preset.duration}m`}
                  </Text>
                </View>
              </View>
              <Text style={styles.presetDescription}>
                {preset.isCustom && selectedPreset === index 
                  ? `${customDuration} min focus + ${customBreak} min break` 
                  : preset.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Time Inputs */}
        {isCustomSelected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ Set Custom Times</Text>
            
            <View style={styles.customTimeContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>Focus Time (minutes)</Text>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setCustomDuration(Math.max(5, customDuration - 5))}
                  >
                    <Text style={styles.timeButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.timeInput}
                    value={customDuration.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 5;
                      setCustomDuration(Math.min(180, Math.max(5, num)));
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setCustomDuration(Math.min(180, customDuration + 5))}
                  >
                    <Text style={styles.timeButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.timeInputGroup}>
                <Text style={styles.timeInputLabel}>Break Time (minutes)</Text>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setCustomBreak(Math.max(1, customBreak - 1))}
                  >
                    <Text style={styles.timeButtonText}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.timeInput}
                    value={customBreak.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 1;
                      setCustomBreak(Math.min(30, Math.max(1, num)));
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setCustomBreak(Math.min(30, customBreak + 1))}
                  >
                    <Text style={styles.timeButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🔔 Sound Notifications</Text>
            <TouchableOpacity
              style={[styles.toggle, soundEnabled && styles.toggleActive]}
              onPress={() => setSoundEnabled(!soundEnabled)}
            >
              <Text style={styles.toggleText}>
                {soundEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartSession}
          >
            <Text style={styles.startButtonText}>
              🚀 Start {isCustomSelected ? customDuration : PRESET_SESSIONS[selectedPreset].duration}min Session
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  presetCard: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  presetCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  presetName: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  presetBadge: {
    backgroundColor: '#6200EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  presetBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  presetDescription: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#666',
  },
  customTimeContainer: {
    gap: 15,
  },
  timeInputGroup: {
    marginBottom: 10,
  },
  timeInputLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  timeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6200EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  timeInput: {
    width: 80,
    height: 45,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#333',
  },
  toggle: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#6200EA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    fontWeight: '600',
  },
});
