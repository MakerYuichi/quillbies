import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getThemeColors } from '../../utils/themeColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RealTimeClockProps {
  isExercising?: boolean;
  customLabel?: string; // Custom label like "Shop" instead of "Room"
}

export default function RealTimeClock({ isExercising = false, customLabel }: RealTimeClockProps) {
  const userData = useQuillbyStore((state) => state.userData);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // Get theme colors for text
  const themeType = userData.roomCustomization?.themeType;
  const themeColors = getThemeColors(themeType);
  const textColor = themeType ? themeColors.textPrimary : '#000000';

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
    // Just use local time - timezone is for display purposes only
    return currentTime.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getBuddyName = () => {
    return userData.buddyName || 'Hammy';
  };

  const getTimeBasedEmoji = () => {
    // Use local device time for emoji
    const hour = currentTime.getHours();
    
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
    
    // Show different text during exercise session
    if (isExercising) {
      return `${time} 💪\n${buddyName}'s Exercise Session`;
    }
    
    // Use custom label if provided
    const label = customLabel || 'Room';
    return `${time} ${timeEmoji}\n${buddyName}'s ${label}`;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text 
        style={[styles.clockText, { opacity: fadeAnim, color: textColor }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {getClockText()}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Dynamic positioning based on iPhone 15 Pro specs (393x852)
    width: '55%', // Reduced from 90% to prevent overlap with currency display
    height: (SCREEN_HEIGHT * 66) / 852, // 66px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 16) / 393, // 16px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 9) / 852, // 9px on iPhone 15 Pro
    justifyContent: 'center',
    zIndex: 25, // Above room layers but below modals
  },
  clockText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 21) / 393, // 21px on iPhone 15 Pro, scales with screen
    lineHeight: (SCREEN_WIDTH * 26) / 393, // Reduced from 33 to 26 for tighter spacing
    color: '#000000',
    textAlign: 'left',
    flexShrink: 1, // Allow text to shrink if needed
  },
});