import React, { useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, Text, ScrollView } from 'react-native';
import { CleaningPlan, CleaningStage } from '../core/types';
import { useRouter } from 'expo-router';

import { useQuillbyStore } from '../state/store-modular';
import { calculateFocusEnergyCost } from '../core/engine';
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
  const [isCleaning, setIsCleaning] = React.useState(false);
  const [cleaningStage, setCleaningStage] = React.useState(1);
  const [cleaningTaps, setCleaningTaps] = React.useState(0);
  const [tapsNeeded, setTapsNeeded] = React.useState(10);
  const [totalStages, setTotalStages] = React.useState(1);
  const [cleaningPlan, setCleaningPlan] = React.useState<CleaningPlan | null>(null);
  const [lastCheckpointCheck, setLastCheckpointCheck] = React.useState(Date.now());
  const [showSessionModal, setShowSessionModal] = React.useState(false);
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [showSleepModal, setShowSleepModal] = React.useState(false);
  const [timeAccelerationActive, setTimeAccelerationActive] = React.useState(false);
  const [timeAccelerationProgress, setTimeAccelerationProgress] = React.useState(0);
  const [accelerationInterval, setAccelerationInterval] = React.useState<NodeJS.Timeout | null>(null);
  const [simulatedTime, setSimulatedTime] = React.useState<string>('00:00');
  const [useSimulatedTime, setUseSimulatedTime] = React.useState(false);
  const [isStartingSimulation, setIsStartingSimulation] = React.useState(false);
  
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
    
    setIsCleaning(true);
    setCleaningStage(1);
    setTotalStages(stages.length);
    setCleaningTaps(0);
    setTapsNeeded(stages[0]?.taps || 10);
    
    // Store cleaning plan for efficiency calculation
    setCleaningPlan({ stages, totalTaps, startMess: mess });
  };

  const handleCleaningTap = () => {
    if (!isCleaning || !cleaningPlan) return;
    
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
    const success = startFocusSession();
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
    
    const checkpointInterval = setInterval(() => {
      try {
        const now = Date.now();
        const timeSinceLastCheck = now - lastCheckpointCheck;
        
        // Only check every 15 minutes to reduce performance impact
        if (timeSinceLastCheck >= 15 * 60 * 1000) {
          const result = checkAndProcessCheckpoints();
          
          if (result.shouldNotify && result.checkpoint && result.expected && result.actual && result.missing) {
            // Update hamster message with checkpoint notification
            const checkpointMessage = `⚠️ Behind on study time... room's getting messy! 📚\n` +
                                     `Expected: ${result.expected.toFixed(1)}h by ${result.checkpoint}, You: ${result.actual.toFixed(1)}h`;
            
            // This will be picked up by the message system
            console.log('[Checkpoint]', checkpointMessage);
          }
          
          setLastCheckpointCheck(now);
        }
      } catch (error) {
        console.error('[HomeScreen] Error checking checkpoints:', error);
      }
    }, 600000); // Check every 10 minutes instead of every 5 minutes for better performance
    
    return () => clearInterval(checkpointInterval);
  }, [userData.enabledHabits, userData.studyGoalHours]); // Removed frequently changing dependencies

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
    >
      {/* FIXED BACKGROUND LAYERS - Switch between room, exercise environment, and sleep timer */}
      {isExercising ? (
        <>
          <ExerciseEnvironment pointerEvents="none" />
          {/* Exercise Timer Overlay */}
          <View style={styles.exerciseTimerContainer}>
            <Text style={styles.exerciseTimerLabel}>
              {buddyName}'s {exerciseType === 'walk' ? 'Walking' : exerciseType === 'stretch' ? 'Stretching' : exerciseType === 'cardio' ? 'Cardio' : 'Energizer'} Session
            </Text>
            <Text style={styles.exerciseTimerValue}>{exerciseElapsedTime}</Text>
          </View>
        </>
      ) : (
        <>
          <RoomLayers pointerEvents="none" messPoints={userData.messPoints} isSleeping={isSleeping} qCoins={userData.qCoins} />
          {/* Sleep Timer Overlay - Show when sleeping */}
          {isSleeping && (
            <View style={styles.sleepTimerContainer}>
              <Text style={styles.sleepTimerLabel}>
                💤 {buddyName} is Sleeping
              </Text>
              <Text style={styles.sleepTimerValue}>{sleepElapsedTime}</Text>
            </View>
          )}
        </>
      )}
      
      {/* FIXED HAMSTER */}
      <HamsterCharacter 
        selectedCharacter={selectedCharacter}
        currentAnimation={currentAnimation}
        isSleeping={isSleeping}
        pointerEvents="none"
      />

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
      <RealTimeClock />

      {/* CLEANING TAP OVERLAY - Only when cleaning */}
      {isCleaning && (
        <TouchableOpacity
          style={styles.cleaningTapOverlay}
          onPress={handleCleaningTap}
          activeOpacity={0.1}
        />
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

        {/* TEMPORARY TEST BUTTON - 10x Time Speed */}
        <View style={styles.testButtonSection}>
          <Text style={styles.testButtonTitle}>🧪 Debug Tools</Text>
          <View style={styles.testButtonRow}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                // Force daily reset to test mess points energy drain (REAL DATA - SYNCS TO SUPABASE)
                const { resetDay } = useQuillbyStore.getState();
                resetDay();
                console.log('[TEST] Daily reset triggered - check energy drain from mess points');
              }}
            >
              <Text style={styles.testButtonText}>⏰ Force Daily Reset</Text>
              <Text style={styles.testButtonSubtext}>Test energy drain (REAL DATA)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                // Add mess points for testing (REAL DATA - SYNCS TO SUPABASE)
                const { skipTask } = useQuillbyStore.getState();
                for (let i = 0; i < 5; i++) {
                  skipTask();
                }
                console.log('[TEST] Added 5 mess points - check room visuals and energy drain');
              }}
            >
              <Text style={styles.testButtonText}>🗑️ Add 5 Mess</Text>
              <Text style={styles.testButtonSubtext}>Test mess system (REAL DATA)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                cleanupAcceleration(true); // Force cleanup
                console.log('[TEST] 🧹 MANUAL FORCE CLEANUP - All intervals cleared by user');
              }}
            >
              <Text style={styles.testButtonText}>🧹 Force Cleanup</Text>
              <Text style={styles.testButtonSubtext}>Clear ALL intervals</Text>
            </TouchableOpacity>
            
            {/* Temporarily disabled to reduce performance impact
            <TouchableOpacity
              style={styles.testButton}
              onPress={testNotification}
            >
              <Text style={styles.testButtonText}>🔔 Test Notification</Text>
              <Text style={styles.testButtonSubtext}>Send test notification</Text>
            </TouchableOpacity>
            */}
          </View>
          
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonWide, timeAccelerationActive && styles.testButtonDisabled]}
            onPress={() => {
              // Prevent multiple accelerations
              if (timeAccelerationActive) {
                console.log('[TEST] Time acceleration already running - ignoring new request');
                return;
              }
              
              // Set starting flag to prevent cleanup interference
              setIsStartingSimulation(true);
              
              // BACKUP REAL USER DATA before simulation (with error handling)
              try {
                const currentUserData = useQuillbyStore.getState().userData;
                setOriginalUserData({ ...currentUserData });
                console.log('[TEST] 💾 Backed up real user data before simulation');
              } catch (error) {
                console.error('[TEST] ❌ Error backing up user data:', error);
                setIsStartingSimulation(false);
                return;
              }
              
              // Clear any existing interval first using cleanup function
              console.log('[TEST] 🧹 Performing aggressive cleanup before starting new simulation');
              cleanupAcceleration(true); // Force cleanup
              
              // Wait a moment for cleanup to complete
              setTimeout(() => {
                console.log('[TEST] ✅ Cleanup complete, starting simulation...');
              
              // 24x time acceleration - simulate 24 hours in 1 hour (LOCAL SIMULATION ONLY)
              const startTimeAcceleration = () => {
                let accelerationCount = 0;
                const maxAccelerations = 1440; // 1440 minutes in a day
                const minutesPerTick = 1; // Advance 1 minute per tick
                const tickInterval = 2500; // 2.5 seconds per tick = 1 hour total for 24 hours
                
                console.log('[TEST] Starting 24x time acceleration - Full day simulation starting at 00:00');
                console.log('[TEST] Will show: Night → Morning → Afternoon → Evening → Night phases');
                console.log('[TEST] Each tick = 1 minute, every 2.5 seconds');
                console.log('[TEST] Hourly logs will show simulated time (00:00, 01:00, 02:00, etc.)');
                console.log('[TEST] ⚠️  SIMULATION DATA ONLY - No Supabase sync during simulation');
                
                // Generate unique session ID for this acceleration
                const sessionId = Math.random().toString(36).substring(7);
                console.log(`[TEST] Session ID: ${sessionId}`);
                
                // Reset to midnight (00:00) to start the day
                setSimulatedTime('00:00');
                setUseSimulatedTime(true);
                
                // Show acceleration timer
                console.log('[TEST] 🎬 Setting timeAccelerationActive to true...');
                setTimeAccelerationActive(true);
                setTimeAccelerationProgress(0);
                console.log('[TEST] 🎬 Timer overlay should now be visible');
                
                const interval = setInterval(() => {
                  try {
                    const store = useQuillbyStore.getState();
                    const { userData, updateEnergy } = store;
                    
                    // Calculate current simulated time (starting from 00:00)
                    const totalMinutes = accelerationCount;
                    const currentHour = Math.floor(totalMinutes / 60) % 24;
                    const currentMinute = totalMinutes % 60;
                    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
                    setSimulatedTime(timeString);
                    
                    // Determine current day phase
                    let dayPhase = '';
                    let phaseEmoji = '';
                    if (currentHour >= 0 && currentHour < 6) {
                      dayPhase = 'Night';
                      phaseEmoji = '🌙';
                    } else if (currentHour >= 6 && currentHour < 12) {
                      dayPhase = 'Morning';
                      phaseEmoji = '🌅';
                    } else if (currentHour >= 12 && currentHour < 18) {
                      dayPhase = 'Afternoon';
                      phaseEmoji = '☀️';
                    } else {
                      dayPhase = 'Evening';
                      phaseEmoji = '🌆';
                    }
                    
                    // Advance time by 1 minute each tick
                    const millisecondsToAdvance = minutesPerTick * 60 * 1000;
                    
                    // Update timestamp to simulate time passing
                    const currentTime = Date.now();
                    const newLastActiveTime = currentTime - millisecondsToAdvance;
                    
                    useQuillbyStore.setState({
                      userData: {
                        ...userData,
                        lastActiveTimestamp: newLastActiveTime
                      }
                    });
                    
                    // Force energy update to apply any time-based changes (without database sync during simulation)
                    updateEnergy();
                    
                    // Simulate realistic daily behavior to test mess accumulation
                    if (accelerationCount > 0) {
                      // Sleep time (00:00 - 06:00) - no missed tasks
                      if (currentHour >= 0 && currentHour < 6) {
                        // No activity during sleep
                      }
                      // Morning routine (06:00 - 09:00)
                      else if (currentHour >= 6 && currentHour < 9) {
                        if (currentHour === 7 && currentMinute === 30) { // Miss breakfast
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed breakfast - added mess`);
                        }
                        if (currentHour === 8 && currentMinute === 0) { // Miss morning water
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed morning hydration - added mess`);
                        }
                      }
                      // Work/Study time (09:00 - 17:00)
                      else if (currentHour >= 9 && currentHour < 17) {
                        // Miss study sessions every 2 hours during work time
                        if (currentMinute === 0 && currentHour % 2 === 1) {
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed study session - added mess`);
                        }
                        // Miss water every 2 hours
                        if (currentMinute === 30 && currentHour % 2 === 0) {
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed hydration break - added mess`);
                        }
                        // Miss lunch
                        if (currentHour === 12 && currentMinute === 30) {
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed lunch - added mess`);
                        }
                      }
                      // Evening time (17:00 - 22:00)
                      else if (currentHour >= 17 && currentHour < 22) {
                        if (currentHour === 18 && currentMinute === 30) { // Miss dinner
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed dinner - added mess`);
                        }
                        if (currentHour === 20 && currentMinute === 0) { // Miss evening study
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed evening study - added mess`);
                        }
                      }
                      // Late night (22:00 - 00:00)
                      else if (currentHour >= 22) {
                        if (currentHour === 23 && currentMinute === 0) { // Miss late water
                          // Simulate skipTask without database sync
                          const currentUserData = useQuillbyStore.getState().userData;
                          useQuillbyStore.setState({
                            userData: {
                              ...currentUserData,
                              messPoints: currentUserData.messPoints + 1
                            }
                          });
                          console.log(`[TEST] [${sessionId}] ${timeString} (${dayPhase}) - Missed late hydration - added mess`);
                        }
                      }
                    }
                    
                    accelerationCount++;
                    const progressPercent = (accelerationCount / maxAccelerations) * 100;
                    
                    // Update progress
                    setTimeAccelerationProgress(progressPercent);
                    
                    // Log progress every hour (60 ticks) with day phase info
                    if (accelerationCount % 60 === 0) {
                      console.log(`[TEST] [${sessionId}] === ${timeString} - ${phaseEmoji} ${dayPhase} Phase Complete ===`);
                      console.log(`[TEST] [${sessionId}] Real Progress: ${progressPercent.toFixed(1)}% (${(accelerationCount / 60).toFixed(0)} hours simulated)`);
                      console.log(`[TEST] [${sessionId}] Energy: ${Math.round(userData.energy)}/${userData.maxEnergyCap}`);
                      console.log(`[TEST] [${sessionId}] Mess Points: ${userData.messPoints.toFixed(1)}`);
                      
                      // Log room state
                      const messPoints = userData.messPoints;
                      let roomState = 'clean';
                      if (messPoints > 20) roomState = 'disaster';
                      else if (messPoints > 10) roomState = 'dirty';
                      else if (messPoints > 5) roomState = 'messy';
                      console.log(`[TEST] [${sessionId}] Room State: ${roomState}`);
                      
                      // Log habit status
                      console.log(`[TEST] [${sessionId}] Water: ${userData.waterGlasses}/8, Meals: ${userData.mealsLogged}/${userData.mealGoalCount || 3}`);
                      console.log(`[TEST] [${sessionId}] Study Minutes: ${userData.studyMinutesToday || 0}, Q-Coins: ${userData.qCoins}`);
                      console.log(`[TEST] [${sessionId}] =====================================`);
                    }
                    
                    // Log phase transitions with expected behaviors
                    if (currentMinute === 0 && (currentHour === 6 || currentHour === 12 || currentHour === 18 || currentHour === 22)) {
                      console.log(`[TEST] [${sessionId}] 🔄 PHASE TRANSITION: Now entering ${phaseEmoji} ${dayPhase} phase at ${timeString}`);
                      
                      // Log expected behaviors for each phase
                      if (currentHour === 6) {
                        console.log(`[TEST] [${sessionId}] 📋 Morning Phase - Expect: Wake up messages, breakfast reminders, morning energy`);
                      } else if (currentHour === 12) {
                        console.log(`[TEST] [${sessionId}] 📋 Afternoon Phase - Expect: Lunch reminders, study focus, midday energy`);
                      } else if (currentHour === 18) {
                        console.log(`[TEST] [${sessionId}] 📋 Evening Phase - Expect: Dinner time, evening study, winding down`);
                      } else if (currentHour === 22) {
                        console.log(`[TEST] [${sessionId}] 📋 Night Phase - Expect: Sleep preparation, low energy, rest messages`);
                      }
                    }
                    
                    // Log special time-based events and message changes
                    if (currentMinute === 0) {
                      if (currentHour === 0) {
                        console.log('[TEST] 🌙 MIDNIGHT - Daily reset should occur, new day begins');
                        console.log('[TEST] 💬 Message: "Midnight! New day begins! Getting sleepy..."');
                        
                        // Trigger daily reset to evaluate the previous day
                        const { resetDay } = useQuillbyStore.getState();
                        resetDay();
                        console.log('[TEST] 📊 Daily evaluation completed - check for disappointed messages');
                        
                      } else if (currentHour === 6) {
                        console.log('[TEST] 🌅 MORNING - Wake up time');
                        console.log('[TEST] 💬 Message: "Good morning! Just woke up! Ready for fresh start!"');
                      } else if (currentHour === 7) {
                        console.log('[TEST] �️ BREAKFAST TIME - Morning meal messages expected');
                        console.log('[TEST] 💬 Message: "Breakfast time! Hungry! Time for morning fuel!"');
                      } else if (currentHour === 12) {
                        console.log('[TEST] 🥪 LUNCH TIME - Midday meal messages expected');
                        console.log('[TEST] 💬 Message: "Lunch time! Needs midday fuel! Time for break!"');
                      } else if (currentHour === 18) {
                        console.log('[TEST] 🍽️ DINNER TIME - Evening meal messages expected');
                        console.log('[TEST] 💬 Message: "Dinner time! Ready for evening meal!"');
                      } else if (currentHour === 22) {
                        console.log('[TEST] 😴 BEDTIME - Sleep preparation messages expected');
                        console.log('[TEST] 💬 Message: "Getting late! Feeling sleepy... bedtime soon!"');
                      }
                    }
                    
                    // Log message changes at key times
                    if (currentMinute === 30) {
                      if (currentHour === 5) {
                        console.log('[TEST] 💬 Message: "Almost dawn! Stirring... morning coming!"');
                      } else if (currentHour === 8) {
                        console.log('[TEST] 💬 Message: "Morning energy! Fresh and ready to learn!"');
                      } else if (currentHour === 13) {
                        console.log('[TEST] 💬 Message: "Afternoon focus! Peak productivity mode!"');
                      } else if (currentHour === 19) {
                        console.log('[TEST] 💬 Message: "Evening relaxation! Winding down... peaceful vibes!"');
                      }
                    }
                    
                    // Stop after 24 hours
                    if (accelerationCount >= maxAccelerations) {
                      // Before stopping, show what should happen at 23:59
                      console.log(`[TEST] [${sessionId}] 🕚 23:59 - END OF DAY EVALUATION:`);
                      console.log(`[TEST] [${sessionId}] Study: ${userData.studyMinutesToday || 0} minutes (${((userData.studyMinutesToday || 0) / 60).toFixed(1)} hours)`);
                      console.log(`[TEST] [${sessionId}] Water: ${userData.waterGlasses}/${userData.hydrationGoalGlasses || 8} glasses`);
                      console.log(`[TEST] [${sessionId}] Meals: ${userData.mealsLogged}/${userData.mealGoalCount || 3} meals`);
                      console.log(`[TEST] [${sessionId}] Missed Checkpoints: ${userData.missedCheckpoints || 0}`);
                      
                      const studyHours = (userData.studyMinutesToday || 0) / 60;
                      if (studyHours === 0) {
                        console.log(`[TEST] [${sessionId}] 😔 TERRIBLE DAY DETECTED - No studying at all!`);
                        console.log(`[TEST] [${sessionId}] Expected message: "😔 We didn't study together today... I missed having you focus with me. Tomorrow will be better, right?"`);
                        console.log(`[TEST] [${sessionId}] Expected consequences: Streak Lost: -1 day, No Q-Coins earned today`);
                      } else if (studyHours < ((userData.studyGoalHours || 3) * 0.3)) {
                        console.log(`[TEST] [${sessionId}] 😟 BAD DAY DETECTED - Poor study and habits!`);
                        console.log(`[TEST] [${sessionId}] Expected message: "😟 Yesterday was rough... Are you okay? This isn't like you..."`);
                        console.log(`[TEST] [${sessionId}] Expected consequences: Streak Lost: -1 day, -10 Q-Coins penalty`);
                      }
                      
                      clearInterval(interval);
                      setTimeAccelerationActive(false);
                      setTimeAccelerationProgress(0);
                      setAccelerationInterval(null);
                      setSimulatedTime('00:00');
                      setUseSimulatedTime(false);
                      
                      // RESTORE REAL USER DATA after simulation
                      const restored = safeRestoreUserData();
                      if (restored) {
                        console.log(`[TEST] [${sessionId}] Real user data is unchanged - simulation was LOCAL ONLY`);
                      }
                      
                      console.log(`[TEST] [${sessionId}] 🎉 FULL DAY COMPLETE - 24 hours simulated from 00:00 to 23:59`);
                      console.log(`[TEST] [${sessionId}] Simulation stats - Energy: ${Math.round(userData.energy)}, Mess: ${userData.messPoints.toFixed(1)} (SIMULATION ONLY)`);
                      console.log(`[TEST] [${sessionId}] You have seen: Night → Morning → Afternoon → Evening → Night phases`);
                      console.log(`[TEST] [${sessionId}] ✅ Real user data preserved and restored`);
                    }
                  } catch (error) {
                    console.error(`[TEST] [${sessionId}] Time acceleration error:`, error);
                    clearInterval(interval);
                    setTimeAccelerationActive(false);
                    setTimeAccelerationProgress(0);
                    setAccelerationInterval(null);
                    setSimulatedTime('00:00');
                    setUseSimulatedTime(false);
                    
                    // RESTORE REAL USER DATA on error
                    const restored = safeRestoreUserData();
                    if (restored) {
                      console.log(`[TEST] [${sessionId}] 🔄 RESTORED real user data after error`);
                    }
                  }
                }, tickInterval);
                
                // Store interval reference for manual stopping
                setAccelerationInterval(interval);
              };
              
              startTimeAcceleration();
              }, 100); // End setTimeout - wait 100ms after cleanup
            }}
          >
            <Text style={styles.testButtonText}>
              {timeAccelerationActive ? '⏳ Running...' : '🌅 Full Day Cycle (1hr)'}
            </Text>
            <Text style={styles.testButtonSubtext}>
              {timeAccelerationActive ? 'Check timer above' : 'LOCAL SIMULATION ONLY - Real data preserved'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* SPACER - Allow more scrolling space */}
        <View style={styles.contentSpacer} />
      </ScrollView>
      
      {/* Dim Overlay when sleeping */}
      {isSleeping && (
        <View style={styles.dimOverlay} pointerEvents="none" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  // Speech bubble container - now in top area (where energy bar was)
  speechBubbleContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 450) / 852, // Slightly higher than energy bar was
    left: (SCREEN_WIDTH * 17) / 393,  // Align with original speech bubble positioning
    width: (SCREEN_WIDTH * 355) / 393, // Match speech bubble width
    zIndex: 20,
  },
  // Scrollable content area - inside orange theme background, below floor
  scrollableContent: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 580) / 852, // Start below floor.png (floor ends at ~575)
    left: 0,
    right: 0,
    bottom: 30, // Small padding from bottom edge
    zIndex: 15,
  },
  scrollContentContainer: {
    paddingHorizontal: (SCREEN_WIDTH * 17) / 393,
    paddingBottom: 20,
    flexGrow: 1,
  },
  contentSpacer: {
    flex: 1, // Pushes study section to top, allows scrolling
    minHeight: 50, // Minimum space for scrolling
  },
  // Scrollable energy bar container - first in scroll area
  scrollableEnergyBarContainer: {
    width: (SCREEN_WIDTH * 251) / 280,
    height: (SCREEN_HEIGHT * 25) / 852,
    marginBottom: 70, // Reduced space before buttons
    alignSelf: 'center',
  },
  // Buttons row - relative within bottom area
  buttonsRow: {
    width: (SCREEN_WIDTH * 355) / 393,
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 6) / 393, // Same gap as original
  },
  // Scrollable buttons row - inside scroll area
  scrollableButtonsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 6) / 393,
    marginBottom: 20, // Space before study section
    alignSelf: 'center',
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 8,
  },

  // Cleaning tap overlay - only when cleaning
  cleaningTapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 15, // Above room layers (1-10) but below hamster (10) and UI (20+)
    backgroundColor: 'transparent',
  },
  // Cleaning progress display
  cleaningProgress: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    zIndex: 100,
    minWidth: 150,
  },
  cleaningProgressTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cleaningProgressText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 3,
  },
  cleaningProgressTaps: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  cleaningProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cleaningProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  cleaningProgressHint: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cleaningProgressMess: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 10,
    color: '#FF5722',
    textAlign: 'center',
    marginTop: 3,
  },
  // Finish cleaning button
  finishCleaningButton: {
    flex: 1,
    paddingVertical: (SCREEN_WIDTH * 12) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 8) / 393,
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: (SCREEN_WIDTH * 50) / 393,
    borderWidth: 2,
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  finishCleaningButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: (SCREEN_WIDTH * 16) / 393,
  },
  // Study section - side by side layout in scrollable area
  studySection: {
    flexDirection: 'row',
    width: '100%', // Full width within scroll container
    marginBottom: 15,
    gap: (SCREEN_WIDTH * 10) / 393, // Space between button and progress
    alignItems: 'stretch', // Make both components same height
    alignSelf: 'center', // Center within scroll container
  },
  studyProgressContainer: {
    flex: 1, // Equal space with button
  },
  // Focus session button - equal size with progress
  focusSessionButton: {
    backgroundColor: '#1976D2',
    paddingVertical: (SCREEN_WIDTH * 12) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 16) / 393,
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D47A1',
    flex: 0.5, // Equal space with progress container
  },
  focusSessionButtonDisabled: {
    backgroundColor: '#BDBDBD',
    borderColor: '#9E9E9E',
  },
  focusSessionButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393, // Slightly smaller for compact layout
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  focusSessionButtonTextDisabled: {
    color: '#757575',
  },
  focusSessionButtonSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 10) / 393, // Smaller subtext for compact layout
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  // Today's deadline section
  todaysDeadlineSection: {
    width: '100%',
    marginBottom: 15,
    alignSelf: 'center',
  },
  
  todaysDeadlineTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  todaysDeadlineCard: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9800',
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    padding: (SCREEN_WIDTH * 12) / 393,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  todaysDeadlineHeader: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#E65100',
    marginBottom: 4,
  },
  
  todaysDeadlineDate: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#FF6F00',
    marginBottom: 4,
  },
  
  todaysDeadlineProgress: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#333',
    marginBottom: 4,
  },
  
  todaysDeadlineGoal: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#1976D2',
  },
  
  // Test Button Section (Temporary)
  testButtonSection: {
    width: '100%',
    marginBottom: 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    padding: (SCREEN_WIDTH * 12) / 393,
  },
  
  testButtonTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#F57C00',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  testButtonRow: {
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 8) / 393,
    marginBottom: 8,
  },
  
  testButton: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFC107',
    borderRadius: (SCREEN_WIDTH * 8) / 393,
    paddingVertical: (SCREEN_WIDTH * 8) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 6) / 393,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  testButtonWide: {
    width: '100%',
    flex: 0,
  },
  
  testButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
  },
  
  testButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 11) / 393,
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 2,
  },
  
  testButtonSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 9) / 393,
    color: '#FF8F00',
    textAlign: 'center',
  },
  
  // Exercise Timer Overlay
  exerciseTimerContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 80) / 852, // Position below "Quill's Room" text
    left: (SCREEN_WIDTH * 20) / 393,
    right: (SCREEN_WIDTH * 20) / 393,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    zIndex: 15,
  },
  exerciseTimerLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  exerciseTimerValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 28) / 393,
    color: '#FFF',
    letterSpacing: 2,
  },

  // Sleep Timer Overlay
  sleepTimerContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 80) / 852, // Position below "Quill's Room" text
    left: (SCREEN_WIDTH * 20) / 393,
    right: (SCREEN_WIDTH * 20) / 393,
    backgroundColor: 'rgba(126, 87, 194, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    zIndex: 15,
  },
  sleepTimerLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  sleepTimerValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 28) / 393,
    color: '#FFF',
    letterSpacing: 2,
  },

  // Time Acceleration Overlay
  timeAccelerationOverlay: {
    position: 'absolute',
    top: 50, // Move higher up to avoid conflicts
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.98)', // More opaque
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 4, // Thicker border
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, // Stronger shadow
    shadowRadius: 8,
    elevation: 999, // Very high z-index
    alignItems: 'center',
    zIndex: 999, // Very high z-index
  },
  timeAccelerationTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 18) / 393,
    color: '#FFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeAccelerationSubtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#FFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  simulatedTimeContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
  },
  simulatedTimeLabel: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#FFF',
    marginBottom: 5,
  },
  simulatedTimeValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 32) / 393,
    color: '#FFF',
    letterSpacing: 3,
    marginBottom: 5,
  },
  dayPhaseText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#FFF',
  },
  timeAccelerationProgressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  timeAccelerationProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timeAccelerationProgressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  timeAccelerationProgressText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#FFF',
    textAlign: 'center',
  },
  timeAccelerationTime: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: (SCREEN_WIDTH * 16) / 393,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  stopAccelerationButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  stopAccelerationButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#FFF',
    textAlign: 'center',
  },
});