import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  ScrollView 
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SessionCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  onStartSession: (config: SessionConfig) => void;
}

export interface SessionConfig {
  duration: number; // in minutes
  breakDuration: number; // in minutes
  sessionType: 'pomodoro' | 'custom' | 'flow';
  autoBreak: boolean;
  soundEnabled: boolean;
}

const PRESET_SESSIONS = [
  {
    name: 'Pomodoro Classic',
    duration: 25,
    breakDuration: 5,
    sessionType: 'pomodoro' as const,
    autoBreak: true,
    description: '25 min focus + 5 min break'
  },
  {
    name: 'Deep Focus',
    duration: 50,
    breakDuration: 10,
    sessionType: 'custom' as const,
    autoBreak: true,
    description: '50 min focus + 10 min break'
  },
  {
    name: 'Quick Sprint',
    duration: 15,
    breakDuration: 3,
    sessionType: 'custom' as const,
    autoBreak: true,
    description: '15 min focus + 3 min break'
  },
  {
    name: 'Flow State',
    duration: 90,
    breakDuration: 15,
    sessionType: 'flow' as const,
    autoBreak: false,
    description: '90 min deep work session'
  }
];

export default function SessionCustomizationModal({ 
  visible, 
  onClose, 
  onStartSession 
}: SessionCustomizationModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customDuration, setCustomDuration] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleStartSession = () => {
    const preset = PRESET_SESSIONS[selectedPreset];
    const config: SessionConfig = {
      duration: preset.duration,
      breakDuration: preset.breakDuration,
      sessionType: preset.sessionType,
      autoBreak: preset.autoBreak,
      soundEnabled
    };
    
    onStartSession(config);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>🎯 Customize Your Focus Session</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
                    selectedPreset === index && styles.presetCardSelected
                  ]}
                  onPress={() => setSelectedPreset(index)}
                >
                  <View style={styles.presetHeader}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <View style={styles.presetBadge}>
                      <Text style={styles.presetBadgeText}>{preset.duration}m</Text>
                    </View>
                  </View>
                  <Text style={styles.presetDescription}>{preset.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

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

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>⏰ Auto Break</Text>
                <Text style={styles.settingValue}>
                  {PRESET_SESSIONS[selectedPreset].autoBreak ? 'Enabled' : 'Manual'}
                </Text>
              </View>
            </View>

            {/* Session Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Focus Time:</Text>
                  <Text style={styles.previewValue}>
                    {PRESET_SESSIONS[selectedPreset].duration} minutes
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Break Time:</Text>
                  <Text style={styles.previewValue}>
                    {PRESET_SESSIONS[selectedPreset].breakDuration} minutes
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Session Type:</Text>
                  <Text style={styles.previewValue}>
                    {PRESET_SESSIONS[selectedPreset].sessionType}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStartSession}
              >
                <Text style={styles.startButtonText}>
                  🚀 Start {PRESET_SESSIONS[selectedPreset].duration}min Session
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  scrollContainer: {
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  
  presetCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
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
    fontSize: 14,
    color: '#666',
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  
  settingValue: {
    fontSize: 16,
    color: '#666',
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
  
  previewCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
  },
  
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  buttonContainer: {
    padding: 20,
  },
  
  startButton: {
    backgroundColor: '#6200EA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});