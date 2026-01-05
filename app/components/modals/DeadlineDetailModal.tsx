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
  Alert
} from 'react-native';
import { Deadline } from '../../core/types';
import { useQuillbyStore } from '../../state/store-modular';

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
  const { updateReminders } = useQuillbyStore();
  
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
    const descriptions = [
      `${work.toFixed(1)}h (Getting started)`,
      `${work.toFixed(1)}h (Building momentum)`, 
      `${work.toFixed(1)}h (Core work)`,
      `${work.toFixed(1)}h (Review & polish)`,
      `${work.toFixed(1)}h (Final preparation)`
    ];
    return descriptions[index] || `${work.toFixed(1)}h (Continue work)`;
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
      case 'high': return { emoji: '🔴', text: 'High' };
      case 'medium': return { emoji: '🟡', text: 'Medium' };
      case 'low': return { emoji: '🟢', text: 'Low' };
      default: return { emoji: '⚪', text: 'Normal' };
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((deadline.workCompleted / deadline.estimatedHours) * 100, 100);

  // Handle delete with confirmation
  const handleDelete = () => {
    Alert.alert(
      'Delete Deadline',
      `Are you sure you want to delete "${deadline.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <ImageBackground
        source={require('../../../assets/backgrounds/theme.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.editButton} onPress={() => onEdit(deadline)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Text style={styles.title}>📝 {deadline.title}</Text>

          {/* Basic Info */}
          <View style={styles.infoSection}>
            <Text style={styles.dueDate}>Due: {formatDueDate()}</Text>
            <Text style={styles.daysLeft}>
              Days Left: {daysLeft > 0 ? `${daysLeft} days` : daysLeft === 0 ? 'Due today!' : 'Overdue!'}
            </Text>
            <Text style={styles.priority}>
              Priority: {priorityInfo.emoji} {priorityInfo.text}
            </Text>
          </View>

          {/* Work Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>⏱️ WORK BREAKDOWN (Auto-generated)</Text>
            <View style={styles.breakdownCard}>
              <Text style={styles.breakdownItem}>Total work needed: {deadline.estimatedHours} hours</Text>
              <Text style={styles.breakdownItem}>Days available: {Math.max(daysLeft, 0)}</Text>
              <Text style={styles.breakdownItem}>
                Daily target: {dailyTarget.toFixed(1)}h ({Math.round(dailyTarget * 60)} mins)
              </Text>
              
              {workBreakdown.length > 0 && (
                <>
                  <Text style={styles.checkpointsTitle}>Suggested checkpoints:</Text>
                  {workBreakdown.map((checkpoint, index) => (
                    <Text key={index} style={styles.checkpointItem}>
                      ✓ {checkpoint.isToday ? 'Today' : formatDate(checkpoint.date)}: {checkpoint.description}
                    </Text>
                  ))}
                </>
              )}
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>📊 PROGRESS</Text>
            <Text style={styles.progressText}>
              Work completed: {deadline.workCompleted.toFixed(1)}h / {deadline.estimatedHours}h
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>

          {/* Today's Focus */}
          <View style={styles.focusSection}>
            <Text style={styles.sectionTitle}>🎯 TODAY'S FOCUS</Text>
            <TouchableOpacity 
              style={styles.focusButton}
              onPress={() => {
                onStartFocus(deadline.id);
                onClose();
              }}
            >
              <Text style={styles.focusButtonText}>Start Focus Session for this deadline</Text>
            </TouchableOpacity>
          </View>

          {/* Reminders */}
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>🔔 REMINDERS</Text>
            <View style={styles.reminderButtons}>
              <TouchableOpacity 
                style={[
                  styles.reminderButton,
                  reminder1Day && styles.reminderButtonActive
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
                  reminder1Day && styles.reminderButtonTextActive
                ]}>
                  {reminder1Day ? '✓ 1 day before' : '1 day before'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.reminderButton,
                  reminder3Day && styles.reminderButtonActive
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
                  reminder3Day && styles.reminderButtonTextActive
                ]}>
                  {reminder3Day ? '✓ 3 days before' : '3 days before'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: SCREEN_WIDTH * 0.02,
  },
  backButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#FFF',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#FFF',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.02,
    fontFamily: 'ChakraPetch_700Bold',
  },
  infoSection: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dueDate: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_500Medium',
  },
  daysLeft: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_500Medium',
  },
  priority: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    fontFamily: 'ChakraPetch_500Medium',
  },
  breakdownSection: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_700Bold',
  },
  breakdownCard: {
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  breakdownItem: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.008,
    fontFamily: 'ChakraPetch_400Regular',
  },
  checkpointsTitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
    color: '#333',
    marginTop: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.008,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  checkpointItem: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.005,
    paddingLeft: SCREEN_WIDTH * 0.02,
    fontFamily: 'ChakraPetch_400Regular',
  },
  progressSection: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_500Medium',
  },
  progressBar: {
    height: SCREEN_HEIGHT * 0.015,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  progressPercentage: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'right',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  focusSection: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  focusButton: {
    backgroundColor: '#6200EA',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  focusButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#FFF',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  remindersSection: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  reminderButtons: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
  },
  reminderButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_WIDTH * 0.03,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  reminderButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  reminderButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  reminderButtonTextActive: {
    color: '#FFF',
  },
  bottomSpacing: {
    height: SCREEN_HEIGHT * 0.05,
  },
});