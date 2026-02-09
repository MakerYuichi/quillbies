import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../../state/store-modular';
import { calculateFocusEnergyCost } from '../../core/engine';

// Import custom hooks
import { useWaterTracking } from '../../hooks/useWaterTracking';
import { useSleepTracking } from '../../hooks/useSleepTracking';
import { useMealTracking } from '../../hooks/useMealTracking';
import { useExerciseTracking } from '../../hooks/useExerciseTracking';
import { useRandomReminders } from '../../hooks/useRandomReminders';
import { useIdleMessages } from '../../hooks/useIdleMessages';
import { useTimeBasedHabitFeedback } from '../../hooks/useTimeBasedHabitFeedback';
import { useFirstTimeWelcome } from '../../hooks/useFirstTimeWelcome';
import { useDayEvaluationMessages } from '../../hooks/useDayEvaluationMessages';
import { useNotifications } from '../../hooks/useNotifications';

// Import components
import HomeBackground from './HomeBackground';
import HomeHamsterSection from './HomeHamsterSection';
import HomeHabitsSection from './HomeHabitsSection';
import HomeStudySection from './HomeStudySection';
import HomeNotifications from './HomeNotifications';
import HomeDebugSection from './HomeDebugSection';
import SessionCustomizationModal, { SessionConfig } from '../modals/SessionCustomizationModal';
import ExerciseCustomizationModal from '../modals/ExerciseCustomizationModal';
import SleepCustomizationModal from '../modals/SleepCustomizationModal';

export default function HomeScreenContent() {
  const router = useRouter();
  
  // Store access with error handling
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
  
  const { userData, updateEnergy, startFocusSession } = storeData;
  
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

  // Debug userData
  console.log('[HomeScreen] UserData loaded:', {
    energy: userData.energy,
    enabledHabits: userData.enabledHabits,
    studyEnabled: userData.enabledHabits?.includes('study'),
    onboardingCompleted: userData.onboardingCompleted
  });

  // Memoized values
  const { buddyName, selectedCharacter } = useMemo(() => ({
    buddyName: userData.buddyName || 'Quillby',
    selectedCharacter: userData.selectedCharacter || 'casual'
  }), [userData.buddyName, userData.selectedCharacter]);

  // State management
  const [showSessionModal, setShowSessionModal] = React.useState(false);
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [showSleepModal, setShowSleepModal] = React.useState(false);

  // Custom hooks for habit tracking
  const waterTracking = useWaterTracking(buddyName);
  const sleepTracking = useSleepTracking(buddyName);
  const mealTracking = useMealTracking(buddyName);
  const exerciseTracking = useExerciseTracking(buddyName);
  const randomReminders = useRandomReminders(buddyName);
  const idleMessages = useIdleMessages(buddyName);
  const timeBasedFeedback = useTimeBasedHabitFeedback(buddyName);
  const firstTimeWelcome = useFirstTimeWelcome(userData.userName || 'Friend', buddyName, userData.onboardingCompleted || false);
  const dayEvaluation = useDayEvaluationMessages(buddyName);
  const notifications = useNotifications();

  // Focus session handlers
  const handleStartFocusSession = () => {
    const energyNeeded = calculateFocusEnergyCost(userData);
    if (userData.energy < energyNeeded) {
      Alert.alert(
        'Not Enough Energy',
        `You need ${energyNeeded} energy to start a focus session. Current energy: ${Math.round(userData.energy)}`,
        [{ text: 'OK' }]
      );
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

  // Exercise handlers
  const handleExerciseStart = (duration: number | null, type: 'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom') => {
    exerciseTracking.handleStartExercise(type, duration);
  };

  // Sleep handlers
  const handleSleepStart = (duration: number | null) => {
    sleepTracking.handleSleepButton(duration);
  };

  // Update energy periodically
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        updateEnergy();
      } catch (error) {
        console.error('[HomeScreen] Error updating energy:', error);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [updateEnergy]);

  return (
    <View style={styles.backgroundContainer}>
      <HomeBackground>
        <HomeHamsterSection
          userData={userData}
          selectedCharacter={selectedCharacter}
          buddyName={buddyName}
          waterTracking={waterTracking}
          sleepTracking={sleepTracking}
          mealTracking={mealTracking}
          exerciseTracking={exerciseTracking}
          randomReminders={randomReminders}
          idleMessages={idleMessages}
          timeBasedFeedback={timeBasedFeedback}
          firstTimeWelcome={firstTimeWelcome}
          dayEvaluation={dayEvaluation}
        />
        
        <HomeHabitsSection
          userData={userData}
          waterTracking={waterTracking}
          sleepTracking={sleepTracking}
          mealTracking={mealTracking}
          exerciseTracking={exerciseTracking}
          onShowExerciseModal={() => setShowExerciseModal(true)}
          onShowSleepModal={() => setShowSleepModal(true)}
        />
        
        <HomeStudySection
          userData={userData}
          onStartFocusSession={handleStartFocusSession}
        />
        
        <HomeDebugSection userData={userData} />
        
        <HomeNotifications notifications={notifications} />
        
        {/* Session Customization Modal */}
        <SessionCustomizationModal
          visible={showSessionModal}
          onClose={() => setShowSessionModal(false)}
          onStartSession={handleSessionStart}
          isPremium={userData.purchasedItems?.includes('premium') || false}
        />
        
        {/* Exercise Modal */}
        <ExerciseCustomizationModal
          visible={showExerciseModal}
          onClose={() => setShowExerciseModal(false)}
          onStartExercise={handleExerciseStart}
        />
        
        {/* Sleep Modal */}
        <SleepCustomizationModal
          visible={showSleepModal}
          onClose={() => setShowSleepModal(false)}
          onStartSleep={handleSleepStart}
        />
      </HomeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#F5E6D3', // Fallback color similar to theme.png
  },
});