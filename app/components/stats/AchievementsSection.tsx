import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getAllAchievements } from '../../core/achievements';
import AchievementsModal from '../modals/AchievementsModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Map achievement IDs to asset paths
const ACHIEVEMENT_ASSETS: { [key: string]: any } = {
  // Daily Challenges
  'daily-session': require('../../../assets/acheivements/daily/daily-session.png'),
  'daily-water': require('../../../assets/acheivements/daily/daily-water.png'),
  'daily-meals': require('../../../assets/acheivements/daily/daily-meals.png'),
  'daily-hours': require('../../../assets/acheivements/daily/daily-hours.png'),
  'daily-early': require('../../../assets/acheivements/daily/daily-early.png'),
  
  // Weekly Challenges
  'weekly-streak': require('../../../assets/acheivements/weekly/weekly-streak.png'),
  'weekly-sessions': require('../../../assets/acheivements/weekly/weekly-sessions.png'),
  'weekly-hours': require('../../../assets/acheivements/weekly/weekly-hours.png'),
  'weekly-clean': require('../../../assets/acheivements/weekly/weekly-clean.png'),
  'weekly-hydration': require('../../../assets/acheivements/weekly/weekly-hydration.png'),
  
  // Monthly Challenges
  'monthly-hours': require('../../../assets/acheivements/monthly/monthly-hours.png'),
  'monthly-streak': require('../../../assets/acheivements/monthly/monthly-streak.png'),
  'monthly-deadlines': require('../../../assets/acheivements/monthly/monthly-deadlines.png'),
  'monthly-perfect': require('../../../assets/acheivements/monthly/monthly-perfect.png'),
  'monthly-sessions': require('../../../assets/acheivements/monthly/monthly-sessions.png'),
  
  // Beginner Secrets
  'secret-first-session': require('../../../assets/acheivements/secrets/beginners/secret-first-session.png'),
  'secret-first-deadline': require('../../../assets/acheivements/secrets/beginners/secret-first-deadline.png'),
  'secret-first-perfect': require('../../../assets/acheivements/secrets/beginners/secret-first-perfect.png'),
  'secret-first-clean': require('../../../assets/acheivements/secrets/beginners/secret-first-clean.png'),
  
  // Consumption Secrets
  'secret-coffee-lover': require('../../../assets/acheivements/secrets/consumption/secret-coffee-lover.png'),
  'secret-apple-fan': require('../../../assets/acheivements/secrets/consumption/secret-apple-fan.png'),
  'secret-shopaholic': require('../../../assets/acheivements/secrets/consumption/secret-shopaholic.png'),
  
  // Time-Based Secrets
  'secret-night-owl': require('../../../assets/acheivements/secrets/time-based/secret-night-owl.png'),
  'secret-early-bird': require('../../../assets/acheivements/secrets/time-based/secret-early-bird.png'),
  'secret-midnight': require('../../../assets/acheivements/secrets/time-based/secret-midnight.png'),
  'secret-all-nighter': require('../../../assets/acheivements/secrets/time-based/secret-all-nighter.png'),
  
  // Progress Milestones
  'secret-perfectionist': require('../../../assets/acheivements/secrets/milestones/progress/secret-perfectionist.png'),
  'secret-speed-demon': require('../../../assets/acheivements/secrets/milestones/progress/secret-speed-demon.png'),
  'secret-clean-freak': require('../../../assets/acheivements/secrets/milestones/progress/secret-clean-freak.png'),
  'secret-deadline-master': require('../../../assets/acheivements/secrets/milestones/progress/secret-deadline-master.png'),
  
  // Epic Milestones
  'secret-century': require('../../../assets/acheivements/secrets/milestones/epic/secret-century.png'),
  'secret-marathon': require('../../../assets/acheivements/secrets/milestones/epic/secret-marathon.png'),
  'secret-zen-master': require('../../../assets/acheivements/secrets/milestones/epic/secret-zen-master.png'),
  
  // Legendary Secrets
  'secret-scholar': require('../../../assets/acheivements/secrets/milestones/legendary/secret-scholar.png'),
  'secret-legend': require('../../../assets/acheivements/secrets/milestones/legendary/secret-legend.png'),
  'secret-completionist': require('../../../assets/acheivements/secrets/milestones/legendary/secret-completionist.png'),
};

export default function AchievementsSection() {
  const { userData, getTotalXP, getUnlockedCount } = useQuillbyStore();
  const [showModal, setShowModal] = useState(false);
  
  const achievements = getAllAchievements();
  const unlockedCount = getUnlockedCount();
  const totalCount = achievements.length;
  const totalXP = getTotalXP();
  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  
  // Get recently unlocked achievements (last 3)
  const recentlyUnlocked = achievements
    .filter(a => userData.achievements?.[a.id]?.unlocked)
    .sort((a, b) => {
      const dateA = userData.achievements?.[a.id]?.unlockedAt || '';
      const dateB = userData.achievements?.[b.id]?.unlockedAt || '';
      return dateB.localeCompare(dateA);
    })
    .slice(0, 3);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Achievements</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>
      
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{unlockedCount}/{totalCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalXP}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completionPercent}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {unlockedCount} of {totalCount} achievements unlocked
        </Text>
      </View>
      
      {/* Recently Unlocked */}
      {recentlyUnlocked.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Recently Unlocked</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentScroll}>
            {recentlyUnlocked.map(achievement => {
              const achievementAsset = ACHIEVEMENT_ASSETS[achievement.id];
              return (
                <View key={achievement.id} style={styles.recentCard}>
                  {achievementAsset ? (
                    <Image
                      source={achievementAsset}
                      style={styles.recentImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.recentIcon}>{achievement.icon}</Text>
                  )}
                  <Text style={styles.recentName}>{achievement.name}</Text>
                  <View style={styles.recentRewards}>
                    <Text style={styles.recentReward}>💎 {achievement.xpReward}</Text>
                    <Image
                      source={require('../../../assets/overall/qbies.png')}
                      style={styles.qbiesIconSmall}
                      resizeMode="contain"
                    />
                    <Text style={styles.recentReward}>{achievement.coinReward}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
      
      {/* Empty State */}
      {unlockedCount === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>Start completing achievements!</Text>
          <Text style={styles.emptySubtext}>
            Complete focus sessions, maintain streaks, and reach your goals to unlock achievements.
          </Text>
        </View>
      )}
      
      {/* Achievements Modal */}
      <AchievementsModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 20,
    color: '#333',
  },
  viewAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  viewAllText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 13,
    color: '#FF9800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  statValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 22,
    color: '#FF9800',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 11,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 6,
  },
  progressText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recentSection: {
    marginTop: 8,
  },
  recentTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  recentScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  recentCard: {
    width: 120,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  recentIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  recentImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  recentName: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  recentRewards: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  recentReward: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 10,
    color: '#FF9800',
  },
  qbiesIconSmall: {
    width: 12,
    height: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
