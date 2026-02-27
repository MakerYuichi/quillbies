import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuillbyStore } from '../../state/store-modular';
import { getAllAchievements, isDailyChallenge, isWeeklyChallenge, isMonthlyChallenge, isHiddenSecret } from '../../core/achievements';
import { Achievement } from '../../core/types';
import AchievementHistoryModal from './AchievementHistoryModal';
import { supabase } from '../../../lib/supabase';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
}

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

export default function AchievementsModal({ visible, onClose }: AchievementsModalProps) {
  const userData = useQuillbyStore((state) => state.userData);
  const getTotalXP = useQuillbyStore((state) => state.getTotalXP);
  const getUnlockedCount = useQuillbyStore((state) => state.getUnlockedCount);
  const achievements = getAllAchievements();
  
  const unlockedCount = getUnlockedCount();
  const totalCount = achievements.length;
  const totalGems = getTotalXP();
  
  // Collapsible sections state
  const [dailyExpanded, setDailyExpanded] = useState(true);
  const [weeklyExpanded, setWeeklyExpanded] = useState(true);
  const [monthlyExpanded, setMonthlyExpanded] = useState(true);
  const [secretsExpanded, setSecretsExpanded] = useState(true);
  
  // Detail modal state
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userId, setUserId] = useState<string>('');
  
  // Get user ID from Supabase
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    getUserId();
  }, []);
  
  // Separate achievements by type
  const dailyAchievements = achievements.filter(a => isDailyChallenge(a.id));
  const weeklyAchievements = achievements.filter(a => isWeeklyChallenge(a.id));
  const monthlyAchievements = achievements.filter(a => isMonthlyChallenge(a.id));
  const secretAchievements = achievements.filter(a => isHiddenSecret(a.id));
  
  const getRarityColors = (rarity: string): [string, string] => {
    switch (rarity) {
      case 'common': return ['#CD7F32', '#8B4513']; // Bronze
      case 'rare': return ['#42A5F5', '#1565C0']; // Blue
      case 'epic': return ['#AB47BC', '#6A1B9A']; // Purple
      case 'legendary': return ['#FFB300', '#E65100']; // Gold
      default: return ['#CD7F32', '#8B4513'];
    }
  };
  
  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetailModal(true);
  };
  
  const renderAchievementCard = (achievement: Achievement) => {
    const progress = userData.achievements?.[achievement.id];
    const isUnlocked = progress?.unlocked || false;
    const currentProgress = progress?.progress || 0;
    const [color1, color2] = getRarityColors(achievement.rarity);
    const achievementAsset = ACHIEVEMENT_ASSETS[achievement.id];
    const isSecret = achievement.id.startsWith('secret-');
    
    // Get secret number for locked secrets
    const getSecretNumber = () => {
      if (!isSecret) return '';
      const secretIndex = secretAchievements.findIndex(a => a.id === achievement.id);
      return `Secret #${secretIndex + 1}`;
    };
    
    return (
      <TouchableOpacity 
        key={achievement.id} 
        style={styles.achievementCard}
        onPress={() => handleAchievementPress(achievement)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isUnlocked ? [color1, color2] : ['#E0E0E0', '#BDBDBD']}
          style={styles.cardGradient}
        >
          {/* Achievement Image */}
          <View style={styles.cardImageContainer}>
            {achievementAsset && isUnlocked ? (
              <Image
                source={achievementAsset}
                style={styles.cardImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.cardLockIcon}>🔒</Text>
            )}
          </View>
          
          {/* Achievement Name - Show secret number for locked secrets */}
          <Text style={styles.cardName} numberOfLines={2}>
            {isUnlocked ? achievement.name : (isSecret ? getSecretNumber() : achievement.name)}
          </Text>
          
          {/* Progress indicator - Only for non-secret locked achievements */}
          {!isUnlocked && !isSecret && achievement.target && currentProgress > 0 && (
            <Text style={styles.cardProgress}>
              {currentProgress}/{achievement.target}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  
  const renderSection = (
    title: string, 
    icon: string, 
    achievements: Achievement[], 
    isExpanded: boolean, 
    setExpanded: (value: boolean) => void,
    isSecret: boolean = false
  ) => {
    const unlockedInSection = achievements.filter(a => userData.achievements?.[a.id]?.unlocked).length;
    
    return (
      <View style={styles.collapsibleBox}>
        {/* Section Header - Collapsible */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionIcon}>{icon}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>
            {unlockedInSection}/{achievements.length}
          </Text>
          <Text style={styles.sectionArrow}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        
        {/* 3-Column Grid - Collapsible */}
        {isExpanded && (
          <View style={styles.gridContainer}>
            <View style={styles.grid}>
              {achievements.map(renderAchievementCard)}
            </View>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Trophy Room Background */}
        <LinearGradient
          colors={['#F5E6D3', '#E8D4B8', '#D4C4A8']}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>🏆 Trophy Room</Text>
              <Text style={styles.subtitle}>Quillby's Hall of Fame</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => setShowHistoryModal(true)} 
                style={styles.historyButton}
              >
                <Text style={styles.historyButtonText}>📜</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{unlockedCount}/{totalCount}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{Math.round((unlockedCount / totalCount) * 100)}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalGems} 💎</Text>
              <Text style={styles.statLabel}>Gems</Text>
            </View>
          </View>
          
          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Daily Challenges */}
            {renderSection('Daily Challenges', '🌅', dailyAchievements, dailyExpanded, setDailyExpanded)}
            
            {/* Weekly Challenges */}
            {renderSection('Weekly Challenges', '📅', weeklyAchievements, weeklyExpanded, setWeeklyExpanded)}
            
            {/* Monthly Challenges */}
            {renderSection('Monthly Challenges', '👑', monthlyAchievements, monthlyExpanded, setMonthlyExpanded)}
            
            {/* Secret Quests */}
            {renderSection('Secret Quests', '🔐', secretAchievements, secretsExpanded, setSecretsExpanded)}
            
            <View style={styles.bottomSpacer} />
          </ScrollView>
          
          {/* Achievement Detail Modal */}
          {selectedAchievement && (
            <AchievementDetailModal
              visible={showDetailModal}
              achievement={selectedAchievement}
              progress={userData.achievements?.[selectedAchievement.id]}
              onClose={() => {
                setShowDetailModal(false);
                setSelectedAchievement(null);
              }}
            />
          )}
          
          {/* Achievement History Modal */}
          <AchievementHistoryModal
            visible={showHistoryModal}
            onClose={() => setShowHistoryModal(false)}
            userId={userId}
          />
        </LinearGradient>
      </View>
    </Modal>
  );
}

// Achievement Detail Modal Component
interface AchievementDetailModalProps {
  visible: boolean;
  achievement: Achievement;
  progress?: { progress: number; unlocked: boolean; unlockedAt?: string };
  onClose: () => void;
}

function AchievementDetailModal({ visible, achievement, progress, onClose }: AchievementDetailModalProps) {
  const isUnlocked = progress?.unlocked || false;
  const currentProgress = progress?.progress || 0;
  const achievementAsset = ACHIEVEMENT_ASSETS[achievement.id];
  const isSecret = achievement.id.startsWith('secret-');
  
  // Get all achievements to calculate secret number
  const allAchievements = getAllAchievements();
  const secretAchievements = allAchievements.filter(a => isHiddenSecret(a.id));
  
  const getSecretNumber = () => {
    if (!isSecret) return '';
    const secretIndex = secretAchievements.findIndex(a => a.id === achievement.id);
    return `Secret #${secretIndex + 1}`;
  };
  
  const getRarityColors = (rarity: string): [string, string] => {
    switch (rarity) {
      case 'common': return ['#CD7F32', '#8B4513'];
      case 'rare': return ['#42A5F5', '#1565C0'];
      case 'epic': return ['#AB47BC', '#6A1B9A'];
      case 'legendary': return ['#FFB300', '#E65100'];
      default: return ['#CD7F32', '#8B4513'];
    }
  };
  
  const [color1, color2] = getRarityColors(achievement.rarity);
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={detailStyles.overlay}>
        <LinearGradient
          colors={isUnlocked ? [color1, color2, '#1A1A1A'] : ['#616161', '#424242', '#1A1A1A']}
          style={detailStyles.container}
        >
          {/* Close Button */}
          <TouchableOpacity style={detailStyles.closeButton} onPress={onClose}>
            <Text style={detailStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          {/* Content */}
          <View style={detailStyles.content}>
            {/* Quillby Image (for locked) or Achievement Asset (for unlocked) */}
            <View style={detailStyles.imageContainer}>
              {isUnlocked && achievementAsset ? (
                <Image
                  source={achievementAsset}
                  style={detailStyles.achievementImage}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={require('../../../assets/hamsters/casual/idle-sit-happy.png')}
                  style={detailStyles.quillbyImage}
                  resizeMode="contain"
                />
              )}
            </View>
            
            {/* Achievement Name - Show secret number for locked secrets */}
            <Text style={detailStyles.name}>
              {isUnlocked ? achievement.name : (isSecret ? getSecretNumber() : achievement.name)}
            </Text>
            
            {/* Description - Hide for locked secrets */}
            {isUnlocked || !isSecret ? (
              <Text style={detailStyles.description}>{achievement.description}</Text>
            ) : (
              <Text style={detailStyles.secretHint}>
                🤫 Secrets are meant to be discovered...{'\n'}
                Keep exploring to unlock this mystery!
              </Text>
            )}
            
            {isUnlocked ? (
              // Unlocked - Show status and date only
              <>
                <Text style={detailStyles.statusText}>✨ UNLOCKED ✨</Text>
                
                {progress?.unlockedAt && (
                  <Text style={detailStyles.dateText}>
                    Unlocked on {new Date(progress.unlockedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </Text>
                )}
              </>
            ) : (
              // Locked - Show progress only for non-secrets
              <>
                <Text style={detailStyles.statusText}>🔒 LOCKED</Text>
                
                {!isSecret && achievement.target && (
                  <View style={detailStyles.progressContainer}>
                    <Text style={detailStyles.progressLabel}>Your Progress</Text>
                    <View style={detailStyles.progressBar}>
                      <View 
                        style={[
                          detailStyles.progressFill, 
                          { width: `${Math.min((currentProgress / achievement.target) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={detailStyles.progressText}>
                      {currentProgress} / {achievement.target}
                    </Text>
                    <Text style={detailStyles.progressPercent}>
                      {Math.round((currentProgress / achievement.target) * 100)}% Complete
                    </Text>
                  </View>
                )}
                
                <Text style={detailStyles.hintText}>
                  {isSecret ? '🔍 Discover this secret by exploring!' : '💪 Keep going! You\'re making great progress!'}
                </Text>
              </>
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.95,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 24,
    color: '#5D4037',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 13,
    color: '#8D6E63',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  historyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  historyButtonText: {
    fontSize: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 18,
    color: '#5D4037',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 11,
    color: '#8D6E63',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(93, 64, 55, 0.2)',
    marginHorizontal: 12,
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Section
  section: {
    marginBottom: 16,
  },
  collapsibleBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#BDBDBD', // Darker border for better visibility
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 16,
    color: '#5D4037',
    flex: 1,
  },
  sectionCount: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 13,
    color: '#8D6E63',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  sectionArrow: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 14,
    color: '#5D4037',
  },
  
  // Grid (3 columns)
  gridContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // Achievement Card
  achievementCard: {
    width: '31%',
    aspectRatio: 0.68, // Taller card for better text visibility
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardGradient: {
    flex: 1,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardImageContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardImage: {
    width: '80%',
    height: '80%',
  },
  cardLockIcon: {
    fontSize: 38,
    opacity: 0.5,
  },
  cardName: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 11,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 3,
    minHeight: 32, // Space for 2 lines (14 * 2 + padding)
  },
  cardProgress: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 10,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 2,
  },
  
  bottomSpacer: {
    height: 20,
  },
});

// Detail Modal Styles
const detailStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - 40,
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementImage: {
    width: '100%',
    height: '100%',
  },
  quillbyImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 32,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  description: {
    fontFamily: 'ChakraPetch_500Medium',
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  secretHint: {
    fontFamily: 'ChakraPetch_500Medium',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  statusText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 22,
    color: '#FFF',
    marginBottom: 24,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  rewardBox: {
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  qbiesIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  rewardValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 28,
    color: '#FFD700',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rewardLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
  dateText: {
    fontFamily: 'ChakraPetch_500Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
    letterSpacing: 1,
  },
  progressBar: {
    width: '80%',
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 18,
    color: '#FFF',
    marginBottom: 6,
  },
  progressPercent: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  hintText: {
    fontFamily: 'ChakraPetch_500Medium',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
