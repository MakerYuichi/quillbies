import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Animated } from 'react-native';

interface SessionCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  sessionData: {
    duration: number; // in seconds
    targetDuration?: number; // in seconds - the goal duration
    focusScore: number;
    coinsEarned: number;
    buddyName: string;
  };
}

export default function SessionCompletionModal({ visible, onClose, sessionData }: SessionCompletionModalProps) {
  const [celebrationAnim] = useState(new Animated.Value(0));
  const [coinsAnim] = useState(new Animated.Value(0));
  
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
      
      // Animate coins
      Animated.spring(coinsAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }).start();
    } else {
      celebrationAnim.setValue(0);
      coinsAnim.setValue(0);
    }
  }, [visible]);
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Calculate completion percentage (cap at 100%)
  const completionPercent = sessionData.targetDuration 
    ? Math.min(100, Math.round((sessionData.duration / sessionData.targetDuration) * 100))
    : 100; // If no target, assume 100%
  
  // Determine Quillby's reaction based on completion percentage
  let quillbyImage;
  let title = '';
  let subtitle = '';
  let titleColor = '#FF9800';
  
  if (completionPercent >= 100) {
    quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
    title = '🎉 Perfect! Session Complete!';
    subtitle = `${sessionData.buddyName} is so proud of you!`;
    titleColor = '#4CAF50';
  } else if (completionPercent >= 80) {
    quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
    title = '🌟 Amazing Work!';
    subtitle = `${sessionData.buddyName} is really proud! Almost there!`;
    titleColor = '#4CAF50';
  } else if (completionPercent >= 50) {
    quillbyImage = require('../../../assets/hamsters/casual/idle-sit-happy.png');
    title = '💪 Good Progress!';
    subtitle = `${sessionData.buddyName} believes in you! Keep going!`;
    titleColor = '#FF9800';
  } else {
    quillbyImage = require('../../../assets/hamsters/casual/idle-sit.png');
    title = '😔 Early Finish';
    subtitle = `${sessionData.buddyName} hopes you'll do more next time...`;
    titleColor = '#FF9800';
  }
  
  // Motivational message based on completion
  let motivationalMessage = '';
  if (completionPercent >= 100) {
    motivationalMessage = "🏆 You completed your full session! Incredible dedication!";
  } else if (completionPercent >= 80) {
    motivationalMessage = "⭐ You're so close to your goal! Amazing effort!";
  } else if (completionPercent >= 50) {
    motivationalMessage = "💫 Good start! Try to reach your full goal next time!";
  } else {
    motivationalMessage = "🌱 Every minute counts! Let's aim higher next session!";
  }
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Celebration Hamster */}
          <Animated.View 
            style={[
              styles.hamsterContainer,
              {
                transform: [
                  { scale: celebrationAnim },
                  {
                    rotate: celebrationAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['-5deg', '5deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image
              source={quillbyImage}
              style={styles.hamsterImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Title */}
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          
          {/* Completion Percentage (if target exists) */}
          {sessionData.targetDuration && (
            <Text style={styles.completionPercent}>
              {completionPercent}% of goal completed
            </Text>
          )}
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>⏱️ Time Studied:</Text>
              <Text style={styles.statValue}>{formatDuration(sessionData.duration)}</Text>
            </View>
            
            {sessionData.targetDuration && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>🎯 Goal:</Text>
                <Text style={styles.statValue}>{formatDuration(sessionData.targetDuration)}</Text>
              </View>
            )}
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>📊 Focus Score:</Text>
              <Text style={styles.statValue}>{sessionData.focusScore}</Text>
            </View>
            
            <Animated.View 
              style={[
                styles.statRow,
                styles.coinsRow,
                {
                  opacity: coinsAnim,
                  transform: [
                    {
                      scale: coinsAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.5, 1.2, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.statLabel}>💰 Coins Earned:</Text>
              <Text style={[styles.statValue, styles.coinsValue]}>
                +{sessionData.coinsEarned}
              </Text>
            </Animated.View>
          </View>
          
          {/* Motivational Message */}
          <Text style={styles.message}>{motivationalMessage}</Text>
          
          {/* Return Button */}
          <TouchableOpacity
            style={styles.returnButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.returnButtonText}>Return to Home</Text>
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
    padding: 20,
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  hamsterContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  hamsterImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  completionPercent: {
    fontSize: 18,
    color: '#FF9800',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  coinsRow: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  coinsValue: {
    color: '#FF9800',
    fontSize: 24,
  },
  message: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  returnButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  returnButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
