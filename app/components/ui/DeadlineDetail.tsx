import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DeadlineDetailProps {
  deadline: {
    id: string;
    title: string;
    dueDate: string;
    dueTime?: string;
    priority: 'high' | 'medium' | 'low';
    estimatedHours: number;
    category?: string;
    workCompleted: number;
  };
  onClose: () => void;
  onStartFocus: () => void;
}

export default function DeadlineDetail({ deadline, onClose, onStartFocus }: DeadlineDetailProps) {
  const getPriorityColor = () => {
    switch (deadline.priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getPriorityEmoji = () => {
    switch (deadline.priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const calculateProgress = () => {
    return (deadline.workCompleted / deadline.estimatedHours) * 100;
  };

  const calculateDailyTarget = () => {
    const remainingHours = deadline.estimatedHours - deadline.workCompleted;
    const daysLeft = 10; // This would be calculated from actual date
    return remainingHours / daysLeft;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>📝 {deadline.title.toUpperCase()}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Deadline Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>Due: {deadline.dueDate}{deadline.dueTime ? ` at ${deadline.dueTime}` : ''}</Text>
        <Text style={styles.infoText}>Days Left: 10 days</Text>
        <Text style={styles.infoText}>Priority: {getPriorityEmoji()} {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}</Text>
      </View>

      {/* Work Breakdown */}
      <View style={styles.breakdownCard}>
        <Text style={styles.breakdownTitle}>⏱️ WORK BREAKDOWN (Auto-generated)</Text>
        <View style={styles.breakdownContent}>
          <Text style={styles.breakdownText}>Total work needed: {deadline.estimatedHours} hours</Text>
          <Text style={styles.breakdownText}>Days available: 10</Text>
          <Text style={styles.breakdownText}>Daily target: {(() => {
            const dailyTarget = calculateDailyTarget();
            const h = Math.floor(dailyTarget);
            const m = Math.round((dailyTarget - h) * 60);
            return h > 0 ? `${h}h ${m}min` : `${m}min`;
          })()}</Text>
          
          <Text style={styles.checkpointsTitle}>Suggested checkpoints:</Text>
          <View style={styles.checkpoint}>
            <Text style={styles.checkpointText}>✓ Today: 1h (Intro & Ch 1-3)</Text>
          </View>
          <View style={styles.checkpoint}>
            <Text style={styles.checkpointText}>✓ Dec 22: 2h (Ch 4-6)</Text>
          </View>
          <View style={styles.checkpoint}>
            <Text style={styles.checkpointText}>✓ Dec 25: 2h (Ch 7-8 + Practice)</Text>
          </View>
          <View style={styles.checkpoint}>
            <Text style={styles.checkpointText}>✓ Dec 27: 2h (Full review)</Text>
          </View>
          <View style={styles.checkpoint}>
            <Text style={styles.checkpointText}>✓ Dec 28: 1h (Final prep)</Text>
          </View>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>📊 PROGRESS</Text>
        <Text style={styles.progressText}>Work completed: {deadline.workCompleted}h / {deadline.estimatedHours}h</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${calculateProgress()}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressPercent}>{Math.round(calculateProgress())}%</Text>
      </View>

      {/* Today's Focus */}
      <View style={styles.focusCard}>
        <Text style={styles.focusTitle}>🎯 TODAY'S FOCUS</Text>
        <TouchableOpacity style={styles.focusButton} onPress={onStartFocus}>
          <Text style={styles.focusButtonText}>Start Focus Session for this deadline</Text>
        </TouchableOpacity>
      </View>

      {/* Reminders */}
      <View style={styles.remindersCard}>
        <Text style={styles.remindersTitle}>🔔 REMINDERS</Text>
        <View style={styles.reminderRow}>
          <TouchableOpacity style={styles.reminderCheckbox}>
            <Text style={styles.checkboxText}>✓</Text>
          </TouchableOpacity>
          <Text style={styles.reminderText}>1 day before</Text>
        </View>
        <View style={styles.reminderRow}>
          <TouchableOpacity style={styles.reminderCheckbox}>
            <Text style={styles.checkboxText}>✓</Text>
          </TouchableOpacity>
          <Text style={styles.reminderText}>3 days before</Text>
        </View>
      </View>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: SCREEN_WIDTH * 0.05,
  },
  header: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
  },
  headerButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.015,
    borderRadius: 6,
  },
  headerButtonText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#1976D2',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  infoText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  breakdownCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  breakdownTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  breakdownContent: {
    backgroundColor: '#F9F9F9',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 8,
  },
  breakdownText: {
    fontSize: SCREEN_WIDTH * 0.033,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  checkpointsTitle: {
    fontSize: SCREEN_WIDTH * 0.033,
    fontWeight: '600',
    color: '#333',
    marginTop: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  checkpoint: {
    marginLeft: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.003,
  },
  checkpointText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
  },
  progressCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  progressTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  progressText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    textAlign: 'right',
  },
  focusCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  focusTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  focusButton: {
    backgroundColor: '#6200EA',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 8,
    alignItems: 'center',
  },
  focusButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
  },
  remindersCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  remindersTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  reminderCheckbox: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SCREEN_WIDTH * 0.02,
  },
  checkboxText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '700',
  },
  reminderText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#9E9E9E',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
});