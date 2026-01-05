import React, { useEffect } from 'react';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { userData, updateEnergy, cleanRoom, addMissedCheckpoint, checkAndProcessCheckpoints, startFocusSession, getUrgentDeadlines, getUpcomingDeadlines } = useQuillbyStore();
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
  
  // Get personalized data from onboarding
  const buddyName = userData.buddyName || 'Quillby';
  const selectedCharacter = userData.selectedCharacter || 'casual';
  
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
  } = useFirstTimeWelcome(userData.userName, buddyName, userData.onboardingCompleted);

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

  const handleExerciseStart = (duration: number | null, type: 'walk' | 'stretch' | 'cardio' | 'energizer') => {
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
    const currentHour = new Date().getHours();
    
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
  
  // Debug log to see what animation is being calculated
  console.log('[HomeScreen] Animation Debug:', {
    currentAnimation,
    isShowingWelcome,
    allHabitsCompleted: areAllHabitsCompletedForCurrentTime(),
    sleepAnimation,
    exerciseAnimation,
    mealAnimation,
    waterAnimation
  });
  
  // Show the most recent message (highest timestamp)
  const getDefaultWelcomeMessage = () => {
    const currentHour = new Date().getHours();
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
  
  // Find the most recent message among all features
  const messages = [
    { text: waterMessage, timestamp: waterMessageTimestamp, priority: 5 }, // Action messages (highest)
    { text: sleepMessage, timestamp: sleepMessageTimestamp, priority: 5 },
    { text: mealMessage, timestamp: mealMessageTimestamp, priority: 5 },
    { text: exerciseMessage, timestamp: exerciseMessageTimestamp, priority: 5 },
    { text: welcomeMessage, timestamp: welcomeTimestamp, priority: 4 }, // First-time welcome
    { text: feedbackMessage, timestamp: feedbackTimestamp, priority: 3 }, // Time-based concerns
    { text: reminderMessage, timestamp: reminderTimestamp, priority: 2 }, // Reminders
    { text: idleMessage, timestamp: idleTimestamp, priority: 1 }, // Idle messages (lowest priority)
  ].filter(msg => msg.text); // Only messages that exist
  
  if (messages.length > 0) {
    // Sort by priority first, then by timestamp
    const mostRecent = messages.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return b.timestamp - a.timestamp; // Then most recent
    })[0];
    hamsterMessage = mostRecent.text;
  }
  
  // Update energy periodically (just caps it, no drain)
  useEffect(() => {
    const interval = setInterval(() => {
      updateEnergy();
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [updateEnergy]);

  // Check study checkpoints periodically (every 5 minutes)
  useEffect(() => {
    if (!userData.enabledHabits?.includes('study') || !userData.studyGoalHours) return;
    
    const checkpointInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheckpointCheck;
      
      // Only check every 5 minutes to avoid spam
      if (timeSinceLastCheck >= 5 * 60 * 1000) {
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
    }, 60000); // Check every minute, but only process every 5 minutes
    
    return () => clearInterval(checkpointInterval);
  }, [userData.enabledHabits, userData.studyGoalHours, lastCheckpointCheck, checkAndProcessCheckpoints]);

  // Daily reset automation (check at midnight)
  useEffect(() => {
    const dailyResetInterval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Check if it's midnight (00:00)
      if (currentHour === 0 && currentMinute === 0) {
        console.log('[Daily] Midnight reached - applying daily reset');
        const { resetDay } = useQuillbyStore.getState();
        resetDay();
      }
    }, 60000); // Check every minute
    
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
                // Force daily reset to test mess points energy drain
                const { resetDay } = useQuillbyStore.getState();
                resetDay();
                console.log('[TEST] Daily reset triggered - check energy drain from mess points');
              }}
            >
              <Text style={styles.testButtonText}>⏰ Force Daily Reset</Text>
              <Text style={styles.testButtonSubtext}>Test energy drain</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => {
                // Add mess points for testing
                const { skipTask } = useQuillbyStore.getState();
                for (let i = 0; i < 5; i++) {
                  skipTask();
                }
                console.log('[TEST] Added 5 mess points - check room visuals and energy drain');
              }}
            >
              <Text style={styles.testButtonText}>🗑️ Add 5 Mess</Text>
              <Text style={styles.testButtonSubtext}>Test mess system</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonWide]}
            onPress={() => {
              // Start 10x time acceleration
              const startTimeAcceleration = () => {
                let accelerationCount = 0;
                const maxAccelerations = 144; // 144 * 10 minutes = 24 hours
                
                const accelerationInterval = setInterval(() => {
                  const { userData, updateEnergy } = useQuillbyStore.getState();
                  
                  // Advance time by 10 minutes each tick (10x speed)
                  const minutesToAdvance = 10;
                  const millisecondsToAdvance = minutesToAdvance * 60 * 1000;
                  
                  // Update timestamp to simulate time passing
                  useQuillbyStore.setState({
                    userData: {
                      ...userData,
                      lastActiveTimestamp: userData.lastActiveTimestamp - millisecondsToAdvance
                    }
                  });
                  
                  // Force energy update to apply any time-based changes
                  updateEnergy();
                  
                  accelerationCount++;
                  
                  // Log progress every hour (6 ticks)
                  if (accelerationCount % 6 === 0) {
                    const hoursAdvanced = (accelerationCount * 10) / 60;
                    console.log(`[TEST] Time acceleration: ${hoursAdvanced.toFixed(1)} hours advanced`);
                  }
                  
                  // Stop after 24 hours
                  if (accelerationCount >= maxAccelerations) {
                    clearInterval(accelerationInterval);
                    console.log('[TEST] Time acceleration complete - 24 hours simulated');
                  }
                }, 100); // Update every 100ms for smooth acceleration
                
                console.log('[TEST] Starting 10x time acceleration - will simulate 24 hours in ~14 seconds');
              };
              
              startTimeAcceleration();
            }}
          >
            <Text style={styles.testButtonText}>⚡ 10x Time Speed (24h)</Text>
            <Text style={styles.testButtonSubtext}>Accelerate time to test daily systems</Text>
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
      />

      {/* Exercise Customization Modal */}
      <ExerciseCustomizationModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onStartExercise={handleExerciseStart}
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
});
