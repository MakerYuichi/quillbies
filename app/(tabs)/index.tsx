import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Dimensions, ImageBackground, TouchableOpacity, Text, ScrollView, Animated } from 'react-native';
import { CleaningPlan, CleaningStage } from '../core/types';
import { useRouter } from 'expo-router';

import { useQuillbyStore } from '../state/store-modular';
import { calculateFocusEnergyCost } from '../core/engine';
import { soundManager, SOUNDS } from '../../lib/soundManager';
import EnergyBar from '../components/progress/EnergyBar';
import RoomLayers from '../components/room/RoomLayers';
import ExerciseEnvironment from '../components/games/ExerciseEnvironment';
import HamsterCharacter from '../components/character/HamsterCharacter';
import SpeechBubble from '../components/character/SpeechBubble';
import WaterButton from '../components/habits/WaterButton';
import SleepButton from '../components/habits/SleepButton';
import MealButton from '../components/habits/MealButton';
import ExerciseButton from '../components/habits/ExerciseButton';
import CleanButton from '../components/habits/CleanButton';
import StudyProgress from '../components/progress/StudyProgress';
import RealTimeClock from '../components/ui/RealTimeClock';
import SessionCustomizationModal, { SessionConfig } from '../components/modals/SessionCustomizationModal';
import ExerciseCustomizationModal from '../components/modals/ExerciseCustomizationModal';
import SleepCustomizationModal from '../components/modals/SleepCustomizationModal';
import { useWaterTracking } from '../hooks/useWaterTracking';
import { useSleepTracking } from '../hooks/useSleepTracking';
import { useMealTracking } from '../hooks/useMealTracking';
import { useExerciseTracking } from '../hooks/useExerciseTracking';
import { useRandomReminders } from '../hooks/useRandomReminders';
import { useIdleMessages } from '../hooks/useIdleMessages';
import { useTimeBasedHabitFeedback } from '../hooks/useTimeBasedHabitFeedback';
import { useFirstTimeWelcome } from '../hooks/useFirstTimeWelcome';
import { useDayEvaluationMessages } from '../hooks/useDayEvaluationMessages';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBanner from '../components/ui/NotificationBanner';
import { useImageLoading } from '../components/ImagePreloader';
import { homeStyles as styles } from './styles/index.styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  try {
    return <HomeScreenContent />;
  } catch (error) {
    console.error('[HomeScreen] Render error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <Text style={{ fontSize: 18, color: '#333', textAlign: 'center', padding: 20 }}>
          Something went wrong. Please restart the app.
        </Text>
      </View>
    );
  }
}

function HomeScreenContent() {
  const router = useRouter();
  const { imagesLoaded } = useImageLoading();
  
  // Wrap store access in try-catch to prevent crashes
  let storeData;
  try {
    storeData = useQuillbyStore();
  } catch (error) {
    console.error('[HomeScreen] Store access error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <Text style={{ fontSize: 18, color: '#333', textAlign: 'center', padding: 20 }}>
          Loading your study companion...
        </Text>
      </View>
    );
  }
  
  const { userData, updateEnergy, cleanRoom, addMissedCheckpoint, checkAndProcessCheckpoints, startFocusSession, getUrgentDeadlines, getUpcomingDeadlines, getTodaysSleepHours } = storeData;
  
  // Safety check: ensure userData is properly initialized
  if (!userData || typeof userData !== 'object') {
    console.warn('[HomeScreen] UserData not properly initialized, showing loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <Text style={{ fontSize: 18, color: '#333', textAlign: 'center', padding: 20 }}>
          Initializing your study companion...
        </Text>
      </View>
    );
  }
  
  // Wait for images to load before showing content
  if (!imagesLoaded) {
    return null; // ImagePreloader will show loading overlay
  }
  
  // Start background music when entering main app
  useEffect(() => {
    console.log('[Home] Starting game background music...');
    soundManager.playBackgroundMusic(
      SOUNDS.GAME_MUSIC,
      require('../../assets/sounds/background_music/gamemusic.mp3'),
      0.15, // Very low volume (15%)
      true // Loop
    );
    
    // Cleanup when leaving
    return () => {
      console.log('[Home] Stopping game background music...');
      soundManager.stopBackgroundMusic();
    };
  }, []);
  
  const [isCleaning, setIsCleaning] = React.useState(false);
  const [cleaningStage, setCleaningStage] = React.useState(1);
  const [cleaningTaps, setCleaningTaps] = React.useState(0);
  const [tapsNeeded, setTapsNeeded] = React.useState(10);
  const [totalStages, setTotalStages] = React.useState(1);
  const [cleaningPlan, setCleaningPlan] = React.useState<CleaningPlan | null>(null);
  const [dustClouds, setDustClouds] = React.useState<Array<{id: number, x: number, y: number, opacity: Animated.Value, scale: Animated.Value}>>([]);
  const [lastCheckpointCheck, setLastCheckpointCheck] = React.useState(Date.now());
  const [checkpointMessage, setCheckpointMessage] = React.useState<string>('');
  const [checkpointMessageTimestamp, setCheckpointMessageTimestamp] = React.useState<number>(0);
  const [showSessionModal, setShowSessionModal] = React.useState(false);
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [showSleepModal, setShowSleepModal] = React.useState(false);
  const [timeAccelerationActive, setTimeAccelerationActive] = React.useState(false);
  const [timeAccelerationProgress, setTimeAccelerationProgress] = React.useState(0);
  const [accelerationInterval, setAccelerationInterval] = React.useState<NodeJS.Timeout | null>(null);
  const [simulatedTime, setSimulatedTime] = React.useState<string>('00:00');
  const [useSimulatedTime, setUseSimulatedTime] = React.useState(false);
  const [isStartingSimulation, setIsStartingSimulation] = React.useState(false);
  const [randomExerciseMessage, setRandomExerciseMessage] = React.useState<string>('');
  
  // Random exercise messages
  const exerciseMotivationalMessages = [
    "I'm jumping! You should exercise too! 🦘",
    "Look at me go! Let's stay active! 💪",
    "Moving feels great! Join me! 🏃",
    "Exercise time! Let's do this together! ⚡",
    "I'm stretching! Feel the energy! 🤸",
    "Cardio is fun! Keep moving! ❤️",
    "Let's get stronger together! 💪",
    "I'm working out! You got this! 🎯",
    "Movement is life! Let's go! 🌟",
    "Feeling energized! Exercise rocks! ✨"
  ];
  
  // Cleanup function to clear any running intervals
  const cleanupAcceleration = (force = false) => {
    // Don't cleanup if we're in the middle of starting a simulation (unless forced)
    if (isStartingSimulation && !force) {
      console.log('[TEST] 🚫 Skipping cleanup - simulation is starting');
      return;
    }
    
    // Clear the tracked interval
    if (accelerationInterval) {
      clearInterval(accelerationInterval);
      setAccelerationInterval(null);
    }
    
    // More conservative cleanup - only clear a reasonable range
    if (force || !isStartingSimulation) {
      // Clear a reasonable range of intervals instead of all possible ones
      for (let i = 1; i < 100; i++) {
        clearInterval(i);
      }
      console.log('[TEST] 🧹 CONSERVATIVE CLEANUP: Cleared intervals (1-99)');
    }
    
    setTimeAccelerationActive(false);
    setTimeAccelerationProgress(0);
    setSimulatedTime('00:00');
    setUseSimulatedTime(false);
    setIsStartingSimulation(false);
  };

  // Store original user data before simulation starts (with error handling)
  const [originalUserData, setOriginalUserData] = React.useState<any>(null);

  // Safe state restoration function
  const safeRestoreUserData = React.useCallback(() => {
    try {
      if (originalUserData) {
        useQuillbyStore.setState({ userData: originalUserData });
        setOriginalUserData(null);
        console.log('[TEST] 🔄 RESTORED real user data safely');
        return true;
      }
    } catch (error) {
      console.error('[TEST] ❌ Error restoring user data:', error);
    }
    return false;
  }, [originalUserData]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAcceleration(true); // Force cleanup on unmount
    };
  }, []); // Remove accelerationInterval from dependency array to prevent cleanup on interval change

  // Memoize personalized data to prevent unnecessary re-renders
  const { buddyName, selectedCharacter } = useMemo(() => ({
    buddyName: userData.buddyName || 'Quillby',
    selectedCharacter: userData.selectedCharacter || 'casual'
  }), [userData.buddyName, userData.selectedCharacter]);
  
  // Use custom hooks for water and sleep tracking
  const {
    waterGlasses,
    handleDrinkWater,
    waterAnimation,
    waterMessage,
    waterMessageTimestamp,
  } = useWaterTracking(buddyName);
  
  const {
    isSleeping,
    sleepDisplay,
    sleepElapsedTime,
    handleSleepButton,
    handleWakeUpButton,
    sleepAnimation,
    sleepMessage,
    sleepMessageTimestamp,
  } = useSleepTracking(buddyName);

  const {
    mealsLogged,
    portionDescription,
    handleLogMeal,
    mealAnimation,
    mealMessage,
    mealMessageTimestamp,
  } = useMealTracking(buddyName);

  const {
    isExercising,
    exerciseDisplay,
    exerciseElapsedTime,
    exerciseType,
    handleStartExercise,
    handleFinishExercise,
    exerciseAnimation,
    exerciseMessage,
    exerciseMessageTimestamp,
  } = useExerciseTracking(buddyName);

  // Random reminders
  const {
    reminderMessage,
    reminderTimestamp,
  } = useRandomReminders(buddyName);

  // Idle messages
  const {
    idleMessage,
    idleTimestamp,
    resetIdleTimer,
  } = useIdleMessages(buddyName);

  // Time-based habit feedback
  const {
    feedbackMessage,
    feedbackTimestamp,
  } = useTimeBasedHabitFeedback(buddyName);

  // First-time welcome message
  const {
    welcomeMessage,
    welcomeTimestamp,
    isShowingWelcome,
  } = useFirstTimeWelcome(userData.userName || 'Friend', buddyName, userData.onboardingCompleted || false);

  // Day evaluation messages (disappointed, streak broken, etc.) - with safety check
  const evaluationHook = useDayEvaluationMessages(buddyName);
  const evaluationMessage = evaluationHook.evaluationMessage || '';
  const evaluationTimestamp = evaluationHook.evaluationTimestamp || 0;

  // Notification system (temporarily disabled for performance)
  const notifications: any[] = [];
  const dismissNotification = () => {};
  const clearAllNotifications = () => {};
  const addTestNotification = () => {};
  
  // const notificationHook = useNotifications();
  // const notifications = notificationHook?.notifications || [];
  // const dismissNotification = notificationHook?.dismissNotification || (() => {});
  // const clearAllNotifications = notificationHook?.clearAllNotifications || (() => {});
  // const addTestNotification = notificationHook?.addTestNotification || (() => {});

  // Test notification function (for debugging)
  const testNotification = () => {
    console.log('[Notifications] Testing notification system...');
    
    // Add in-app notification banner
    addTestNotification();
    
    // Also send system notification
    import('../../lib/notifications').then(({ sendImmediateNotification }) => {
      sendImmediateNotification(
        '🔔 Test Notification',
        'Notification system is working! This is a test message.',
        'default'
      );
    }).catch(error => {
      console.error('[Notifications] Error sending test notification:', error);
    });
  };

  // Memory monitoring (for debugging app closures)
  useEffect(() => {
    const memoryInterval = setInterval(() => {
      try {
        // Check if performance.memory is available (Chrome/Edge)
        if (global.performance && (global.performance as any).memory) {
          const memory = (global.performance as any).memory;
          const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
          
          // Only log if memory usage is high
          if (usedMB > 50) {
            console.log(`[Memory] Used: ${usedMB}MB / Total: ${totalMB}MB`);
          }
          
          // Warn if memory usage is very high
          if (usedMB > 100) {
            console.warn(`[Memory] HIGH MEMORY USAGE: ${usedMB}MB - App may close soon`);
          }
        }
      } catch (error) {
        // Memory monitoring not available, ignore
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(memoryInterval);
  }, []);

  // Wrap handlers to reset idle timer on interaction
  const handleDrinkWaterWithReset = () => {
    resetIdleTimer();
    handleDrinkWater();
  };

  const handleLogMealWithReset = () => {
    resetIdleTimer();
    handleLogMeal();
  };

  const handleStartExerciseWithReset = () => {
    resetIdleTimer();
    setShowExerciseModal(true);
  };

  const handleExerciseStart = (duration: number | null, type: 'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom') => {
    handleStartExercise(type, duration);
  };

  const handleStartSleepWithReset = () => {
    resetIdleTimer();
    setShowSleepModal(true);
  };

  const handleSleepStart = (duration: number | null) => {
    handleSleepButton(duration);
  };

  const handleFinishExerciseWithReset = () => {
    resetIdleTimer();
    handleFinishExercise();
  };

  const handleSleepButtonWithReset = () => {
    resetIdleTimer();
    handleSleepButton();
  };

  const handleWakeUpButtonWithReset = () => {
    resetIdleTimer();
    handleWakeUpButton();
  };

  // Helper functions for today's deadline
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Compare at the calendar-day level (ignore time of day)
    const startOfDue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = startOfDue.getTime() - startOfToday.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    if (diffDays === 0) return `${formattedDate} (Today)`;
    if (diffDays === 1) return `${formattedDate} (Tomorrow)`;
    if (diffDays > 1) return `${formattedDate} (${diffDays} days)`;
    return `${formattedDate} (Overdue)`;
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTodaysDeadline = () => {
    const urgentDeadlines = getUrgentDeadlines();
    const upcomingDeadlines = getUpcomingDeadlines();
    
    // First check for deadlines due today
    const today = new Date();
    const todayDeadlines = urgentDeadlines.filter(deadline => {
      const dueDate = new Date(deadline.dueDate);
      return dueDate.toDateString() === today.toDateString();
    });
    
    if (todayDeadlines.length > 0) {
      // Return the highest priority deadline due today
      return todayDeadlines.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      })[0];
    }
    
    // If no deadlines today, return the most urgent one
    if (urgentDeadlines.length > 0) {
      return urgentDeadlines[0];
    }
    
    // If no urgent deadlines, return the next upcoming one
    if (upcomingDeadlines.length > 0) {
      return upcomingDeadlines[0];
    }
    
    return null;
  };

  const renderTodaysDeadline = () => {
    const deadline = getTodaysDeadline();
    if (!deadline) return null;

    const progressPercent = (deadline.workCompleted / deadline.estimatedHours) * 100;
    const progressBars = Math.floor(progressPercent / 10); // Each bar represents 10%
    const emptyBars = 10 - progressBars;
    const progressDisplay = '█'.repeat(progressBars) + '░'.repeat(emptyBars);

    return (
      <TouchableOpacity 
        style={styles.todaysDeadlineCard}
        onPress={() => router.push('/(tabs)/focus')}
        activeOpacity={0.7}
      >
        <Text style={styles.todaysDeadlineHeader}>
          {getPriorityEmoji(deadline.priority)} {deadline.title}
        </Text>
        <Text style={styles.todaysDeadlineDate}>
          {formatDate(deadline.dueDate)}
        </Text>
        <Text style={styles.todaysDeadlineProgress}>
          {deadline.workCompleted.toFixed(1)}/{deadline.estimatedHours}h {progressDisplay}
        </Text>
        <Text style={styles.todaysDeadlineGoal}>
          Today's goal: 2h [Focus on This →]
        </Text>
      </TouchableOpacity>
    );
  };

  // Handle cleaning system with room state transitions
  const handleStartCleaning = () => {
    console.log('[Cleaning] Starting cleaning - current mess:', userData.messPoints);
    const mess = userData.messPoints;
    let stages: CleaningStage[] = [];
    let totalTaps = 0;
    
    // Determine cleaning stages based on current room state
    if (mess > 20) {
      // Heavy Mess (Messy 3) → Messy 2 → Messy 1 → Clean
      stages = [
        { name: '🚿 Deep Clean', taps: 15, targetMess: 15, messReduction: mess - 15 }, // To Messy 2 (15 mess)
        { name: '🧽 Scrubbing', taps: 15, targetMess: 8, messReduction: 7 }, // To Messy 1 (8 mess)
        { name: '🧹 Sweeping', taps: 10, targetMess: 3, messReduction: 5 } // To Clean (3 mess)
      ];
      totalTaps = 40;
    } else if (mess > 10) {
      // Medium Mess (Messy 2) → Messy 1 → Clean
      stages = [
        { name: '🧽 Scrubbing', taps: 15, targetMess: 8, messReduction: mess - 8 }, // To Messy 1 (8 mess)
        { name: '🧹 Sweeping', taps: 10, targetMess: 3, messReduction: 5 } // To Clean (3 mess)
      ];
      totalTaps = 25;
    } else if (mess > 5) {
      // Light Mess (Messy 1) → Clean
      stages = [
        { name: '🧹 Tidying Up', taps: 10, targetMess: 3, messReduction: mess - 3 } // To Clean (3 mess)
      ];
      totalTaps = 10;
    }
    
    console.log('[Cleaning] Stages:', stages.length, 'Total taps needed:', totalTaps);
    
    setIsCleaning(true);
    setCleaningStage(1);
    setTotalStages(stages.length);
    setCleaningTaps(0);
    setTapsNeeded(stages[0]?.taps || 10);
    
    // Store cleaning plan for efficiency calculation
    setCleaningPlan({ stages, totalTaps, startMess: mess });
    
    console.log('[Cleaning] Cleaning mode activated - tap the screen!');
  };

  const handleCleaningTap = async (event: any) => {
    if (!isCleaning || !cleaningPlan) return;
    
    console.log('[Cleaning] Tap detected - creating dust cloud and playing sound');
    
    // Get tap position from event
    const tapX = event.nativeEvent.locationX || Math.random() * SCREEN_WIDTH;
    const tapY = event.nativeEvent.locationY || Math.random() * SCREEN_HEIGHT;
    
    // Create dust cloud at tap position with unique ID using timestamp
    const cloudId = Date.now() + Math.random(); // Ensure unique ID
    
    // Offset cloud position slightly so it's centered on tap
    const cloudX = tapX - 75; // 150 = cloud width / 2
    const cloudY = tapY - 75; // 150 = cloud height / 2
    const opacity = new Animated.Value(1);
    const scale = new Animated.Value(0.3); // Start smaller
    
    const newCloud = { id: cloudId, x: cloudX, y: cloudY, opacity, scale };
    setDustClouds(prev => [...prev, newCloud]);
    
    // Animate dust cloud: grow and fade out
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 2.0, // Grow much bigger
        duration: 1200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Remove cloud after animation
      setDustClouds(prev => prev.filter(cloud => cloud.id !== cloudId));
    });
    
    // Play appropriate cleaning sound based on stage
    const currentStageIndex = cleaningStage - 1;
    const stage = cleaningPlan.stages[currentStageIndex];
    
    if (stage) {
      // Use different sounds based on cleaning stage NAME
      try {
        let soundKey = SOUNDS.SCRUB; // Default
        
        // Match sound to stage name
        if (stage.name.includes('Sweeping')) {
          soundKey = SOUNDS.BROOM;
          console.log('[Cleaning] 🔊 Playing BROOM sound for', stage.name);
        } else if (stage.name.includes('Scrubbing')) {
          soundKey = SOUNDS.SCRUB;
          console.log('[Cleaning] 🔊 Playing SCRUB sound for', stage.name);
        } else if (stage.name.includes('Deep Clean')) {
          soundKey = SOUNDS.DEEP_CLEAN;
          console.log('[Cleaning] 🔊 Playing DEEP_CLEAN sound for', stage.name);
        }
        
        const result = await soundManager.playSound(soundKey, 1.0, 1.0);
        console.log('[Cleaning] ✅ Sound played successfully, result:', result);
      } catch (err) {
        console.error('[Cleaning] ❌ Sound playback error:', err);
      }
    }
    
    const newTaps = cleaningTaps + 1;
    setCleaningTaps(newTaps);
    
    if (newTaps >= tapsNeeded) {
      // Stage completed - apply mess reduction for this stage
      const currentStageIndex = cleaningStage - 1;
      const stage = cleaningPlan.stages[currentStageIndex];
      
      if (stage) {
        // Calculate efficiency-based cleaning
        const efficiency = 1.0; // Perfect completion for now
        const messReduced = stage.messReduction * efficiency;
        
        // Apply cleaning with efficiency-based rewards
        applyCleaningResults(messReduced, efficiency);
      }
      
      if (cleaningStage >= totalStages || userData.messPoints <= 5) {
        // All cleaning completed
        setIsCleaning(false);
        setCleaningStage(1);
        setCleaningTaps(0);
        setCleaningPlan(null);
      } else {
        // Move to next stage
        const nextStage = cleaningStage + 1;
        setCleaningStage(nextStage);
        setCleaningTaps(0);
        setTapsNeeded(cleaningPlan.stages[nextStage - 1]?.taps || 10);
      }
    }
  };

  // Apply cleaning results with efficiency-based rewards
  const applyCleaningResults = (messReduced: number, efficiency: number) => {
    // Energy restoration (max 30% based on efficiency)
    const energyRestored = Math.floor(efficiency * 30);
    
    // Coins earned (max 20 based on efficiency)
    const coinsEarned = Math.floor(efficiency * 20);
    
    console.log(`[Cleaning] Stage complete: -${messReduced.toFixed(1)} mess, +${energyRestored} cap, +${coinsEarned} coins`);
    
    // Apply changes through store
    cleanRoom(messReduced);
  };

  const handleFinishCleaning = () => {
    // Calculate partial efficiency if user exits early
    if (cleaningPlan && cleaningTaps > 0) {
      const partialEfficiency = Math.min(1.0, cleaningTaps / tapsNeeded);
      const currentStageIndex = cleaningStage - 1;
      const stage = cleaningPlan.stages[currentStageIndex];
      
      if (stage && partialEfficiency > 0.3) { // Minimum 30% completion for rewards
        const messReduced = stage.messReduction * partialEfficiency;
        applyCleaningResults(messReduced, partialEfficiency);
      }
    }
    
    setIsCleaning(false);
    setCleaningStage(1);
    setCleaningTaps(0);
    setCleaningPlan(null);
  };



  // Handle focus session start
  const handleStartFocusSession = () => {
    const energyNeeded = calculateFocusEnergyCost(userData);
    if (userData.energy < energyNeeded) {
      alert(`Not enough energy! Need ${energyNeeded} energy to focus (have ${Math.round(userData.energy)})`);
      return;
    }
    
    // Show customization modal
    setShowSessionModal(true);
  };

  const handleSessionStart = (config: SessionConfig) => {
    const success = startFocusSession(undefined, config);
    if (success) {
      router.push('/study-session');
    }
  };
  
  // Check if all habits are completed according to current time of day
  const areAllHabitsCompletedForCurrentTime = () => {
    const enabledHabits = userData.enabledHabits || [];
    let currentHour: number;
    
    // Use simulated time during acceleration, otherwise use device time
    if (useSimulatedTime && timeAccelerationActive) {
      currentHour = parseInt(simulatedTime.split(':')[0]);
    } else {
      currentHour = new Date().getHours();
    }
    
    // Check each enabled habit based on time expectations
    for (const habit of enabledHabits) {
      switch (habit) {
        case 'study':
          // Check study progress based on checkpoints
          const studyHours = (userData.studyMinutesToday || 0) / 60;
          const studyGoal = userData.studyGoalHours || 0;
          
          // Determine expected progress based on current time
          let expectedProgress = 0;
          if (currentHour >= 21) { // 9 PM - should be 100% done
            expectedProgress = 1.0;
          } else if (currentHour >= 18) { // 6 PM - should be ~75% done
            expectedProgress = 0.75;
          } else if (currentHour >= 12) { // 12 PM - should be ~33% done
            expectedProgress = 0.33;
          } else if (currentHour >= 9) { // 9 AM - should have started
            expectedProgress = 0.1;
          }
          
          const expectedHours = studyGoal * expectedProgress;
          if (studyHours < expectedHours) return false;
          break;
          
        case 'hydration':
          // Water intake should be progressive throughout the day
          const waterGoal = userData.hydrationGoalGlasses || 8;
          let expectedWater = 0;
          if (currentHour >= 22) expectedWater = waterGoal; // 10 PM - full goal
          else if (currentHour >= 18) expectedWater = waterGoal * 0.8; // 6 PM - 80%
          else if (currentHour >= 14) expectedWater = waterGoal * 0.6; // 2 PM - 60%
          else if (currentHour >= 10) expectedWater = waterGoal * 0.4; // 10 AM - 40%
          else if (currentHour >= 7) expectedWater = waterGoal * 0.2; // 7 AM - 20%
          
          if (userData.waterGlasses < expectedWater) return false;
          break;
          
        case 'meals':
          // Meals based on time of day
          const mealGoal = userData.mealGoalCount || 3;
          let expectedMeals = 0;
          if (currentHour >= 20) expectedMeals = mealGoal; // 8 PM - all meals
          else if (currentHour >= 14) expectedMeals = 2; // 2 PM - breakfast + lunch
          else if (currentHour >= 10) expectedMeals = 1; // 10 AM - breakfast
          
          if (userData.mealsLogged < expectedMeals) return false;
          break;
          
        case 'exercise':
          // Exercise can be done anytime, but expect it by evening
          const exerciseGoal = userData.exerciseGoalMinutes || 30;
          if (currentHour >= 18) { // After 6 PM, should have some exercise
            if (userData.exerciseMinutes < exerciseGoal * 0.5) return false;
          }
          break;
          
        case 'sleep':
          // Sleep from previous night - only check in morning/afternoon
          const sleepGoal = userData.sleepGoalHours || 7;
          if (currentHour >= 6 && currentHour <= 14) { // Morning to afternoon
            const todaysSleepHours = getTodaysSleepHours();
            if (todaysSleepHours < sleepGoal * 0.8) return false; // At least 80% of sleep goal
          }
          break;
      }
    }
    
    return true; // All enabled habits are on track for current time
  };

  // Determine current animation based on priority: sleep > exercise > meal > water > habit completion
  const getBaseAnimation = () => {
    // First check activity animations (highest priority - these should always show for user feedback)
    if (sleepAnimation !== 'idle') return sleepAnimation;
    if (exerciseAnimation !== 'idle') return exerciseAnimation;
    if (mealAnimation !== 'idle') return mealAnimation;
    if (waterAnimation !== 'idle') return waterAnimation;
    
    // Show happy animation during welcome message
    if (isShowingWelcome) return 'idle-sit-happy';
    
    // Then check if all habits are completed for current time for happy idle
    if (areAllHabitsCompletedForCurrentTime()) return 'idle-sit-happy';
    
    // Default to regular idle
    return 'idle-sit';
  };
  
  const currentAnimation = getBaseAnimation();
  
  // Show the most recent message (highest timestamp)
  const getDefaultWelcomeMessage = () => {
    let currentHour: number;
    
    // Use simulated time during acceleration, otherwise use device time
    if (useSimulatedTime && timeAccelerationActive) {
      currentHour = parseInt(simulatedTime.split(':')[0]);
    } else {
      currentHour = new Date().getHours();
    }
    
    const userName = userData.userName || 'there';
    
    if (currentHour < 12) {
      return `Mornin', ${userName}! ☕️\nJust woke up... ${buddyName} is ready to chill and study!`;
    } else if (currentHour < 17) {
      return `Hey there, ${userName}! 😎\n${buddyName} is here - let's tackle some work together!`;
    } else {
      return `Evening, ${userName}! 🌙\nPerfect time for focus with some chill vibes!`;
    }
  };
  
  let hamsterMessage = getDefaultWelcomeMessage();
  
  // Add time-specific messages during simulation
  if (useSimulatedTime && timeAccelerationActive) {
    const currentHour = parseInt(simulatedTime.split(':')[0]);
    const currentMinute = parseInt(simulatedTime.split(':')[1]);
    const userName = userData.userName || 'there';
    
    // Override with time-specific messages during simulation
    if (currentHour >= 0 && currentHour < 6) {
      // Night messages
      if (currentHour === 0 && currentMinute < 30) {
        hamsterMessage = `🌙 Midnight, ${userName}! New day begins!\n${buddyName} is getting sleepy... time for rest! 😴`;
      } else if (currentHour >= 1 && currentHour < 5) {
        hamsterMessage = `💤 Deep sleep time, ${userName}...\n${buddyName} is dreaming of tomorrow's adventures! 🌙`;
      } else if (currentHour >= 5 && currentMinute >= 30) {
        hamsterMessage = `🌅 Almost dawn, ${userName}!\n${buddyName} is stirring... morning is coming! ☀️`;
      }
    } else if (currentHour >= 6 && currentHour < 12) {
      // Morning messages
      if (currentHour === 6) {
        hamsterMessage = `🌅 Good morning, ${userName}!\n${buddyName} just woke up! Ready for a fresh start! ☀️`;
      } else if (currentHour === 7) {
        hamsterMessage = `🍳 Breakfast time, ${userName}!\n${buddyName} is hungry! Time for morning fuel! 🥞`;
      } else if (currentHour >= 8 && currentHour < 10) {
        hamsterMessage = `☕ Morning energy, ${userName}!\n${buddyName} is feeling fresh and ready to learn! 📚`;
      } else if (currentHour >= 10) {
        hamsterMessage = `🌞 Mid-morning, ${userName}!\n${buddyName} is in full focus mode! Let's be productive! 💪`;
      }
    } else if (currentHour >= 12 && currentHour < 18) {
      // Afternoon messages
      if (currentHour === 12) {
        hamsterMessage = `🥪 Lunch time, ${userName}!\n${buddyName} needs midday fuel! Time for a break! 🍽️`;
      } else if (currentHour >= 13 && currentHour < 15) {
        hamsterMessage = `☀️ Afternoon focus, ${userName}!\n${buddyName} is in peak productivity mode! 🎯`;
      } else if (currentHour >= 15 && currentHour < 17) {
        hamsterMessage = `🌤️ Late afternoon, ${userName}!\n${buddyName} is staying strong! Keep going! 💪`;
      } else if (currentHour >= 17) {
        hamsterMessage = `🌅 Evening approaches, ${userName}!\n${buddyName} feels the day winding down... 🌆`;
      }
    } else if (currentHour >= 18) {
      // Evening messages
      if (currentHour === 18) {
        hamsterMessage = `🍽️ Dinner time, ${userName}!\n${buddyName} is ready for evening meal! 🥘`;
      } else if (currentHour >= 19 && currentHour < 21) {
        hamsterMessage = `🌆 Evening relaxation, ${userName}!\n${buddyName} is winding down... peaceful vibes! 😌`;
      } else if (currentHour >= 21 && currentHour < 23) {
        hamsterMessage = `🌙 Getting late, ${userName}!\n${buddyName} is feeling sleepy... bedtime soon! 😴`;
      } else if (currentHour >= 23) {
        hamsterMessage = `💤 Very late, ${userName}!\n${buddyName} is yawning... time for sleep! 🌙`;
      }
    }
  }
  
  // Find the most recent message among all features (only if not using simulated time messages)
  // Find the most recent message among all features (only if not using simulated time messages)
  const messages = [
    { text: checkpointMessage, timestamp: checkpointMessageTimestamp, priority: 6 }, // Checkpoint warnings (highest priority)
    { text: waterMessage, timestamp: waterMessageTimestamp, priority: 5 }, // Action messages (highest)
    { text: sleepMessage, timestamp: sleepMessageTimestamp, priority: 5 },
    { text: mealMessage, timestamp: mealMessageTimestamp, priority: 5 },
    { text: exerciseMessage, timestamp: exerciseMessageTimestamp, priority: 5 },
    { text: evaluationMessage, timestamp: evaluationTimestamp, priority: 4.5 }, // Day evaluation (very high priority)
    { text: welcomeMessage, timestamp: welcomeTimestamp, priority: 4 }, // First-time welcome
    { text: feedbackMessage, timestamp: feedbackTimestamp, priority: 3 }, // Time-based concerns
    { text: reminderMessage, timestamp: reminderTimestamp, priority: 2 }, // Reminders
    { text: idleMessage, timestamp: idleTimestamp, priority: 1 }, // Idle messages (lowest priority)
  ].filter(msg => msg.text); // Only messages that exist
  
  // Only use hook messages if not in simulation mode, or if they're high priority action messages
  if (!useSimulatedTime && messages.length > 0) {
    // Sort by priority first, then by timestamp
    const mostRecent = messages.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return b.timestamp - a.timestamp; // Then most recent
    })[0];
    hamsterMessage = mostRecent.text;
  } else if (useSimulatedTime && messages.length > 0) {
    // During simulation, only show high priority action messages (priority 5)
    const actionMessages = messages.filter(msg => msg.priority === 5);
    if (actionMessages.length > 0) {
      const mostRecent = actionMessages.sort((a, b) => b.timestamp - a.timestamp)[0];
      hamsterMessage = mostRecent.text;
    }
    // Otherwise keep the time-based simulated message
  }
  
  // Update energy periodically (reduced frequency for better performance)
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        updateEnergy();
      } catch (error) {
        console.error('[HomeScreen] Error updating energy:', error);
      }
    }, 30000); // Update every 30 seconds instead of every second
    
    return () => clearInterval(interval);
  }, [updateEnergy]);

  // Check study checkpoints periodically (reduced frequency for performance)
  useEffect(() => {
    if (!userData.enabledHabits?.includes('study') || !userData.studyGoalHours) return;
    
    // Check immediately on mount
    console.log('[HomeScreen] Running initial checkpoint check...');
    try {
      const result = checkAndProcessCheckpoints();
      if (result.shouldNotify && result.checkpoint && result.expected && result.actual && result.missing) {
        // Format missing time as "Xh Ymin"
        const missingHours = Math.floor(result.missing);
        const missingMinutes = Math.round((result.missing - missingHours) * 60);
        const missingText = `${missingHours}h ${missingMinutes}min`;
        
        const message = `⚠️ Behind by ${missingText}... room's getting messy! 📚\n` +
                       `Expected: ${result.expected.toFixed(1)}h by ${result.checkpoint}, You: ${result.actual.toFixed(1)}h`;
        console.log('[Checkpoint]', message);
        setCheckpointMessage(message);
        setCheckpointMessageTimestamp(Date.now());
      }
    } catch (error) {
      console.error('[HomeScreen] Error in initial checkpoint check:', error);
    }
    
    const checkpointInterval = setInterval(() => {
      try {
        const now = Date.now();
        const timeSinceLastCheck = now - lastCheckpointCheck;
        
        // Only check every 15 minutes to reduce performance impact
        if (timeSinceLastCheck >= 15 * 60 * 1000) {
          const result = checkAndProcessCheckpoints();
          
          if (result.shouldNotify && result.checkpoint && result.expected && result.actual && result.missing) {
            // Format missing time as "Xh Ymin"
            const missingHours = Math.floor(result.missing);
            const missingMinutes = Math.round((result.missing - missingHours) * 60);
            const missingText = `${missingHours}h ${missingMinutes}min`;
            
            // Update hamster message with checkpoint notification
            const message = `⚠️ Behind by ${missingText}... room's getting messy! 📚\n` +
                           `Expected: ${result.expected.toFixed(1)}h by ${result.checkpoint}, You: ${result.actual.toFixed(1)}h`;
            
            console.log('[Checkpoint]', message);
            setCheckpointMessage(message);
            setCheckpointMessageTimestamp(Date.now());
          }
          
          setLastCheckpointCheck(now);
        }
      } catch (error) {
        console.error('[HomeScreen] Error checking checkpoints:', error);
      }
    }, 600000); // Check every 10 minutes instead of every 5 minutes for better performance
    
    return () => clearInterval(checkpointInterval);
  }, [userData.enabledHabits, userData.studyGoalHours]); // Removed frequently changing dependencies

  // Rotate exercise messages during exercise session
  useEffect(() => {
    if (!isExercising) {
      setRandomExerciseMessage('');
      return;
    }
    
    // Set initial random message
    const randomIndex = Math.floor(Math.random() * exerciseMotivationalMessages.length);
    setRandomExerciseMessage(exerciseMotivationalMessages[randomIndex]);
    
    // Change message every 10 seconds
    const messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * exerciseMotivationalMessages.length);
      setRandomExerciseMessage(exerciseMotivationalMessages[randomIndex]);
    }, 10000); // Change every 10 seconds
    
    return () => clearInterval(messageInterval);
  }, [isExercising]);

  // Daily reset automation (check every 10 minutes for better performance)
  useEffect(() => {
    const dailyResetInterval = setInterval(() => {
      try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Check if it's around midnight (00:00-00:10)
        if (currentHour === 0 && currentMinute < 10) {
          console.log('[Daily] Midnight reached - applying daily reset');
          const { resetDay } = useQuillbyStore.getState();
          resetDay();
        }
      } catch (error) {
        console.error('[HomeScreen] Error in daily reset:', error);
      }
    }, 600000); // Check every 10 minutes instead of every minute for better performance
    
    return () => clearInterval(dailyResetInterval);
  }, []);
  
  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.container}
      resizeMode="cover"
      defaultSource={require('../../assets/backgrounds/theme.png')}
    >
      {/* FIXED BACKGROUND LAYERS - Keep both mounted, just hide/show for instant switching */}
      <View style={[styles.environmentContainer, !isExercising && styles.hidden]}>
        <ExerciseEnvironment pointerEvents="none" />
        {/* Exercise Timer Overlay */}
        <View style={styles.exerciseTimerContainer}>
          <Text style={styles.exerciseTimerLabel}>
            {randomExerciseMessage || "Let's exercise together! 💪"}
          </Text>
          <Text style={styles.exerciseTimerValue}>{exerciseElapsedTime}</Text>
        </View>
      </View>
      
      <View style={[styles.environmentContainer, isExercising && styles.hidden]}>
        <RoomLayers pointerEvents="none" messPoints={userData.messPoints} isSleeping={isSleeping} sleepAnimation={sleepAnimation} qCoins={userData.qCoins} />
        {/* Sleep Timer Overlay - Show when sleeping */}
        {isSleeping && (
          <View style={styles.sleepTimerContainer}>
            <Text style={styles.sleepTimerLabel}>
              💤 {buddyName} is Sleeping
            </Text>
            <Text style={styles.sleepTimerValue}>{sleepElapsedTime}</Text>
          </View>
        )}
      </View>
      
      {/* FIXED HAMSTER - Must be above environment layers */}
      <View style={styles.hamsterContainer}>
        <HamsterCharacter 
          selectedCharacter={selectedCharacter}
          currentAnimation={currentAnimation}
          isSleeping={isSleeping}
          pointerEvents="none"
        />
      </View>

      {/* Time Acceleration Timer Overlay */}
      {timeAccelerationActive && (
        <View style={styles.timeAccelerationOverlay}>
          <Text style={styles.timeAccelerationTitle}>⚡ Day Simulation Active</Text>
          <Text style={styles.timeAccelerationSubtitle}>Full 24h cycle starting from 00:00</Text>
          
          {/* Current Simulated Time Display */}
          <View style={styles.simulatedTimeContainer}>
            <Text style={styles.simulatedTimeLabel}>Current Time:</Text>
            <Text style={styles.simulatedTimeValue}>{simulatedTime}</Text>
            <Text style={styles.dayPhaseText}>
              {(() => {
                const hour = parseInt(simulatedTime.split(':')[0]);
                if (hour >= 0 && hour < 6) return '🌙 Night';
                if (hour >= 6 && hour < 12) return '🌅 Morning';
                if (hour >= 12 && hour < 18) return '☀️ Afternoon';
                return '🌆 Evening';
              })()}
            </Text>
          </View>
          
          <View style={styles.timeAccelerationProgressContainer}>
            <View style={styles.timeAccelerationProgressBar}>
              <View 
                style={[
                  styles.timeAccelerationProgressFill,
                  { width: `${timeAccelerationProgress}%` }
                ]}
              />
            </View>
            <Text style={styles.timeAccelerationProgressText}>
              {timeAccelerationProgress.toFixed(1)}% Complete
            </Text>
          </View>
          <Text style={styles.timeAccelerationTime}>
            {((timeAccelerationProgress / 100) * 24).toFixed(1)} hours simulated
          </Text>
          <TouchableOpacity
            style={styles.stopAccelerationButton}
            onPress={() => {
              cleanupAcceleration(true); // Force cleanup
              console.log('[TEST] Time acceleration stopped manually');
            }}
          >
            <Text style={styles.stopAccelerationButtonText}>⏹ Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REAL-TIME CLOCK */}
      <RealTimeClock isExercising={isExercising} />

      {/* CLEANING TAP OVERLAY - Only when cleaning */}
      {isCleaning && (
        <>
          <TouchableOpacity
            style={styles.cleaningTapOverlay}
            onPress={handleCleaningTap}
            activeOpacity={0.1}
          />
          
          {/* Dust Clouds */}
          {dustClouds.map(cloud => (
            <Animated.View
              key={cloud.id}
              style={[
                styles.dustCloud,
                {
                  left: cloud.x,
                  top: cloud.y,
                  opacity: cloud.opacity,
                  transform: [{ scale: cloud.scale }],
                }
              ]}
              pointerEvents="none"
            >
              <View style={styles.dustCloudCircle}>
                <View style={[styles.dustCloudBubble, styles.dustCloudBubble1]} />
                <View style={[styles.dustCloudBubble, styles.dustCloudBubble2]} />
                <View style={[styles.dustCloudBubble, styles.dustCloudBubble3]} />
                <View style={[styles.dustCloudBubble, styles.dustCloudBubble4]} />
              </View>
            </Animated.View>
          ))}
        </>
      )}
      


      {/* SPEECH BUBBLE - Now in top area where energy bar was */}
      <View style={styles.speechBubbleContainer} pointerEvents="none">
        <SpeechBubble message={hamsterMessage} />
      </View>

      {/* CLEANING PROGRESS - Shows when cleaning */}
      {isCleaning && cleaningPlan && (
        <View style={styles.cleaningProgress} pointerEvents="none">
          <Text style={styles.cleaningProgressTitle}>
            {cleaningPlan.stages[cleaningStage - 1]?.name || '🧹 Cleaning'}
          </Text>
          <Text style={styles.cleaningProgressText}>
            Stage {cleaningStage}/{totalStages}
          </Text>
          <Text style={styles.cleaningProgressTaps}>
            {cleaningTaps}/{tapsNeeded} taps
          </Text>
          <View style={styles.cleaningProgressBar}>
            <View 
              style={[
                styles.cleaningProgressFill,
                { width: `${Math.min(100, (cleaningTaps / tapsNeeded) * 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.cleaningProgressHint}>
            Tap anywhere on the room!
          </Text>
          <Text style={styles.cleaningProgressMess}>
            Mess: {userData.messPoints.toFixed(1)}
          </Text>
        </View>
      )}


      
      {/* SCROLLABLE CONTENT AREA - Inside orange theme background */}
      <ScrollView 
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* NOTIFICATION BANNERS - Show at the top */}
        {notifications.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            {notifications.map((notification: any) => (
              <NotificationBanner
                key={notification.id}
                notification={notification}
                onDismiss={dismissNotification}
              />
            ))}
          </View>
        )}

        {/* ENERGY BAR - First in scrollable area (status bar) */}
        <View style={styles.scrollableEnergyBarContainer}>
          <EnergyBar current={userData.energy} max={userData.maxEnergyCap} />
        </View>

        {/* BUTTONS ROW - Second in scrollable area */}
        {selectedCharacter === 'casual' && (
          <View style={styles.scrollableButtonsRow}>
            {!isSleeping && !isExercising && !isCleaning ? (
              <>
                {/* Water Button - Only when NOT in any active mode */}
                <WaterButton 
                  waterGlasses={waterGlasses}
                  hydrationGoal={userData.hydrationGoalGlasses || 8}
                  onPress={handleDrinkWaterWithReset}
                />
                
                {/* Meal Button - Only when NOT in any active mode */}
                <MealButton 
                  mealsLogged={mealsLogged}
                  mealGoal={userData.mealGoalCount || 3}
                  portionDescription={portionDescription}
                  onPress={handleLogMealWithReset}
                />
                
                {/* Exercise Button - Only when exercise habit is enabled */}
                {userData.enabledHabits?.includes('exercise') && (
                  <ExerciseButton 
                    isExercising={false}
                    exerciseDisplay={exerciseDisplay}
                    exerciseElapsedTime={exerciseElapsedTime}
                    onStartExercise={handleStartExerciseWithReset}
                    onFinishExercise={handleFinishExerciseWithReset}
                  />
                )}
                
                {/* Clean Button - Only when room is messy */}
                <CleanButton 
                  messPoints={userData.messPoints}
                  onPress={handleStartCleaning}
                />
                
                {/* Sleep Button - Only when NOT in any active mode */}
                <SleepButton 
                  isSleeping={false}
                  sleepDisplay={sleepDisplay}
                  sleepElapsedTime={sleepElapsedTime}
                  onSleep={handleStartSleepWithReset}
                  onWakeUp={handleWakeUpButtonWithReset}
                />
              </>
            ) : isSleeping ? (
              <>
                {/* Wake Button - Full width when sleeping */}
                <SleepButton 
                  isSleeping={true}
                  sleepDisplay={sleepDisplay}
                  sleepElapsedTime={sleepElapsedTime}
                  onSleep={handleStartSleepWithReset}
                  onWakeUp={handleWakeUpButtonWithReset}
                />
              </>
            ) : isExercising ? (
              <>
                {/* Exercise Button - Full width when exercising */}
                <ExerciseButton 
                  isExercising={true}
                  exerciseDisplay={exerciseDisplay}
                  exerciseElapsedTime={exerciseElapsedTime}
                  onStartExercise={handleStartExerciseWithReset}
                  onFinishExercise={handleFinishExerciseWithReset}
                />
              </>
            ) : isCleaning ? (
              <>
                {/* Finish Cleaning Button - Full width when cleaning */}
                <TouchableOpacity
                  style={styles.finishCleaningButton}
                  onPress={handleFinishCleaning}
                >
                  <Text style={styles.finishCleaningButtonText}>
                    ✨ Finish Cleaning
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        )}

        {/* STUDY SECTION - Focus Button and Progress side by side BELOW buttons */}
        {userData.enabledHabits?.includes('study') && (
          <View style={styles.studySection}>
            {/* FOCUS SESSION BUTTON - Left side */}
            {!isCleaning && !isSleeping && !isExercising && (
              <TouchableOpacity
                style={[
                  styles.focusSessionButton,
                  userData.energy < calculateFocusEnergyCost(userData) && styles.focusSessionButtonDisabled
                ]}
                onPress={handleStartFocusSession}
                disabled={userData.energy < calculateFocusEnergyCost(userData)}
              >
                <Text style={[
                  styles.focusSessionButtonText,
                  userData.energy < calculateFocusEnergyCost(userData) && styles.focusSessionButtonTextDisabled
                ]}>
                  {userData.energy >= calculateFocusEnergyCost(userData) ? '📚 Focus' : '😴 Tired'}
                </Text>
                <Text style={styles.focusSessionButtonSubtext}>
                  {userData.energy >= 20 ? '20 energy' : `Need ${20 - userData.energy}`}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* STUDY PROGRESS - Right side */}
            <View style={styles.studyProgressContainer}>
              <StudyProgress />
            </View>
          </View>
        )}

        {/* TODAY'S DEADLINE SECTION - Show under study section */}
        {userData.enabledHabits?.includes('study') && getTodaysDeadline() && (
          <View style={styles.todaysDeadlineSection}>
            <Text style={styles.todaysDeadlineTitle}>📅 Today's Priority</Text>
            {renderTodaysDeadline()}
          </View>
        )}
        
        {/* SPACER - Allow more scrolling space */}
        <View style={styles.contentSpacer} />
        
        {/* TEST BUTTONS - Achievement Testing */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: 'Chakra Petch', fontSize: 16, color: '#333', textAlign: 'center', fontWeight: 'bold', marginBottom: 10 }}>
            🏆 Test Achievements
          </Text>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#FFD54F',
              padding: 15,
              borderRadius: 10,
              marginHorizontal: 20,
              marginBottom: 10,
              borderWidth: 2,
              borderColor: '#FFC107',
            }}
            onPress={() => {
              console.log('[TEST] 🎯 Button pressed: First Steps');
              const store = useQuillbyStore.getState();
              
              // Reset achievement first
              console.log('[TEST] Resetting first-focus...');
              const userData = { ...store.userData };
              if (!userData.achievements) userData.achievements = {};
              userData.achievements['first-focus'] = { progress: 0, unlocked: false };
              useQuillbyStore.setState({ userData });
              
              // Then unlock it (with small delay to ensure state update)
              setTimeout(() => {
                console.log('[TEST] Unlocking first-focus...');
                const currentStore = useQuillbyStore.getState();
                currentStore.unlockAchievement('first-focus');
                console.log('[TEST] ✅ First Steps unlocked!');
              }, 100);
            }}
          >
            <Text style={{ fontFamily: 'Chakra Petch', fontSize: 14, color: '#8B4513', textAlign: 'center', fontWeight: 'bold' }}>
              🎯 Test: First Steps (Common)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#B2DFDB',
              padding: 15,
              borderRadius: 10,
              marginHorizontal: 20,
              marginBottom: 10,
              borderWidth: 2,
              borderColor: '#00897B',
            }}
            onPress={() => {
              console.log('[TEST] 🔥 Button pressed: Week Warrior');
              const store = useQuillbyStore.getState();
              
              // Reset achievement first
              console.log('[TEST] Resetting week-warrior...');
              const userData = { ...store.userData };
              if (!userData.achievements) userData.achievements = {};
              userData.achievements['week-warrior'] = { progress: 0, unlocked: false };
              useQuillbyStore.setState({ userData });
              
              // Then unlock it
              setTimeout(() => {
                console.log('[TEST] Unlocking week-warrior...');
                const currentStore = useQuillbyStore.getState();
                currentStore.unlockAchievement('week-warrior');
                console.log('[TEST] ✅ Week Warrior unlocked!');
              }, 100);
            }}
          >
            <Text style={{ fontFamily: 'Chakra Petch', fontSize: 14, color: '#004D40', textAlign: 'center', fontWeight: 'bold' }}>
              🔥 Test: Week Warrior (Rare)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#CE93D8',
              padding: 15,
              borderRadius: 10,
              marginHorizontal: 20,
              marginBottom: 10,
              borderWidth: 2,
              borderColor: '#9C27B0',
            }}
            onPress={() => {
              console.log('[TEST] 🏃 Button pressed: Marathon Runner');
              const store = useQuillbyStore.getState();
              
              // Reset achievement first
              console.log('[TEST] Resetting marathon-runner...');
              const userData = { ...store.userData };
              if (!userData.achievements) userData.achievements = {};
              userData.achievements['marathon-runner'] = { progress: 0, unlocked: false };
              useQuillbyStore.setState({ userData });
              
              // Then unlock it
              setTimeout(() => {
                console.log('[TEST] Unlocking marathon-runner...');
                const currentStore = useQuillbyStore.getState();
                currentStore.unlockAchievement('marathon-runner');
                console.log('[TEST] ✅ Marathon Runner unlocked!');
              }, 100);
            }}
          >
            <Text style={{ fontFamily: 'Chakra Petch', fontSize: 14, color: '#4A148C', textAlign: 'center', fontWeight: 'bold' }}>
              🏃 Test: Marathon Runner (Legendary)
            </Text>
          </TouchableOpacity>
          
          {/* Reset All Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FF5252',
              padding: 12,
              borderRadius: 10,
              marginHorizontal: 20,
              marginTop: 10,
              borderWidth: 2,
              borderColor: '#D32F2F',
            }}
            onPress={() => {
              console.log('[TEST] 🔄 Resetting all test achievements...');
              const store = useQuillbyStore.getState();
              const userData = { ...store.userData };
              
              // Reset all test achievements
              if (!userData.achievements) userData.achievements = {};
              userData.achievements['first-focus'] = { progress: 0, unlocked: false };
              userData.achievements['week-warrior'] = { progress: 0, unlocked: false };
              userData.achievements['marathon-runner'] = { progress: 0, unlocked: false };
              
              useQuillbyStore.setState({ userData });
              console.log('[TEST] ✅ All test achievements reset');
            }}
          >
            <Text style={{ fontFamily: 'Chakra Petch', fontSize: 12, color: '#FFF', textAlign: 'center', fontWeight: 'bold' }}>
              🔄 Reset All Test Achievements
            </Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>

      {/* Dimming overlay when cleaning - only dim the tab bar area */}
      {isCleaning && (
        <View style={styles.cleaningTabBarDimOverlay} pointerEvents="none" />
      )}
      
      {/* Dimming overlay when sleeping or waking up */}
      {(isSleeping || sleepAnimation === 'sleeping' || sleepAnimation === 'wake-up') && (
        <View style={styles.sleepDimOverlay} pointerEvents="none" />
      )}

      {/* Session Customization Modal */}
      <SessionCustomizationModal
        visible={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onStartSession={handleSessionStart}
        isPremium={userData.purchasedItems?.includes('premium') || false}
      />

      {/* Exercise Customization Modal */}
      <ExerciseCustomizationModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onStartExercise={handleExerciseStart}
        isPremium={userData.purchasedItems?.includes('premium') || false}
      />

      {/* Sleep Customization Modal */}
      <SleepCustomizationModal
        visible={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onStartSleep={handleSleepStart}
      />

    </ImageBackground>
  );
}