import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch, TouchableWithoutFeedback } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { wp, hp, fs, sp } from '../../utils/responsive';
import { scheduleAllNotifications } from '../../../lib/enhancedNotifications';
import { getThemeColors } from '../../utils/themeColors';
import { syncToDatabase } from '../../state/utils/syncUtils';

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({ visible, onClose }: NotificationSettingsModalProps) {
  const userData = useQuillbyStore((state) => state.userData);
  const deadlines = useQuillbyStore((state) => state.deadlines);
  
  // Get theme colors
  const themeType = userData.roomCustomization?.themeType;
  const themeColors = getThemeColors(themeType);
  
  const preferences = userData.notificationPreferences || {
    deadlines: true,
    water: true,
    meals: true,
    exercise: true,
    sleep: true,
    studyCheckpoints: true,
    motivational: true,
    allEnabled: true,
  };
  
  const togglePreference = async (key: keyof typeof preferences) => {
    try {
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };
      
      // If turning off master toggle, disable all
      if (key === 'allEnabled' && preferences[key] === true) {
        Object.keys(newPreferences).forEach(k => {
          if (k !== 'allEnabled') {
            newPreferences[k as keyof typeof newPreferences] = false;
          }
        });
      }
      
      // Update state using Zustand's set pattern
      const updatedUserData = {
        ...userData,
        notificationPreferences: newPreferences,
      };
      
      useQuillbyStore.setState({ userData: updatedUserData });
      syncToDatabase(updatedUserData);
      
      // Then reschedule notifications (don't await to avoid blocking UI)
      scheduleAllNotifications(
        updatedUserData,
        deadlines
      ).catch(err => {
        console.error('[NotificationSettings] Failed to reschedule notifications:', err);
      });
    } catch (error) {
      console.error('[NotificationSettings] Failed to update preferences:', error);
    }
  };
  
  const notificationTypes = [
    {
      key: 'allEnabled' as const,
      icon: '🔔',
      title: 'All Notifications',
      description: 'Master toggle for all notifications',
      color: '#6200EA',
    },
    {
      key: 'deadlines' as const,
      icon: '📝',
      title: 'Deadline Reminders',
      description: '3 days before, 1 day before, and critical alerts',
      color: '#FF5722',
    },
    {
      key: 'studyCheckpoints' as const,
      icon: '📚',
      title: 'Study Checkpoints',
      description: 'Reminders at your selected checkpoint times',
      color: '#4CAF50',
    },
    {
      key: 'water' as const,
      icon: '💧',
      title: 'Hydration Reminders',
      description: 'Regular reminders to drink water',
      color: '#2196F3',
    },
    {
      key: 'meals' as const,
      icon: '🍽️',
      title: 'Meal Reminders',
      description: 'Breakfast, lunch, and dinner notifications',
      color: '#FF9800',
    },
    {
      key: 'exercise' as const,
      icon: '💪',
      title: 'Exercise Reminders',
      description: 'Reminders to stay active',
      color: '#FFC107',
    },
    {
      key: 'sleep' as const,
      icon: '😴',
      title: 'Sleep Reminders',
      description: 'Bedtime and wind-down notifications',
      color: '#9C27B0',
    },
    {
      key: 'motivational' as const,
      icon: '💝',
      title: 'Motivational Messages',
      description: `Encouraging messages from ${userData.buddyName || 'your buddy'}`,
      color: '#E91E63',
    },
  ];
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[
              styles.container,
              themeType && {
                backgroundColor: themeColors.cardBackground,
                borderTopColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              }
            ]}>
              {/* Header */}
              <View style={[
                styles.header,
                themeType && {
                  backgroundColor: themeColors.accentColor || themeColors.cardBackground,
                  borderBottomColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}>
                <Text style={[
                  styles.headerTitle,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' }
                ]}>🔔 Notification Settings</Text>
                <TouchableOpacity onPress={onClose} style={[
                  styles.closeButton,
                  themeType && {
                    backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  }
                ]}>
                  <Text style={[
                    styles.closeButtonText,
                    themeType && { color: themeColors.isDark ? '#FFFFFF' : '#666' }
                  ]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={[
                styles.subtitle,
                themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#666' }
              ]}>
                Choose which notifications you want to receive
              </Text>
              
              {/* Notification List */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {notificationTypes.map((type, index) => {
                  const isEnabled = preferences[type.key] !== false;
                  const isMasterToggle = type.key === 'allEnabled';
                  const isDisabledByMaster = !isMasterToggle && preferences.allEnabled === false;
                  
                  return (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.notificationCard,
                        isMasterToggle && styles.masterCard,
                        index === 0 && styles.firstCard,
                        themeType && {
                          backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F9F9',
                          borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : '#E0E0E0',
                        },
                        isMasterToggle && themeType && {
                          backgroundColor: themeColors.isDark ? 'rgba(33, 150, 243, 0.2)' : '#E3F2FD',
                          borderColor: '#2196F3',
                        }
                      ]}
                      onPress={() => !isDisabledByMaster && togglePreference(type.key)}
                      activeOpacity={0.7}
                      disabled={isDisabledByMaster}
                    >
                      <View style={styles.notificationLeft}>
                        <View style={[styles.iconContainer, { backgroundColor: type.color }]}>
                          <Text style={styles.icon}>{type.icon}</Text>
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={[
                            styles.notificationTitle,
                            isMasterToggle && styles.masterTitle,
                            themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' },
                            isMasterToggle && themeType && { color: themeColors.isDark ? '#64B5F6' : '#1976D2' }
                          ]}>
                            {type.title}
                          </Text>
                          <Text style={[
                            styles.notificationDescription,
                            themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.6)' : '#666' }
                          ]}>
                            {type.description}
                          </Text>
                        </View>
                      </View>
                      
                      <Switch
                        value={isEnabled}
                        onValueChange={() => togglePreference(type.key)}
                        trackColor={{ false: '#E0E0E0', true: type.color }}
                        thumbColor={isEnabled ? '#FFFFFF' : '#F4F3F4'}
                        disabled={isDisabledByMaster}
                        style={styles.switch}
                        pointerEvents="none"
                      />
                    </TouchableOpacity>
                  );
                })}
                
                {/* Info Box */}
                <View style={[
                  styles.infoBox,
                  themeType && {
                    backgroundColor: themeColors.isDark ? 'rgba(255, 235, 59, 0.15)' : '#FFF9C4',
                    borderLeftColor: '#FDD835',
                  }
                ]}>
                  <Text style={styles.infoIcon}>💡</Text>
                  <Text style={[
                    styles.infoText,
                    themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.8)' : '#666' }
                  ]}>
                    Notifications help you stay on track with your goals. You can always change these settings later.
                  </Text>
                </View>
                
                <View style={styles.bottomSpacer} />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: sp(8),
    borderTopRightRadius: sp(8),
    height: hp(85),
    paddingBottom: hp(2),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: sp(5),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: fs(6),
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fs(5),
    color: '#666',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: fs(3.5),
    color: '#666',
    paddingHorizontal: sp(5),
    paddingTop: hp(1),
    paddingBottom: hp(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: sp(5),
    paddingTop: hp(1),
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: sp(4),
    padding: sp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  masterCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  firstCard: {
    marginTop: 0,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp(2),
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  icon: {
    fontSize: fs(6),
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: fs(4),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(0.3),
  },
  masterTitle: {
    fontSize: fs(4.5),
    fontWeight: '700',
    color: '#1976D2',
  },
  notificationDescription: {
    fontSize: fs(3),
    color: '#666',
    lineHeight: fs(4),
  },
  switch: {
    transform: [{ scale: 1.1 }],
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    borderRadius: sp(3),
    padding: sp(4),
    marginTop: hp(2),
    borderLeftWidth: 4,
    borderLeftColor: '#FDD835',
  },
  infoIcon: {
    fontSize: fs(5),
    marginRight: wp(2),
  },
  infoText: {
    flex: 1,
    fontSize: fs(3.2),
    color: '#666',
    lineHeight: fs(4.5),
  },
  bottomSpacer: {
    height: hp(2),
  },
});
