import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  ScrollView,
  TextInput,
  SafeAreaView,
  Platform
} from 'react-native';
import PremiumPaywallModal from './PremiumPaywallModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SessionCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  onStartSession: (config: SessionConfig) => void;
  isPremium?: boolean;
}

export interface SessionConfig {
  duration: number; // in minutes
  breakDuration: number; // in minutes
  sessionType: 'pomodoro' | 'custom' | 'flow' | 'premium';
  autoBreak: boolean;
  soundEnabled: boolean;
  customName?: string;
  backgroundMusic?: boolean;
  strictMode?: boolean;
}

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
    name: '⭐ Custom Time',
    duration: 30,
    breakDuration: 5,
    sessionType: 'custom' as const,
    autoBreak: true,
    description: 'Set your own focus and break time',
    isCustom: true,
    isPremium: true
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
  {
    name: 'Flow State',
    duration: 90,
    breakDuration: 15,
    sessionType: 'flow' as const,
    autoBreak: false,
    description: '90 min deep work session',
    isCustom: false,
    isPremium: false
  },
  {
    name: '⭐ Premium Session',
    duration: 45,
    breakDuration: 10,
    sessionType: 'premium' as const,
    autoBreak: true,
    description: 'Custom name + advanced features',
    isCustom: true,
    isPremium: true
  }
];

export default function SessionCustomizationModal({ 
  visible, 
  onClose, 
  onStartSession,
  isPremium = false
}: SessionCustomizationModalProps) {
  // Debug visibility
  React.useEffect(() => {
    console.log('[SessionModal] Visibility changed to:', visible);
    if (visible) {
      console.log('[SessionModal] Modal should be visible now!');
      console.log('[SessionModal] isPremium:', isPremium);
    }
  }, [visible, isPremium]);
  
  const [selectedPreset, setSelectedPreset] = useState(() => {
    // Ensure non-premium users start with a free preset
    const defaultIndex = 0; // Pomodoro Classic
    if (!isPremium && PRESET_SESSIONS[defaultIndex]?.isPremium) {
      // Find first non-premium preset
      return PRESET_SESSIONS.findIndex(preset => !preset.isPremium);
    }
    return defaultIndex;
  });
  const [customDuration, setCustomDuration] = useState(30);
  const [customBreak, setCustomBreak] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [customSessionName, setCustomSessionName] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Show all presets but with locked states for non-premium users
  const availablePresets = PRESET_SESSIONS;

  const handleUpgradePrompt = () => {
    setShowPremiumModal(true);
  };
  
  const handleClosePremiumModal = () => {
    setShowPremiumModal(false);
  };

  const handleStartSession = () => {
    const preset = availablePresets[selectedPreset];
    const config: SessionConfig = {
      duration: preset.isCustom ? customDuration : preset.duration,
      breakDuration: preset.isCustom ? customBreak : preset.breakDuration,
      sessionType: preset.sessionType,
      autoBreak: preset.autoBreak,
      soundEnabled,
      ...(preset.isPremium && isPremium ? {
        customName: customSessionName,
        backgroundMusic,
        strictMode
      } : {})
    };
    
    onStartSession(config);
    onClose();
  };

  const isCustomSelected = availablePresets[selectedPreset]?.isCustom;
  const isPremiumSelected = availablePresets[selectedPreset]?.isPremium;

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
            <Text style={styles.title}>🎯 Focus Session</Text>

            {/* Session Presets */}
            <Text style={styles.sectionTitle}>Choose Your Session Type:</Text>
              {availablePresets.map((preset, index) => {
                const isLocked = preset.isPremium && !isPremium;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.presetCard,
                      selectedPreset === index && styles.presetCardSelected,
                      preset.isPremium && styles.presetCardPremium,
                      isLocked && styles.presetCardLocked
                    ]}
                    onPress={() => {
                      if (isLocked) {
                        handleUpgradePrompt();
                      } else {
                        setSelectedPreset(index);
                      }
                    }}
                  >
                    <View style={styles.presetHeader}>
                      <Text style={[
                        styles.presetName,
                        isLocked && styles.presetNameLocked
                      ]}>
                        {isLocked ? `🔒 ${preset.name.replace('⭐ ', '')}` : preset.name}
                      </Text>
                      <View style={[
                        styles.presetBadge,
                        preset.isPremium && styles.presetBadgePremium,
                        isLocked && styles.presetBadgeLocked
                      ]}>
                        <Text style={[
                          styles.presetBadgeText,
                          isLocked && styles.presetBadgeTextLocked
                        ]}>
                          {preset.isCustom && selectedPreset === index ? `${customDuration}m` : `${preset.duration}m`}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.presetDescription,
                      isLocked && styles.presetDescriptionLocked
                    ]}>
                      {preset.isCustom && selectedPreset === index 
                        ? `${customDuration} min focus + ${customBreak} min break` 
                        : preset.description}
                    </Text>
                    {isLocked && (
                      <Text style={styles.premiumBadge}>PREMIUM FEATURE</Text>
                    )}
                  </TouchableOpacity>
                );
              })}

            {/* Custom Time Inputs - Only for Premium Users */}
            {isCustomSelected && isPremium && (
              <>
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

                <View style={styles.timeHints}>
                  <Text style={styles.timeHint}>💡 Focus: 5-180 minutes</Text>
                  <Text style={styles.timeHint}>💡 Break: 1-30 minutes</Text>
                </View>
              </>
            )}

            {/* Settings */}
            <Text style={styles.sectionTitle}>Session Settings:</Text>
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
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.startButton} onPress={handleStartSession}>
              <Text style={styles.startButtonText}>
                🚀 Start {isCustomSelected ? customDuration : availablePresets[selectedPreset].duration}min Session
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    
    {/* Premium Paywall Modal */}
    <PremiumPaywallModal
      visible={showPremiumModal}
      onClose={handleClosePremiumModal}
      onPurchaseSuccess={() => {
        console.log('[SessionModal] Premium purchased successfully!');
        setShowPremiumModal(false);
      }}
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
  presetNameLocked: {
    color: '#999',
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
  presetBadgeTextLocked: {
    color: '#757575',
  },
  
  presetDescription: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#666',
  },
  presetDescriptionLocked: {
    color: '#999',
  },
  premiumBadge: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
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
  
  settingValue: {
    fontFamily: 'ChakraPetch_400Regular',
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
  
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '600',
  },

  // Premium Styles
  presetCardPremium: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF8E1',
  },
  presetCardLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },

  presetBadgePremium: {
    backgroundColor: '#FF9800',
  },
  presetBadgeLocked: {
    backgroundColor: '#BDBDBD',
  },

  premiumFeature: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  premiumLabel: {
    fontSize: 16,
    color: '#F57F17',
    fontWeight: '600',
    flex: 1,
  },

  premiumInput: {
    flex: 2,
    borderWidth: 2,
    borderColor: '#FFB74D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#333',
    marginLeft: 10,
  },

  premiumHint: {
    fontSize: 12,
    color: '#F57F17',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },

  // Premium Custom Session Styles
  premiumTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 8,
  },

  premiumTimeButton: {
    backgroundColor: '#FF9800',
  },

  premiumTimeInput: {
    borderColor: '#FF9800',
  },

  // Custom Time Input Styles
  customTimeContainer: {
    gap: 20,
  },

  timeInputGroup: {
    marginBottom: 15,
  },

  timeInputLabel: {
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
    height: 45, // Increased height for better touch target
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: SCREEN_WIDTH * 0.04, // Responsive font size
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FFFFFF',
  },

  timeHints: {
    marginTop: 15,
    gap: 5,
  },

  timeHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});