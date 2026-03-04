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
import { wp, hp, fs, sp } from '../../utils/responsive';

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
    width: wp(90),
    maxHeight: hp(80),
    backgroundColor: '#FFF',
    borderRadius: sp(5),
    padding: sp(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(6),
    color: '#333',
    textAlign: 'center',
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4),
    color: '#555',
    marginTop: hp(2),
    marginBottom: hp(1.5),
  },
  
  presetCard: {
    backgroundColor: '#F5F5F5',
    padding: sp(4),
    borderRadius: sp(3),
    marginBottom: hp(1.2),
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
    marginBottom: hp(0.6),
  },
  
  presetName: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4),
    fontWeight: '600',
    color: '#333',
  },
  presetNameLocked: {
    color: '#999',
  },
  
  presetBadge: {
    backgroundColor: '#6200EA',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: sp(3),
  },
  
  presetBadgeText: {
    color: '#FFFFFF',
    fontSize: fs(3),
    fontWeight: '600',
  },
  presetBadgeTextLocked: {
    color: '#757575',
  },
  
  presetDescription: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(3.5),
    color: '#666',
  },
  presetDescriptionLocked: {
    color: '#999',
  },
  premiumBadge: {
    fontSize: fs(2.5),
    color: '#FF9800',
    fontWeight: '600',
    marginTop: hp(0.6),
    textAlign: 'center',
  },
  
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.8),
  },
  
  settingLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4),
    color: '#333',
  },
  
  settingValue: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(4),
    color: '#666',
  },
  
  toggle: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.7),
    borderRadius: sp(4),
    minWidth: wp(13),
    alignItems: 'center',
  },
  
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  
  toggleText: {
    color: '#FFFFFF',
    fontSize: fs(3),
    fontWeight: '600',
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: wp(2.5),
    marginTop: hp(2.5),
  },
  
  startButton: {
    flex: 1,
    backgroundColor: '#6200EA',
    padding: sp(4),
    borderRadius: sp(3),
    alignItems: 'center',
  },
  
  startButtonText: {
    color: '#FFFFFF',
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3.5),
    fontWeight: '700',
  },
  
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: sp(4),
    borderRadius: sp(3),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  
  cancelButtonText: {
    color: '#666',
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3.5),
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
    marginBottom: hp(1.8),
  },

  premiumLabel: {
    fontSize: fs(4),
    color: '#F57F17',
    fontWeight: '600',
    flex: 1,
  },

  premiumInput: {
    flex: 2,
    borderWidth: 2,
    borderColor: '#FFB74D',
    borderRadius: sp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    fontSize: fs(3.5),
    backgroundColor: '#FFF',
    color: '#333',
    marginLeft: wp(2.5),
  },

  premiumHint: {
    fontSize: fs(3),
    color: '#F57F17',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: hp(1.2),
  },

  // Premium Custom Session Styles
  premiumTimeLabel: {
    fontSize: fs(3.5),
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: hp(1),
  },

  premiumTimeButton: {
    backgroundColor: '#FF9800',
  },

  premiumTimeInput: {
    borderColor: '#FF9800',
  },

  // Custom Time Input Styles
  customTimeContainer: {
    gap: hp(2.5),
  },

  timeInputGroup: {
    marginBottom: hp(1.8),
  },

  timeInputLabel: {
    fontSize: fs(3.5),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(1),
  },

  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(4),
  },

  timeButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#6200EA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeButtonText: {
    color: '#FFFFFF',
    fontSize: fs(5),
    fontWeight: '700',
  },

  timeInput: {
    width: wp(20),
    height: hp(5.5),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: sp(2),
    textAlign: 'center',
    fontSize: fs(4),
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FFFFFF',
  },

  timeHints: {
    marginTop: hp(1.8),
    gap: hp(0.6),
  },

  timeHint: {
    fontSize: fs(3),
    color: '#666',
    textAlign: 'center',
  },
});