import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, Text, ScrollView } from 'react-native';
import { CleaningPlan, CleaningStage } from '../core/types';
import { useRouter } from 'expo-router';

import { useQuillbyStore } from '../state/store';
import EnergyBar from '../components/EnergyBar';
import RoomLayers from '../components/RoomLayers';
import ExerciseEnvironment from '../components/ExerciseEnvironment';
import HamsterCharacter from '../components/HamsterCharacter';
import SpeechBubble from '../components/SpeechBubble';
import WaterButton from '../components/WaterButton';
import SleepButton from '../components/SleepButton';
import MealButton from '../components/MealButton';
import ExerciseButton from '../components/ExerciseButton';
import CleanButton from '../components/CleanButton';
import StudyProgress from '../components/StudyProgress';
import NotificationBanner from '../components/NotificationBanner';
import RealTimeClock from '../components/RealTimeClock';
import { useNotifications } from '../hooks/useNotifications';
import { useWaterTracking } from '../hooks/useWaterTracking';
import { useSleepTracking } from '../hooks/useSleepTracking';
import { useMealTracking } from '../hooks/useMealTracking';
import { useExerciseTracking } from '../hooks/useExerciseTracking';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { userData, updateEnergy, cleanRoom, addMissedCheckpoint, checkAndProcessCheckpoints, startFocusSession } = useQuillbyStore();
  const [isCleaning, setIsCleaning] = React.useState(false);
  const [cleaningStage, setCleaningStage] = React.useState(1);
  const [cleaningTaps, setCleaningTaps] = React.useState(0);
  const [tapsNeeded, setTapsNeeded] = React.useState(10);
  const [totalStages, setTotalStages] = React.useState(1);
  const [cleaningPlan, setCleaningPlan] = React.useState<CleaningPlan | null>(null);
  const [lastCheckpointCheck, setLastCheckpointCheck] = React.useState(Date.now());
  
  // Notification system
  const { notifications, dismissNotification } = useNotifications();
  
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
    handleStartExercise,
    handleFinishExercise,
    exerciseAnimation,
    exerciseMessage,
    exerciseMessageTimestamp,
  } = useExerciseTracking(buddyName);

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

  // TEMPORARY TEST FUNCTIONS - Remove after testing
  const addTestMess = () => {
    addMissedCheckpoint(); // Adds 5 mess points
  };

  const testDailyReset = () => {
    const { resetDay, generateDailySummary } = useQuillbyStore.getState();
    const summary = generateDailySummary();
    console.log('[Test] Daily Summary:', summary);
    resetDay();
  };

  // Handle focus session start
  const handleStartFocusSession = () => {
    const success = startFocusSession();
    if (success) {
      router.push('/study-session');
    }
  };
  
  // Determine current animation based on priority: sleep > exercise > meal > water
  const currentAnimation = sleepAnimation !== 'idle' ? sleepAnimation : 
                          (exerciseAnimation !== 'idle' ? exerciseAnimation : 
                          (mealAnimation !== 'idle' ? mealAnimation : waterAnimation));
  
  // Show the most recent message (highest timestamp)
  let hamsterMessage = `Hi ${buddyName}! 👋\nLet's have a productive day!`;
  
  // Find the most recent message among all features
  const messages = [
    { text: waterMessage, timestamp: waterMessageTimestamp },
    { text: sleepMessage, timestamp: sleepMessageTimestamp },
    { text: mealMessage, timestamp: mealMessageTimestamp },
    { text: exerciseMessage, timestamp: exerciseMessageTimestamp },
  ].filter(msg => msg.text); // Only messages that exist
  
  if (messages.length > 0) {
    // Sort by timestamp and get the most recent
    const mostRecent = messages.sort((a, b) => b.timestamp - a.timestamp)[0];
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
          const checkpointMessage = `⚠️ Study Checkpoint: ${result.checkpoint}!\n` +
                                   `Expected: ${result.expected.toFixed(1)}h, You: ${result.actual.toFixed(1)}h\n` +
                                   `Behind by ${result.missing.toFixed(1)}h - Room getting messier! 📚`;
          
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
      source={require('../../assets/backgrounds/orange-theme.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* FIXED BACKGROUND LAYERS - Switch between room and exercise environment */}
      {isExercising ? (
        <ExerciseEnvironment pointerEvents="none" />
      ) : (
        <RoomLayers pointerEvents="none" messPoints={userData.messPoints} isSleeping={isSleeping} qCoins={userData.qCoins} />
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
      
      {/* NOTIFICATIONS - Show above speech bubble */}
      {notifications.length > 0 && (
        <View style={styles.notificationsContainer} pointerEvents="box-none">
          {notifications.slice(0, 2).map(notification => (
            <NotificationBanner
              key={notification.id}
              notification={notification}
              onDismiss={dismissNotification}
            />
          ))}
        </View>
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

      {/* TEMPORARY TEST BUTTONS - Remove after testing */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={addTestMess}
      >
        <Text style={styles.testButtonText}>
          TEST: Add Mess (+1h)
        </Text>
        <Text style={styles.testButtonSubtext}>
          Mess: {userData.messPoints.toFixed(1)} | Cap: {userData.maxEnergyCap}
        </Text>
        <Text style={styles.testButtonSubtext}>
          Room: {userData.messPoints <= 5 ? 'Clean' : 
                 userData.messPoints <= 10 ? 'Light Mess' :
                 userData.messPoints <= 20 ? 'Medium Mess' : 'Heavy Mess'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.testButton, { top: 120, backgroundColor: 'rgba(0, 150, 0, 0.8)' }]}
        onPress={testDailyReset}
      >
        <Text style={styles.testButtonText}>
          TEST: Daily Reset
        </Text>
        <Text style={styles.testButtonSubtext}>
          Decay mess & reset day
        </Text>
      </TouchableOpacity>
      
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
                  onPress={handleDrinkWater}
                />
                
                {/* Meal Button - Only when NOT in any active mode */}
                <MealButton 
                  mealsLogged={mealsLogged}
                  portionDescription={portionDescription}
                  onPress={handleLogMeal}
                />
                
                {/* Exercise Button - Only when exercise habit is enabled */}
                {userData.enabledHabits?.includes('exercise') && (
                  <ExerciseButton 
                    isExercising={false}
                    exerciseDisplay={exerciseDisplay}
                    onStartExercise={() => handleStartExercise('walk')}
                    onFinishExercise={handleFinishExercise}
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
                  onSleep={handleSleepButton}
                  onWakeUp={handleWakeUpButton}
                />
              </>
            ) : isSleeping ? (
              <>
                {/* Wake Button - Full width when sleeping */}
                <SleepButton 
                  isSleeping={true}
                  sleepDisplay={sleepDisplay}
                  onSleep={handleSleepButton}
                  onWakeUp={handleWakeUpButton}
                />
              </>
            ) : isExercising ? (
              <>
                {/* Exercise Button - Full width when exercising */}
                <ExerciseButton 
                  isExercising={true}
                  exerciseDisplay={exerciseDisplay}
                  onStartExercise={() => handleStartExercise('walk')}
                  onFinishExercise={handleFinishExercise}
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
                  userData.energy < 20 && styles.focusSessionButtonDisabled
                ]}
                onPress={handleStartFocusSession}
                disabled={userData.energy < 20}
              >
                <Text style={[
                  styles.focusSessionButtonText,
                  userData.energy < 20 && styles.focusSessionButtonTextDisabled
                ]}>
                  {userData.energy >= 20 ? '📚 Focus' : '😴 Tired'}
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
        
        {/* SPACER - Allow more scrolling space */}
        <View style={styles.contentSpacer} />
      </ScrollView>
      
      {/* Dim Overlay when sleeping */}
      {isSleeping && (
        <View style={styles.dimOverlay} pointerEvents="none" />
      )}
      

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
  // TEMPORARY TEST STYLES - Remove after testing
  testButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 100,
  },
  testButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  testButtonSubtext: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 2,
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
  // Notifications container
  notificationsContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 50,
  },
});
