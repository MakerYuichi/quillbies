import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ImageBackground } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store-modular';
import { DeadlineFormData, Deadline } from '../core/types';
import { calculateFocusEnergyCost } from '../core/engine';
import CreateDeadlineModal from '../components/modals/CreateDeadlineModal';
import DeadlineDetailModal from '../components/modals/DeadlineDetailModal';
import SessionCustomizationModal, { SessionConfig } from '../components/modals/SessionCustomizationModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FocusScreen() {
  const router = useRouter();
  const { 
    userData, 
    startFocusSession, 
    createDeadline,
    updateDeadline,
    deleteDeadline,
    getUrgentDeadlines,
    getUpcomingDeadlines,
    getCompletedDeadlines
  } = useQuillbyStore();
  
  const buddyName = userData.buddyName || 'Quillby';

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [pendingDeadlineId, setPendingDeadlineId] = useState<string | undefined>(undefined);

  // Get deadline lists
  const urgentDeadlines = getUrgentDeadlines();
  const upcomingDeadlines = getUpcomingDeadlines();
  const completedDeadlines = getCompletedDeadlines();

  const handleStartSession = (deadlineId?: string) => {
    const energyNeeded = calculateFocusEnergyCost(userData);
    if (userData.energy < energyNeeded) {
      alert(`Not enough energy! Need ${energyNeeded} energy to focus (have ${Math.round(userData.energy)})`);
      return;
    }
    
    // Show customization modal
    setPendingDeadlineId(deadlineId);
    setShowSessionModal(true);
  };

  const handleSessionStart = (config: SessionConfig) => {
    const success = startFocusSession(pendingDeadlineId);
    if (success) {
      // Store session config in session data if needed
      router.push('/study-session');
    }
    setPendingDeadlineId(undefined);
  };

  const handleCreateOrEditDeadline = (formData: DeadlineFormData, deadlineId?: string) => {
    if (deadlineId) {
      // Edit existing deadline
      updateDeadline(deadlineId, {
        title: formData.title,
        dueDate: formData.dueDate,
        dueTime: formData.dueTime || undefined,
        priority: formData.priority,
        estimatedHours: parseFloat(formData.estimatedHours),
        category: formData.category,
      });
    } else {
      // Create new deadline
      createDeadline(formData);
    }
    setShowCreateModal(false);
    setEditingDeadline(null);
  };

  const handleDeadlinePress = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setShowDetailModal(true);
  };

  const handleEditDeadline = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setShowDetailModal(false);
    setShowCreateModal(true);
  };
  
  const handleDeleteDeadline = (deadlineId: string) => {
    // Remove deadline from store and clear local selection if needed
    deleteDeadline(deadlineId);
    if (selectedDeadline?.id === deadlineId) {
      setSelectedDeadline(null);
      setShowDetailModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Compare at the calendar-day level (ignore time of day)
    const startOfDue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = startOfDue.getTime() - startOfToday.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    if (diffDays === 0) return `${formattedDate} (Today)`;
    if (diffDays === 1) return `${formattedDate} (Tomorrow)`;
    if (diffDays > 1) return `${formattedDate} (${diffDays} days)`;
    return `${formattedDate} (Overdue)`;
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };



  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header with Energy Icon */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Focus Session</Text>
            <Text style={styles.subtitle}>{buddyName} is ready to study with you!</Text>
          </View>
          
          {/* Small Energy Icon (like Q-coins on home screen) */}
          <View style={styles.energyIcon}>
            <Text style={styles.energyIconEmoji}>⚡</Text>
            <Text style={styles.energyIconText}>{Math.round(userData.energy)}</Text>
          </View>
        </View>

        {/* Start Session Button */}
        <TouchableOpacity
          style={[styles.startButton, userData.energy < calculateFocusEnergyCost(userData) && styles.startButtonDisabled]}
          onPress={() => handleStartSession()}
          disabled={userData.energy < calculateFocusEnergyCost(userData)}
        >
          <Text style={styles.startButtonText}>
            {userData.energy >= calculateFocusEnergyCost(userData) ? '📚 Start Focus Session' : '😴 Too Tired to Focus'}
          </Text>
          <Text style={styles.startButtonSubtext}>
            {userData.energy >= calculateFocusEnergyCost(userData)
              ? `Costs ${calculateFocusEnergyCost(userData)} energy (${userData.energy >= calculateFocusEnergyCost(userData) ? 'Ready!' : 'Need more'})`
              : `Need ${calculateFocusEnergyCost(userData)} energy (have ${Math.round(userData.energy)})`}
          </Text>
        </TouchableOpacity>

        {/* Deadlines List */}
        <View style={styles.deadlinesList}>
          <View style={styles.deadlinesHeader}>
            <Text style={styles.deadlinesTitle}>📋 MY DEADLINES</Text>
          </View>

          {/* Urgent Section */}
          {urgentDeadlines.length > 0 && (
          <View style={styles.deadlineSection}>
            <Text style={styles.sectionTitle}>🔴 URGENT (Due Soon)</Text>
            {urgentDeadlines.map(deadline => (
              <TouchableOpacity 
                key={deadline.id} 
                style={styles.deadlineCard}
                onPress={() => handleDeadlinePress(deadline)}
                activeOpacity={0.7}
              >
                <Text style={styles.deadlineTitle}>
                  {getPriorityEmoji(deadline.priority)} {deadline.title}
                </Text>
                <Text style={styles.deadlineDate}>
                  {formatDate(deadline.dueDate)}
                  {deadline.dueTime ? ` at ${deadline.dueTime}` : ''}
                </Text>
                <Text style={styles.deadlineProgress}>
                  {deadline.workCompleted.toFixed(1)}h / {deadline.estimatedHours}h completed
                </Text>
                <View style={styles.deadlineActions}>
                  <TouchableOpacity 
                    style={styles.focusForDeadlineButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStartSession(deadline.id);
                    }}
                    disabled={userData.energy < calculateFocusEnergyCost(userData)}
                  >
                    <Text style={styles.focusForDeadlineText}>
                      {userData.energy >= calculateFocusEnergyCost(userData) ? '🎯 Focus on This' : '😴 Need Energy'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          )}

          {/* Upcoming Section */}
          {upcomingDeadlines.length > 0 && (
          <View style={styles.deadlineSection}>
            <Text style={styles.sectionTitle}>🟡 UPCOMING</Text>
            {upcomingDeadlines.map(deadline => (
              <TouchableOpacity 
                key={deadline.id} 
                style={styles.deadlineCard}
                onPress={() => handleDeadlinePress(deadline)}
                activeOpacity={0.7}
              >
                <Text style={styles.deadlineTitle}>
                  {getPriorityEmoji(deadline.priority)} {deadline.title}
                </Text>
                <Text style={styles.deadlineDate}>
                  {formatDate(deadline.dueDate)}
                  {deadline.dueTime ? ` at ${deadline.dueTime}` : ''}
                </Text>
                <Text style={styles.deadlineProgress}>
                  {deadline.workCompleted.toFixed(1)}h / {deadline.estimatedHours}h completed
                </Text>
                <View style={styles.deadlineActions}>
                  <TouchableOpacity 
                    style={styles.focusForDeadlineButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleStartSession(deadline.id);
                    }}
                    disabled={userData.energy < calculateFocusEnergyCost(userData)}
                  >
                    <Text style={styles.focusForDeadlineText}>
                      {userData.energy >= calculateFocusEnergyCost(userData) ? '🎯 Focus on This' : '😴 Need Energy'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          )}

          {/* Completed Section */}
          {completedDeadlines.length > 0 && (
          <View style={styles.deadlineSection}>
            <Text style={styles.sectionTitle}>✅ COMPLETED</Text>
            {completedDeadlines.map(deadline => (
              <TouchableOpacity 
                key={deadline.id} 
                style={styles.deadlineCard}
                onPress={() => handleDeadlinePress(deadline)}
                activeOpacity={0.7}
              >
                <Text style={styles.deadlineTitle}>{deadline.title}</Text>
                <Text style={styles.deadlineCompleted}>✓ Submitted</Text>
              </TouchableOpacity>
            ))}
          </View>
          )}

          {/* Empty State */}
          {urgentDeadlines.length === 0 && upcomingDeadlines.length === 0 && completedDeadlines.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>📝 No deadlines yet</Text>
              <Text style={styles.emptyStateSubtext}>Create your first deadline to get started!</Text>
            </View>
          )}
        </View>

        {/* Create New Deadline Button */}
        <TouchableOpacity 
          style={styles.createDeadlineButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createDeadlineText}>➕ CREATE NEW DEADLINE</Text>
        </TouchableOpacity>




      </ScrollView>

      {/* Create / Edit Deadline Modal */}
      <CreateDeadlineModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingDeadline(null);
        }}
        onSubmit={handleCreateOrEditDeadline}
        mode={editingDeadline ? 'edit' : 'create'}
        initialData={editingDeadline}
        deadlineId={editingDeadline?.id}
      />

      {/* Deadline Detail Modal */}
      <DeadlineDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        deadline={selectedDeadline}
        onStartFocus={handleStartSession}
        onEdit={handleEditDeadline}
        onDelete={handleDeleteDeadline}
      />

      {/* Session Customization Modal */}
      <SessionCustomizationModal
        visible={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setPendingDeadlineId(undefined);
        }}
        onStartSession={handleSessionStart}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.06,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  // Small Energy Icon (like Q-coins on home screen)
  energyIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: SCREEN_WIDTH * 0.02,
    borderWidth: 2,
    borderColor: '#FFB300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  energyIconEmoji: {
    fontSize: SCREEN_WIDTH * 0.06,
  },
  energyIconText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '700',
    color: '#FF9800',
    marginTop: 2,
  },
  startButton: {
    backgroundColor: '#6200EA',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  startButtonSubtext: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
    opacity: 0.9,
  },
  // Deadlines List
  deadlinesList: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  deadlinesHeader: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  deadlinesTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#333',
  },
  // Deadline Sections
  deadlineSection: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  deadlineCard: {
    backgroundColor: '#F9F9F9',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.01,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  deadlineTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  deadlineDate: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  deadlineProgress: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#2196F3',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  deadlineCompleted: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#4CAF50',
    fontWeight: '600',
  },
  deadlineActions: {
    marginTop: SCREEN_HEIGHT * 0.01,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  focusForDeadlineButton: {
    backgroundColor: '#6200EA',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
  },
  focusForDeadlineText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#F9F9F9',
    padding: SCREEN_WIDTH * 0.08,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  emptyStateText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#666',
    fontWeight: '600',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  emptyStateSubtext: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#999',
    textAlign: 'center',
  },
  // Create New Deadline Button (at bottom)
  createDeadlineButton: {
    backgroundColor: '#4CAF50',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    borderWidth: 2,
    borderColor: '#388E3C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  createDeadlineText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
  },

});