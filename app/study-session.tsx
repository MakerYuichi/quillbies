import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, AppState, AppStateStatus, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';
import InteractiveTooltip from './components/ui/InteractiveTooltip';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StudySessionScreen() {
  const router = useRouter();
  const { 
    userData, 
    session, 
    selectedDeadlineId, 
    deadlines, 
    updateFocusDuringSession, 
    endFocusSession, 
    handleDistraction, 
    startBreak, 
    endBreak,
    tapAppleInSession,
    tapCoffeeInSession
  } = useQuillbyStore();
  
  console.log('[StudySession] Render - session exists:', !!session);
  
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [speechKey, setSpeechKey] = useState(0); // Force re-render of speech bubble
  const [showReturnMessage, setShowReturnMessage] = useState(false);
  const [returnMessageTimer, setReturnMessageTimer] = useState<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStep, setTooltipStep] = useState(0);
  
  // Session control states
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [breakTimer, setBreakTimer] = useState<NodeJS.Timeout | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<number>(0); // Track when break started
  
  // Animation states
  const [currentAnimation, setCurrentAnimation] = useState<'focus' | 'drinking' | 'eating' | 'exercising' | 'break'>('focus');
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Define tooltip steps for first-time users
  // Orange theme starts at top: 634, habit buttons are at top: 120 relative to it
  // So habit buttons actual position is 634 + 120 = 754
  // Action buttons are at top: 582 (ABOVE orange box, not inside it)
  const tooltipSteps = [
    {
      id: 'welcome',
      title: '🎯 Welcome to Focus Mode!',
      description: 'This is where you study with your hamster buddy. Let me show you around!',
      position: { top: SCREEN_HEIGHT / 2 - 100, left: 20 },
      arrowDirection: 'down' as const,
    },
    {
      id: 'coffee',
      title: '☕ Coffee Boost',
      description: 'Tap here for +6 focus for 3 minutes. You get 3 free uses per day (costs 3 coins each).',
      position: { top: 500, left: 20 },
      arrowDirection: 'down' as const,
      highlightArea: { top: 754, left: 20, width: (SCREEN_WIDTH - 50) / 2, height: 80 },
    },
    {
      id: 'apple',
      title: '🍎 Apple Snack',
      description: 'Tap here for +3 focus instantly. You get 5 free uses per day (costs 2 coins each).',
      position: { top: 500, right: 20 },
      arrowDirection: 'down' as const,
      highlightArea: { top: 754, left: SCREEN_WIDTH / 2 + 5, width: (SCREEN_WIDTH - 50) / 2, height: 80 },
    },
    {
      id: 'focus',
      title: '📊 Focus Score',
      description: 'This shows your current focus level. Stay in the app to keep it high!',
      position: { top: 300, left: 20 },
      arrowDirection: 'down' as const,
      highlightArea: { top: 582, left: 60, width: 80, height: 50 },
    },
    {
      id: 'break',
      title: '⏸️ Take a Break',
      description: 'Need a break? Tap here for a 5-minute rest. You have limited break time per session.',
      position: { top: 300, left: SCREEN_WIDTH / 2 - 140 },
      arrowDirection: 'down' as const,
      highlightArea: { top: 582, left: 150, width: 120, height: 50 },
    },
    {
      id: 'done',
      title: '✅ Finish Session',
      description: 'When you\'re done studying, tap here. You\'ll earn coins and XP based on your performance!',
      position: { top: 300, right: 20 },
      arrowDirection: 'down' as const,
      highlightArea: { top: 582, left: SCREEN_WIDTH - 140, width: 80, height: 50 },
    },
    {
      id: 'final',
      title: '🚀 Ready to Focus!',
      description: 'Stay in the app while studying to maintain your focus score. Good luck!',
      position: { top: SCREEN_HEIGHT / 2 - 100, left: 20 },
      arrowDirection: 'down' as const,
    },
  ];
  
  console.log('[Tutorial] Screen dimensions:', SCREEN_WIDTH, 'x', SCREEN_HEIGHT);
  console.log('[Tutorial] Action buttons at top:', 582, '(above orange box)');
  console.log('[Tutorial] Habit buttons at top:', 754, '(634 orange + 120 relative)');
  
  // Check if first time in study session and show tooltips
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        console.log('[Tutorial] Checking if first time...');
        const hasSeenTutorial = await AsyncStorage.getItem('hasSeenStudyTutorial');
        console.log('[Tutorial] hasSeenStudyTutorial:', hasSeenTutorial);
        
        if (!hasSeenTutorial) {
          console.log('[Tutorial] First time! Starting tutorial in 1 second...');
          // Delay tooltip to let UI render, then auto-start tutorial
          setTimeout(() => {
            console.log('[Tutorial] Showing tooltip now');
            setShowTooltip(true);
            setTooltipStep(0);
          }, 1000);
        } else {
          console.log('[Tutorial] Already seen, skipping');
        }
      } catch (error) {
        console.error('[Tutorial] Error checking first time:', error);
      }
    };
    checkFirstTime();
  }, []);
  
  const handleTooltipNext = async () => {
    if (tooltipStep < tooltipSteps.length - 1) {
      setTooltipStep(tooltipStep + 1);
    } else {
      // Finished all steps
      setShowTooltip(false);
      try {
        await AsyncStorage.setItem('hasSeenStudyTutorial', 'true');
      } catch (error) {
        console.error('[Tutorial] Error saving tutorial state:', error);
      }
    }
  };
  
  const handleTooltipSkip = async () => {
    setShowTooltip(false);
    try {
      await AsyncStorage.setItem('hasSeenStudyTutorial', 'true');
    } catch (error) {
      console.error('[Tutorial] Error saving tutorial state:', error);
    }
  };
  
  // Update focus score and speech bubble every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update focus if not on break
      if (!isOnBreak) {
        updateFocusDuringSession();
      }
      setSpeechKey(prev => prev + 1); // Update speech bubble every second
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOnBreak]);
  
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
      if (animationTimer) {
        clearTimeout(animationTimer);
      }
    };
  }, [breakTimer, animationTimer]);
  
  // Play animation for 3 seconds then return to focus
  const playAnimation = (animation: 'drinking' | 'eating' | 'exercising') => {
    // Clear any existing animation timer
    if (animationTimer) {
      clearTimeout(animationTimer);
    }
    
    // Set the animation
    setCurrentAnimation(animation);
    
    // Return to focus after 3 seconds
    const timer = setTimeout(() => {
      setCurrentAnimation('focus');
      setAnimationTimer(null);
    }, 3000);
    
    setAnimationTimer(timer);
  };
  
  const handleBreakSession = () => {
    if (isOnBreak) {
      // Skip break early - record actual time taken
      const actualBreakTime = Math.floor((Date.now() - breakStartTime) / 1000);
      endBreak(actualBreakTime);
      
      setIsOnBreak(false);
      setBreakTimeRemaining(0);
      setCurrentAnimation('focus'); // Return to focus
      if (breakTimer) {
        clearInterval(breakTimer);
        setBreakTimer(null);
      }
      
      console.log(`[Break] Skipped early - ${actualBreakTime}s taken`);
    } else {
      // Check if user can start a break
      if (!startBreak()) {
        // No break time remaining - show message
        console.log('[Break] Cannot start - no break time remaining');
        return;
      }
      
      // Calculate available break time
      const availableBreakTime = session ? session.maxBreakTime - session.totalBreakTime : 5 * 60;
      const breakDuration = Math.min(5 * 60, availableBreakTime); // 5 minutes or remaining time
      
      // Start break
      setIsOnBreak(true);
      setBreakTimeRemaining(breakDuration);
      setBreakStartTime(Date.now());
      setCurrentAnimation('break'); // Show break animation
      
      const timer = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            // Break finished - record the full duration
            endBreak(breakDuration);
            setIsOnBreak(false);
            setCurrentAnimation('focus'); // Return to focus
            clearInterval(timer);
            setBreakTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setBreakTimer(timer);
      
      console.log(`[Break] Started - ${Math.floor(breakDuration / 60)}m ${breakDuration % 60}s`);
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
        
        {/* Interactive Tooltip for first-time users - show even without session */}
        <InteractiveTooltip
          visible={showTooltip}
          currentStep={tooltipStep}
          steps={tooltipSteps}
          onNext={handleTooltipNext}
          onSkip={handleTooltipSkip}
        />
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
    
    console.log('[Speech] Break:', isOnBreak, 'Grace period:', session.isInGracePeriod, 'Warnings:', session.distractionWarnings);
    
    // Break state messages
    if (isOnBreak) {
      const minutes = Math.floor(breakTimeRemaining / 60);
      const seconds = breakTimeRemaining % 60;
      const totalBreakUsed = session ? session.totalBreakTime : 0;
      const maxBreak = session ? session.maxBreakTime : 5 * 60;
      const remainingTotal = Math.max(0, maxBreak - totalBreakUsed);
      const remainingMinutes = Math.floor(remainingTotal / 60);
      
      return `☕ Quick break! ${minutes}:${seconds.toString().padStart(2, '0')} left | Back in ${remainingMinutes}m`;
    }
    
    // Show return message for 4 seconds after user returns
    if (showReturnMessage && !session.isInGracePeriod) {
      if (session.distractionWarnings === 0 && session.distractionCount === 0) {
        return `Hey, welcome back! Missed you! 😊\nLet's keep the momentum going!`;
      } else {
        return `Glad you're back! Let's finish strong! 💪\nWe got this together!`;
      }
    }
    
    // Grace period active
    if (session.isInGracePeriod) {
      return `You left? 🏃‍♂️ Come back quick to avoid penalty!\n${buddyName} is waiting!`;
    }
    
    // Has warnings but not in grace period
    if (session.distractionWarnings > 0) {
      const warningsLeft = 3 - session.distractionWarnings;
      if (warningsLeft === 0) {
        return `😰 Next time we lose focus energy! Stay here!\n${buddyName} needs you to focus!`;
      }
      return `⚠️ ${warningsLeft} warning${warningsLeft > 1 ? 's' : ''} left... stay with me! 🎯\nWe can do this!`;
    }
    
    // Has penalties applied
    if (session.distractionCount > 0) {
      return `😔 Lost some focus... but we can still do this! 🌟\n${buddyName} believes in you!`;
    }
    
    // Different messages based on session progress
    const progressPercent = (session.duration / (25 * 60)) * 100;
    
    if (progressPercent < 25) {
      return `🚀 Let's get started! First steps!\n${buddyName} is ready to focus!`;
    } else if (progressPercent < 50) {
      return `🔥 Getting into it! Nice flow!\n${buddyName} feels the momentum!`;
    } else if (progressPercent < 75) {
      return `💪 Over halfway! We got this!\n${buddyName} is in the zone!`;
    } else if (progressPercent < 90) {
      return `🏃‍♂️ Almost there! Push through!\nThe finish line is in sight!`;
    } else {
      return `🎉 So close! Final stretch!\n${buddyName} is so proud!`;
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
      
      {/* Customizable Plants */}
      <ImageBackground
        source={
          userData.roomCustomization?.plantType === 'succulent-plant' 
            ? require('../assets/rooms/plant.png') // Using default plant for now
            : userData.roomCustomization?.plantType === 'swiss-cheese-plant'
            ? require('../assets/rooms/plant.png') // Using default plant for now
            : require('../assets/rooms/plant.png')
        }
        style={styles.plant1}
        resizeMode="contain"
      />
      <ImageBackground
        source={
          userData.roomCustomization?.plantType === 'succulent-plant' 
            ? require('../assets/rooms/plant.png') // Using default plant for now
            : userData.roomCustomization?.plantType === 'swiss-cheese-plant'
            ? require('../assets/rooms/plant.png') // Using default plant for now
            : require('../assets/rooms/plant.png')
        }
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
          source={
            currentAnimation === 'break'
              ? require('../assets/study-session/5-min-break.png')
              : currentAnimation === 'drinking' 
              ? require('../assets/hamsters/casual/coffee.png')
              : currentAnimation === 'eating'
              ? require('../assets/hamsters/casual/apples.png')
              : currentAnimation === 'exercising'
              ? require('../assets/hamsters/casual/exercising.png')
              : require('../assets/hamsters/casual/focus.png')
          }
          style={styles.focusHamster}
          resizeMode="contain"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {/* Focus Score Display */}
        <View style={styles.focusScoreDisplay}>
          <Text style={styles.focusScoreLabel}>Focus</Text>
          <Text style={styles.focusScoreValue}>{Math.round(session.focusScore)}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.breakButton, 
            isOnBreak && styles.buttonActive,
            session && session.totalBreakTime >= session.maxBreakTime && styles.buttonDisabled
          ]}
          onPress={handleBreakSession}
          disabled={session ? session.totalBreakTime >= session.maxBreakTime && !isOnBreak : false}
        >
          <Text style={styles.breakText}>
            {isOnBreak 
              ? 'Skip Break' 
              : session && session.totalBreakTime >= session.maxBreakTime
              ? 'No Break'
              : `${Math.floor((session ? session.maxBreakTime - session.totalBreakTime : 5 * 60) / 60)}m Break`
            }
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

        {/* Habit Buttons - 2 horizontal buttons */}
        <View style={styles.habitButtons}>
          {/* Coffee Button */}
          <TouchableOpacity 
            style={[
              styles.habitButton,
              userData.coffeeTapsToday >= 3 && !session?.coffeePremiumUsedThisSession && styles.premiumButton,
              userData.coffeeTapsToday >= 3 && session?.coffeePremiumUsedThisSession && styles.disabledButton
            ]}
            onPress={() => {
              if (!session) return;
              
              if (userData.coffeeTapsToday < 3) {
                if (tapCoffeeInSession(false)) {
                  playAnimation('drinking');
                }
              } else if (!session.coffeePremiumUsedThisSession) {
                if (tapCoffeeInSession(true)) {
                  playAnimation('drinking');
                }
              }
            }}
            disabled={userData.coffeeTapsToday >= 3 && session?.coffeePremiumUsedThisSession}
          >
            <View style={styles.buttonLeft}>
              <ImageBackground
                source={require('../assets/study-session/coffee-cup.png')}
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.habitButtonLabel}>Coffee</Text>
            </View>
            
            <View style={styles.buttonRight}>
              {userData.coffeeTapsToday >= 3 && session?.coffeePremiumUsedThisSession ? (
                <Text style={styles.habitUsed}>USED</Text>
              ) : userData.coffeeTapsToday >= 3 ? (
                <View style={styles.buttonStats}>
                  <Text style={styles.premiumLabel}>PREMIUM</Text>
                  <Text style={styles.habitReward}>+15 5m</Text>
                  <Text style={styles.habitCost}>-15🪙</Text>
                </View>
              ) : (
                <View style={styles.buttonStats}>
                  <Text style={styles.habitReward}>+6 3m</Text>
                  <Text style={styles.habitCost}>-3🪙</Text>
                  <Text style={styles.habitCount}>({userData.coffeeTapsToday}/3)</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Apple Button */}
          <TouchableOpacity 
            style={[
              styles.habitButton,
              userData.appleTapsToday >= 5 && !session?.applePremiumUsedThisSession && styles.premiumButton,
              userData.appleTapsToday >= 5 && session?.applePremiumUsedThisSession && styles.disabledButton
            ]}
            onPress={() => {
              if (!session) return;
              
              if (userData.appleTapsToday < 5) {
                if (tapAppleInSession(false)) {
                  playAnimation('eating');
                }
              } else if (!session.applePremiumUsedThisSession) {
                if (tapAppleInSession(true)) {
                  playAnimation('eating');
                }
              }
            }}
            disabled={userData.appleTapsToday >= 5 && session?.applePremiumUsedThisSession}
          >
            <View style={styles.buttonLeft}>
              <ImageBackground
                source={require('../assets/study-session/apple-pie.png')}
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.habitButtonLabel}>Apple</Text>
            </View>
            
            <View style={styles.buttonRight}>
              {userData.appleTapsToday >= 5 && session?.applePremiumUsedThisSession ? (
                <Text style={styles.habitUsed}>USED</Text>
              ) : userData.appleTapsToday >= 5 ? (
                <View style={styles.buttonStats}>
                  <Text style={styles.premiumLabel}>PREMIUM</Text>
                  <Text style={styles.habitReward}>+10</Text>
                  <Text style={styles.habitCost}>-10🪙</Text>
                </View>
              ) : (
                <View style={styles.buttonStats}>
                  <Text style={styles.habitReward}>+3 🍎</Text>
                  <Text style={styles.habitCost}>-2🪙</Text>
                  <Text style={styles.habitCount}>({userData.appleTapsToday}/5)</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.bottomText}>
          {userData.buddyName || 'Hammy'} feels your support! ⭐️
        </Text>
      </ImageBackground>
      
      {/* Interactive Tooltip for first-time users */}
      <InteractiveTooltip
        visible={showTooltip}
        currentStep={tooltipStep}
        steps={tooltipSteps}
        onNext={handleTooltipNext}
        onSkip={handleTooltipSkip}
      />
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
    alignItems: 'center',
    width: (SCREEN_WIDTH * 269) / 393,
    left: 60,
    top: 582,
  },
  
  focusScoreDisplay: {
    width: (SCREEN_WIDTH * 79) / 393,
    height: (SCREEN_HEIGHT * 48) / 852,
    backgroundColor: '#E3F2FD',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  focusScoreLabel: {
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#2196F3',
  },
  
  focusScoreValue: {
    fontFamily: 'Chakra Petch',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 20) / 393,
    color: '#1976D2',
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
  
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.5,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    width: SCREEN_WIDTH - 40,
    left: 20,
    top: 120,
    gap: 10,
  },
  
  habitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFE797',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000000',
  },
  
  premiumButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    borderWidth: 3,
    borderColor: '#FFC107',
  },
  
  disabledButton: {
    opacity: 0.4,
    backgroundColor: '#CCCCCC',
  },
  
  premiumLabel: {
    fontFamily: 'Chakra Petch',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: '#FFC107',
    textAlign: 'right',
    marginBottom: 2,
  },
  
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    minWidth: 80,
  },
  
  buttonRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 70,
  },
  
  buttonStats: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  
  buttonIcon: {
    width: (SCREEN_WIDTH * 40) / 393,
    height: (SCREEN_HEIGHT * 40) / 852,
  },
  
  habitButtonLabel: {
    fontFamily: 'Chakra Petch',
    fontWeight: '600',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#000000',
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
    width: (SCREEN_WIDTH * 65) / 393,  // Increased from 53 to 65
    height: (SCREEN_HEIGHT * 60) / 852, // Increased from 48 to 60
  },
  
  habitReward: {
    fontFamily: 'Chakra Petch',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 13) / 393,
    color: '#000000',
    opacity: 0.8,
    textAlign: 'right',
  },
  
  habitCost: {
    fontFamily: 'Chakra Petch',
    fontWeight: '600',
    fontSize: (SCREEN_WIDTH * 11) / 393,
    color: '#FF5722',
    textAlign: 'right',
  },
  
  habitCount: {
    fontFamily: 'Chakra Petch',
    fontWeight: '500',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: '#666666',
    textAlign: 'right',
  },
  
  habitUsed: {
    fontFamily: 'Chakra Petch',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#999999',
    textAlign: 'right',
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
