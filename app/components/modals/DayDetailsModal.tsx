import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Dimensions, Image, StatusBar, ImageBackground } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getDeviceUser } from '../../../lib/deviceAuth';
import { saveCalendarDayNote, getCalendarDayNote } from '../../../lib/calendarNotes';
import DeadlineDetailModal from './DeadlineDetailModal';
import CreateDeadlineModal from './CreateDeadlineModal';
import { Deadline } from '../../core/types';
import { useRouter } from 'expo-router';
import { getThemeColors } from '../../utils/themeColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DayDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  onEmojiChange?: (emoji: string) => void;
}

export default function DayDetailsModal({ visible, onClose, date, onEmojiChange }: DayDetailsModalProps) {
  const userData = useQuillbyStore((state) => state.userData);
  const deadlines = useQuillbyStore((state) => state.deadlines);
  const deleteDeadline = useQuillbyStore((state) => state.deleteDeadline);
  const startFocusSession = useQuillbyStore((state) => state.startFocusSession);
  const router = useRouter();
  
  // Get theme colors
  const themeType = userData.roomCustomization?.themeType;
  const themeColors = getThemeColors(themeType);
  
  const [note, setNote] = useState('');
  const [selectedDayEmoji, setSelectedDayEmoji] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeadlineDetail, setShowDeadlineDetail] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [showEditDeadline, setShowEditDeadline] = useState(false);
  
  const dayEmojis = ['🌟', '🎉', '💪', '🔥', '✨', '🚀', '💯', '🎯', '⚡', '🌈', '🦋', '🌺', '🎨', '📚', '☕', '🌙'];
  
  // Load note and emoji when modal opens or date changes
  useEffect(() => {
    if (visible) {
      loadDayNote();
    }
  }, [visible, date]);
  
  const loadDayNote = async () => {
    try {
      const user = await getDeviceUser();
      if (!user) return;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('[DayDetailsModal] Loading note for date:', dateString, 'from Date object:', date.toISOString());
      
      const dayNote = await getCalendarDayNote(user.id, dateString);
      if (dayNote) {
        setNote(dayNote.note || '');
        setSelectedDayEmoji(dayNote.emoji || '');
      } else {
        setNote('');
        setSelectedDayEmoji('');
      }
    } catch (error) {
      console.error('[DayDetailsModal] Failed to load note:', error);
    }
  };
  
  const saveDayNote = async () => {
    try {
      setIsLoading(true);
      const user = await getDeviceUser();
      if (!user) {
        console.log('[DayDetailsModal] No user, skipping save');
        return;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('[DayDetailsModal] Saving note for date:', dateString, 'from Date object:', date.toISOString());
      
      await saveCalendarDayNote(user.id, dateString, note, selectedDayEmoji);
      console.log('[DayDetailsModal] Note saved successfully');
    } catch (error) {
      console.error('[DayDetailsModal] Failed to save note:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setSelectedDayEmoji(emoji);
    setShowEmojiPicker(false);
    onEmojiChange?.(emoji);
    // Save immediately when emoji changes
    setTimeout(() => saveDayNote(), 100);
  };
  
  const handleNoteBlur = () => {
    // Save when user finishes editing note
    saveDayNote();
  };
  
  // Format date for display
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric'
  });
  
  // Check if this is today
  const isToday = date.toDateString() === new Date().toDateString();
  
  // Get deadlines for this specific date
  const dateString = (() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone
  })();
  
  const dayDeadlines = deadlines.filter(deadline => {
    // Normalize deadline date to YYYY-MM-DD format
    const deadlineDate = deadline.dueDate.includes('T')
      ? deadline.dueDate.split('T')[0]
      : deadline.dueDate;
    return deadlineDate === dateString;
  });

  // Get data for this day
  const dayData = isToday ? {
    studyMinutes: userData.studyMinutesToday || 0,
    studyGoal: userData.studyGoalHours ? userData.studyGoalHours * 60 : 0,
    waterGlasses: userData.waterGlasses || 0,
    waterGoal: userData.hydrationGoalGlasses || 8,
    mealsLogged: userData.mealsLogged || 0,
    mealGoal: userData.mealGoalCount || 3,
    ateBreakfast: userData.ateBreakfast || false,
    exerciseMinutes: userData.exerciseMinutes || 0,
    exerciseGoal: userData.exerciseGoalMinutes || 30,
    sleepHours: 0,
    sleepGoal: userData.sleepGoalHours || 8,
    messPoints: userData.messPoints || 0,
    missedCheckpoints: userData.missedCheckpoints || 0,
    qCoins: userData.qCoins || 0,
    currentStreak: userData.currentStreak || 0,
  } : {
    studyMinutes: 0,
    studyGoal: userData.studyGoalHours ? userData.studyGoalHours * 60 : 0,
    waterGlasses: 0,
    waterGoal: userData.hydrationGoalGlasses || 8,
    mealsLogged: 0,
    mealGoal: userData.mealGoalCount || 3,
    ateBreakfast: false,
    exerciseMinutes: 0,
    exerciseGoal: userData.exerciseGoalMinutes || 30,
    sleepHours: 0,
    sleepGoal: userData.sleepGoalHours || 8,
    messPoints: 0,
    missedCheckpoints: 0,
    qCoins: 0,
    currentStreak: 0,
  };
  
  // Calculate completion percentages
  const studyCompleted = dayData.studyGoal > 0 ? Math.min(100, (dayData.studyMinutes / dayData.studyGoal) * 100) : 0;
  const waterCompleted = Math.min(100, (dayData.waterGlasses / dayData.waterGoal) * 100);
  const mealsCompleted = Math.min(100, (dayData.mealsLogged / dayData.mealGoal) * 100);
  const exerciseCompleted = dayData.exerciseGoal > 0 ? Math.min(100, (dayData.exerciseMinutes / dayData.exerciseGoal) * 100) : 0;
  
  // Overall completion
  const enabledGoals = [];
  if (userData.enabledHabits?.includes('study') && dayData.studyGoal > 0) enabledGoals.push(studyCompleted);
  if (userData.enabledHabits?.includes('hydration')) enabledGoals.push(waterCompleted);
  if (userData.enabledHabits?.includes('meals')) enabledGoals.push(mealsCompleted);
  if (userData.enabledHabits?.includes('exercise') && dayData.exerciseGoal > 0) enabledGoals.push(exerciseCompleted);
  
  const overallCompletion = enabledGoals.length > 0 
    ? Math.round(enabledGoals.reduce((sum, val) => sum + val, 0) / enabledGoals.length)
    : 0;

  const getQuillbyMood = () => {
    if (overallCompletion >= 90) return { 
      image: require('../../../assets/hamsters/casual/idle-sit-happy.png'),
      message: 'You crushed it today! Keep that momentum going! 🌟' 
    };
    if (overallCompletion >= 70) return { 
      image: require('../../../assets/hamsters/casual/idle-sit-happy.png'),
      message: 'Great progress! You\'re doing amazing! ⭐' 
    };
    if (overallCompletion >= 50) return { 
      image: require('../../../assets/hamsters/casual/idle-sit.png'),
      message: 'Good effort! Let\'s keep building those habits! 💪' 
    };
    if (overallCompletion >= 30) return { 
      image: require('../../../assets/hamsters/casual/idle-sit.png'),
      message: 'Every step counts! Tomorrow is a new day! 🌱' 
    };
    return { 
      image: require('../../../assets/hamsters/casual/idle-sit.png'),
      message: 'It\'s okay! Let\'s try again tomorrow! 🌈' 
    };
  };
  
  const quillbyMood = getQuillbyMood();
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor={themeType ? themeColors.statusBar : "#2C3E50"} />
      <View style={styles.overlay}>
        <View style={[
          styles.container,
          themeType && {
            backgroundColor: themeColors.isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
            borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          }
        ]}>
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
          
          {/* Decorative corners */}
          <Text style={styles.cornerLeft}>🌈</Text>
          <Text style={styles.cornerRight}>⭐</Text>
          
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          {/* Header */}
          <View style={[
            styles.header,
            themeType && {
              backgroundColor: themeColors.accentColor || themeColors.cardBackground,
            }
          ]}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>📅 {formattedDate}</Text>
            </View>
            
            {/* Score Circle */}
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Image 
                  source={quillbyMood.image}
                  style={styles.quillbyImage}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.scorePercent}>{overallCompletion}%</Text>
                  <Text style={styles.scoreLabel}>
                    {overallCompletion >= 90 ? 'Amazing!' : 
                     overallCompletion >= 70 ? 'Great day!' : 
                     overallCompletion >= 50 ? 'Good job!' : 
                     overallCompletion >= 30 ? 'Keep going!' : 'Try again!'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Day Vibe Selector */}
            <TouchableOpacity 
              style={styles.vibeButton}
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Text style={styles.vibeEmoji}>{selectedDayEmoji || '🌟'}</Text>
              <Text style={styles.vibeText}>Today's vibe</Text>
              <Text style={styles.vibeSparkle}>✨</Text>
            </TouchableOpacity>
            
            {showEmojiPicker && (
              <View style={styles.emojiPicker}>
                {dayEmojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => handleEmojiSelect(emoji)}
                    style={styles.emojiOption}
                  >
                    <Text style={styles.emojiOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quillby's Thought Bubble */}
          <View style={styles.thoughtBubble}>
            <View style={styles.bubbleDot1} />
            <View style={styles.bubbleDot2} />
            <Text style={styles.thoughtText}>
              💭 <Text style={styles.thoughtBold}>{quillbyMood.message}</Text>
            </Text>
          </View>
          
          {/* Scrollable Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Study Card - Hero */}
            {userData.enabledHabits?.includes('study') && dayData.studyGoal > 0 && (
              <View style={[styles.habitCard, styles.studyCard]}>
                <View style={styles.habitHeader}>
                  <View style={styles.habitTitleRow}>
                    <Text style={styles.habitIcon}>📚</Text>
                    <View>
                      <Text style={styles.habitTitle}>Study Session</Text>
                      <Text style={styles.habitSubtitle}>
                        {Math.floor(dayData.studyMinutes / 60)}h {dayData.studyMinutes % 60}m / {Math.floor(dayData.studyGoal / 60)}h {dayData.studyGoal % 60}m
                      </Text>
                    </View>
                  </View>
                  <View style={styles.percentBadge}>
                    <Text style={styles.percentText}>{Math.round(studyCompleted)}%</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, styles.studyProgress, { width: `${studyCompleted}%` }]} />
                </View>
              </View>
            )}
            
            {/* Grid Row - Hydration & Meals */}
            <View style={styles.gridRow}>
              {userData.enabledHabits?.includes('hydration') && (
                <View style={[styles.habitCard, styles.waterCard, styles.halfCard]}>
                  <Text style={styles.habitIconLarge}>💧</Text>
                  <Text style={styles.habitTitleSmall}>Water</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFill, styles.waterProgress, { width: `${waterCompleted}%` }]} />
                  </View>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>{dayData.waterGlasses} / {dayData.waterGoal} glasses</Text>
                  </View>
                </View>
              )}
              
              {userData.enabledHabits?.includes('meals') && (
                <View style={[styles.habitCard, styles.mealsCard, styles.halfCard]}>
                  {mealsCompleted === 100 && <Text style={styles.sparkle}>✨</Text>}
                  <Text style={styles.habitIconLarge}>🍽️</Text>
                  <Text style={styles.habitTitleSmall}>Meals</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFill, styles.mealsProgress, { width: `${mealsCompleted}%` }]} />
                  </View>
                  <View style={styles.mealBadges}>
                    <View style={[styles.mealBadge, dayData.ateBreakfast && styles.mealBadgeActive]}>
                      <Text style={styles.mealBadgeText}>B</Text>
                    </View>
                    <View style={[styles.mealBadge, dayData.mealsLogged >= 2 && styles.mealBadgeActive]}>
                      <Text style={styles.mealBadgeText}>L</Text>
                    </View>
                    <View style={[styles.mealBadge, dayData.mealsLogged >= 3 && styles.mealBadgeActive]}>
                      <Text style={styles.mealBadgeText}>D</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Grid Row - Exercise & Sleep */}
            <View style={styles.gridRow}>
              {userData.enabledHabits?.includes('exercise') && (
                <View style={[styles.habitCard, styles.exerciseCard, styles.halfCard, dayData.exerciseMinutes === 0 && styles.cardInactive]}>
                  <Text style={styles.habitIconLarge}>🏃</Text>
                  <Text style={styles.habitTitleSmall}>Exercise</Text>
                  <View style={styles.progressBarSmall}>
                    <View style={[styles.progressFill, styles.exerciseProgress, { width: `${exerciseCompleted}%` }]} />
                  </View>
                  {dayData.exerciseMinutes === 0 ? (
                    <Text style={styles.restDayText}>Rest day</Text>
                  ) : (
                    <View style={styles.statBadge}>
                      <Text style={styles.statBadgeText}>{dayData.exerciseMinutes} min</Text>
                    </View>
                  )}
                </View>
              )}
              
              {userData.enabledHabits?.includes('sleep') && (
                <View style={[styles.habitCard, styles.sleepCard, styles.halfCard]}>
                  <Text style={styles.habitIconLarge}>😴</Text>
                  <Text style={styles.habitTitleSmall}>Sleep</Text>
                  <TouchableOpacity style={styles.logButton}>
                    <Text style={styles.logButtonText}>Log now →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {/* Stats Strip */}
            <View style={[
              styles.statsStrip,
              themeType && {
                backgroundColor: themeColors.accentColor || themeColors.cardBackground,
                borderColor: themeColors.accentBorder || themeColors.tabBarActive,
              }
            ]}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🧹</Text>
                <Text style={[
                  styles.statLabel,
                  themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#666' }
                ]}>Mess</Text>
                <Text style={[
                  styles.statValue,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' }
                ]}>{dayData.messPoints.toFixed(0)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={[
                  styles.statLabel,
                  themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#666' }
                ]}>Streak</Text>
                <Text style={[styles.statValue, styles.statValueOrange]}>{dayData.currentStreak}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={[
                  styles.statLabel,
                  themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#666' }
                ]}>Missed</Text>
                <Text style={[
                  styles.statValue,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' }
                ]}>{dayData.missedCheckpoints}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>🪙</Text>
                <Text style={[
                  styles.statLabel,
                  themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#666' }
                ]}>Coins</Text>
                <Text style={[styles.statValue, styles.statValueGold]}>{dayData.qCoins}</Text>
              </View>
            </View>
            
            {/* Achievements Section */}
            {isToday && userData.achievements && Object.keys(userData.achievements).length > 0 && (
              <View style={[
                styles.achievementsCard,
                themeType && {
                  backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}>
                <View style={styles.achievementsHeader}>
                  <Text style={styles.achievementsIcon}>🏆</Text>
                  <Text style={[
                    styles.achievementsTitle,
                    themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                  ]}>Today's Achievements</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.achievementsScroll}
                >
                  {Object.entries(userData.achievements)
                    .filter(([_, achievement]) => {
                      if (!achievement.unlocked || !achievement.unlockedAt) return false;
                      const unlockedDate = new Date(achievement.unlockedAt).toDateString();
                      const today = new Date().toDateString();
                      return unlockedDate === today;
                    })
                    .map(([achievementId, _]) => {
                      const achievement = require('../../core/achievements').ACHIEVEMENTS[achievementId];
                      if (!achievement) return null;
                      
                      // Get achievement asset
                      const getAchievementAsset = () => {
                        const assetMap: { [key: string]: any } = {
                          'daily-session': require('../../../assets/acheivements/daily/daily-session.png'),
                          'daily-water': require('../../../assets/acheivements/daily/daily-water.png'),
                          'daily-meals': require('../../../assets/acheivements/daily/daily-meals.png'),
                          'daily-hours': require('../../../assets/acheivements/daily/daily-hours.png'),
                          'daily-early': require('../../../assets/acheivements/daily/daily-early.png'),
                          'weekly-streak': require('../../../assets/acheivements/weekly/weekly-streak.png'),
                          'weekly-sessions': require('../../../assets/acheivements/weekly/weekly-sessions.png'),
                          'weekly-hours': require('../../../assets/acheivements/weekly/weekly-hours.png'),
                          'weekly-clean': require('../../../assets/acheivements/weekly/weekly-clean.png'),
                          'weekly-hydration': require('../../../assets/acheivements/weekly/weekly-hydration.png'),
                          'monthly-hours': require('../../../assets/acheivements/monthly/monthly-hours.png'),
                          'monthly-streak': require('../../../assets/acheivements/monthly/monthly-streak.png'),
                          'monthly-deadlines': require('../../../assets/acheivements/monthly/monthly-deadlines.png'),
                          'monthly-perfect': require('../../../assets/acheivements/monthly/monthly-perfect.png'),
                          'monthly-sessions': require('../../../assets/acheivements/monthly/monthly-sessions.png'),
                        };
                        return assetMap[achievementId] || null;
                      };
                      
                      const asset = getAchievementAsset();
                      
                      return (
                        <View key={achievementId} style={[
                          styles.achievementBadge,
                          themeType && {
                            backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                          }
                        ]}>
                          {asset ? (
                            <Image 
                              source={asset}
                              style={styles.achievementBadgeImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <Text style={styles.achievementBadgeIcon}>{achievement.icon}</Text>
                          )}
                          <Text style={[
                            styles.achievementBadgeName,
                            themeType && { color: themeColors.isDark ? '#FFFFFF' : '#2C3E50' }
                          ]}>{achievement.name}</Text>
                          <View style={styles.achievementRewards}>
                            <Text style={[
                              styles.achievementReward,
                              themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.8)' : '#666' }
                            ]}>💎 {achievement.xpReward}</Text>
                            <Text style={[
                              styles.achievementReward,
                              themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.8)' : '#666' }
                            ]}>🪙 {achievement.coinReward}</Text>
                          </View>
                        </View>
                      );
                    })}
                  {Object.entries(userData.achievements).filter(([_, achievement]) => {
                    if (!achievement.unlocked || !achievement.unlockedAt) return false;
                    const unlockedDate = new Date(achievement.unlockedAt).toDateString();
                    const today = new Date().toDateString();
                    return unlockedDate === today;
                  }).length === 0 && (
                    <View style={[
                      styles.noAchievementsToday,
                      themeType && {
                        backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                      }
                    ]}>
                      <Text style={[
                        styles.noAchievementsTodayText,
                        themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.6)' : '#999' }
                      ]}>✨ No achievements unlocked today yet</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
            
            {/* Notes */}
            <View style={styles.notesCard}>
              <View style={styles.notesHeader}>
                <Text style={styles.notesIcon}>📝</Text>
                <Text style={styles.notesTitle}>Today's Note</Text>
              </View>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes about this day..."
                placeholderTextColor="#999"
                multiline
                value={note}
                onChangeText={setNote}
                onBlur={handleNoteBlur}
              />
            </View>

            {/* Deadlines */}
            <View style={styles.deadlinesSection}>
              <View style={styles.deadlinesHeader}>
                <Text style={styles.deadlinesIcon}>⚡</Text>
                <Text style={[
                  styles.deadlinesTitle,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' }
                ]}>Deadlines</Text>
              </View>
              {dayDeadlines.length > 0 ? (
                dayDeadlines.map((deadline) => {
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
                    if (diffDays === -1) return '1 DAY AGO';
                    return `${Math.abs(diffDays)} DAYS AGO`;
                  };
                  
                  return (
                    <TouchableOpacity 
                      key={deadline.id} 
                      style={[
                        styles.deadlineCard,
                        themeType && {
                          backgroundColor: themeColors.isDark ? 'rgba(255, 235, 238, 0.2)' : '#FFEBEE',
                        }
                      ]}
                      onPress={() => {
                        setSelectedDeadline(deadline);
                        setShowDeadlineDetail(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deadlineIcon}>
                        {deadline.category === 'study' ? '📘' : 
                         deadline.category === 'work' ? '💼' : 
                         deadline.category === 'project' ? '📝' : '📌'}
                      </Text>
                      <View style={styles.deadlineContent}>
                        <Text style={[
                          styles.deadlineTitle,
                          themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' }
                        ]}>{deadline.title}</Text>
                        {deadline.dueTime && (
                          <Text style={[
                            styles.deadlineTime,
                            themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.8)' : '#666' }
                          ]}>⏰ {deadline.dueTime}</Text>
                        )}
                        <TouchableOpacity
                          style={styles.focusButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            startFocusSession(deadline.id);
                            onClose();
                            router.push('/study-session');
                          }}
                        >
                          <Text style={styles.focusButtonText}>🎯 Focus on this</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={[
                        styles.priorityBadge,
                        deadline.priority === 'high' && styles.priorityHigh,
                        deadline.priority === 'medium' && styles.priorityMedium,
                        deadline.priority === 'low' && styles.priorityLow,
                      ]}>
                        <Text style={styles.priorityText}>{getTimeRemaining()}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.noDeadlinesCard}>
                  <Text style={styles.noDeadlinesText}>✨ No deadlines for this day</Text>
                </View>
              )}
            </View>
            
            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>
      </View>
      
      {/* Deadline Detail Modal */}
      <DeadlineDetailModal
        visible={showDeadlineDetail}
        onClose={() => setShowDeadlineDetail(false)}
        deadline={selectedDeadline}
        onStartFocus={(deadlineId) => {
          startFocusSession(deadlineId);
          setShowDeadlineDetail(false);
          onClose();
          router.push('/study-session');
        }}
        onEdit={(deadline) => {
          setShowDeadlineDetail(false);
          setSelectedDeadline(deadline);
          setShowEditDeadline(true);
        }}
        onDelete={(deadlineId) => {
          deleteDeadline(deadlineId);
          setShowDeadlineDetail(false);
        }}
      />
      
      {/* Edit Deadline Modal */}
      {selectedDeadline && (
        <CreateDeadlineModal
          visible={showEditDeadline}
          onClose={() => {
            setShowEditDeadline(false);
            setSelectedDeadline(null);
          }}
          onSubmit={() => {
            setShowEditDeadline(false);
            setSelectedDeadline(null);
          }}
          mode="edit"
          initialData={selectedDeadline}
          deadlineId={selectedDeadline.id}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF8E7',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: '100%',
    height: SCREEN_HEIGHT * 0.92,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFE4B5',
  },
  cornerLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    fontSize: 24,
    zIndex: 10,
  },
  cornerRight: {
    position: 'absolute',
    top: 12,
    right: 64,
    fontSize: 24,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  header: {
    backgroundColor: '#FFD93D',
    padding: 24,
    paddingBottom: 32,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  dateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  scoreCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quillbyImage: {
    width: 80,
    height: 80,
  },
  scorePercent: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FF6B35',
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  vibeButton: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  vibeEmoji: {
    fontSize: 24,
  },
  vibeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  vibeSparkle: {
    fontSize: 16,
  },
  emojiPicker: {
    position: 'absolute',
    top: 180,
    left: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 30,
    maxWidth: 280,
  },
  emojiOption: {
    padding: 8,
  },
  emojiOptionText: {
    fontSize: 24,
  },
  thoughtBubble: {
    marginHorizontal: 24,
    marginTop: -16,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0BBE4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  bubbleDot1: {
    position: 'absolute',
    top: -12,
    left: 24,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0BBE4',
  },
  bubbleDot2: {
    position: 'absolute',
    top: -6,
    left: 16,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0BBE4',
  },
  thoughtText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  thoughtBold: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  habitCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 12,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  studyCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#90CAF9',
  },
  waterCard: {
    backgroundColor: '#E0F7FA',
    borderColor: '#80DEEA',
  },
  mealsCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    position: 'relative',
  },
  exerciseCard: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFCC80',
  },
  sleepCard: {
    backgroundColor: '#F3E5F5',
    borderColor: '#CE93D8',
  },
  cardInactive: {
    opacity: 0.6,
  },
  halfCard: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  habitIcon: {
    fontSize: 40,
  },
  habitTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  habitSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#64B5F6',
  },
  percentText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1976D2',
  },
  progressBar: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  studyProgress: {
    backgroundColor: '#42A5F5',
  },
  waterProgress: {
    backgroundColor: '#26C6DA',
  },
  mealsProgress: {
    backgroundColor: '#66BB6A',
  },
  exerciseProgress: {
    backgroundColor: '#FFA726',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  habitIconLarge: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  habitTitleSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBarSmall: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  statBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 32,
    zIndex: 10,
  },
  mealBadges: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  mealBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealBadgeActive: {
    backgroundColor: '#66BB6A',
  },
  mealBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  restDayText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logButton: {
    backgroundColor: '#AB47BC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  logButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsStrip: {
    backgroundColor: '#FFE4E1',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFB6C1',
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333',
  },
  statValueOrange: {
    color: '#FF6B35',
  },
  statValueGold: {
    color: '#FFD700',
  },
  notesCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FDD835',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesIcon: {
    fontSize: 20,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deadlinesSection: {
    marginBottom: 12,
  },
  deadlinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  deadlinesIcon: {
    fontSize: 18,
  },
  deadlinesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  deadlineCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFCDD2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deadlineIcon: {
    fontSize: 24,
  },
  deadlineContent: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deadlineTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  focusButton: {
    backgroundColor: '#6200EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  focusButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
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
  priorityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  noDeadlinesCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  noDeadlinesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
  achievementsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  achievementsIcon: {
    fontSize: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  achievementsScroll: {
    gap: 12,
  },
  achievementBadge: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    width: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementBadgeImage: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  achievementBadgeIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  achievementBadgeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
  achievementRewards: {
    flexDirection: 'row',
    gap: 8,
  },
  achievementReward: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  noAchievementsToday: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 16,
    width: 200,
    alignItems: 'center',
  },
  noAchievementsTodayText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
