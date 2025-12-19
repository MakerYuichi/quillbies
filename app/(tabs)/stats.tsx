import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { useQuillbyStore } from '../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StatsScreen() {
  const { userData, deadlines, getCompletedDeadlines, getUrgentDeadlines, getUpcomingDeadlines } = useQuillbyStore();
  const buddyName = userData.buddyName || 'Quillby';

  // Calculate statistics
  const stats = useMemo(() => {
    const completedDeadlines = getCompletedDeadlines();
    const urgentDeadlines = getUrgentDeadlines();
    const upcomingDeadlines = getUpcomingDeadlines();
    
    // Study stats
    const studyGoalProgress = userData.studyGoalHours 
      ? (userData.studyMinutesToday || 0) / (userData.studyGoalHours * 60) * 100
      : 0;
    
    // Sleep stats
    const todaysSleep = userData.sleepSessions?.filter(session => {
      const sessionDate = new Date(session.startTime).toDateString();
      const today = new Date().toDateString();
      return sessionDate === today;
    }).reduce((total, session) => total + (session.duration || 0), 0) / 3600 || 0;
    
    const avgSleep = userData.sleepSessions?.length > 0
      ? userData.sleepSessions.reduce((total, session) => total + (session.duration || 0), 0) / userData.sleepSessions.length / 3600
      : 0;
    
    // Habit completion rates
    const waterProgress = (userData.waterGlasses / 8) * 100;
    const mealProgress = (userData.mealsLogged / 3) * 100;
    const exerciseGoal = 30; // 30 minutes goal
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
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Your Progress</Text>
          <Text style={styles.subtitle}>Track your journey with {buddyName}</Text>
        </View>

        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>⚡ Current Status</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{Math.round(userData.energy)}</Text>
              <Text style={styles.overviewLabel}>Energy</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{userData.qCoins}</Text>
              <Text style={styles.overviewLabel}>Q-Coins</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{userData.currentStreak}</Text>
              <Text style={styles.overviewLabel}>Day Streak</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{stats.roomStatus}</Text>
              <Text style={styles.overviewLabel}>Room</Text>
            </View>
          </View>
        </View>

        {/* Study Analytics */}
        {userData.enabledHabits?.includes('study') && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>📚 Study Analytics</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Today's Goal Progress:</Text>
            </View>
            {renderProgressBar(stats.studyGoalProgress, '#1976D2')}
            <Text style={styles.statDetail}>
              {((userData.studyMinutesToday || 0) / 60).toFixed(1)}h / {userData.studyGoalHours || 0}h
            </Text>
            
            <View style={styles.divider} />
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Study Time:</Text>
              <Text style={styles.statValue}>{stats.totalStudyHours.toFixed(1)}h</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Missed Checkpoints:</Text>
              <Text style={styles.statValue}>{userData.missedCheckpoints || 0}</Text>
            </View>
          </View>
        )}

        {/* Deadline Progress */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>🎯 Deadline Progress</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Deadlines:</Text>
            <Text style={styles.statValue}>{stats.totalDeadlines}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completed:</Text>
            <Text style={styles.statValue}>✅ {stats.completedDeadlines}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Urgent:</Text>
            <Text style={styles.statValue}>🔴 {stats.urgentDeadlines}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Upcoming:</Text>
            <Text style={styles.statValue}>🟡 {stats.upcomingDeadlines}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completion Rate:</Text>
          </View>
          {renderProgressBar(stats.completionRate, '#4CAF50')}
        </View>

        {/* Today's Habits */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>✅ Today's Habits</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>💧 Hydration:</Text>
            <Text style={styles.statValue}>{userData.waterGlasses} / 8</Text>
          </View>
          {renderProgressBar(stats.waterProgress, '#2196F3')}
          
          <View style={styles.divider} />
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>🍽️ Meals:</Text>
            <Text style={styles.statValue}>{userData.mealsLogged} / 3</Text>
          </View>
          {renderProgressBar(stats.mealProgress, '#FF9800')}
          
          {userData.enabledHabits?.includes('exercise') && (
            <>
              <View style={styles.divider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>🏃 Exercise:</Text>
                <Text style={styles.statValue}>{userData.exerciseMinutes} / 30 min</Text>
              </View>
              {renderProgressBar(stats.exerciseProgress, '#4CAF50')}
            </>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>🍳 Breakfast:</Text>
            <Text style={styles.statValue}>{userData.ateBreakfast ? '✅ Logged' : '⬜ Not logged'}</Text>
          </View>
        </View>

        {/* Sleep Analytics */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>😴 Sleep Analytics</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Last Night:</Text>
            <Text style={styles.statValue}>{stats.todaysSleep.toFixed(1)}h</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Average Sleep:</Text>
            <Text style={styles.statValue}>{stats.avgSleep.toFixed(1)}h</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Sessions:</Text>
            <Text style={styles.statValue}>{userData.sleepSessions?.length || 0}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.sleepQualityContainer}>
            <Text style={styles.sleepQualityLabel}>Sleep Quality:</Text>
            <Text style={[
              styles.sleepQualityValue,
              stats.todaysSleep >= 7 ? styles.sleepGood :
              stats.todaysSleep >= 5 ? styles.sleepOkay :
              styles.sleepPoor
            ]}>
              {stats.todaysSleep >= 7 ? '😊 Excellent' :
               stats.todaysSleep >= 5 ? '😐 Fair' :
               stats.todaysSleep > 0 ? '😴 Poor' : '⬜ Not tracked'}
            </Text>
          </View>
        </View>

        {/* Room & Energy */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>🏠 Room & Energy</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Room Status:</Text>
            <Text style={[
              styles.statValue,
              userData.messPoints <= 5 ? styles.roomClean :
              userData.messPoints <= 10 ? styles.roomLight :
              userData.messPoints <= 20 ? styles.roomMedium :
              styles.roomHeavy
            ]}>
              {stats.roomStatus}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Mess Points:</Text>
            <Text style={styles.statValue}>{userData.messPoints.toFixed(1)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Energy Cap:</Text>
            <Text style={styles.statValue}>⚡ {userData.maxEnergyCap}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Energy:</Text>
            <Text style={styles.statValue}>⚡ {Math.round(userData.energy)}</Text>
          </View>
        </View>

        {/* Achievements Preview */}
        <View style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>🏆 Achievements</Text>
          <View style={styles.achievementGrid}>
            {userData.currentStreak >= 7 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>🔥</Text>
                <Text style={styles.achievementName}>Week Warrior</Text>
              </View>
            )}
            {stats.completedDeadlines >= 5 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>📚</Text>
                <Text style={styles.achievementName}>Task Master</Text>
              </View>
            )}
            {stats.totalStudyHours >= 10 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>⭐</Text>
                <Text style={styles.achievementName}>Study Star</Text>
              </View>
            )}
            {userData.waterGlasses >= 8 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>💧</Text>
                <Text style={styles.achievementName}>Hydration Hero</Text>
              </View>
            )}
            {userData.messPoints <= 5 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>✨</Text>
                <Text style={styles.achievementName}>Clean Queen</Text>
              </View>
            )}
            {stats.avgSleep >= 7 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementIcon}>😴</Text>
                <Text style={styles.achievementName}>Sleep Champion</Text>
              </View>
            )}
          </View>
          {userData.currentStreak < 7 && stats.completedDeadlines < 5 && stats.totalStudyHours < 10 && (
            <Text style={styles.achievementHint}>
              Keep building habits to unlock achievements! 🌟
            </Text>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  header: {
    marginBottom: SCREEN_HEIGHT * 0.03,
    alignItems: 'center',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    textAlign: 'center',
  },
  
  // Overview Card
  overviewCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    textAlign: 'center',
  },
  
  // Stats Cards
  statsCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.008,
  },
  statLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
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
    marginVertical: SCREEN_HEIGHT * 0.01,
  },
  progressBar: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontFamily: 'monospace',
    flex: 1,
  },
  progressBarEmpty: {
    color: '#E0E0E0',
  },
  progressPercent: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    marginLeft: 8,
    minWidth: 35,
    textAlign: 'right',
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
    backgroundColor: '#FFF3E0',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.02,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: SCREEN_WIDTH * 0.08,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '600',
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
});
