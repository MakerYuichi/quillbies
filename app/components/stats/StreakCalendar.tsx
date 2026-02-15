// Streak calendar component for tracking focus sessions and deadlines
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import DayDetailsModal from '../modals/DayDetailsModal';
import { useQuillbyStore } from '../../state/store-modular';
import { getDeviceUser } from '../../../lib/deviceAuth';
import { getCalendarDayNotes } from '../../../lib/calendarNotes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StreakCalendarProps {
  completedDays: number[]; // Array of day numbers that were completed (1-31)
  currentMonth: string;
  userCreatedAt?: Date; // When user signed up
}

// Store day emojis loaded from database
interface DayEmojis {
  [key: string]: string;
}

export default function StreakCalendar({ completedDays, currentMonth, userCreatedAt }: StreakCalendarProps) {
  const { deadlines } = useQuillbyStore();
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = previous, etc.
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [showFutureAlert, setShowFutureAlert] = useState(false);
  const [futureDate, setFutureDate] = useState<Date | null>(null);
  const [dayEmojis, setDayEmojis] = useState<DayEmojis>({});
  const [, forceUpdate] = useState(0); // For re-rendering when emoji changes
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Load emojis from database when component mounts or month changes
  useEffect(() => {
    loadMonthEmojis();
  }, [selectedMonthOffset]);
  
  const loadMonthEmojis = async () => {
    try {
      const user = await getDeviceUser();
      if (!user) return;
      
      // Get first and last day of selected month
      const selectedMonth = availableMonths[selectedMonthOffset] || availableMonths[0];
      const firstDay = new Date(selectedMonth.year, selectedMonth.month, 1);
      const lastDay = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
      
      const year1 = firstDay.getFullYear();
      const month1 = String(firstDay.getMonth() + 1).padStart(2, '0');
      const day1 = String(firstDay.getDate()).padStart(2, '0');
      const startDate = `${year1}-${month1}-${day1}`;
      
      const year2 = lastDay.getFullYear();
      const month2 = String(lastDay.getMonth() + 1).padStart(2, '0');
      const day2 = String(lastDay.getDate()).padStart(2, '0');
      const endDate = `${year2}-${month2}-${day2}`;
      
      const notes = await getCalendarDayNotes(user.id, startDate, endDate);
      
      // Convert to emoji map
      const emojiMap: DayEmojis = {};
      notes.forEach(note => {
        if (note.emoji) {
          emojiMap[note.date] = note.emoji;
        }
      });
      
      setDayEmojis(emojiMap);
    } catch (error) {
      console.error('[StreakCalendar] Failed to load emojis:', error);
    }
  };
  
  // Calculate available months based on user signup date
  const availableMonths = useMemo(() => {
    const now = new Date();
    const signupDate = userCreatedAt || now;
    const months = [];
    
    let currentDate = new Date(signupDate.getFullYear(), signupDate.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    while (currentDate <= endDate) {
      months.push({
        name: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months.reverse(); // Most recent first
  }, [userCreatedAt]);
  
  const selectedMonth = availableMonths[selectedMonthOffset] || availableMonths[0];
  
  // Get days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
  }, [selectedMonth]);
  
  // Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = useMemo(() => {
    return new Date(selectedMonth.year, selectedMonth.month, 1).getDay();
  }, [selectedMonth]);
  
  // Generate calendar grid with empty cells for alignment
  const calendarDays = useMemo(() => {
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [daysInMonth, firstDayOfMonth]);
  
  const isCurrentMonth = selectedMonthOffset === 0;
  const today = new Date().getDate();
  
  const handleDayPress = (day: number) => {
    const date = new Date(selectedMonth.year, selectedMonth.month, day);
    const today = new Date();
    
    // Set time to start of day for accurate comparison
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if date is in the future
    if (dateStart > todayStart) {
      setFutureDate(date);
      setShowFutureAlert(true);
      return;
    }
    
    setSelectedDate(date);
    setShowDayDetails(true);
  };
  
  const handleEmojiChange = (emoji: string) => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      setDayEmojis(prev => ({ ...prev, [dateKey]: emoji }));
      forceUpdate(prev => prev + 1); // Force re-render
    }
  };
  
  const getDayEmoji = (day: number) => {
    const date = new Date(selectedMonth.year, selectedMonth.month, day);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;
    return dayEmojis[dateKey];
  };
  
  const handlePrevMonth = () => {
    if (selectedMonthOffset < availableMonths.length - 1) {
      setSelectedMonthOffset(selectedMonthOffset + 1);
    }
  };
  
  const handleNextMonth = () => {
    if (selectedMonthOffset > 0) {
      setSelectedMonthOffset(selectedMonthOffset - 1);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header with Quillby */}
      <View style={styles.header}>
        <Image 
          source={require('../../../assets/hamsters/casual/idle-sit-happy.png')}
          style={styles.quillbyImage}
          resizeMode="contain"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>📅 Your Journey</Text>
          <Text style={styles.subtitle}>Tap any day to see details!</Text>
        </View>
      </View>
      
      {/* Month Navigation */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity 
          onPress={handlePrevMonth}
          disabled={selectedMonthOffset >= availableMonths.length - 1}
          style={[styles.navButton, selectedMonthOffset >= availableMonths.length - 1 && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.monthBadge}>
          <Text style={styles.monthText}>{selectedMonth.name}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleNextMonth}
          disabled={selectedMonthOffset <= 0}
          style={[styles.navButton, selectedMonthOffset <= 0 && styles.navButtonDisabled]}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>
      
      {/* Week day headers */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }
          
          const isCompleted = completedDays.includes(day);
          const isCurrentMonth = selectedMonthOffset === 0;
          const isToday = isCurrentMonth && day === today;
          const dayEmoji = getDayEmoji(day);
          
          // Check if this day has deadlines
          const date = new Date(selectedMonth.year, selectedMonth.month, day);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const dayStr = String(date.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${dayStr}`;
          
          const hasDeadlines = deadlines.some(deadline => {
            const deadlineDate = deadline.dueDate.includes('T')
              ? deadline.dueDate.split('T')[0]
              : deadline.dueDate;
            return deadlineDate === dateString;
          });
          
          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDayPress(day)}
              style={[
                styles.dayCell,
                styles.dayCellTouchable,
                isToday && styles.todayCell,
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.dayContent}>
                <Text style={[styles.dayText, isToday && styles.todayText]}>{day}</Text>
                {dayEmoji && (
                  <View style={styles.emojiOverlay}>
                    <Text style={styles.dayEmojiLarge}>{dayEmoji}</Text>
                  </View>
                )}
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.badgeText}>✓</Text>
                  </View>
                )}
                {hasDeadlines && !isCompleted && (
                  <View style={styles.deadlineBadge}>
                    <Text style={styles.badgeText}>⚡</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>✓</Text>
          <Text style={styles.legendText}>Goals Met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.todayIndicator} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendEmoji}>⚡</Text>
          <Text style={styles.legendText}>Deadline</Text>
        </View>
      </View>
      
      {/* Day Details Modal */}
      {selectedDate && (
        <DayDetailsModal
          visible={showDayDetails}
          onClose={() => setShowDayDetails(false)}
          date={selectedDate}
          onEmojiChange={handleEmojiChange}
        />
      )}
      
      {/* Future Date Alert Modal */}
      <Modal
        visible={showFutureAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFutureAlert(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <Image 
              source={require('../../../assets/hamsters/casual/idle-sit.png')}
              style={styles.alertQuillby}
              resizeMode="contain"
            />
            <Text style={styles.alertTitle}>🔮 Not Yet!</Text>
            <Text style={styles.alertMessage}>
              This day hasn't happened yet! I can't see into the future... or can I? 🤔
            </Text>
            
            {/* Show deadlines for future date if any */}
            {futureDate && (() => {
              const year = futureDate.getFullYear();
              const month = String(futureDate.getMonth() + 1).padStart(2, '0');
              const day = String(futureDate.getDate()).padStart(2, '0');
              const dateString = `${year}-${month}-${day}`;
              
              const futureDeadlines = deadlines.filter(deadline => {
                // Normalize deadline date to YYYY-MM-DD format
                const deadlineDate = deadline.dueDate.includes('T')
                  ? deadline.dueDate.split('T')[0]
                  : deadline.dueDate;
                return deadlineDate === dateString;
              });
              
              if (futureDeadlines.length > 0) {
                return (
                  <View style={styles.futureDeadlinesSection}>
                    <Text style={styles.futureDeadlinesTitle}>📌 Upcoming Deadlines:</Text>
                    <ScrollView style={styles.futureDeadlinesList} showsVerticalScrollIndicator={false}>
                      {futureDeadlines.map((deadline) => {
                        // Calculate time remaining
                        const getTimeRemaining = () => {
                          const [year, month, day] = deadline.dueDate.split('T')[0].split('-').map(Number);
                          const dueDate = new Date(year, month - 1, day);
                          const now = new Date();
                          const startOfDue = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
                          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                          const diffTime = startOfDue.getTime() - startOfToday.getTime();
                          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays === 0) return 'TODAY';
                          if (diffDays === 1) return '1 DAY';
                          if (diffDays > 1) return `${diffDays} DAYS`;
                          return 'OVERDUE';
                        };
                        
                        return (
                          <View key={deadline.id} style={styles.futureDeadlineCard}>
                            <Text style={styles.futureDeadlineIcon}>
                              {deadline.category === 'study' ? '📘' : 
                               deadline.category === 'work' ? '💼' : 
                               deadline.category === 'project' ? '📝' : '📌'}
                            </Text>
                            <View style={styles.futureDeadlineContent}>
                              <Text style={styles.futureDeadlineTitle}>{deadline.title}</Text>
                              {deadline.dueTime && (
                                <Text style={styles.futureDeadlineTime}>⏰ {deadline.dueTime}</Text>
                              )}
                            </View>
                            <View style={[
                              styles.futurePriorityBadge,
                              deadline.priority === 'high' && styles.priorityHigh,
                              deadline.priority === 'medium' && styles.priorityMedium,
                              deadline.priority === 'low' && styles.priorityLow,
                            ]}>
                              <Text style={styles.futurePriorityText}>{getTimeRemaining()}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                );
              }
              return null;
            })()}
            
            <Text style={styles.alertSubtext}>
              Come back after this day passes to see your progress!
            </Text>
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => setShowFutureAlert(false)}
            >
              <Text style={styles.alertButtonText}>Got it! ✨</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: SCREEN_WIDTH * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#FFE4B5',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF8E7',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  quillbyImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '800',
    color: '#FF6B35',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD93D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '700',
    color: '#333',
  },
  monthBadge: {
    backgroundColor: '#FFD93D',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#333',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekDayCell: {
    width: SCREEN_WIDTH * 0.11,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontWeight: '700',
    color: '#999',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  dayCell: {
    width: SCREEN_WIDTH * 0.11,
    height: SCREEN_WIDTH * 0.11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayCellTouchable: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  todayCell: {
    backgroundColor: '#FFF8E7',
    borderColor: '#FFD93D',
    borderWidth: 3,
  },
  dayContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: SCREEN_WIDTH * 0.038,
    fontWeight: '700',
    color: '#333',
  },
  todayText: {
    color: '#FF6B35',
    fontWeight: '900',
  },
  emojiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  dayEmojiLarge: {
    fontSize: SCREEN_WIDTH * 0.08,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  deadlineBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendEmoji: {
    fontSize: 18,
  },
  todayIndicator: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#FFD93D',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  legendText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    fontWeight: '600',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    backgroundColor: '#FFF8E7',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    borderWidth: 4,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  alertQuillby: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B35',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
    fontWeight: '600',
  },
  alertSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  alertButton: {
    backgroundColor: '#FFD93D',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  alertButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  futureDeadlinesSection: {
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    maxHeight: 200,
  },
  futureDeadlinesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 12,
    textAlign: 'center',
  },
  futureDeadlinesList: {
    maxHeight: 160,
  },
  futureDeadlineCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFCDD2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  futureDeadlineIcon: {
    fontSize: 20,
  },
  futureDeadlineContent: {
    flex: 1,
  },
  futureDeadlineTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  futureDeadlineTime: {
    fontSize: 11,
    color: '#666',
  },
  futurePriorityBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  futurePriorityText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  priorityHigh: {
    backgroundColor: '#F44336',
  },
  priorityMedium: {
    backgroundColor: '#FF9800',
  },
  priorityLow: {
    backgroundColor: '#9E9E9E',
  },
});
