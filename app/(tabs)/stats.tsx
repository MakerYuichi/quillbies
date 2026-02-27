import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { useQuillbyStore } from '../state/store-modular';
import { formatSleepTime, formatExerciseTime, formatStudyTime } from '../../lib/timeUtils';
import { getTodaysSleepHours } from '../core/engine';
import WeeklyLineGraph from '../components/stats/WeeklyLineGraph';
import PremiumPaywallModal from '../components/modals/PremiumPaywallModal';
import ActivityCard from '../components/stats/ActivityCard';
import StreakCalendar from '../components/stats/StreakCalendar';
import AchievementsSection from '../components/stats/AchievementsSection';
import ThemedScreen from '../components/themed/ThemedScreen';
import { playTabSound } from '../../lib/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StatsScreen() {
  const userData = useQuillbyStore((state) => state.userData);
  const deadlines = useQuillbyStore((state) => state.deadlines);
  const session = useQuillbyStore((state) => state.session);
  const getCompletedDeadlines = useQuillbyStore((state) => state.getCompletedDeadlines);
  const getUrgentDeadlines = useQuillbyStore((state) => state.getUrgentDeadlines);
  const getUpcomingDeadlines = useQuillbyStore((state) => state.getUpcomingDeadlines);
  const buddyName = userData.buddyName || 'Quillby';
  const [showPremiumModal, setShowPremiumModal] = React.useState(false);
  const [isPremiumExpanded, setIsPremiumExpanded] = React.useState(false);

  // Generate mock weekly data (last 7 days)
  // In production, this would come from historical data stored in the database
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Study data (minutes per day)
    const studyData = days.map((day, index) => ({
      day,
      value: index === 6 ? (userData.studyMinutesToday || 0) : Math.floor(Math.random() * 120 + 30), // Today's actual data
    }));
    
    // Sleep data (hours per day)
    const sleepData = days.map((day, index) => ({
      day,
      value: index === 6 ? getTodaysSleepHours(userData.sleepSessions || []) : Math.random() * 3 + 5, // Today's actual data
    }));
    
    // Water data (glasses per day)
    const waterData = days.map((day, index) => ({
      day,
      value: index === 6 ? userData.waterGlasses : Math.floor(Math.random() * 8 + 2), // Today's actual data
    }));
    
    return { studyData, sleepData, waterData };
  }, [userData.studyMinutesToday, userData.sleepSessions, userData.waterGlasses]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedDeadlines = getCompletedDeadlines();
    const urgentDeadlines = getUrgentDeadlines();
    const upcomingDeadlines = getUpcomingDeadlines();
    
    // Study stats
    const studyGoalProgress = userData.studyGoalHours 
      ? (userData.studyMinutesToday || 0) / (userData.studyGoalHours * 60) * 100
      : 0;
    
    // Sleep stats - use the same function as everywhere else for consistency
    const todaysSleep = getTodaysSleepHours(userData.sleepSessions || []);
    
    const avgSleep = userData.sleepSessions?.length > 0
      ? userData.sleepSessions.reduce((total, session) => total + (session.duration || 0), 0) / userData.sleepSessions.length / 3600
      : 0;
    
    // Habit completion rates
    const hydrationGoal = userData.hydrationGoalGlasses || 8;
    const mealGoal = userData.mealGoalCount || 3;
    const exerciseGoal = userData.exerciseGoalMinutes || 30; // Use dynamic exercise goal
    const waterProgress = (userData.waterGlasses / hydrationGoal) * 100;
    const mealProgress = (userData.mealsLogged / mealGoal) * 100;
    const exerciseProgress = Math.min((userData.exerciseMinutes / exerciseGoal) * 100, 100);
    
    // Deadline stats
    const totalDeadlines = deadlines.length;
    const completionRate = totalDeadlines > 0 
      ? (completedDeadlines.length / totalDeadlines) * 100 
      : 0;
    
    // Total study time from completed work
    const totalStudyHours = deadlines.reduce((total, d) => total + d.workCompleted, 0);
    
    // Room cleanliness
    const roomStatus = userData.messPoints <= 5 ? 'Clean' :
                      userData.messPoints <= 10 ? 'Light Mess' :
                      userData.messPoints <= 20 ? 'Medium Mess' : 'Heavy Mess';
    
    return {
      studyGoalProgress,
      todaysSleep,
      avgSleep,
      waterProgress,
      mealProgress,
      exerciseProgress,
      completedDeadlines: completedDeadlines.length,
      urgentDeadlines: urgentDeadlines.length,
      upcomingDeadlines: upcomingDeadlines.length,
      totalDeadlines,
      completionRate,
      totalStudyHours,
      roomStatus,
      hydrationGoal,
      mealGoal,
      exerciseGoal,
    };
  }, [userData, deadlines, getCompletedDeadlines, getUrgentDeadlines, getUpcomingDeadlines]);

  const renderProgressBar = (progress: number, color: string) => {
    const bars = Math.floor(progress / 10);
    const emptyBars = 10 - bars;
    return (
      <View style={styles.progressBarContainer}>
        <Text style={[styles.progressBar, { color }]}>
          {'█'.repeat(bars)}
          <Text style={styles.progressBarEmpty}>{'░'.repeat(emptyBars)}</Text>
        </Text>
        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
      </View>
    );
  };

  return (
    <ThemedScreen showBackground={false}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Your Progress</Text>
        </View>

        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>⚡ Current Status</Text>
          <View style={styles.overviewGrid}>
            <View style={[
              styles.overviewItem,
              (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewItemSmall
            ]}>
              <Text style={styles.overviewLabel}>Energy</Text>
              <Text style={[
                styles.overviewValue,
                (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewValueSmall
              ]}>
                {Math.round(userData.energy)}
              </Text>
            </View>
            <View style={[
              styles.overviewItem,
              (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewItemSmall
            ]}>
              <Text style={styles.overviewLabel}>Q-Bies</Text>
              <View style={styles.overviewIconRow}>
                <Image
                  source={require('../../assets/overall/qbies.png')}
                  style={[
                    styles.qbiesIconStats,
                    (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.qbiesIconSmall
                  ]}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.overviewValue,
                  (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewValueSmall
                ]}>
                  {userData.qCoins}
                </Text>
              </View>
            </View>
            <View style={[
              styles.overviewItem,
              (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewItemSmall
            ]}>
              <Text style={styles.overviewLabel}>Gems</Text>
              <View style={styles.overviewIconRow}>
                <Text style={[
                  styles.gemEmojiStats,
                  (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.gemEmojiSmall
                ]}>
                  💎
                </Text>
                <Text style={[
                  styles.overviewValue,
                  styles.gemsValue,
                  (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewValueSmall
                ]}>
                  {userData.gems || 0}
                </Text>
              </View>
            </View>
            <View style={[
              styles.overviewItem,
              (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewItemSmall
            ]}>
              <Text style={styles.overviewLabel}>Mess</Text>
              <Text style={[
                styles.overviewValue,
                (userData.energy >= 100 || userData.qCoins >= 1000 || (userData.gems || 0) >= 100 || userData.messPoints >= 100) && styles.overviewValueSmall
              ]}>
                {userData.messPoints.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Activity Cards - Only show enabled habits */}
        {/* Study is always shown */}
        <ActivityCard
          title="Study Time"
          value={formatStudyTime(userData.studyMinutesToday || 0)}
          subtitle={`Goal: ${formatStudyTime((userData.studyGoalHours || 0) * 60)}`}
          image={require('../../assets/hamsters/casual/studying.png')}
          backgroundColor="#5C6BC0"
          icon="📚"
          detailedStats={
            <View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Today's Progress:</Text>
                <Text style={styles.detailValue}>{Math.round(stats.studyGoalProgress)}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Study Time:</Text>
                <Text style={styles.detailValue}>{formatStudyTime(Math.round(stats.totalStudyHours * 60))}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Break Time Today:</Text>
                <Text style={styles.detailValue}>{formatStudyTime(Math.floor((session?.totalBreakTime || 0) / 60))}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Missed Checkpoints:</Text>
                <Text style={styles.detailValue}>{userData.missedCheckpoints || 0}</Text>
              </View>
            </View>
          }
        />

        {/* Sleep Card - Only if sleep habit is enabled */}
        {userData.enabledHabits?.includes('sleep') && (
          <ActivityCard
            title="Sleep"
            value={formatSleepTime(stats.todaysSleep)}
            subtitle={`Avg: ${formatSleepTime(stats.avgSleep)}`}
            image={require('../../assets/hamsters/casual/sleeping.png')}
            backgroundColor="#7E57C2"
            icon="😴"
            detailedStats={
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Night:</Text>
                  <Text style={styles.detailValue}>{formatSleepTime(stats.todaysSleep)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Average Sleep:</Text>
                  <Text style={styles.detailValue}>{formatSleepTime(stats.avgSleep)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Sessions:</Text>
                  <Text style={styles.detailValue}>{userData.sleepSessions?.length || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quality:</Text>
                  <Text style={styles.detailValue}>
                    {stats.todaysSleep >= 7 ? '😊 Excellent' :
                     stats.todaysSleep >= 5 ? '😐 Fair' : '😴 Poor'}
                  </Text>
                </View>
              </View>
            }
          />
        )}

        {/* Hydration Card - Only if hydration habit is enabled */}
        {userData.enabledHabits?.includes('hydration') && (
          <ActivityCard
            title="Hydration"
            value={`${userData.waterGlasses}/${stats.hydrationGoal}`}
            subtitle="Glasses today"
            image={require('../../assets/hamsters/casual/drinking.png')}
            backgroundColor="#42A5F5"
            icon="💧"
            detailedStats={
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Today's Progress:</Text>
                  <Text style={styles.detailValue}>{Math.round(stats.waterProgress)}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Glasses Logged:</Text>
                  <Text style={styles.detailValue}>{userData.waterGlasses}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Daily Goal:</Text>
                  <Text style={styles.detailValue}>{stats.hydrationGoal} glasses</Text>
                </View>
              </View>
            }
          />
        )}

        {/* Meals Card - Only if meals habit is enabled */}
        {userData.enabledHabits?.includes('meals') && (
          <ActivityCard
            title="Meals"
            value={`${userData.mealsLogged}/${stats.mealGoal}`}
            subtitle="Meals today"
            image={
              userData.dietType === 'small-portions' 
                ? require('../../assets/hamsters/casual/eating-small.png')
                : userData.dietType === 'large-portions'
                ? require('../../assets/hamsters/casual/eating-large.png')
                : require('../../assets/hamsters/casual/eating-normal.png')
            }
            backgroundColor="#FF7043"
            icon="🍽️"
            detailedStats={
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Today's Progress:</Text>
                  <Text style={styles.detailValue}>{Math.round(stats.mealProgress)}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Meals Logged:</Text>
                  <Text style={styles.detailValue}>{userData.mealsLogged}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Breakfast:</Text>
                  <Text style={styles.detailValue}>{userData.ateBreakfast ? '✅' : '⬜'}</Text>
                </View>
              </View>
            }
          />
        )}

        {/* Exercise Card - Only if exercise habit is enabled */}
        {userData.enabledHabits?.includes('exercise') && (
          <ActivityCard
            title="Exercise"
            value={`${userData.exerciseMinutes}/${stats.exerciseGoal}`}
            subtitle="Minutes today"
            image={require('../../assets/hamsters/casual/jumping.gif')}
            backgroundColor="#66BB6A"
            icon="🏃"
            detailedStats={
              <View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Today's Progress:</Text>
                  <Text style={styles.detailValue}>{Math.round(stats.exerciseProgress)}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Minutes Logged:</Text>
                  <Text style={styles.detailValue}>{userData.exerciseMinutes}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Daily Goal:</Text>
                  <Text style={styles.detailValue}>{stats.exerciseGoal} minutes</Text>
                </View>
              </View>
            }
          />
        )}

        {/* Weekly Trends - Premium Feature (Collapsible) */}
        <View style={styles.premiumCard}>
          <TouchableOpacity 
            style={styles.premiumHeader}
            onPress={() => {
              playTabSound();
              if (userData.isPremium) {
                setIsPremiumExpanded(!isPremiumExpanded);
              } else {
                setShowPremiumModal(true);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.premiumHeaderContent}>
              <Text style={styles.cardTitle}>📈 Weekly Trends</Text>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⭐ PREMIUM</Text>
              </View>
            </View>
            {userData.isPremium && (
              <Text style={styles.expandIcon}>{isPremiumExpanded ? '▼' : '▶'}</Text>
            )}
          </TouchableOpacity>
          
          {userData.isPremium && isPremiumExpanded ? (
            <View style={styles.premiumContent}>
              {/* Study Graph */}
              <WeeklyLineGraph
                data={weeklyData.studyData}
                color="#1976D2"
                label="📚 Study Time"
                unit="Minutes per day"
                maxValue={180}
              />
              
              <View style={styles.graphDivider} />
              
              {/* Sleep Graph */}
              <WeeklyLineGraph
                data={weeklyData.sleepData}
                color="#9C27B0"
                label="😴 Sleep Duration"
                unit="Hours per night"
                maxValue={10}
              />
              
              <View style={styles.graphDivider} />
              
              {/* Water Graph */}
              <WeeklyLineGraph
                data={weeklyData.waterData}
                color="#2196F3"
                label="💧 Hydration"
                unit="Glasses per day"
                maxValue={12}
              />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.blurContainerCompact}
              activeOpacity={0.9}
              onPress={() => {
                playTabSound();
                setShowPremiumModal(true);
              }}
            >
              {/* Compact preview - just one graph */}
              <View style={styles.graphPreviewCompact}>
                <WeeklyLineGraph
                  data={weeklyData.studyData}
                  color="#1976D2"
                  label="📚 Study Time"
                  unit="Minutes per day"
                  maxValue={180}
                />
              </View>
              
              {/* Blur overlay */}
              <View style={styles.blurOverlayCompact}>
                <View style={styles.premiumPromptCompact}>
                  <Image 
                    source={require('../../assets/hamsters/casual/idle-sit.png')}
                    style={styles.quillbyLockImageCompact}
                    resizeMode="contain"
                  />
                  <View style={styles.premiumTextContainer}>
                    <Text style={styles.premiumPromptTitleCompact}>Unlock Weekly Insights</Text>
                    <Text style={styles.premiumPromptTextCompact}>
                      Track study, sleep & hydration trends
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.upgradeButtonCompact}
                    onPress={() => {
                      playTabSound();
                      setShowPremiumModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.upgradeButtonTextCompact}>⭐ Upgrade</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Achievements Section */}
        <AchievementsSection />

        {/* Streak Calendar */}
        <StreakCalendar
          completedDays={[]} // TODO: Track completed days as day numbers (1-31)
          currentMonth={new Date().toLocaleString('default', { month: 'long' })}
          userCreatedAt={userData.createdAt ? new Date(userData.createdAt) : new Date()}
        />

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Premium Paywall Modal */}
      <PremiumPaywallModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onPurchaseSuccess={() => {
          console.log('[Stats] Premium purchased successfully!');
          setShowPremiumModal(false);
        }}
      />
    </ThemedScreen>
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
  header: {
    marginBottom: SCREEN_HEIGHT * 0.03,
    alignItems: 'center',
    paddingTop: 10,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.075,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: SCREEN_HEIGHT * 0.01,
    textShadowColor: 'rgba(25, 118, 210, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  // Detail Stats (for flipped cards)
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  detailLabel: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#FFF',
    fontWeight: '700',
  },
  
  // Overview Card
  overviewCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 20,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
    padding: 8,
  },
  overviewItemSmall: {
    padding: 6,
  },
  overviewIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qbiesIconStats: {
    width: SCREEN_WIDTH * 0.05,
    height: SCREEN_WIDTH * 0.05,
  },
  qbiesIconSmall: {
    width: SCREEN_WIDTH * 0.04,
    height: SCREEN_WIDTH * 0.04,
  },
  gemEmojiStats: {
    fontSize: SCREEN_WIDTH * 0.05,
    marginRight: 2,
  },
  gemEmojiSmall: {
    fontSize: SCREEN_WIDTH * 0.04,
  },
  overviewValue: {
    fontSize: SCREEN_WIDTH * 0.065,
    fontWeight: '700',
    color: '#1976D2',
    marginTop: 4,
  },
  overviewValueSmall: {
    fontSize: SCREEN_WIDTH * 0.05,
  },
  overviewLabel: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  gemsValue: {
    color: '#7E57C2', // Purple color for gems
  },
  
  // Stats Cards
  statsCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 20,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  cardTitle: {
    fontSize: SCREEN_WIDTH * 0.052,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#555',
    flex: 1,
    fontWeight: '500',
  },
  statValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    color: '#1976D2',
  },
  statDetail: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Progress Bars
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.012,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 8,
  },
  progressBar: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: 'monospace',
    flex: 1,
  },
  progressBarEmpty: {
    color: '#E0E0E0',
  },
  progressPercent: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#1976D2',
    marginLeft: 12,
    minWidth: 40,
    textAlign: 'right',
    fontWeight: '700',
  },
  
  // Dividers
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: SCREEN_HEIGHT * 0.015,
  },
  
  // Sleep Quality
  sleepQualityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sleepQualityLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  sleepQualityValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  sleepGood: {
    color: '#4CAF50',
  },
  sleepOkay: {
    color: '#FF9800',
  },
  sleepPoor: {
    color: '#F44336',
  },
  
  // Room Status Colors
  roomClean: {
    color: '#4CAF50',
  },
  roomLight: {
    color: '#FF9800',
  },
  roomMedium: {
    color: '#FF5722',
  },
  roomHeavy: {
    color: '#F44336',
  },
  
  // Achievements
  achievementsCard: {
    backgroundColor: '#FFF9E6',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 20,
    marginBottom: SCREEN_HEIGHT * 0.02,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.035,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.012,
    width: '48%',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  achievementIcon: {
    fontSize: SCREEN_WIDTH * 0.09,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  achievementHint: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#FF8F00',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: SCREEN_HEIGHT * 0.05,
  },
  
  // Premium Card
  premiumCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 20,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumBadgeText: {
    fontSize: SCREEN_WIDTH * 0.028,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  premiumHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandIcon: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#FFD700',
    fontWeight: '700',
    marginLeft: 10,
  },
  premiumContent: {
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  graphDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  
  // Blur Container (Compact for free users)
  blurContainerCompact: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    minHeight: 200,
  },
  graphPreviewCompact: {
    opacity: 0.3,
  },
  blurOverlayCompact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumPromptCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFD700',
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  quillbyLockImageCompact: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_WIDTH * 0.15,
    marginRight: 12,
  },
  premiumTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  premiumPromptTitleCompact: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  premiumPromptTextCompact: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    lineHeight: SCREEN_WIDTH * 0.042,
  },
  upgradeButtonCompact: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFA000',
  },
  upgradeButtonTextCompact: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  
  // Blur Container (Original - for premium users)
  blurContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    minHeight: 600,
  },
  graphPreview: {
    opacity: 0.4,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumPrompt: {
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.06,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFD700',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  quillbyLockImage: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.25,
    marginBottom: 12,
  },
  premiumPromptIcon: {
    fontSize: SCREEN_WIDTH * 0.15,
    marginBottom: 12,
  },
  premiumPromptTitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  premiumPromptText: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: SCREEN_WIDTH * 0.05,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFA000',
  },
  upgradeButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
});
