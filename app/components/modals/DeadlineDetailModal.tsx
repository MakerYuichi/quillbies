import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Modal,
  StatusBar,
  ImageBackground,
  Image,
  Alert
} from 'react-native';
import { Deadline } from '../../core/types';
import { useQuillbyStore } from '../../state/store-modular';
import { calculateFocusEnergyCost } from '../../core/engine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DeadlineDetailModalProps {
  visible: boolean;
  onClose: () => void;
  deadline: Deadline | null;
  onStartFocus: (deadlineId: string) => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (deadlineId: string) => void;
}

export default function DeadlineDetailModal({ 
  visible, 
  onClose, 
  deadline, 
  onStartFocus, 
  onEdit, 
  onDelete 
}: DeadlineDetailModalProps) {
  const { updateReminders, userData } = useQuillbyStore();
  
  // Get theme colors
  const themeType = userData.roomCustomization?.themeType;
  const { getThemeColors } = require('../../utils/themeColors');
  const themeColors = getThemeColors(themeType);
  
  // Format hours to "Xh Ymin" format
  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0 && m === 0) return '0min';
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  };
  
  // Reminder states - initialize from deadline
  const [reminder1Day, setReminder1Day] = useState(deadline?.reminders?.oneDayBefore ?? true);
  const [reminder3Day, setReminder3Day] = useState(deadline?.reminders?.threeDaysBefore ?? true);

  if (!deadline) return null;

  // Calculate days left
  const calculateDaysLeft = () => {
    const dueDate = new Date(deadline.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate daily target
  const calculateDailyTarget = () => {
    const daysLeft = calculateDaysLeft();
    const remainingWork = deadline.estimatedHours - deadline.workCompleted;
    if (daysLeft <= 0) return remainingWork;
    return remainingWork / daysLeft;
  };

  // Generate work breakdown
  const generateWorkBreakdown = () => {
    const daysLeft = calculateDaysLeft();
    const remainingWork = deadline.estimatedHours - deadline.workCompleted;
    const dailyTarget = calculateDailyTarget();
    
    const checkpoints = [];
    const today = new Date();
    
    if (daysLeft > 0 && remainingWork > 0) {
      const workPerCheckpoint = remainingWork / Math.min(daysLeft, 5);
      
      for (let i = 0; i < Math.min(daysLeft, 5); i++) {
        const checkpointDate = new Date(today);
        checkpointDate.setDate(today.getDate() + i);
        
        const isToday = i === 0;
        const workAmount = i === Math.min(daysLeft, 5) - 1 ? remainingWork - (workPerCheckpoint * i) : workPerCheckpoint;
        
        checkpoints.push({
          date: checkpointDate,
          work: workAmount,
          isToday,
          description: getCheckpointDescription(i, workAmount)
        });
      }
    }
    
    return checkpoints;
  };

  const getCheckpointDescription = (index: number, work: number) => {
    // Format work hours to "Xh Ymin"
    const h = Math.floor(work);
    const m = Math.round((work - h) * 60);
    const timeText = h > 0 ? `${h}h ${m}min` : `${m}min`;
    
    const descriptions = [
      `${timeText} (Start the mission)`,
      `${timeText} (Build momentum)`, 
      `${timeText} (Core battle)`,
      `${timeText} (Review & polish)`,
      `${timeText} (Final preparations)`
    ];
    return descriptions[index] || `${timeText} (Continue work)`;
  };

  // Format date
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format due date with time
  const formatDueDate = () => {
    const date = new Date(deadline.dueDate);
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    if (deadline.dueTime) {
      return `${dateStr} at ${deadline.dueTime}`;
    }
    return dateStr;
  };

  // Get priority info
  const getPriorityInfo = () => {
    switch (deadline.priority) {
      case 'high': return { emoji: '🔴', text: 'HIGH', color: '#FF5252' };
      case 'medium': return { emoji: '🟡', text: 'MEDIUM', color: '#FF9800' };
      case 'low': return { emoji: '🟢', text: 'LOW', color: '#4CAF50' };
      default: return { emoji: '⚪', text: 'NORMAL', color: '#9E9E9E' };
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((deadline.workCompleted / deadline.estimatedHours) * 100, 100);

  // Get Quillby's reaction based on deadline status
  const getQuillbyReaction = () => {
    const daysLeft = calculateDaysLeft();
    const progress = progressPercentage;
    
    if (daysLeft <= 0) {
      return {
        image: require('../../../assets/hamsters/casual/sad.png'),
        message: "Captain! We're out of time! 😱"
      };
    }
    if (daysLeft <= 2 && progress < 50) {
      return {
        image: require('../../../assets/hamsters/casual/sad.png'),
        message: "We need to move faster! I'm with you!"
      };
    }
    if (progress >= 100) {
      return {
        image: require('../../../assets/hamsters/casual/idle-sit-happy.png'),
        message: "Mission accomplished! You're amazing! 🎉"
      };
    }
    if (progress > 50) {
      return {
        image: require('../../../assets/hamsters/casual/focus.png'),
        message: "Great progress! Let's keep pushing!"
      };
    }
    return {
      image: require('../../../assets/hamsters/casual/studying.png'),
      message: "Ready when you are, captain!"
    };
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    Alert.alert(
      'Archive Mission',
      `Are you sure you want to archive "${deadline.title}"? This mission will be marked as completed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          style: 'destructive',
          onPress: () => {
            onDelete(deadline.id);
            onClose();
          }
        }
      ]
    );
  };

  const daysLeft = calculateDaysLeft();
  const dailyTarget = calculateDailyTarget();
  const workBreakdown = generateWorkBreakdown();
  const priorityInfo = getPriorityInfo();
  const quillbyReaction = getQuillbyReaction();
  const energyCost = calculateFocusEnergyCost(userData);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={themeType ? themeColors.statusBar : "#2C3E50"} />
      <View style={styles.container}>
        {/* Background - themed or default */}
        {!themeType && (
          <ImageBackground
            source={require('../../../assets/backgrounds/theme.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
        {themeType && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: themeColors.background }]} />
        )}
        
        {/* Theme decorations */}
        {themeType && require('../../utils/themeColors').getThemeDecorations(themeType).map((decoration: any, index: number) => (
          <Text 
            key={index}
            style={{
              position: 'absolute',
              top: `${decoration.top}%`,
              left: `${decoration.left}%`,
              fontSize: decoration.size,
              opacity: 0.3,
              zIndex: 1,
            }}
          >
            {decoration.emoji}
          </Text>
        ))}
        
        {/* Mission Header with Quillby */}
        <View style={[styles.missionHeader, themeType && { backgroundColor: themeColors.statusBar }]}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>← Back to Command</Text>
          </TouchableOpacity>
          
          <View style={styles.commanderSection}>
            <Image
              source={quillbyReaction.image}
              style={styles.commanderImage}
              resizeMode="contain"
            />
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{quillbyReaction.message}</Text>
              <View style={styles.bubbleTail} />
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mission Dossier */}
          <View style={[
            styles.dossierContainer,
            themeType && {
              backgroundColor: themeColors.isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
              borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              shadowColor: themeColors.background,
            }
          ]}>
            {/* Mission Title & Priority */}
            <View style={styles.missionTitleSection}>
              <Text style={styles.missionEmoji}>📜</Text>
              <Text style={[
                styles.missionTitle,
                themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
              ]}>{deadline.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.color }]}>
                <Text style={styles.priorityText}>{priorityInfo.emoji} {priorityInfo.text}</Text>
              </View>
            </View>

            {/* D-Day Info */}
            <View style={styles.ddaySection}>
              <View style={styles.ddayCard}>
                <Text style={styles.ddayLabel}>D-DAY</Text>
                <Text style={styles.ddayDate}>{formatDueDate()}</Text>
              </View>
              
              <View style={[styles.ddayCard, daysLeft <= 2 && styles.urgentCard]}>
                <Text style={styles.ddayLabel}>TIME REMAINING</Text>
                <Text style={[styles.ddayValue, daysLeft <= 2 && styles.urgentText]}>
                  {daysLeft > 0 ? `${daysLeft} days` : daysLeft === 0 ? 'TODAY!' : 'OVERDUE!'}
                </Text>
              </View>
            </View>

            {/* Mission Progress */}
            <View style={styles.progressSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📊</Text>
                <Text style={[
                  styles.sectionTitle,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                ]}>MISSION PROGRESS</Text>
              </View>
              
              <View style={[
                styles.progressCard,
                themeType && {
                  backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}>
                <Text style={[
                  styles.progressText,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                ]}>
                  {formatHours(deadline.workCompleted)} / {formatHours(deadline.estimatedHours)} completed
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progressPercentage}%` },
                      progressPercentage >= 100 && styles.progressComplete
                    ]} 
                  />
                </View>
                <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
                
                {progressPercentage >= 100 && (
                  <View style={styles.completeBadge}>
                    <Text style={styles.completeText}>✓ MISSION ACCOMPLISHED</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Battle Plan */}
            <View style={styles.battlePlanSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🗺️</Text>
                <Text style={[
                  styles.sectionTitle,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                ]}>BATTLE PLAN</Text>
              </View>
              
              <View style={[
                styles.battlePlanCard,
                themeType && {
                  backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}>
                <View style={styles.planStats}>
                  <View style={styles.statItem}>
                    <Text style={[
                      styles.statLabel,
                      themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#7F8C8D' }
                    ]}>Total Work</Text>
                    <Text style={[
                      styles.statValue,
                      themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                    ]}>{formatHours(deadline.estimatedHours)}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[
                      styles.statLabel,
                      themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#7F8C8D' }
                    ]}>Daily Target</Text>
                    <Text style={[
                      styles.statValue,
                      themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                    ]}>{formatHours(dailyTarget)}</Text>
                  </View>
                </View>
                
                {workBreakdown.length > 0 && (
                  <View style={styles.checkpoints}>
                    <Text style={[
                      styles.checkpointsTitle,
                      themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                    ]}>Suggested Checkpoints:</Text>
                    {workBreakdown.map((checkpoint, index) => (
                      <View key={index} style={styles.checkpointRow}>
                        <Text style={styles.checkpointBullet}>⚔️</Text>
                        <Text style={[
                          styles.checkpointText,
                          themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.8)' : '#7F8C8D' }
                        ]}>
                          {checkpoint.isToday ? 'TODAY' : formatDate(checkpoint.date)}: {checkpoint.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Launch Mission Button */}
            <TouchableOpacity 
              style={[styles.launchButton, userData.energy < energyCost && styles.launchButtonDisabled]}
              onPress={() => {
                onStartFocus(deadline.id);
                onClose();
              }}
              disabled={userData.energy < energyCost}
              activeOpacity={0.8}
            >
              <Text style={styles.launchButtonIcon}>🚀</Text>
              <View style={styles.launchButtonTextContainer}>
                <Text style={styles.launchButtonText}>
                  {userData.energy >= energyCost ? 'Start Focus Session' : 'Too Tired to Focus'}
                </Text>
                <Text style={styles.launchButtonSubtext}>
                  {userData.energy >= energyCost 
                    ? `Costs ${energyCost} ⚡ • Ready to conquer!` 
                    : `Need ${energyCost} ⚡ (have ${Math.round(userData.energy)})`}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Reminders & Alerts */}
            <View style={styles.remindersSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🔔</Text>
                <Text style={[
                  styles.sectionTitle,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                ]}>ALERTS</Text>
              </View>
              
              <View style={styles.reminderButtons}>
                <TouchableOpacity 
                  style={[
                    styles.reminderButton,
                    reminder1Day && styles.reminderButtonActive,
                    themeType && !reminder1Day && {
                      backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    }
                  ]}
                  onPress={() => {
                    const newState = !reminder1Day;
                    setReminder1Day(newState);
                    updateReminders(deadline.id, {
                      oneDayBefore: newState,
                      threeDaysBefore: reminder3Day
                    });
                  }}
                >
                  <Text style={[
                    styles.reminderButtonText,
                    reminder1Day && styles.reminderButtonTextActive,
                    themeType && !reminder1Day && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                  ]}>
                    {reminder1Day ? '✓ 1 day before' : '1 day before'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.reminderButton,
                    reminder3Day && styles.reminderButtonActive,
                    themeType && !reminder3Day && {
                      backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    }
                  ]}
                  onPress={() => {
                    const newState = !reminder3Day;
                    setReminder3Day(newState);
                    updateReminders(deadline.id, {
                      oneDayBefore: reminder1Day,
                      threeDaysBefore: newState
                    });
                  }}
                >
                  <Text style={[
                    styles.reminderButtonText,
                    reminder3Day && styles.reminderButtonTextActive,
                    themeType && !reminder3Day && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                  ]}>
                    {reminder3Day ? '✓ 3 days before' : '3 days before'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mission Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity 
                style={[
                  styles.actionEdit,
                  themeType && {
                    backgroundColor: themeColors.isDark ? 'rgba(52, 152, 219, 0.8)' : '#3498DB',
                  }
                ]}
                onPress={() => onEdit(deadline)}
              >
                <Text style={styles.actionEditText}>✏️ Edit Mission</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.actionArchive,
                  themeType && {
                    backgroundColor: themeColors.isDark ? 'rgba(149, 165, 166, 0.8)' : '#95A5A6',
                  }
                ]}
                onPress={handleDelete}
              >
                <Text style={styles.actionArchiveText}>📦 Archive Mission</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  missionHeader: {
    backgroundColor: '#12b5ddff',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 3,
    borderBottomColor: '#34495E',
  },
  backButton: {
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  backButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#ECF0F1',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  commanderSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commanderImage: {
    width: SCREEN_WIDTH * 0.18,
    height: SCREEN_WIDTH * 0.18,
    marginRight: SCREEN_WIDTH * 0.03,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#ECF0F1',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 16,
    position: 'relative',
  },
  speechText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#2C3E50',
    fontFamily: 'Schoolbell',
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#ECF0F1',
  },
  content: {
    flex: 1,
  },
  dossierContainer: {
    backgroundColor: 'rgba(218, 253, 158, 0.43)',
    margin: SCREEN_WIDTH * 0.05,
    borderRadius: 20,
    padding: SCREEN_WIDTH * 0.05,
    borderWidth: 3,
    borderColor: '#bdc7c1ff',
    shadowColor: '#bbe924ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  missionTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  missionEmoji: {
    fontSize: SCREEN_WIDTH * 0.07,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  missionTitle: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.055,
    color: '#2C3E50',
    fontFamily: 'ChakraPetch_700Bold',
  },
  priorityBadge: {
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.01,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#FFF',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  ddaySection: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  ddayCard: {
    flex: 1,
    backgroundColor: '#006d89ff',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
  },
  urgentCard: {
    backgroundColor: '#E74C3C',
  },
  ddayLabel: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#BDC3C7',
    marginBottom: SCREEN_HEIGHT * 0.005,
    fontFamily: 'ChakraPetch_500Medium',
  },
  ddayDate: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  ddayValue: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#FFF',
    fontFamily: 'ChakraPetch_700Bold',
  },
  urgentText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.05,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  sectionIcon: {
    fontSize: SCREEN_WIDTH * 0.06,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    color: '#2C3E50',
    fontFamily: 'ChakraPetch_700Bold',
  },
  progressSection: {
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  progressCard: {
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  progressText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#2C3E50',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_500Medium',
  },
  progressBar: {
    height: SCREEN_HEIGHT * 0.018,
    backgroundColor: '#E0E0E0',
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498DB',
  },
  progressComplete: {
    backgroundColor: '#2ECC71',
  },
  progressPercentage: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#3498DB',
    textAlign: 'right',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  completeBadge: {
    backgroundColor: '#2ECC71',
    padding: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  completeText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  battlePlanSection: {
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  battlePlanCard: {
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#7F8C8D',
    marginBottom: SCREEN_HEIGHT * 0.005,
    fontFamily: 'ChakraPetch_400Regular',
  },
  statValue: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#2C3E50',
    fontFamily: 'ChakraPetch_700Bold',
  },
  statDivider: {
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  checkpoints: {
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
    paddingTop: SCREEN_HEIGHT * 0.015,
  },
  checkpointsTitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#2C3E50',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  checkpointBullet: {
    fontSize: SCREEN_WIDTH * 0.04,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  checkpointText: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#7F8C8D',
    fontFamily: 'ChakraPetch_400Regular',
  },
  launchButton: {
    backgroundColor: '#4761e1ff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.025,
    borderWidth: 3,
    borderColor: '#2b3fc0ff',
    shadowColor: '#e7753cff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  launchButtonDisabled: {
    backgroundColor: '#95A5A6',
    borderColor: '#7F8C8D',
    shadowColor: '#000',
  },
  launchButtonIcon: {
    fontSize: SCREEN_WIDTH * 0.08,
    marginRight: SCREEN_WIDTH * 0.04,
  },
  launchButtonTextContainer: {
    flex: 1,
  },
  launchButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#FFF',
    fontFamily: 'ChakraPetch_700Bold',
  },
  launchButtonSubtext: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SCREEN_HEIGHT * 0.005,
    fontFamily: 'ChakraPetch_400Regular',
  },
  remindersSection: {
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  reminderButtons: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
  },
  reminderButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  reminderButtonActive: {
    backgroundColor: '#2ECC71',
    borderColor: '#27AE60',
  },
  reminderButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#2C3E50',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  reminderButtonTextActive: {
    color: '#FFF',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
  },
  actionEdit: {
    flex: 1,
    backgroundColor: '#3498DB',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2980B9',
  },
  actionEditText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  actionArchive: {
    flex: 1,
    backgroundColor: '#95A5A6',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7F8C8D',
  },
  actionArchiveText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  bottomSpacing: {
    height: SCREEN_HEIGHT * 0.05,
  },
});