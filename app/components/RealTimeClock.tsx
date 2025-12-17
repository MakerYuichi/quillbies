import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useQuillbyStore } from '../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RealTimeClock() {
  const { userData } = useQuillbyStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const timezone = userData.timezone || 'UTC';
    
    try {
      // Format time according to user's timezone
      const timeString = currentTime.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return timeString;
    } catch (error) {
      // Fallback to local time if timezone is invalid
      console.warn('[Clock] Invalid timezone:', timezone, 'Using local time');
      return currentTime.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getBuddyName = () => {
    return userData.buddyName || 'Hammy';
  };

  const getClockText = () => {
    const time = formatTime();
    const buddyName = getBuddyName();
    return `${time} 🐹 ${buddyName}'s Room`;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <Text style={styles.clockText}>
        {getClockText()}
      </Text>
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