import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getAchievementHistory, getAchievementStats, AchievementHistoryRecord } from '../../../lib/achievementHistory';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AchievementHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function AchievementHistoryModal({ visible, onClose, userId }: AchievementHistoryModalProps) {
  const [history, setHistory] = useState<AchievementHistoryRecord[]>([]);
  const [stats, setStats] = useState({
    totalUnlocked: 0,
    dailyCount: 0,
    weeklyCount: 0,
    monthlyCount: 0,
    secretCount: 0,
    totalGemsEarned: 0,
    totalQbiesEarned: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'secret'>('all');

  useEffect(() => {
    if (visible && userId) {
      loadHistory();
    }
  }, [visible, userId, filter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const [historyData, statsData] = await Promise.all([
        getAchievementHistory(userId, {
          achievementType: filter === 'all' ? undefined : filter,
          limit: 100
        }),
        getAchievementStats(userId)
      ]);
      
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('[AchievementHistory] Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise return formatted date
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Group history by date
  const groupedHistory = history.reduce((groups, record) => {
    const date = new Date(record.unlocked_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, AchievementHistoryRecord[]>);

  const getTypeColor = (type: string): [string, string] => {
    switch (type) {
      case 'daily': return ['#4CAF50', '#2E7D32'];
      case 'weekly': return ['#2196F3', '#1565C0'];
      case 'monthly': return ['#FF9800', '#E65100'];
      case 'secret': return ['#9C27B0', '#6A1B9A'];
      default: return ['#757575', '#424242'];
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return '🌅';
      case 'weekly': return '📅';
      case 'monthly': return '👑';
      case 'secret': return '🔐';
      default: return '🏆';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#F5E6D3', '#E8D4B8', '#D4C4A8']}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>📜 Achievement History</Text>
              <Text style={styles.subtitle}>Your Hall of Records</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalUnlocked}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalGemsEarned} 💎</Text>
              <Text style={styles.statLabel}>Gems</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalQbiesEarned}</Text>
              <Text style={styles.statLabel}>Q-Bies</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'daily', 'weekly', 'monthly', 'secret'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterTab, filter === type && styles.filterTabActive]}
                  onPress={() => setFilter(type as any)}
                >
                  <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
                    {type === 'all' ? '🏆 All' : `${getTypeIcon(type)} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                  </Text>
                  <Text style={[styles.filterCount, filter === type && styles.filterCountActive]}>
                    {type === 'all' ? stats.totalUnlocked : 
                     type === 'daily' ? stats.dailyCount :
                     type === 'weekly' ? stats.weeklyCount :
                     type === 'monthly' ? stats.monthlyCount :
                     stats.secretCount}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* History List */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5D4037" />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>No achievements yet</Text>
                <Text style={styles.emptySubtext}>Start completing challenges!</Text>
              </View>
            ) : (
              Object.keys(groupedHistory).map((dateKey) => {
                const records = groupedHistory[dateKey];
                const firstRecord = records[0];
                
                return (
                  <View key={dateKey}>
                    {/* Date Header */}
                    <View style={styles.dateHeader}>
                      <Text style={styles.dateHeaderText}>{formatDateHeader(firstRecord.unlocked_at)}</Text>
                      <View style={styles.dateHeaderLine} />
                    </View>
                    
                    {/* Achievements for this date */}
                    {records.map((record) => {
                      const [color1, color2] = getTypeColor(record.achievement_type);
                      return (
                        <View key={record.id} style={styles.historyCard}>
                          <LinearGradient
                            colors={[color1, color2]}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          >
                            <View style={styles.cardContent}>
                              <View style={styles.cardHeader}>
                                <Text style={styles.cardIcon}>{getTypeIcon(record.achievement_type)}</Text>
                                <View style={styles.cardInfo}>
                                  <Text style={styles.cardName}>{record.achievement_name}</Text>
                                  <Text style={styles.cardDate}>
                                    {new Date(record.unlocked_at).toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.cardRewards}>
                                <Text style={styles.rewardText}>+{record.gems_earned} 💎</Text>
                                <Text style={styles.rewardText}>+{record.qbies_earned} Q-Bies</Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </View>
                      );
                    })}
                  </View>
                );
              })
            )}
            <View style={styles.bottomSpacer} />
          </ScrollView>
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
  
  // Filter Tabs
  filterContainer: {
    marginBottom: 16,
  },
  filterTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#5D4037',
  },
  filterText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 13,
    color: '#5D4037',
  },
  filterTextActive: {
    color: '#FFF',
  },
  filterCount: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 11,
    color: '#8D6E63',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountActive: {
    color: '#5D4037',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Date Headers
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  dateHeaderText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 14,
    color: '#5D4037',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(93, 64, 55, 0.2)',
    borderRadius: 1,
  },
  
  // History Cards
  historyCard: {
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
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 15,
    color: '#FFF',
    marginBottom: 4,
  },
  cardDate: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  cardRewards: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 12,
    color: '#FFF',
    marginBottom: 2,
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: 'ChakraPetch_500Medium',
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 18,
    color: '#5D4037',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#8D6E63',
  },
  
  bottomSpacer: {
    height: 20,
  },
});
