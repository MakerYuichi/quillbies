import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useQuillbyStore } from '../../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RealTimeClock() {
  const { userData } = useQuillbyStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => {
      // Subtle fade animation on time update
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [fadeAnim]);

  const formatTime = () => {
    const timezone = userData.timezone || 'UTC';
    
    try {
      // Format time according to user's timezone
      const timeString = currentTime.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: true,
        hour: 'numeric', // Remove leading zero for single digits
        minute: '2-digit'
      });
      
      return timeString;
    } catch (error) {
      // Fallback to local time if timezone is invalid
      console.warn('[Clock] Invalid timezone:', timezone, 'Using local time');
      return currentTime.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getBuddyName = () => {
    return userData.buddyName || 'Hammy';
  };

  const getTimeBasedEmoji = () => {
    const timezone = userData.timezone || 'UTC';
    let hour;
    
    try {
      // Get hour in user's timezone
      const timeInTimezone = new Date().toLocaleString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit'
      });
      hour = parseInt(timeInTimezone);
    } catch (error) {
      hour = currentTime.getHours();
    }
    
    // Return appropriate emoji based on time of day
    if (hour >= 6 && hour < 12) return '🌅'; // Morning
    if (hour >= 12 && hour < 17) return '☀️'; // Afternoon  
    if (hour >= 17 && hour < 20) return '🌆'; // Evening
    if (hour >= 20 || hour < 6) return '🌙'; // Night
    return '🐹'; // Default
  };

  const getClockText = () => {
    const time = formatTime();
    const buddyName = getBuddyName();
    const timeEmoji = getTimeBasedEmoji();
    return `${time} ${timeEmoji} ${buddyName}'s Room`;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text style={[styles.clockText, { opacity: fadeAnim }]}>
        {getClockText()}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Dynamic positioning based on iPhone 15 Pro specs (393x852)
    width: (SCREEN_WIDTH * 266) / 393, // 266px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 66) / 852, // 66px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 16) / 393, // 16px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 9) / 852, // 9px on iPhone 15 Pro
    justifyContent: 'center',
    zIndex: 25, // Above room layers but below modals
  },
  clockText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 21) / 393, // 21px on iPhone 15 Pro, scales with screen
    lineHeight: (SCREEN_WIDTH * 33) / 393, // 33px line height, scales with screen
    color: '#000000',
    textAlign: 'left',
  },
});