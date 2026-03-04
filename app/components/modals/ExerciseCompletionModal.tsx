import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Animated, Dimensions } from 'react-native';
import { playEndSessionSound } from '../../../lib/soundManager';
import { wp, hp, fs, sp } from '../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExerciseCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseData: {
    duration: number; // in minutes
    targetDuration?: number; // in minutes - the goal duration (null for stopwatch mode)
    buddyName: string;
    exerciseGoal?: number; // daily exercise goal in minutes
  };
}

export default function ExerciseCompletionModal({ visible, onClose, exerciseData }: ExerciseCompletionModalProps) {
  const [celebrationAnim] = useState(new Animated.Value(0));
  const [statsAnim] = useState(new Animated.Value(0));
  
  const handleClose = () => {
    playEndSessionSound();
    onClose();
  };
  
  useEffect(() => {
    if (visible) {
      // Animate hamster celebration
      Animated.sequence([
        Animated.spring(celebrationAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(celebrationAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(celebrationAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animate stats
      Animated.spring(statsAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }).start();
    } else {
      celebrationAnim.setValue(0);
      statsAnim.setValue(0);
    }
  }, [visible]);
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };
  
  // Determine reaction based on mode and goal
  let quillbyImage;
  let title = '';
  let subtitle = '';
  let titleColor = '#FF9800';
  let showGoalComparison = false;
  let completionPercent = 0;
  
  if (exerciseData.targetDuration === null || exerciseData.targetDuration === undefined) {
    // Stopwatch mode - check against daily goal
    if (exerciseData.exerciseGoal) {
      showGoalComparison = true;
      completionPercent = Math.round((exerciseData.duration / exerciseData.exerciseGoal) * 100);
      
      if (completionPercent >= 100) {
        quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
        title = '🎉 Daily Goal Crushed!';
        subtitle = `${exerciseData.buddyName} is so proud! You did it! 💪`;
        titleColor = '#4CAF50';
      } else if (completionPercent >= 80) {
        quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
        title = '🌟 Almost There!';
        subtitle = `${exerciseData.buddyName} is proud! So close to your goal!`;
        titleColor = '#4CAF50';
      } else if (completionPercent >= 50) {
        quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
        title = '💪 Good Progress!';
        subtitle = `${exerciseData.buddyName} believes in you! Keep it up!`;
        titleColor = '#FF9800';
      } else {
        quillbyImage = require('../../../assets/hamsters/casual/idle-sit.png');
        title = '🏃 Good Start!';
        subtitle = `${exerciseData.buddyName} knows you can do more! Every bit counts!`;
        titleColor = '#FF9800';
      }
    } else {
      // No goal set - always happy
      quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
      title = '💪 Great Workout!';
      subtitle = `${exerciseData.buddyName} is proud of you! 🌟`;
      titleColor = '#4CAF50';
    }
  } else {
    // Goal mode - compare session duration to target
    completionPercent = Math.min(100, Math.round((exerciseData.duration / exerciseData.targetDuration) * 100));
    showGoalComparison = true;
    
    if (completionPercent >= 100) {
      quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
      title = '🎉 Session Goal Achieved!';
      subtitle = `${exerciseData.buddyName} is so proud of you!`;
      titleColor = '#4CAF50';
    } else if (completionPercent >= 80) {
      quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
      title = '🌟 Almost There!';
      subtitle = `${exerciseData.buddyName} is really proud! So close!`;
      titleColor = '#4CAF50';
    } else if (completionPercent >= 50) {
      quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
      title = '💪 Good Effort!';
      subtitle = `${exerciseData.buddyName} believes in you! Keep going!`;
      titleColor = '#FF9800';
    } else {
      quillbyImage = require('../../../assets/hamsters/casual/idle-sit.png');
      title = '🏃 Good Start!';
      subtitle = `${exerciseData.buddyName} knows you can do more next time!`;
      titleColor = '#FF9800';
    }
  }
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Animated Hamster */}
          <Animated.View style={[
            styles.hamsterContainer,
            {
              transform: [{ scale: celebrationAnim }]
            }
          ]}>
            <Image
              source={quillbyImage}
              style={styles.hamsterImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Title */}
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          
          {/* Stats Container */}
          <Animated.View style={[
            styles.statsContainer,
            {
              opacity: statsAnim,
              transform: [{ scale: statsAnim }]
            }
          ]}>
            {/* Duration */}
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⏱️ Duration:</Text>
              <Text style={styles.statValue}>{formatDuration(exerciseData.duration)}</Text>
            </View>
            
            {/* Target Duration (if in goal mode) */}
            {exerciseData.targetDuration && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>🎯 Target:</Text>
                <Text style={styles.statValue}>{formatDuration(exerciseData.targetDuration)}</Text>
              </View>
            )}
            
            {/* Daily Goal Progress (if goal exists) */}
            {showGoalComparison && exerciseData.exerciseGoal && (
              <>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>📊 Daily Goal:</Text>
                  <Text style={styles.statValue}>{formatDuration(exerciseData.exerciseGoal)}</Text>
                </View>
                
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${Math.min(100, completionPercent)}%`,
                          backgroundColor: completionPercent >= 100 ? '#4CAF50' : '#FF9800'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{completionPercent}% of daily goal</Text>
                </View>
              </>
            )}
            
            {/* Energy Bonus */}
            <View style={[styles.statRow, styles.energyRow]}>
              <Text style={styles.energyLabel}>⚡ Energy Restored!</Text>
            </View>
          </Animated.View>
          
          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue 🎉</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: wp(85),
    backgroundColor: '#FFF',
    borderRadius: sp(5),
    padding: sp(5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  hamsterContainer: {
    width: wp(35),
    height: wp(35),
    marginBottom: hp(2),
  },
  hamsterImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(6),
    textAlign: 'center',
    marginBottom: hp(1),
  },
  subtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(3.5),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: fs(5),
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: sp(3),
    padding: sp(4),
    marginBottom: hp(3),
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  statLabel: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(3.5),
    color: '#666',
  },
  statValue: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4),
    color: '#333',
  },
  progressContainer: {
    marginTop: hp(1),
  },
  progressBarBackground: {
    width: '100%',
    height: hp(1.2),
    backgroundColor: '#E0E0E0',
    borderRadius: sp(1.5),
    overflow: 'hidden',
    marginBottom: hp(0.8),
  },
  progressBarFill: {
    height: '100%',
    borderRadius: sp(1.5),
  },
  progressText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3),
    color: '#666',
    textAlign: 'center',
  },
  energyRow: {
    justifyContent: 'center',
    marginTop: hp(1),
    marginBottom: 0,
  },
  energyLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4),
    color: '#4CAF50',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(10),
    borderRadius: sp(3),
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4.5),
    color: '#FFF',
  },
});
