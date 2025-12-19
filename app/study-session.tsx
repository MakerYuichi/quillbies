import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, AppState, AppStateStatus, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StudySessionScreen() {
  const router = useRouter();
  const { userData, session, selectedDeadlineId, deadlines, updateFocusDuringSession, endFocusSession, handleDistraction, logWater, logMeal, logExercise } = useQuillbyStore();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [speechKey, setSpeechKey] = useState(0); // Force re-render of speech bubble
  const [showReturnMessage, setShowReturnMessage] = useState(false);
  const [returnMessageTimer, setReturnMessageTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Session control states
  const [isPaused, setIsPaused] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [breakTimer, setBreakTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Update focus score and speech bubble every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update focus if not paused and not on break
      if (!isPaused && !isOnBreak) {
        updateFocusDuringSession();
      }
      setSpeechKey(prev => prev + 1); // Update speech bubble every second
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPaused, isOnBreak]);
  
  // Detect when user leaves the app (distraction)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log(`[AppState] ${appState} → ${nextAppState}`);
      
      if (appState === 'active' && (nextAppState === 'background' || nextAppState === 'inactive')) {
        // User left the app - start tracking distraction
        console.log('[Distraction] User left the app - starting grace period');
        handleDistraction();
      }
      
      if ((appState === 'background' || appState === 'inactive') && nextAppState === 'active') {
        // User returned to app - check grace period
        console.log('[Distraction] User returned to app - checking grace period');
        handleDistraction();
        
        // Show return message for 4 seconds
        setShowReturnMessage(true);
        
        // Clear any existing timer
        if (returnMessageTimer) {
          clearTimeout(returnMessageTimer);
        }
        
        // Set new timer to hide return message after 4 seconds
        const timer = setTimeout(() => {
          setShowReturnMessage(false);
          setReturnMessageTimer(null);
        }, 4000);
        
        setReturnMessageTimer(timer);
      }
      
      setAppState(nextAppState);
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      // Clean up return message timer
      if (returnMessageTimer) {
        clearTimeout(returnMessageTimer);
      }
    };
  }, [appState, returnMessageTimer]);

  // Cleanup break timer on unmount
  useEffect(() => {
    return () => {
      if (breakTimer) {
        clearInterval(breakTimer);
      }
    };
  }, [breakTimer]);
  
  const handlePauseSession = () => {
    setIsPaused(!isPaused);
    setSpeechKey(prev => prev + 1); // Update speech bubble
  };

  const handleBreakSession = () => {
    if (isOnBreak) {
      // Skip break early
      setIsOnBreak(false);
      setBreakTimeRemaining(0);
      if (breakTimer) {
        clearInterval(breakTimer);
        setBreakTimer(null);
      }
    } else {
      // Start 5-minute break
      setIsOnBreak(true);
      setBreakTimeRemaining(5 * 60); // 5 minutes in seconds
      
      const timer = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            // Break finished
            setIsOnBreak(false);
            clearInterval(timer);
            setBreakTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setBreakTimer(timer);
    }
    setSpeechKey(prev => prev + 1); // Update speech bubble
  };

  const handleEndSession = () => {
    // Clean up any active timers
    if (breakTimer) {
      clearInterval(breakTimer);
    }
    
    endFocusSession();
    
    // Navigate based on session type
    if (selectedDeadlineId) {
      // Deadline-focused session - return to focus screen
      router.push('/(tabs)/focus');
    } else {
      // Generic focus session - return to home
      router.push('/(tabs)/');
    }
  };
  
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No active session</Text>
      </View>
    );
  }
  
  // Find the deadline being worked on
  const currentDeadline = selectedDeadlineId 
    ? deadlines.find(d => d.id === selectedDeadlineId)
    : null;
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSpeechBubbleMessage = () => {
    const buddyName = userData.buddyName || 'Hammy';
    
    console.log('[Speech] Paused:', isPaused, 'Break:', isOnBreak, 'Grace period:', session.isInGracePeriod, 'Warnings:', session.distractionWarnings);
    
    // Break state messages
    if (isOnBreak) {
      const minutes = Math.floor(breakTimeRemaining / 60);
      const seconds = breakTimeRemaining % 60;
      return `☕ ${buddyName} is recharging! Break time: ${minutes}:${seconds.toString().padStart(2, '0')} ⭐`;
    }
    
    // Paused state message
    if (isPaused) {
      return `⏸️ ${buddyName} asks: "Taking a breather? Ready to continue when you are!" 😌`;
    }
    
    // Show return message for 4 seconds after user returns
    if (showReturnMessage && !session.isInGracePeriod) {
      if (session.distractionWarnings === 0 && session.distractionCount === 0) {
        return `🎉 Welcome back ${buddyName}! Great job returning quickly! Let's keep the momentum going! 💪`;
      } else {
        return `😊 ${buddyName} is happy you're back! Let's refocus and finish strong together! 🌟`;
      }
    }
    
    // Grace period active
    if (session.isInGracePeriod) {
      return `⏰ ${buddyName} notices you left! Come back within 30 seconds to avoid a warning! 🏃‍♂️`;
    }
    
    // Has warnings but not in grace period
    if (session.distractionWarnings > 0) {
      const warningsLeft = 3 - session.distractionWarnings;
      if (warningsLeft === 0) {
        return `😰 ${buddyName} is worried! Next distraction will hurt your focus score! Stay strong! 💪`;
      }
      return `⚠️ ${buddyName} says: "${warningsLeft} warning${warningsLeft > 1 ? 's' : ''} left before penalty!" Keep focusing! 🎯`;
    }
    
    // Has penalties applied
    if (session.distractionCount > 0) {
      return `😔 ${buddyName} lost some focus energy... But we can still finish strong together! 🌟`;
    }
    
    // Different messages based on session progress
    const progressPercent = (session.duration / (25 * 60)) * 100;
    
    if (progressPercent < 25) {
      return `🚀 ${buddyName} is ready to focus! Let's build momentum together! 💫`;
    } else if (progressPercent < 50) {
      return `🔥 ${buddyName} is in the zone! Great progress so far! Keep it up! ⭐`;
    } else if (progressPercent < 75) {
      return `💪 ${buddyName} feels the flow! We're more than halfway there! 🎯`;
    } else if (progressPercent < 90) {
      return `🏃‍♂️ ${buddyName} says "Almost there!" The finish line is in sight! 🏁`;
    } else {
      return `🎉 ${buddyName} is so proud! Just a few more minutes to victory! 🏆`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Blue Background - Sky/Top Decoration */}
      <ImageBackground
        source={require('../assets/backgrounds/bluebg.png')}
        style={styles.blueBgDecor}
        resizeMode="cover"
      />
      
      {/* Background Walls */}
      <ImageBackground
        source={require('../assets/rooms/walls.png')}
        style={styles.wallsBackground}
        resizeMode="cover"
      />
      
      {/* Floor */}
      <ImageBackground
        source={require('../assets/rooms/floor.png')}
        style={styles.floorBackground}
        resizeMode="cover"
      />
      
      {/* Blue Background - Sky/Top Decoration */}
      <ImageBackground
        source={require('../assets/backgrounds/bluebg.png')}
        style={styles.blueBgDecor}
        resizeMode="cover"
      />


      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {getCurrentTime()} 🐹 {userData.buddyName || 'Hammy'}'s Focus Session
        </Text>
      </View>

      {/* Q-Coins Display */}
      <View style={styles.qCoinsContainer}>
        <ImageBackground
          source={require('../assets/overall/qbies.png')}
          style={styles.qCoinIcon}
          resizeMode="contain"
        />
        <Text style={styles.qCoinsText}>{userData.qCoins}</Text>
      </View>

      {/* Study Room Decorations */}
      <ImageBackground
        source={require('../assets/study-session/studyroom-shelf.png')}
        style={styles.studyShelf}
        resizeMode="cover"
      />
      <ImageBackground
        source={require('../assets/hamsters/photo-frame2.png')}
        style={styles.photoFrame1}
        resizeMode="contain"
      />
      <ImageBackground
        source={require('../assets/hamsters/casual/photo-frame.png')}
        style={styles.photoFrame2}
        resizeMode="contain"
      />
      
      {/* Plants */}
      <ImageBackground
        source={require('../assets/rooms/plant.png')}
        style={styles.plant1}
        resizeMode="contain"
      />
      <ImageBackground
        source={require('../assets/rooms/plant.png')}
        style={styles.plant2}
        resizeMode="contain"
      />

      {/* Status Section */}
      <View style={styles.statusSection}>
        <Text style={styles.statusLabel}>🐹 Status:</Text>
        <Text style={styles.statusText}>
          {userData.buddyName || 'Hammy'} is in flow. Don't interrupt!
        </Text>
        
        {/* Timer Bar - Countdown from 100% to 0% */}
        <View style={styles.timerBarContainer}>
          <View style={styles.timerBarBackground}>
            <View 
              style={[
                styles.timerBar, 
                { width: `${Math.max(100 - (session.duration / (25 * 60)) * 100, 0)}%` }
              ]} 
            />
          </View>
          <Text style={styles.timerText}>
            {formatTime(Math.max((25 * 60) - session.duration, 0))} remaining
          </Text>
        </View>
        
        <Text style={styles.statusSubtext}>
          (Drains if you leave the app)
        </Text>
      </View>

      {/* Hamster Character */}
      <View style={styles.hamsterContainer}>
        <ImageBackground
          source={require('../assets/hamsters/casual/focus.png')}
          style={styles.focusHamster}
          resizeMode="contain"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.pauseButton, isPaused && styles.buttonActive]}
          onPress={handlePauseSession}
        >
          <Text style={styles.pauseIcon}>{isPaused ? '▶️' : '⏸️'}</Text>
          <Text style={styles.buttonLabel}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.breakButton, isOnBreak && styles.buttonActive]}
          onPress={handleBreakSession}
        >
          <Text style={styles.breakText}>
            {isOnBreak ? 'Skip Break' : '5m Break'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.doneButton} onPress={handleEndSession}>
          <Text style={styles.doneIcon}>✅</Text>
          <Text style={styles.buttonLabel}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Orange Theme Section */}
      <ImageBackground
        source={require('../assets/backgrounds/orange-theme.png')}
        style={styles.orangeTheme}
        resizeMode="cover"
      >
        {/* Dynamic Speech Bubble */}
        <View style={styles.speechBubble}>
          <Text 
            key={speechKey} 
            style={styles.speechText}
            adjustsFontSizeToFit={true}
            numberOfLines={3}
            minimumFontScale={0.6}
          >
            {getSpeechBubbleMessage()}
          </Text>
        </View>

        {/* Habit Buttons */}
        <View style={styles.habitButtons}>
          <TouchableOpacity style={styles.habitButton} onPress={() => logExercise(5)}>
            <ImageBackground
              source={require('../assets/hamsters/casual/exercising.png')}
              style={styles.hamsterInteraction}
              resizeMode="contain"
            />
            <Text style={styles.habitReward}>+15</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.habitButton} onPress={logMeal}>
            <ImageBackground
              source={require('../assets/hamsters/casual/eating-normal.png')}
              style={styles.mealTime}
              resizeMode="contain"
            />
            <Text style={styles.habitReward}>+10</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.habitButton} onPress={logWater}>
            <ImageBackground
              source={require('../assets/hamsters/casual/drinking.png')}
              style={styles.coffeeTime}
              resizeMode="contain"
            />
            <Text style={styles.habitReward}>+5</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.bottomText}>
          {userData.buddyName || 'Hammy'} feels your support! ⭐️
        </Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
  },
  
  // Background Elements
  blueBgDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 401) / 393, // 401px from CSS
    height: (SCREEN_HEIGHT * 260) / 852, // 260px from CSS
    left: (SCREEN_WIDTH * -8) / 393, // -8px from CSS
    top: (SCREEN_HEIGHT * -190) / 852, // -190px from CSS
    borderWidth: 1,
    borderColor: '#000000',
  },
  
  wallsBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 590) / 852,
    left: 0,
    top: -8,
  },
  
  floorBackground: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 518) / 393,
    height: (SCREEN_HEIGHT * 336) / 852,
    left: -90,
    top: (SCREEN_HEIGHT * 239) / 852,
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: 'rgba(21, 255, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  


  // Header
  header: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 266) / 393,
    height: (SCREEN_HEIGHT * 66) / 852,
    left: 16,
    top: 9,
  },
  
  headerText: {
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 21) / 393,
    lineHeight: (SCREEN_HEIGHT * 33) / 852,
    color: '#000000',
  },

  // Q-Coins
  qCoinsContainer: {
    position: 'absolute',
    right: 16,
    top: 3,
    alignItems: 'center',
  },
  
  qCoinIcon: {
    width: (SCREEN_WIDTH * 47) / 393,
    height: (SCREEN_HEIGHT * 47) / 852,
  },
  
  qCoinsText: {
    fontFamily: 'Chakra Petch',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 21) / 393,
    lineHeight: (SCREEN_HEIGHT * 27) / 852,
    color: '#000000',
    opacity: 0.7,
    marginTop: 5,
  },

  // Study Room Decorations
  studyShelf: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 133) / 393,
    height: (SCREEN_HEIGHT * 93) / 852,
    left: 240,
    top: 75,
  },
  
  photoFrame1: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 68) / 393,
    height: (SCREEN_HEIGHT * 58) / 852,
    left: 3,
    top: 76,
  },
  
  photoFrame2: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 64) / 393,
    height: (SCREEN_HEIGHT * 104) / 852,
    left: 79,
    top: 77,
  },

  // Plants
  plant1: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 31) / 393,
    height: (SCREEN_HEIGHT * 50) / 852,
    left: (SCREEN_WIDTH * 82) / 393,
    top: (SCREEN_HEIGHT * 201) / 852,
  },
  
  plant2: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 31) / 393,
    height: (SCREEN_HEIGHT * 50) / 852,
    left: (SCREEN_WIDTH * 110) / 393,
    top: (SCREEN_HEIGHT * 201) / 852,
  },

  // Status Section
  statusSection: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 343) / 393,
    height: (SCREEN_HEIGHT * 123) / 852,
    left: 21,
    top: 437,
    backgroundColor: '#E3F2FD', // Placeholder for blue bg image
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
  },
  
  statusLabel: {
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 18) / 393,
    lineHeight: (SCREEN_HEIGHT * 23) / 852,
    color: '#000000',
  },
  
  statusText: {
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 18) / 393,
    lineHeight: (SCREEN_HEIGHT * 22) / 852,
    color: '#000000',
    marginTop: 5,
  },
  
  timerBarContainer: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 251) / 393,
    height: (SCREEN_HEIGHT * 25) / 852,
    left: 50,
    top: 65,
    alignItems: 'center',
  },
  
  timerBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  
  timerBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  
  timerText: {
    fontFamily: 'Chakra Petch',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: '#000000',
    marginTop: 2,
  },
  
  statusSubtext: {
    position: 'absolute',
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    lineHeight: (SCREEN_HEIGHT * 18) / 852,
    color: '#000000',
    left: 77,
    bottom: 10,
  },

  // Hamster Character - Large studying position
  hamsterContainer: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 312) / 393,
    height: (SCREEN_HEIGHT * 234) / 852,
    left: (SCREEN_WIDTH * 40) / 393, // Centered horizontally
    top: (SCREEN_HEIGHT * 200) / 852, // Positioned in middle area
  },
  
  focusHamster: {
    width: '100%',
    height: '100%',
  },

  // Action Buttons
  actionButtons: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: (SCREEN_WIDTH * 269) / 393,
    left: 60,
    top: 582,
  },
  
  pauseButton: {
    width: (SCREEN_WIDTH * 79) / 393,
    height: (SCREEN_HEIGHT * 48) / 852,
    backgroundColor: '#FFE797',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  breakButton: {
    width: (SCREEN_WIDTH * 79) / 393,
    height: (SCREEN_HEIGHT * 48) / 852,
    backgroundColor: '#FFE797',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  doneButton: {
    width: (SCREEN_WIDTH * 79) / 393,
    height: (SCREEN_HEIGHT * 48) / 852,
    backgroundColor: '#FFE797',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonActive: {
    backgroundColor: '#4CAF50',
  },
  
  pauseIcon: {
    fontSize: (SCREEN_WIDTH * 20) / 393,
  },
  
  doneIcon: {
    fontSize: (SCREEN_WIDTH * 24) / 393,
    color: '#000000',
  },
  
  breakText: {
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 18) / 393,
    lineHeight: (SCREEN_HEIGHT * 15) / 852,
    textAlign: 'center',
    color: '#000000',
  },
  
  buttonLabel: {
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 18) / 393,
    lineHeight: (SCREEN_HEIGHT * 15) / 852,
    textAlign: 'center',
    color: '#000000',
    marginTop: 2,
  },

  // Bottom Orange Theme Section
  orangeTheme: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 332) / 852,
    left: 0,
    top: 634,
    borderRadius: 20,
    padding: 20,
  },
  
  speechBubble: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 355) / 393,
    height: (SCREEN_HEIGHT * 87) / 852,
    left: 17,
    top: 13,
    backgroundColor: '#FFFBFB',
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 12,
    padding: 15,
    justifyContent: 'center',
  },
  
  speechText: {
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 20) / 393, // Back to original size
    lineHeight: (SCREEN_HEIGHT * 26) / 852, // Back to original line height
    color: '#000000',
    textAlign: 'center',
  },
  
  habitButtons: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: SCREEN_WIDTH - 40,
    left: 20,
    top: 120,
  },
  
  habitButton: {
    alignItems: 'center',
  },
  
  hamsterInteraction: {
    width: (SCREEN_WIDTH * 52) / 393,
    height: (SCREEN_HEIGHT * 54) / 852,
  },
  
  mealTime: {
    width: (SCREEN_WIDTH * 53) / 393,
    height: (SCREEN_HEIGHT * 55) / 852,
  },
  
  coffeeTime: {
    width: (SCREEN_WIDTH * 53) / 393,
    height: (SCREEN_HEIGHT * 48) / 852,
  },
  
  habitReward: {
    fontFamily: 'Chakra Petch',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    lineHeight: (SCREEN_HEIGHT * 18) / 852,
    color: '#000000',
    opacity: 0.7,
    marginTop: 5,
  },
  
  bottomText: {
    position: 'absolute',
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    lineHeight: (SCREEN_HEIGHT * 18) / 852,
    color: '#000000',
    left: 98,
    bottom: 30,
  },
  
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 50,
  },
});
