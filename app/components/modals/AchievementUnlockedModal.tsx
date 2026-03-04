import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, Image, ScrollView } from 'react-native';
import { Achievement } from '../../core/types';
import { LinearGradient } from 'expo-linear-gradient';
import { soundManager, SOUNDS } from '../../../lib/soundManager';
import { wp, hp, fs, sp } from '../../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AchievementUnlockedModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

// Shop item reward info
interface ShopItemReward {
  itemId: string;
  itemName: string;
  alreadyOwned: boolean;
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

// Get decorative elements based on rarity
const getDecorativeElements = (rarity: string): string[] => {
  switch (rarity) {
    case 'common':
      return ['✨', '⭐', '✨', '⭐']; // Simple sparkles
    case 'rare':
      return ['🍃', '🍂', '🍃', '🍂']; // Leaves
    case 'epic':
      return ['🌸', '🌺', '🌼', '🌻']; // Flowers and blossoms
    case 'legendary':
      return ['🌸', '✨', '🌺', '⭐']; // Mix of everything
    default:
      return ['✨', '⭐', '✨', '⭐'];
  }
};

// Get themed emojis based on achievement
const getThemedEmojis = (achievementId: string): string[] => {
  switch (achievementId) {
    // Daily Challenges
    case 'daily-session': return ['☀️', '☕', '📚', '✨', '💪', '🌅'];
    case 'daily-water': return ['💧', '💦', '🌊', '💙', '🚰', '💧'];
    case 'daily-meals': return ['🍎', '🥗', '🍽️', '🥙', '🍱', '🥘'];
    case 'daily-hours': return ['🎯', '⏱️', '📖', '✍️', '💡', '🎯'];
    case 'daily-early': return ['🌅', '☀️', '🐦', '🌄', '⏰', '🌞'];
    
    // Weekly Challenges
    case 'weekly-streak': return ['🔥', '⚔️', '🗡️', '🛡️', '⚔️', '🔥'];
    case 'weekly-sessions': return ['💪', '✅', '📊', '💯', '🎯', '💪'];
    case 'weekly-hours': return ['🎓', '📚', '🏆', '📖', '✨', '🎓'];
    case 'weekly-clean': return ['🧼', '✨', '🧹', '🧽', '💫', '🧼'];
    case 'weekly-hydration': return ['💧', '🦸', '💪', '💙', '🌊', '💧'];
    
    // Monthly Challenges
    case 'monthly-hours': return ['👑', '🏆', '💎', '⭐', '🎖️', '👑'];
    case 'monthly-streak': return ['🔥', '👑', '📅', '💪', '🏆', '🔥'];
    case 'monthly-deadlines': return ['🎯', '🏹', '🎪', '💥', '🎯', '🏹'];
    case 'monthly-perfect': return ['🌟', '✨', '💫', '⭐', '🌠', '🌟'];
    case 'monthly-sessions': return ['🏃', '🏁', '🎽', '🏅', '🏃', '🏁'];
    
    // Beginner Secrets
    case 'secret-first-session': return ['🎯', '📚', '✨', '🎉', '💡', '🎯'];
    case 'secret-first-deadline': return ['📋', '✅', '💡', '📝', '✨', '📋'];
    case 'secret-first-perfect': return ['✨', '💯', '🎭', '🌟', '👏', '✨'];
    case 'secret-first-clean': return ['🧹', '✨', '💫', '🧼', '🌟', '🧹'];
    
    // Consumption Secrets
    case 'secret-coffee-lover': return ['☕', '💨', '⚡', '🫘', '☕', '💨'];
    case 'secret-apple-fan': return ['🍎', '🍏', '💚', '🌿', '✨', '🍎'];
    case 'secret-shopaholic': return ['🛍️', '💳', '🎁', '✨', '🛒', '🛍️'];
    
    // Time-Based Secrets
    case 'secret-night-owl': return ['🦉', '🌙', '⭐', '🌃', '🦉', '🌙'];
    case 'secret-early-bird': return ['🐦', '🌅', '☀️', '☕', '🌄', '🐦'];
    case 'secret-midnight': return ['🌙', '⭐', '🌌', '✨', '🕛', '🌙'];
    case 'secret-all-nighter': return ['😴', '☕', '🌙', '☀️', '💪', '😴'];
    
    // Progress Milestones
    case 'secret-perfectionist': return ['💎', '✨', '🔍', '💯', '⭐', '💎'];
    case 'secret-speed-demon': return ['⚡', '💨', '🏎️', '💥', '🔥', '⚡'];
    case 'secret-clean-freak': return ['🧼', '✨', '🧽', '💫', '🧹', '🧼'];
    case 'secret-deadline-master': return ['🏆', '💥', '🎯', '👊', '🏅', '🏆'];
    
    // Epic Milestones
    case 'secret-century': return ['🌟', '🎉', '🥂', '🎊', '💯', '🌟'];
    case 'secret-marathon': return ['🏃', '🏁', '🏅', '🎖️', '💪', '🏃'];
    case 'secret-zen-master': return ['🧘', '🌸', '☮️', '🕉️', '✨', '🧘'];
    
    // Legendary Secrets
    case 'secret-scholar': return ['📚', '🎓', '📖', '✨', '🏛️', '📚'];
    case 'secret-legend': return ['🎓', '👑', '⚡', '🌟', '🏆', '🎓'];
    case 'secret-completionist': return ['👑', '🏆', '💎', '🌈', '⭐', '👑'];
    
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
  
  // Get shop item reward from store
  const userData = require('../../state/store-modular').useQuillbyStore((state: any) => state.userData);
  const shopItemReward = achievement ? userData.achievements?.[achievement.id]?.shopItemReward : null;
  
  // Confetti animations
  const confetti1 = useRef(new Animated.Value(-100)).current;
  const confetti2 = useRef(new Animated.Value(-100)).current;
  const confetti3 = useRef(new Animated.Value(-100)).current;
  const confetti4 = useRef(new Animated.Value(-100)).current;
  const confetti5 = useRef(new Animated.Value(-100)).current;
  const confetti6 = useRef(new Animated.Value(-100)).current;
  
  // Decorative elements animations (flowers, leaves, sparkles)
  const decor1 = useRef(new Animated.Value(-100)).current;
  const decor2 = useRef(new Animated.Value(-100)).current;
  const decor3 = useRef(new Animated.Value(-100)).current;
  const decor4 = useRef(new Animated.Value(-100)).current;
  
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
      decor1.setValue(-100);
      decor2.setValue(-100);
      decor3.setValue(-100);
      decor4.setValue(-100);
      
      // Rarity-based animation intensity
      const rarity = achievement.rarity;
      const isLegendary = rarity === 'legendary';
      const isEpic = rarity === 'epic';
      const isRare = rarity === 'rare';
      
      // Adjust animation parameters based on rarity
      const springFriction = isLegendary ? 2 : isEpic ? 3 : isRare ? 4 : 5;
      const springTension = isLegendary ? 80 : isEpic ? 70 : isRare ? 60 : 50;
      const scaleFriction = isLegendary ? 2 : isEpic ? 2.5 : isRare ? 3 : 4;
      const rotationDuration = 800; // Equal rotation duration for all rarities
      const rotations = 1; // Equal single rotation for all rarities
      
      // Start epic celebration animation with varied effects
      Animated.parallel([
        // Fade in background quickly
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Slide up content with strong bounce (more dramatic for higher rarity)
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: springFriction,
          tension: springTension,
          useNativeDriver: true,
        }),
        // Scale in trophy with dramatic overshoot (more for higher rarity)
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: scaleFriction,
          tension: springTension,
          delay: 150,
          useNativeDriver: true,
        }),
        // Rotation with wobble (more rotations for higher rarity)
        Animated.timing(rotateAnim, {
          toValue: rotations,
          duration: rotationDuration,
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
        // Glow effect (stronger for higher rarity)
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(glowAnim, {
            toValue: isLegendary ? 1.15 : isEpic ? 1.1 : 1.05,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Start pulsing and shaking animations
        const pulseScale = isLegendary ? 1.2 : isEpic ? 1.18 : isRare ? 1.15 : 1.12;
        const pulseDuration = isLegendary ? 400 : isEpic ? 450 : 500;
        
        Animated.parallel([
          // Pulse animation (more dramatic for higher rarity)
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnim, {
                toValue: pulseScale,
                duration: pulseDuration,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnim, {
                toValue: 1,
                duration: pulseDuration,
                useNativeDriver: true,
              }),
            ])
          ),
          // Subtle shake animation (more for legendary)
          Animated.loop(
            Animated.sequence([
              Animated.timing(shakeAnim, {
                toValue: isLegendary ? 1.5 : 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(shakeAnim, {
                toValue: isLegendary ? -1.5 : -1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(shakeAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.delay(isLegendary ? 1500 : 2000), // More frequent for legendary
            ])
          ),
        ]).start();
      });
      
      // Confetti rain with rarity-based speed
      const confettiDuration = isLegendary ? 1500 : isEpic ? 1800 : isRare ? 2000 : 2200;
      const confettiStagger = isLegendary ? 80 : isEpic ? 90 : 100;
      
      const confettiAnimations = [confetti1, confetti2, confetti3, confetti4, confetti5, confetti6];
      confettiAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * confettiStagger),
            Animated.timing(anim, {
              toValue: SCREEN_HEIGHT + 100,
              duration: confettiDuration,
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
      
      // Decorative elements rain (slower and different pattern)
      const decorDuration = isLegendary ? 2000 : isEpic ? 2300 : isRare ? 2500 : 2800;
      const decorStagger = isLegendary ? 120 : isEpic ? 140 : 160;
      
      const decorAnimations = [decor1, decor2, decor3, decor4];
      decorAnimations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * decorStagger + 200), // Start slightly after confetti
            Animated.timing(anim, {
              toValue: SCREEN_HEIGHT + 100,
              duration: decorDuration,
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
  
  // Get themed background colors based on achievement
  const getThemedColors = (achievementId: string): [string, string] => {
    switch (achievementId) {
      // Daily Challenges - Morning/Fresh colors
      case 'daily-session': return ['#FFB74D', '#FF9800']; // Orange sunrise
      case 'daily-water': return ['#4FC3F7', '#0288D1']; // Blue water
      case 'daily-meals': return ['#81C784', '#388E3C']; // Green healthy
      case 'daily-hours': return ['#7986CB', '#3949AB']; // Blue focus
      case 'daily-early': return ['#FFD54F', '#FFA000']; // Golden sunrise
      
      // Weekly Challenges - Vibrant/Achievement colors
      case 'weekly-streak': return ['#FF5722', '#D84315']; // Red fire
      case 'weekly-sessions': return ['#AB47BC', '#7B1FA2']; // Purple power
      case 'weekly-hours': return ['#5C6BC0', '#283593']; // Deep blue
      case 'weekly-clean': return ['#4DD0E1', '#0097A7']; // Cyan clean
      case 'weekly-hydration': return ['#29B6F6', '#0277BD']; // Bright blue
      
      // Monthly Challenges - Royal/Premium colors
      case 'monthly-hours': return ['#FFD700', '#FFA000']; // Gold crown
      case 'monthly-streak': return ['#FF6F00', '#E65100']; // Orange flame
      case 'monthly-deadlines': return ['#F44336', '#C62828']; // Red target
      case 'monthly-perfect': return ['#FDD835', '#F57F17']; // Yellow star
      case 'monthly-sessions': return ['#66BB6A', '#2E7D32']; // Green runner
      
      // Beginner Secrets - Soft/Encouraging colors
      case 'secret-first-session': return ['#7986CB', '#3949AB']; // Blue start
      case 'secret-first-deadline': return ['#64B5F6', '#1976D2']; // Light blue
      case 'secret-first-perfect': return ['#FFD54F', '#FFA000']; // Golden sparkle
      case 'secret-first-clean': return ['#4DD0E1', '#0097A7']; // Cyan clean
      
      // Consumption Secrets - Item-themed colors
      case 'secret-coffee-lover': return ['#8D6E63', '#4E342E']; // Brown coffee
      case 'secret-apple-fan': return ['#66BB6A', '#2E7D32']; // Green apple
      case 'secret-shopaholic': return ['#EC407A', '#C2185B']; // Pink shopping
      
      // Time-Based Secrets - Time-of-day colors
      case 'secret-night-owl': return ['#5C6BC0', '#283593']; // Night blue
      case 'secret-early-bird': return ['#FFB74D', '#F57C00']; // Dawn orange
      case 'secret-midnight': return ['#7E57C2', '#4527A0']; // Midnight purple
      case 'secret-all-nighter': return ['#5E35B1', '#311B92']; // Deep purple
      
      // Progress Milestones - Achievement colors
      case 'secret-perfectionist': return ['#BA68C8', '#7B1FA2']; // Purple diamond
      case 'secret-speed-demon': return ['#FFEB3B', '#F57F17']; // Yellow lightning
      case 'secret-clean-freak': return ['#4FC3F7', '#0277BD']; // Bright blue
      case 'secret-deadline-master': return ['#FF7043', '#D84315']; // Orange trophy
      
      // Epic Milestones - Epic colors
      case 'secret-century': return ['#FFD700', '#FF8F00']; // Gold celebration
      case 'secret-marathon': return ['#66BB6A', '#2E7D32']; // Green runner
      case 'secret-zen-master': return ['#9575CD', '#5E35B1']; // Purple zen
      
      // Legendary Secrets - Legendary colors
      case 'secret-scholar': return ['#5C6BC0', '#283593']; // Deep blue scholar
      case 'secret-legend': return ['#FFB300', '#E65100']; // Golden legend
      case 'secret-completionist': return ['#E91E63', '#880E4F']; // Rainbow/Pink ultimate
      
      default: return getRarityColors(achievement?.rarity || 'common');
    }
  };
  
  const [color1, color2] = getThemedColors(achievement.id);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
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
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  });
  
  // Get achievement asset
  const achievementAsset = ACHIEVEMENT_ASSETS[achievement.id];
  
  // Get themed emojis
  const themedEmojis = getThemedEmojis(achievement.id);
  
  // Rarity-based styling
  const rarity = achievement.rarity;
  const isLegendary = rarity === 'legendary';
  const isEpic = rarity === 'epic';
  const isRare = rarity === 'rare';
  
  // Confetti size based on rarity
  const confettiSize = isLegendary ? fs(12) : isEpic ? fs(10.5) : isRare ? fs(9.5) : fs(9);
  
  // Image border glow based on rarity
  const imageBorderWidth = isLegendary ? 6 : isEpic ? 5 : isRare ? 4 : 3;
  const imageShadowRadius = isLegendary ? 20 : isEpic ? 15 : isRare ? 12 : 10;
  const imageShadowOpacity = isLegendary ? 0.6 : isEpic ? 0.5 : isRare ? 0.4 : 0.3;
  
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
        {/* Confetti Rain with themed emojis - Outside ScrollView */}
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
            pointerEvents="none"
          >
            <Text style={[styles.confettiEmoji, { fontSize: confettiSize }]}>{themedEmojis[index]}</Text>
          </Animated.View>
        ))}
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
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
            {/* Header */}
            <Text style={styles.title}>🏆 ACHIEVEMENT UNLOCKED! 🏆</Text>
            
            {/* Achievement Image/Icon */}
            <Animated.View 
              style={[
                styles.imageContainer,
                {
                  borderWidth: imageBorderWidth,
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  shadowRadius: imageShadowRadius,
                  shadowOpacity: imageShadowOpacity,
                  shadowColor: color1,
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
            
            {/* Achievement Type Badge */}
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {achievement.id.startsWith('daily-') ? '📅 DAILY CHALLENGE' :
                 achievement.id.startsWith('weekly-') ? '📊 WEEKLY CHALLENGE' :
                 achievement.id.startsWith('monthly-') ? '🏆 MONTHLY CHALLENGE' :
                 achievement.id.startsWith('secret-') ? '🔒 SECRET QUEST' :
                 '🎯 SPECIAL'}
              </Text>
            </View>
            
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
            
            {/* Shop Item Reward */}
            {shopItemReward && (
              <View style={[styles.shopItemContainer, { backgroundColor: shopItemReward.alreadyOwned ? 'rgba(255, 152, 0, 0.15)' : 'rgba(76, 175, 80, 0.15)' }]}>
                <Text style={styles.shopItemTitle}>
                  {shopItemReward.alreadyOwned ? '🎁 Bonus Item (Already Owned)' : '🎁 New Item Unlocked!'}
                </Text>
                <Text style={[styles.shopItemName, { color: shopItemReward.alreadyOwned ? '#FF9800' : '#4CAF50' }]}>
                  {shopItemReward.itemName}
                </Text>
                {shopItemReward.alreadyOwned && (
                  <Text style={styles.shopItemSubtext}>
                    Oops! You already have this. Better luck next time! 😅
                  </Text>
                )}
              </View>
            )}
            
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
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: hp(7),
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
  },
  confetti: {
    position: 'absolute',
    top: -100,
  },
  confettiEmoji: {
    fontSize: fs(9),
  },
  title: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: fs(6.5),
    color: '#FFF',
    marginBottom: hp(2.5),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1.5,
  },
  imageContainer: {
    width: wp(45),
    height: wp(45),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2.5),
    borderRadius: wp(22.5),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  achievementImage: {
    width: '100%',
    height: '100%',
  },
  iconFallback: {
    fontSize: fs(25),
  },
  achievementName: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: fs(8),
    color: '#FFF',
    marginBottom: hp(1.5),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rarityBadge: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    borderRadius: sp(4),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  typeBadge: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    borderRadius: sp(3),
    marginBottom: hp(1),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  typeText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3),
    color: '#FFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rarityText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: fs(3.5),
    color: '#FFF',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  description: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(4),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: hp(3),
    lineHeight: fs(5.5),
    paddingHorizontal: wp(2.5),
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: sp(4),
    padding: sp(5),
    marginBottom: hp(3),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  rewardBox: {
    alignItems: 'center',
    flex: 1,
  },
  rewardDivider: {
    width: 2,
    height: hp(6),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: wp(4),
  },
  rewardIcon: {
    fontSize: fs(10),
    marginBottom: hp(1),
  },
  qbiesIcon: {
    width: wp(10),
    height: wp(10),
    marginBottom: hp(1),
  },
  rewardValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: fs(7),
    color: '#FFD700',
    marginBottom: hp(0.5),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  rewardLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3.2),
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.8,
  },
  shopItemContainer: {
    width: wp(90),
    padding: sp(4),
    borderRadius: sp(3),
    marginBottom: hp(2.5),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  shopItemTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3.5),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: hp(0.7),
    letterSpacing: 0.5,
  },
  shopItemName: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: fs(4.5),
    marginBottom: hp(0.5),
    textAlign: 'center',
  },
  shopItemSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(3),
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  closeButton: {
    paddingVertical: hp(1.7),
    paddingHorizontal: wp(12.5),
    borderRadius: sp(6.5),
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
    fontSize: fs(4.5),
    color: '#FFF',
    letterSpacing: 1.8,
  },
});
