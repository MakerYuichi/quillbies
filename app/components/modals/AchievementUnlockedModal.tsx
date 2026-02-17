import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { Achievement } from '../../core/types';
import { LinearGradient } from 'expo-linear-gradient';
import { soundManager, SOUNDS } from '../../../lib/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AchievementUnlockedModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

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

// Get themed emojis based on achievement
const getThemedEmojis = (achievementId: string): string[] => {
  switch (achievementId) {
    case 'marathon-runner':
      return ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐']; // Sports balls
    case 'week-warrior':
      return ['⚔️', '🗡️', '🛡️', '⚔️', '🗡️', '🛡️']; // Swords and shields
    case 'first-focus':
      return ['⭐', '✨', '💫', '🌟', '⭐', '✨']; // Stars
    case 'speed-demon':
      return ['⚡', '💨', '🔥', '⚡', '💨', '🔥']; // Speed symbols
    case 'night-owl':
      return ['🌙', '⭐', '🦉', '🌙', '⭐', '🦉']; // Night symbols
    default:
      return ['✨', '⭐', '🎉', '💫', '🌟', '✨']; // Default celebration
  }
};

export default function AchievementUnlockedModal({ visible, achievement, onClose }: AchievementUnlockedModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Confetti animations
  const confetti1 = useRef(new Animated.Value(-100)).current;
  const confetti2 = useRef(new Animated.Value(-100)).current;
  const confetti3 = useRef(new Animated.Value(-100)).current;
  const confetti4 = useRef(new Animated.Value(-100)).current;
  const confetti5 = useRef(new Animated.Value(-100)).current;
  const confetti6 = useRef(new Animated.Value(-100)).current;
  
  // Track sound for cleanup
  const soundPlayingRef = useRef(false);
  
  useEffect(() => {
    if (visible && achievement) {
      // Play achievement sound
      console.log('[Achievement] 🔊 Playing achievement sound...');
      soundPlayingRef.current = true;
      soundManager.playSound(SOUNDS.ACHIEVEMENT, 0.8, 1.0).catch(err => {
        console.error('[Achievement] Failed to play sound:', err);
      });
      
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      slideAnim.setValue(100);
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
      bounceAnim.setValue(0);
      shakeAnim.setValue(0);
      glowAnim.setValue(0);
      confetti1.setValue(-100);
      confetti2.setValue(-100);
      confetti3.setValue(-100);
      confetti4.setValue(-100);
      confetti5.setValue(-100);
      confetti6.setValue(-100);
      
      // Start epic celebration animation with varied effects
      Animated.parallel([
        // Fade in background quickly
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Slide up content with strong bounce
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        // Scale in trophy with dramatic overshoot
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 60,
          delay: 150,
          useNativeDriver: true,
        }),
        // Single rotation with wobble
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          delay: 150,
          useNativeDriver: true,
        }),
        // Bounce effect with overshoot
        Animated.sequence([
          Animated.delay(250),
          Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 2,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
        // Glow effect
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Start pulsing and shaking animations
        Animated.parallel([
          // Pulse animation
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: 1.15,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
            ])
          ),
          // Subtle shake animation
          Animated.loop(
            Animated.sequence([
              Animated.timing(shakeAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(shakeAnim, {
                toValue: -1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.delay(2000), // Pause between shakes
            ])
          ),
        ]).start();
      });
      
      // Confetti rain with faster, more dramatic fall
      const confettiAnimations = [confetti1, confetti2, confetti3, confetti4, confetti5, confetti6];
      confettiAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 100), // Faster stagger
            Animated.timing(anim, {
              toValue: SCREEN_HEIGHT + 100,
              duration: 2000, // Faster fall
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: -100,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    } else if (!visible && soundPlayingRef.current) {
      // Stop sound when modal closes
      console.log('[Achievement] 🔇 Stopping achievement sound...');
      soundManager.stopSound(SOUNDS.ACHIEVEMENT);
      soundPlayingRef.current = false;
    }
    
    return () => {
      // Cleanup: stop sound if modal unmounts
      if (soundPlayingRef.current) {
        console.log('[Achievement] 🔇 Cleanup: Stopping achievement sound...');
        soundManager.stopSound(SOUNDS.ACHIEVEMENT);
        soundPlayingRef.current = false;
      }
    };
  }, [visible, achievement]);
  
  if (!achievement) return null;
  
  const getRarityColors = (rarity: string): [string, string] => {
    switch (rarity) {
      case 'common': return ['#9E9E9E', '#616161'];
      case 'rare': return ['#42A5F5', '#1565C0'];
      case 'epic': return ['#AB47BC', '#6A1B9A'];
      case 'legendary': return ['#FFB300', '#E65100'];
      default: return ['#9E9E9E', '#616161'];
    }
  };
  
  const [color1, color2] = getRarityColors(achievement.rarity);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // Single rotation
  });
  
  const shake = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });
  
  const glow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });
  
  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });
  
  // Get achievement asset
  const achievementAsset = ACHIEVEMENT_ASSETS[achievement.id];
  
  // Get themed emojis
  const themedEmojis = getThemedEmojis(achievement.id);
  
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={[color1, color2, '#1A1A1A']}
        style={styles.fullScreenContainer}
      >
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim, 
              transform: [
                { translateY: slideAnim },
                { translateY: bounce }
              ] 
            }
          ]}
        >
          {/* Confetti Rain with themed emojis */}
          {[confetti1, confetti2, confetti3, confetti4, confetti5, confetti6].map((anim, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.confetti, 
                { 
                  left: `${15 + index * 15}%`,
                  transform: [{ translateY: anim }]
                }
              ]}
            >
              <Text style={styles.confettiEmoji}>{themedEmojis[index]}</Text>
            </Animated.View>
          ))}
          
          {/* Header */}
          <Text style={styles.title}>🏆 ACHIEVEMENT UNLOCKED! 🏆</Text>
          
          {/* Achievement Image/Icon */}
          <Animated.View 
            style={[
              styles.imageContainer,
              {
                transform: [
                  { scale: Animated.multiply(Animated.multiply(scaleAnim, pulseAnim), glow) },
                  { rotate },
                  { rotateZ: shake }
                ]
              }
            ]}
          >
            {achievementAsset ? (
              <Image
                source={achievementAsset}
                style={styles.achievementImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.iconFallback}>{achievement.icon}</Text>
            )}
          </Animated.View>
          
          {/* Achievement Name */}
          <Text style={styles.achievementName}>{achievement.name}</Text>
          
          {/* Rarity Badge */}
          <View style={[styles.rarityBadge, { backgroundColor: color1 }]}>
            <Text style={styles.rarityText}>✦ {achievement.rarity.toUpperCase()} ✦</Text>
          </View>
          
          {/* Description */}
          <Text style={styles.description}>{achievement.description}</Text>
          
          {/* Rewards Section - Compact */}
          <View style={styles.rewardsContainer}>
            {/* Gems Reward */}
            <View style={styles.rewardBox}>
              <Text style={styles.rewardIcon}>💎</Text>
              <Text style={styles.rewardValue}>+{achievement.xpReward}</Text>
              <Text style={styles.rewardLabel}>Gems</Text>
            </View>
            
            <View style={styles.rewardDivider} />
            
            {/* Q-Bies Reward */}
            <View style={styles.rewardBox}>
              <Image
                source={require('../../../assets/overall/qbies.png')}
                style={styles.qbiesIcon}
                resizeMode="contain"
              />
              <Text style={styles.rewardValue}>+{achievement.coinReward}</Text>
              <Text style={styles.rewardLabel}>Q-Bies</Text>
            </View>
          </View>
          
          {/* Close Button */}
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: color1 }]} 
            onPress={() => {
              // Stop sound when closing
              if (soundPlayingRef.current) {
                console.log('[Achievement] 🔇 Stopping sound on close...');
                soundManager.stopSound(SOUNDS.ACHIEVEMENT);
                soundPlayingRef.current = false;
              }
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>AWESOME! 🎉</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  confetti: {
    position: 'absolute',
    top: -100,
  },
  confettiEmoji: {
    fontSize: 36,
  },
  title: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 26,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1.5,
  },
  imageContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementImage: {
    width: '100%',
    height: '100%',
  },
  iconFallback: {
    fontSize: 100,
  },
  achievementName: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 32,
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rarityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  rarityText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 14,
    color: '#FFF',
    letterSpacing: 2.5,
  },
  description: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  rewardBox: {
    alignItems: 'center',
    flex: 1,
  },
  rewardDivider: {
    width: 2,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
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
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.8,
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 18,
    color: '#FFF',
    letterSpacing: 1.8,
  },
});
