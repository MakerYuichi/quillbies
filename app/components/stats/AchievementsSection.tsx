import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuillbyStore } from '../../state/store-modular';
import { getAllAchievements } from '../../core/achievements';
import AchievementsModal from '../modals/AchievementsModal';

// Map achievement IDs to asset paths
const ACHIEVEMENT_ASSETS: { [key: string]: any } = {
  // Daily challenges
  'daily-session': require('../../../assets/acheivements/daily/daily-session.png'),
  'daily-water': require('../../../assets/acheivements/daily/daily-water.png'),
  'daily-meals': require('../../../assets/acheivements/daily/daily-meals.png'),
  'daily-hours': require('../../../assets/acheivements/daily/daily-hours.png'),
  'daily-early': require('../../../assets/acheivements/daily/daily-early.png'),
  
  // Weekly challenges
  'weekly-streak': require('../../../assets/acheivements/weekly/weekly-streak.png'),
  'weekly-sessions': require('../../../assets/acheivements/weekly/weekly-sessions.png'),
  'weekly-hours': require('../../../assets/acheivements/weekly/weekly-hours.png'),
  'weekly-clean': require('../../../assets/acheivements/weekly/weekly-clean.png'),
  'weekly-hydration': require('../../../assets/acheivements/weekly/weekly-hydration.png'),
  
  // Monthly challenges
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
  const { userData } = useQuillbyStore();
  const [showModal, setShowModal] = useState(false);
  
  const achievements = getAllAchievements();
  
  // Get unlocked achievements sorted by unlock date (most recent first)
  const unlockedAchievements = achievements
    .filter(a => userData.achievements?.[a.id]?.unlocked)
    .sort((a, b) => {
      const dateA = userData.achievements?.[a.id]?.unlockedAt || '';
      const dateB = userData.achievements?.[b.id]?.unlockedAt || '';
      return dateB.localeCompare(dateA);
    })
    .slice(0, 8); // Show max 8 achievements (2 rows x 4 columns)
  
  const getRarityColors = (rarity: string): [string, string] => {
    switch (rarity) {
      case 'common': return ['#CD7F32', '#8B4513']; // Bronze/Copper
      case 'rare': return ['#42A5F5', '#1565C0']; // Blue
      case 'epic': return ['#AB47BC', '#6A1B9A']; // Purple
      case 'legendary': return ['#FFB300', '#E65100']; // Gold/Orange
      default: return ['#CD7F32', '#8B4513'];
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Shelf Header */}
      <View style={styles.shelfHeader}>
        <Text style={styles.shelfTitle}>🏆 Trophy Shelf</Text>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          style={styles.viewAllButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>
      
      {/* Brown Wooden Shelf with decorative elements */}
      <LinearGradient
        colors={['#8D6E63', '#6D4C41', '#5D4037']}
        style={styles.woodenShelf}
      >
        {/* Shelf Top Edge (lighter) */}
        <View style={styles.shelfEdge} />
        
        {/* Decorative standing lines (wood grain) */}
        <View style={styles.woodGrain1} />
        <View style={styles.woodGrain2} />
        <View style={styles.woodGrain3} />
        
        {/* Golden pins/trophies decoration at corners */}
        <Text style={styles.decorPin1}>📌</Text>
        <Text style={styles.decorPin2}>📌</Text>
        <Text style={styles.decorTrophy1}>🏆</Text>
        <Text style={styles.decorTrophy2}>🏆</Text>
        
        {/* Achievements Grid - 2 rows x 4 columns */}
        <View style={styles.achievementsGrid}>
          {unlockedAchievements.length === 0 ? (
            // Empty shelf message
            <View style={styles.emptyShelf}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>Start your journey!</Text>
              <Text style={styles.emptyHint}>Complete challenges to earn trophies</Text>
            </View>
          ) : (
            <>
              {/* Row 1 */}
              <View style={styles.gridRow}>
                {unlockedAchievements.slice(0, 4).map(achievement => {
                  const achievementAsset = ACHIEVEMENT_ASSETS[achievement.id];
                  const [bgColor1, bgColor2] = getRarityColors(achievement.rarity);
                  
                  console.log('[Trophy Shelf] Achievement:', achievement.id, 'Rarity:', achievement.rarity, 'Colors:', bgColor1, bgColor2, 'Has Asset:', !!achievementAsset);
                  
                  return (
                    <TouchableOpacity
                      key={achievement.id}
                      style={styles.trophySlot}
                      onPress={() => setShowModal(true)}
                      activeOpacity={0.8}
                    >
                      {/* Pin on top of achievement */}
                      <Text style={styles.achievementPin}>📌</Text>
                      
                      <LinearGradient
                        colors={[bgColor1, bgColor2]}
                        style={styles.trophyFrame}
                      >
                        {achievementAsset && (
                          <Image
                            source={achievementAsset}
                            style={styles.trophyImage}
                            resizeMode="contain"
                          />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
                {/* Fill empty slots in row 1 */}
                {Array.from({ length: Math.max(0, 4 - unlockedAchievements.slice(0, 4).length) }).map((_, i) => (
                  <View key={`empty-1-${i}`} style={styles.trophySlot}>
                    {/* Flipping paper effect */}
                    <View style={styles.emptySlot}>
                      <View style={styles.paperCurl} />
                      <Text style={styles.paperLines}>───</Text>
                      <Text style={styles.paperLines}>───</Text>
                      <Text style={styles.paperLines}>───</Text>
                      <Text style={styles.emptySlotText}>?</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              {/* Row 2 */}
              <View style={styles.gridRow}>
                {unlockedAchievements.slice(4, 8).map(achievement => {
                  const achievementAsset = ACHIEVEMENT_ASSETS[achievement.id];
                  const [bgColor1, bgColor2] = getRarityColors(achievement.rarity);
                  
                  return (
                    <TouchableOpacity
                      key={achievement.id}
                      style={styles.trophySlot}
                      onPress={() => setShowModal(true)}
                      activeOpacity={0.8}
                    >
                      {/* Pin on top of achievement */}
                      <Text style={styles.achievementPin}>📌</Text>
                      
                      <LinearGradient
                        colors={[bgColor1, bgColor2]}
                        style={styles.trophyFrame}
                      >
                        {achievementAsset && (
                          <Image
                            source={achievementAsset}
                            style={styles.trophyImage}
                            resizeMode="contain"
                          />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
                {/* Fill empty slots in row 2 */}
                {Array.from({ length: Math.max(0, 4 - unlockedAchievements.slice(4, 8).length) }).map((_, i) => (
                  <View key={`empty-2-${i}`} style={styles.trophySlot}>
                    {/* Flipping paper effect */}
                    <View style={styles.emptySlot}>
                      <View style={styles.paperCurl} />
                      <Text style={styles.paperLines}>───</Text>
                      <Text style={styles.paperLines}>───</Text>
                      <Text style={styles.paperLines}>───</Text>
                      <Text style={styles.emptySlotText}>?</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
        
        {/* Shelf Bottom Shadow */}
        <View style={styles.shelfShadow} />
      </LinearGradient>
      
      {/* Achievements Modal */}
      <AchievementsModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  
  // Shelf Header
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  shelfTitle: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 18,
    color: '#5D4037',
    letterSpacing: 0.5,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(141, 110, 99, 0.15)',
    borderRadius: 12,
  },
  viewAllText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 13,
    color: '#6D4C41',
  },
  
  // Wooden Shelf
  woodenShelf: {
    borderRadius: 12,
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  shelfEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  shelfShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  
  // Wood grain decorations
  woodGrain1: {
    position: 'absolute',
    left: '25%',
    top: 12,
    bottom: 12,
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  woodGrain2: {
    position: 'absolute',
    left: '50%',
    top: 12,
    bottom: 12,
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  woodGrain3: {
    position: 'absolute',
    left: '75%',
    top: 12,
    bottom: 12,
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Decorative pins and trophies
  decorPin1: {
    position: 'absolute',
    top: 8,
    left: 12,
    fontSize: 16,
    transform: [{ rotate: '-15deg' }],
  },
  decorPin2: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 16,
    transform: [{ rotate: '15deg' }],
  },
  decorTrophy1: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    fontSize: 14,
    opacity: 0.6,
  },
  decorTrophy2: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 14,
    opacity: 0.6,
  },
  
  // Achievements Grid
  achievementsGrid: {
    paddingVertical: 8,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  
  // Trophy Slot
  trophySlot: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  achievementPin: {
    position: 'absolute',
    top: -8,
    zIndex: 10,
    fontSize: 20,
    transform: [{ rotate: '15deg' }],
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  trophyFrame: {
    width: '100%',
    height: '100%',
    borderRadius: 50, // Circular frame
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden', // Clip images within circular frame
  },
  trophyImage: {
    width: '70%',
    height: '70%',
  },
  
  // Empty Slot - Flipping Paper Effect
  emptySlot: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F5F5DC', // Beige paper color
    borderWidth: 1,
    borderColor: '#D4C5A9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    transform: [{ rotate: '-2deg' }], // Slight tilt
  },
  paperCurl: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 15,
    borderRightWidth: 15,
    borderTopColor: '#D4C5A9',
    borderRightColor: 'transparent',
    borderTopRightRadius: 4,
  },
  paperLines: {
    fontSize: 8,
    color: '#C0C0C0',
    marginVertical: 2,
    letterSpacing: 2,
  },
  emptySlotText: {
    fontSize: 28,
    color: '#999',
    marginTop: 4,
    fontWeight: 'bold',
  },
  
  // Empty Shelf
  emptyShelf: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  emptyHint: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
