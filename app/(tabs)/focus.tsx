import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store-modular';
import { DeadlineFormData, Deadline } from '../core/types';
import { calculateFocusEnergyCost } from '../core/engine';
import CreateDeadlineModal from '../components/modals/CreateDeadlineModal';
import DeadlineDetailModal from '../components/modals/DeadlineDetailModal';
import SessionCustomizationModal, { SessionConfig } from '../components/modals/SessionCustomizationModal';
import ThemedScreen from '../components/themed/ThemedScreen';
import { playTabSound } from '../../lib/soundManager';
import { getThemeColors } from '../utils/themeColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FocusScreen() {
  const router = useRouter();
  const userData = useQuillbyStore((state) => state.userData);
  const deadlines = useQuillbyStore((state) => state.deadlines);
  const startFocusSession = useQuillbyStore((state) => state.startFocusSession);
  const createDeadline = useQuillbyStore((state) => state.createDeadline);
  const updateDeadline = useQuillbyStore((state) => state.updateDeadline);
  const deleteDeadline = useQuillbyStore((state) => state.deleteDeadline);
  const getUrgentDeadlines = useQuillbyStore((state) => state.getUrgentDeadlines);
  const getUpcomingDeadlines = useQuillbyStore((state) => state.getUpcomingDeadlines);
  const getCompletedDeadlines = useQuillbyStore((state) => state.getCompletedDeadlines);

  
  const buddyName = userData.buddyName || 'Quillby';
  
  // Get theme colors
  const themeType = userData.roomCustomization?.themeType;
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [pendingDeadlineId, setPendingDeadlineId] = useState<string | undefined>(undefined);
  
  // Collapsible sections state
  const [urgentExpanded, setUrgentExpanded] = useState(true);
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [victoriesExpanded, setVictoriesExpanded] = useState(false);

  // Get deadline lists
  const urgentDeadlines = getUrgentDeadlines();
  const upcomingDeadlines = getUpcomingDeadlines();
  const completedDeadlines = getCompletedDeadlines();
  
  const totalMissions = urgentDeadlines.length + upcomingDeadlines.length;
  // Get Quillby's mission briefing
  const getMissionBriefing = () => {
    if (totalMissions === 0) return "All clear, captain! No missions yet.";
    if (urgentDeadlines.length > 0) return `🔴 RED ALERT! ${urgentDeadlines.length} urgent mission${urgentDeadlines.length > 1 ? 's' : ''}!`;
    if (totalMissions === 1) return "We've got 1 mission on the board!";
    return `We've got ${totalMissions} missions to conquer!`;
  };

  // Get Quillby's battle gear based on urgency
  const getQuillbyImage = () => {
    if (userData.energy < calculateFocusEnergyCost(userData)) {
      return require('../../assets/hamsters/casual/sleeping.png');
    }
    if (urgentDeadlines.length > 0) {
      return require('../../assets/hamsters/casual/focus.png'); // Battle ready!
    }
    return require('../../assets/hamsters/casual/studying.png'); // Strategy mode
  };

  const handleStartSession = (deadlineId?: string) => {
    playTabSound();
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
    const success = startFocusSession(pendingDeadlineId, config);
    if (success) {
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
    playTabSound();
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
    // Parse date string in local timezone to avoid UTC conversion issues
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    const now = new Date();

    // Compare at the calendar-day level (ignore time of day)
    const startOfDue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = startOfDue.getTime() - startOfToday.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    if (diffDays === 0) return `${formattedDate} (Today)`;
    if (diffDays === 1) return `${formattedDate} (Tomorrow)`;
    if (diffDays > 1) return `${formattedDate} (${diffDays} days)`;
    return `${formattedDate} (Overdue)`;
  };



  return (
    <>
      <ThemedScreen showBackground={false}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Quillby Commander Section */}
          <View style={styles.commanderSection}>
            <Image
              source={getQuillbyImage()}
              style={styles.commanderImage}
              resizeMode="contain"
            />
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{getMissionBriefing()}</Text>
              <View style={styles.bubbleTail} />
            </View>
          </View>
          
          <Text style={[
            styles.commandTitle,
            themeType && { color: themeColors.isDark ? '#FFFFFF' : '#000' }
          ]}>🎯 {buddyName}'s Mission Control</Text>
          
          {/* Energy Shield Display */}
          <View style={[
            styles.energyShield,
            themeType && {
              backgroundColor: themeColors.isDark ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 215, 0, 0.9)',
            }
          ]}>
            <Text style={styles.shieldIcon}>⚡</Text>
            <View style={styles.shieldInfo}>
              <Text style={[styles.shieldLabel, themeType && { color: themeColors.isDark ? '#FFF' : '#000' }]}>POWER</Text>
              <Text style={[styles.shieldValue, themeType && { color: themeColors.isDark ? '#FFD700' : '#FF6F00' }]}>{Math.round(userData.energy)}</Text>
            </View>
          </View>

          {/* Start Focus Session Button */}
          <TouchableOpacity
            style={[
              styles.startFocusButton, 
              userData.energy < calculateFocusEnergyCost(userData) && styles.startFocusButtonDisabled,
              themeType && !( userData.energy < calculateFocusEnergyCost(userData)) && {
                backgroundColor: themeColors.isDark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(0, 187, 255, 0.9)',
                borderColor: themeColors.isDark ? 'rgba(96, 165, 250, 1)' : '#0084ffff',
                shadowColor: themeColors.isDark ? '#60a5fa' : '#4CAF50',
              },
              themeType && userData.energy < calculateFocusEnergyCost(userData) && themeColors.isDark && {
                backgroundColor: 'rgba(75, 85, 99, 0.6)',
                borderColor: 'rgba(107, 114, 128, 0.8)',
              }
            ]}
            onPress={() => handleStartSession()}
            disabled={userData.energy < calculateFocusEnergyCost(userData)}
            activeOpacity={0.8}
          >
            <Text style={styles.startFocusIcon}>
              {userData.energy >= calculateFocusEnergyCost(userData) ? '📚' : '😴'}
            </Text>
            <Text style={[
              styles.startFocusText,
              themeType && themeColors.isDark && { color: '#FFFFFF' }
            ]}>
              {userData.energy >= calculateFocusEnergyCost(userData) ? 'Start Focus Session' : 'Too Tired to Focus'}
            </Text>
            <Text style={[
              styles.startFocusSubtext,
              themeType && themeColors.isDark && { color: 'rgba(255, 255, 255, 0.8)' }
            ]}>
              {userData.energy >= calculateFocusEnergyCost(userData)
                ? `Costs ${calculateFocusEnergyCost(userData)} energy • Ready!`
                : `Need ${calculateFocusEnergyCost(userData)} energy (have ${Math.round(userData.energy)})`}
            </Text>
          </TouchableOpacity>

          {/* Mission Briefings */}
          {/* RED ALERT - Urgent Missions */}
          {urgentDeadlines.length > 0 && (
            <View style={[
              styles.collapsibleBox,
              themeType && {
                backgroundColor: themeColors.isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                borderWidth: 2,
                borderColor: themeColors.isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.3)',
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.alertHeader,
                  themeType && {
                    backgroundColor: themeColors.isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 205, 210, 0.8)',
                    borderColor: themeColors.isDark ? 'rgba(239, 68, 68, 0.6)' : '#D32F2F',
                  }
                ]}
                onPress={() => {
                  playTabSound();
                  setUrgentExpanded(!urgentExpanded);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={[
                      styles.alertTitle,
                      themeType && themeColors.isDark && { color: '#fca5a5' }
                    ]}>🔴 Red Alert!</Text>
                    <Text style={[
                      styles.alertSubtitle,
                      themeType && themeColors.isDark && { color: '#f87171' }
                    ]}>Urgent Missions ({urgentDeadlines.length})</Text>
                  </View>
                  <Text style={[
                    styles.expandArrow,
                    themeType && themeColors.isDark && { color: '#fca5a5' }
                  ]}>{urgentExpanded ? '▼' : '▶'}</Text>
                </View>
              </TouchableOpacity>
              
              {urgentExpanded && (
                <View style={styles.deadlinesContainer}>
                  {urgentDeadlines.map((deadline, index) => (
                    <TouchableOpacity 
                      key={deadline.id} 
                      style={[
                        styles.deadlineItem,
                        index < urgentDeadlines.length - 1 && styles.deadlineItemBorder,
                        themeType && themeColors.isDark && {
                          borderBottomColor: 'rgba(239, 68, 68, 0.3)',
                        }
                      ]}
                      onPress={() => handleDeadlinePress(deadline)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.deadlineContent}>
                        <View style={styles.missionHeader}>
                          <Text style={[
                            styles.missionTitle,
                            themeType && themeColors.isDark && { color: '#f8fafc' }
                          ]}>
                            📜 {deadline.title}
                          </Text>
                          <Text style={styles.urgencyBadge}>🔥</Text>
                        </View>
                        
                        <Text style={[
                          styles.missionDueDate,
                          themeType && themeColors.isDark && { color: '#fca5a5' }
                        ]}>
                          ⏰ {formatDate(deadline.dueDate)}
                          {deadline.dueTime ? ` at ${deadline.dueTime}` : ''}
                        </Text>
                        
                        {/* Visual Progress Bar */}
                        <View style={styles.progressSection}>
                          <View style={[
                            styles.progressBar,
                            themeType && themeColors.isDark && {
                              backgroundColor: 'rgba(75, 85, 99, 0.5)',
                              borderColor: 'rgba(107, 114, 128, 0.6)',
                            }
                          ]}>
                            <View 
                              style={[
                                styles.progressFill, 
                                { width: `${Math.min((deadline.workCompleted / deadline.estimatedHours) * 100, 100)}%` }
                              ]} 
                            />
                          </View>
                          <Text style={[
                            styles.progressText,
                            themeType && themeColors.isDark && { color: '#e2e8f0' }
                          ]}>
                            {formatHours(deadline.workCompleted)} / {formatHours(deadline.estimatedHours)}
                          </Text>
                        </View>
                        
                        <TouchableOpacity 
                          style={[
                            styles.attackButton,
                            themeType && themeColors.isDark && {
                              backgroundColor: 'rgba(239, 68, 68, 0.9)',
                              borderColor: 'rgba(220, 38, 38, 1)',
                              shadowColor: '#ef4444',
                            },
                            userData.energy < calculateFocusEnergyCost(userData) && themeType && themeColors.isDark && {
                              backgroundColor: 'rgba(75, 85, 99, 0.6)',
                              borderColor: 'rgba(107, 114, 128, 0.8)',
                            }
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleStartSession(deadline.id);
                          }}
                          disabled={userData.energy < calculateFocusEnergyCost(userData)}
                        >
                          <Text style={styles.attackButtonText}>
                            {userData.energy >= calculateFocusEnergyCost(userData) ? '🎯 Start Session' : '😴 No Energy'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* UPCOMING MISSIONS */}
          {upcomingDeadlines.length > 0 && (
            <View style={[
              styles.collapsibleBox,
              themeType && {
                backgroundColor: themeColors.isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                borderWidth: 2,
                borderColor: themeColors.isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)',
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.upcomingHeader,
                  themeType && {
                    backgroundColor: themeColors.isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(187, 222, 251, 0.8)',
                    borderColor: themeColors.isDark ? 'rgba(59, 130, 246, 0.6)' : '#42A5F5',
                  }
                ]}
                onPress={() => {
                  playTabSound();
                  setUpcomingExpanded(!upcomingExpanded);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={[
                      styles.upcomingTitle,
                      themeType && themeColors.isDark && { color: '#93c5fd' }
                    ]}>📋 Upcoming Missions</Text>
                    <Text style={[
                      styles.upcomingSubtitle,
                      themeType && themeColors.isDark && { color: '#60a5fa' }
                    ]}>Plan Your Strategy ({upcomingDeadlines.length})</Text>
                  </View>
                  <Text style={[
                    styles.expandArrow,
                    themeType && themeColors.isDark && { color: '#93c5fd' }
                  ]}>{upcomingExpanded ? '▼' : '▶'}</Text>
                </View>
              </TouchableOpacity>
              
              {upcomingExpanded && (
                <View style={styles.deadlinesContainer}>
                  {upcomingDeadlines.map((deadline, index) => {
                    const isHighPriority = deadline.priority === 'high';
                    const isMediumPriority = deadline.priority === 'medium';
                    const isLowPriority = deadline.priority === 'low';
                    
                    return (
                      <TouchableOpacity 
                        key={deadline.id} 
                        style={[
                          styles.deadlineItem,
                          index < upcomingDeadlines.length - 1 && styles.deadlineItemBorder,
                          themeType && themeColors.isDark && {
                            borderBottomColor: 'rgba(59, 130, 246, 0.3)',
                          }
                        ]}
                        onPress={() => handleDeadlinePress(deadline)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.deadlineContent}>
                          <View style={styles.missionHeader}>
                            <Text style={[
                              styles.missionTitle,
                              themeType && themeColors.isDark && { color: '#f8fafc' }
                            ]}>
                              📜 {deadline.title}
                            </Text>
                            <Text style={styles.priorityBadge}>
                              {isHighPriority ? '🔴' : isMediumPriority ? '🟡' : '🟢'}
                            </Text>
                          </View>
                          
                          <Text style={[
                            styles.missionDueDate,
                            themeType && themeColors.isDark && { color: '#93c5fd' }
                          ]}>
                            🗓️ {formatDate(deadline.dueDate)}
                            {deadline.dueTime ? ` at ${deadline.dueTime}` : ''}
                          </Text>
                          
                          {/* Visual Progress Bar */}
                          <View style={styles.progressSection}>
                            <View style={[
                              styles.progressBar,
                              themeType && themeColors.isDark && {
                                backgroundColor: 'rgba(75, 85, 99, 0.5)',
                                borderColor: 'rgba(107, 114, 128, 0.6)',
                              }
                            ]}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${Math.min((deadline.workCompleted / deadline.estimatedHours) * 100, 100)}%` }
                                ]} 
                              />
                            </View>
                            <Text style={[
                              styles.progressText,
                              themeType && themeColors.isDark && { color: '#e2e8f0' }
                            ]}>
                              {formatHours(deadline.workCompleted)} / {formatHours(deadline.estimatedHours)}
                            </Text>
                          </View>
                          
                          <TouchableOpacity 
                            style={[
                              styles.planButton,
                              isHighPriority && styles.planButtonHigh,
                              isMediumPriority && styles.planButtonMedium,
                              isLowPriority && styles.planButtonLow,
                              themeType && themeColors.isDark && {
                                backgroundColor: isHighPriority ? 'rgba(239, 68, 68, 0.9)' : 
                                                 isMediumPriority ? 'rgba(251, 146, 60, 0.9)' : 
                                                 'rgba(34, 197, 94, 0.9)',
                                borderColor: isHighPriority ? 'rgba(220, 38, 38, 1)' : 
                                            isMediumPriority ? 'rgba(234, 88, 12, 1)' : 
                                            'rgba(22, 163, 74, 1)',
                              },
                              userData.energy < calculateFocusEnergyCost(userData) && themeType && themeColors.isDark && {
                                backgroundColor: 'rgba(75, 85, 99, 0.6)',
                                borderColor: 'rgba(107, 114, 128, 0.8)',
                              }
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleStartSession(deadline.id);
                            }}
                            disabled={userData.energy < calculateFocusEnergyCost(userData)}
                          >
                            <Text style={styles.planButtonText}>
                              {userData.energy >= calculateFocusEnergyCost(userData) ? '📖 Start Focusing' : '😴 No Energy'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* VICTORIES - Completed */}
          {completedDeadlines.length > 0 && (
            <View style={[
              styles.collapsibleBox,
              themeType && {
                backgroundColor: themeColors.isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.15)',
                borderWidth: 2,
                borderColor: themeColors.isDark ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.3)',
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.victoryHeader,
                  themeType && {
                    backgroundColor: themeColors.isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(200, 230, 201, 0.8)',
                    borderColor: themeColors.isDark ? 'rgba(34, 197, 94, 0.6)' : '#66BB6A',
                  }
                ]}
                onPress={() => {
                  playTabSound();
                  setVictoriesExpanded(!victoriesExpanded);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={[
                      styles.victoryTitle,
                      themeType && themeColors.isDark && { color: '#86efac' }
                    ]}>🏆 Victories</Text>
                    <Text style={[
                      styles.victorySubtitle,
                      themeType && themeColors.isDark && { color: '#4ade80' }
                    ]}>Completed Missions ({completedDeadlines.length})</Text>
                  </View>
                  <Text style={[
                    styles.expandArrow,
                    themeType && themeColors.isDark && { color: '#86efac' }
                  ]}>{victoriesExpanded ? '▼' : '▶'}</Text>
                </View>
              </TouchableOpacity>
              
              {victoriesExpanded && (
                <View style={styles.deadlinesContainer}>
                  {completedDeadlines.map((deadline, index) => (
                    <TouchableOpacity 
                      key={deadline.id} 
                      style={[
                    styles.victoryScroll,
                    themeType && themeColors.isDark && {
                      borderColor: 'rgba(34, 197, 94, 0.5)',
                    }
                  ]}
                  onPress={() => handleDeadlinePress(deadline)}
                  activeOpacity={0.85}
                >
                  <Text style={[
                    styles.victoryText,
                    themeType && themeColors.isDark && { color: '#86efac' }
                  ]}>✓ {deadline.title}</Text>
                  <Text style={styles.victoryBadge}>🎖️</Text>
                </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Empty State - No Missions */}
          {totalMissions === 0 && completedDeadlines.length === 0 && (
            <View style={styles.emptyWarRoom}>
              <Image
                source={require('../../assets/hamsters/casual/idle-sit.png')}
                style={styles.emptyQuillby}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>No missions yet!</Text>
              <Text style={styles.emptySubtitle}>Ready to plan your first conquest?</Text>
            </View>
          )}

          {/* Plan New Mission Button */}
          <TouchableOpacity 
            style={styles.newMissionButton}
            onPress={() => {
              playTabSound();
              setShowCreateModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.newMissionText}>📝 Plan New Mission</Text>
          </TouchableOpacity>

        </ScrollView>
      </ThemedScreen>

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
        isPremium={userData.purchasedItems?.includes('premium') || false}
      />
    </>
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
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  
  // Mission Control Command Center
  commandCenter: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.02,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  commanderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  commanderImage: {
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 0.2,
    marginRight: SCREEN_WIDTH * 0.03,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speechText: {
    fontSize: SCREEN_WIDTH * 0.036,
    color: '#000',
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
    borderRightColor: '#FFF',
  },
  commandTitle: {
    fontSize: SCREEN_WIDTH * 0.048,
    color: '#000',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
    fontWeight: '700',
  },
  energyShield: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 20,
    padding: SCREEN_WIDTH * 0.02,
    alignSelf: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  shieldIcon: {
    fontSize: SCREEN_WIDTH * 0.08,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  shieldInfo: {
    alignItems: 'center',
  },
  shieldLabel: {
    fontSize: SCREEN_WIDTH * 0.026,
    color: '#000',
    fontWeight: '700',
  },
  shieldValue: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#FF6F00',
    fontWeight: '700',
  },
  
  // Start Focus Session Button
  startFocusButton: {
    backgroundColor: '#00bbffff',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.03,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#0084ffff',
  },
  startFocusButtonDisabled: {
    backgroundColor: '#9E9E9E',
    borderColor: '#757575',
    shadowColor: '#000',
  },
  startFocusIcon: {
    fontSize: SCREEN_WIDTH * 0.1,
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  startFocusText: {
    fontSize: SCREEN_WIDTH * 0.048,
    color: '#FFF',
    marginBottom: SCREEN_HEIGHT * 0.005,
    fontWeight: '700',
  },
  startFocusSubtext: {
    fontFamily: 'Schoolbell',
    fontSize: SCREEN_WIDTH * 0.032,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  
  // Mission Sections
  missionSection: {
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  collapsibleBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.025,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  deadlinesContainer: {
    backgroundColor: 'transparent',
  },
  deadlineItem: {
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: 'transparent',
  },
  deadlineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#BDBDBD', // Darker border
  },
  deadlineContent: {
    // Content styling
  },
  alertHeader: {
    backgroundColor: '#FFCDD2', // Light red
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandArrow: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#333',
    marginLeft: SCREEN_WIDTH * 0.02,
    fontWeight: '700',
  },
  alertTitle: {
    fontSize: SCREEN_WIDTH * 0.048,
    color: '#C62828', // Dark red for contrast
    fontWeight: '700',
  },
  alertSubtitle: {
    fontFamily: 'ChakraPetch_500Medium',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#D32F2F', // Medium red
    marginTop: 2,
    fontWeight: '600',
  },
  upcomingHeader: {
    backgroundColor: '#BBDEFB', // Light blue
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#42A5F5',
  },
  upcomingTitle: {
    fontSize: SCREEN_WIDTH * 0.048,
    color: '#1565C0', // Dark blue for contrast
    fontWeight: '700',
  },
  upcomingSubtitle: {
    fontFamily: 'ChakraPetch_500Medium',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#1976D2', // Medium blue
    marginTop: 2,
    fontWeight: '600',
  },
  victoryHeader: {
    backgroundColor: '#4CAF50',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#388E3C',
  },
  victoryTitle: {
    fontSize: SCREEN_WIDTH * 0.048,
    color: '#FFF',
    fontWeight: '700',
  },
  victorySubtitle: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '600',
  },
  
  // Mission Scroll (Parchment Style)
  missionScroll: {
    backgroundColor: '#FFF8DC',
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#DEB887',
  },
  // Red Alert Mission Cards
  urgentMissionScroll: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.015,
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FF5252',
  },
  // Upcoming Mission Cards
  upcomingMissionScroll: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.015,
    shadowColor: '#64B5F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#64B5F6',
  },
  scrollPaper: {
    padding: SCREEN_WIDTH * 0.04,
  },
  scrollCurl: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: '#DEB887',
    borderTopLeftRadius: 20,
  },
  urgentScrollCurl: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: '#FF5252',
    borderTopLeftRadius: 20,
  },
  upcomingScrollCurl: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: '#64B5F6',
    borderTopLeftRadius: 20,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  missionTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    flex: 1,
  },
  urgencyBadge: {
    fontSize: SCREEN_WIDTH * 0.065,
  },
  priorityBadge: {
    fontSize: SCREEN_WIDTH * 0.05,
  },
  missionDueDate: {
    fontSize: SCREEN_WIDTH * 0.036,
    color: '#000',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'Schoolbell',
  },
  
  // Visual Progress Bar
  progressSection: {
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: SCREEN_HEIGHT * 0.005,
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  progressText: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Schoolbell',
  },
  
  // Action Buttons
  attackButton: {
    backgroundColor: '#FF5252',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D32F2F',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  attackButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.038,
    fontWeight: '700',
  },
  planButton: {
    backgroundColor: '#2196F3',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976D2',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  planButtonHigh: {
    backgroundColor: '#FF5252',
    borderColor: '#D32F2F',
    shadowColor: '#FF5252',
  },
  planButtonMedium: {
    backgroundColor: '#FF9800',
    borderColor: '#F57C00',
    shadowColor: '#FF9800',
  },
  planButtonLow: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
    shadowColor: '#4CAF50',
  },
  planButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.038,
    fontWeight: '700',
  },
  
  // Victory Scroll
  victoryScroll: {
    backgroundColor: 'transparent',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.01,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  victoryText: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#000',
    flex: 1,
    fontFamily: 'Schoolbell',
  },
  victoryBadge: {
    fontSize: SCREEN_WIDTH * 0.065,
  },
  
  // Empty War Room
  emptyWarRoom: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: SCREEN_WIDTH * 0.08,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.03,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyQuillby: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  emptyTitle: {
    fontSize: SCREEN_WIDTH * 0.048,
    color: '#000',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Plan New Mission Button
  newMissionButton: {
    backgroundColor: '#4CAF50',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
    borderWidth: 3,
    borderColor: '#388E3C',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  newMissionText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.042,
    fontWeight: '700',
  },
});