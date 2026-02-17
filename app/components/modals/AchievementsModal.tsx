import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getAllAchievements } from '../../core/achievements';
import { Achievement } from '../../core/types';
import AchievementUnlockedModal from './AchievementUnlockedModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AchievementsModal({ visible, onClose }: AchievementsModalProps) {
  const { userData, getTotalXP, getUnlockedCount, unlockAchievement } = useQuillbyStore();
  const achievements = getAllAchievements();
  const [testAchievement, setTestAchievement] = useState<Achievement | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  
  const unlockedCount = getUnlockedCount();
  const totalCount = achievements.length;
  const totalXP = getTotalXP();
  
  const handleTestAchievement = (achievement: Achievement) => {
    setTestAchievement(achievement);
    setShowTestModal(true);
  };
  
  const renderAchievement = (achievement: Achievement) => {
    const progress = userData.achievements?.[achievement.id];
    const isUnlocked = progress?.unlocked || false;
    const currentProgress = progress?.progress || 0;
    
    return (
      <View
        key={achievement.id}
        style={[
          styles.achievementCard,
          isUnlocked && styles.achievementCardUnlocked,
        ]}
      >
        <View style={styles.achievementIcon}>
          <Text style={styles.achievementIconText}>{achievement.icon}</Text>
          {isUnlocked && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedBadgeText}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementName, !isUnlocked && styles.lockedText]}>
            {achievement.name}
          </Text>
          <Text style={[styles.achievementDescription, !isUnlocked && styles.lockedText]}>
            {achievement.description}
          </Text>
          
          {!isUnlocked && achievement.target && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (currentProgress / achievement.target) * 100)}%` }
                ]}
              />
              <Text style={styles.progressText}>
                {currentProgress}/{achievement.target}
              </Text>
            </View>
          )}
          
          <View style={styles.achievementFooter}>
            <View style={[styles.rarityBadge, styles[`rarity${achievement.rarity}`]]}>
              <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
            </View>
            <View style={styles.rewardContainer}>
              <Text style={[styles.achievementReward, !isUnlocked && styles.lockedText]}>
                ⭐ {achievement.xpReward} XP
              </Text>
              <Text style={[styles.achievementReward, !isUnlocked && styles.lockedText]}>
                🪙 {achievement.coinReward}
              </Text>
            </View>
          </View>
          
          {isUnlocked && progress?.unlockedAt && (
            <Text style={styles.unlockedDate}>
              Unlocked: {new Date(progress.unlockedAt).toLocaleDateString()}
            </Text>
          )}
          
          {/* Test Button */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => handleTestAchievement(achievement)}
          >
            <Text style={styles.testButtonText}>
              🧪 Test Achievement
            </Text>
          </TouchableOpacity>
        </View>
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
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🏆 Achievements</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{unlockedCount}/{totalCount}</Text>
              <Text style={styles.statLabel}>Unlocked</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
          
          {/* Achievements List */}
          <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
            {achievements.map(renderAchievement)}
          </ScrollView>
        </View>
      </View>
      
      {/* Test Achievement Modal */}
      <AchievementUnlockedModal
        visible={showTestModal}
        achievement={testAchievement}
        onClose={() => {
          setShowTestModal(false);
          setTestAchievement(null);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 24,
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 24,
    color: '#FF9800',
  },
  statLabel: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementsList: {
    flex: 1,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  achievementCardUnlocked: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  achievementIconText: {
    fontSize: 32,
  },
  unlockedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  lockedText: {
    opacity: 0.6,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  progressText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    zIndex: 1,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  raritycommon: {
    backgroundColor: '#9E9E9E',
  },
  rarityrare: {
    backgroundColor: '#2196F3',
  },
  rarityepic: {
    backgroundColor: '#9C27B0',
  },
  raritylegendary: {
    backgroundColor: '#FF9800',
  },
  rarityText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 10,
    color: '#FFF',
  },
  rewardContainer: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  achievementReward: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 11,
    color: '#FF9800',
  },
  unlockedDate: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  testButton: {
    marginTop: 8,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 12,
    color: '#FFF',
  },
});
