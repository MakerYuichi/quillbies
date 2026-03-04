import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { CheckpointResult } from '../../core/types';
import { fs, sp, hp } from '../../utils/responsive';

export default function StudyProgress() {
  const userData = useQuillbyStore((state) => state.userData);
  const checkStudyCheckpoints = useQuillbyStore((state) => state.checkStudyCheckpoints);
  
  // Get theme colors
  const themeType = userData.roomCustomization?.themeType;
  const themeColors = require('../../utils/themeColors').getThemeColors(themeType);
  const textColor = themeType && themeColors.isDark ? '#FFFFFF' : '#333';
  const secondaryTextColor = themeType && themeColors.isDark ? '#E0E0E0' : '#666';
  
  // Only show if study habit is enabled
  if (!userData.enabledHabits?.includes('study') || !userData.studyGoalHours) {
    return null;
  }
  
  const studyHours = (userData.studyMinutesToday || 0) / 60;
  const goalHours = userData.studyGoalHours;
  const progressPercent = Math.min(100, (studyHours / goalHours) * 100);
  
  // Get current checkpoint status (but don't add mess points here - that's done by the interval in index.tsx)
  const checkResult: CheckpointResult = checkStudyCheckpoints();
  
  const getProgressColor = () => {
    if (checkResult.isBehind) return '#F44336'; // Red if behind
    if (progressPercent >= 100) return '#4CAF50'; // Green if complete
    if (progressPercent >= 75) return '#8BC34A'; // Light green if on track
    if (progressPercent >= 50) return '#FF9800'; // Orange if moderate
    return '#FFC107'; // Yellow if low
  };

  const getEnergyCapVisualCue = () => {
    const mess = userData.messPoints;
    if (mess <= 5) return '✅ Full';
    if (mess <= 10) return '⚠️ Slight';
    if (mess <= 15) return '⚠️ Noticeable';
    if (mess <= 20) return '❌ Significant';
    if (mess <= 25) return '❌ Heavy';
    if (mess <= 30) return '❌ Severe';
    return '❌ Maximum';
  };

  const getStatusText = () => {
    if (checkResult.isBehind && checkResult.missing) {
      return 'Behind';
    }
    if (progressPercent >= 100) {
      return 'Goal achieved! 🎉';
    }
    return 'On track';
  };

  return (
    <View style={[
      styles.container,
      themeType && {
        backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0',
      }
    ]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>📚 Study Progress</Text>
        <Text style={[styles.status, { color: getProgressColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${progressPercent}%`,
                backgroundColor: getProgressColor()
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: secondaryTextColor }]}>
          {(() => {
            const h = Math.floor(studyHours);
            const m = Math.round((studyHours - h) * 60);
            const studyText = h > 0 ? `${h}h ${m}min` : `${m}min`;
            return `${studyText} / ${goalHours}h (${progressPercent.toFixed(0)}%)`;
          })()}
        </Text>
      </View>
      
      {/* Energy Cap Impact Display */}
      {userData.messPoints > 5 && (
        <View style={styles.energyCapWarning}>
          <Text style={styles.energyCapText}>
            Energy Cap: {userData.maxEnergyCap}% {getEnergyCapVisualCue()}
          </Text>
          <Text style={styles.messPointsText}>
            Mess: {userData.messPoints.toFixed(1)} points
          </Text>
        </View>
      )}
      
      {checkResult.isBehind && checkResult.expected && checkResult.checkpoint && (
        <Text style={styles.warningText}>
          Expected {Math.floor(checkResult.expected)}h {Math.round((checkResult.expected - Math.floor(checkResult.expected)) * 60)}min by {checkResult.checkpoint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: sp(3),
    padding: sp(3),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1, // Take available space in side-by-side layout
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3.2),
    color: '#333',
    flexShrink: 1,
  },
  status: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(2.8),
    flexShrink: 0,
  },
  progressContainer: {
    marginBottom: hp(0.6),
  },
  progressBar: {
    width: '100%',
    height: hp(1),
    backgroundColor: '#E0E0E0',
    borderRadius: sp(1),
    overflow: 'hidden',
    marginBottom: hp(0.6),
  },
  progressFill: {
    height: '100%',
    borderRadius: sp(1),
  },
  progressText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(2.8),
    color: '#666',
    textAlign: 'center',
  },
  warningText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(2.5),
    color: '#F44336',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  energyCapWarning: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    padding: sp(2),
    borderRadius: sp(1.5),
    marginTop: hp(0.6),
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  energyCapText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(2.5),
    color: '#D84315',
    textAlign: 'center',
  },
  messPointsText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(2.3),
    color: '#FF5722',
    textAlign: 'center',
    marginTop: hp(0.3),
  },
});