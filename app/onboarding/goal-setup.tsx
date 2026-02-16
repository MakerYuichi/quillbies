import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../state/store-modular';
import ScrollablePicker from '../components/ui/ScrollablePicker';
import { playTabSound, playUISubmitSound, soundManager } from '../../lib/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GoalSetupScreen() {
  const router = useRouter();
  const userData = useQuillbyStore((state) => state.userData);
  const setWeightGoal = useQuillbyStore((state) => state.setWeightGoal);
  const setStudyGoal = useQuillbyStore((state) => state.setStudyGoal);
  const setExerciseGoal = useQuillbyStore((state) => state.setExerciseGoal);
  const setHydrationGoal = useQuillbyStore((state) => state.setHydrationGoal);
  const setSleepGoal = useQuillbyStore((state) => state.setSleepGoal);
  const completeOnboarding = useQuillbyStore((state) => state.completeOnboarding);

  const enabledHabits = userData.enabledHabits || [];

  // Goal states with defaults
  const [weightGoal, setWeightGoalState] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  
  // Study goal - separate hours and minutes
  const [studyHours, setStudyHours] = useState<number>(3);
  const [studyMinutes, setStudyMinutes] = useState<number>(0);
  const [checkpoints, setCheckpoints] = useState<string[]>(['12 PM', '6 PM', '9 PM']);
  
  // Exercise goal - separate hours and minutes
  const [exerciseHours, setExerciseHours] = useState<number>(0);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(30);
  
  // Hydration goal
  const [hydrationGoalGlasses, setHydrationGoalGlasses] = useState<number>(8);
  
  // Sleep goal - separate hours and minutes
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepMinutes, setSleepMinutes] = useState<number>(0);

  // Picker modal states
  const [showPicker, setShowPicker] = useState<{
    type: 'studyHours' | 'studyMinutes' | 'exerciseHours' | 'exerciseMinutes' | 'sleepHours' | 'sleepMinutes' | 'hydration' | null;
  }>({ type: null });

  const [fontsLoaded] = useFonts({
    'Caviche': require('../../assets/fonts/Caviche-Regular.ttf'),
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  const toggleCheckpoint = (timeLabel: string) => {
    playTabSound();
    setCheckpoints(prev => 
      prev.includes(timeLabel) 
        ? prev.filter(t => t !== timeLabel)
        : [...prev, timeLabel].sort((a, b) => {
          const timeOrder = ['9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
          return timeOrder.indexOf(a) - timeOrder.indexOf(b);
        })
    );
  };

  const handleCompleteSetup = async () => {
    playUISubmitSound();
    
    // Stop onboarding music before transitioning to main app
    console.log('[Goal Setup] Stopping onboarding music...');
    soundManager.stopBackgroundMusic();
    
    // Save goals for enabled habits
    if (enabledHabits.includes('meals')) {
      setWeightGoal(weightGoal);
    }
    if (enabledHabits.includes('study')) {
      // Convert to total hours (e.g., 3.5 hours for 3hr 30min)
      const totalHours = studyHours + (studyMinutes / 60);
      setStudyGoal(totalHours, checkpoints);
    }
    if (enabledHabits.includes('exercise')) {
      // Convert to total minutes
      const totalMinutes = (exerciseHours * 60) + exerciseMinutes;
      setExerciseGoal(totalMinutes);
    }
    if (enabledHabits.includes('hydration')) {
      setHydrationGoal(hydrationGoalGlasses);
    }
    if (enabledHabits.includes('sleep')) {
      // Convert to total hours (e.g., 7.5 hours for 7hr 30min)
      const totalHours = sleepHours + (sleepMinutes / 60);
      setSleepGoal(totalHours);
    }

    console.log('[Onboarding] Goals saved, device auth will handle user creation automatically');

    // Navigate to tutorial instead of directly to main app
    console.log('[Onboarding] Navigating to tutorial');
    router.push('/onboarding/tutorial');
  };

  const CHECKPOINT_OPTIONS = [
    { label: '9 AM', description: 'Morning' },
    { label: '12 PM', description: 'Lunch' },
    { label: '3 PM', description: 'Afternoon' },
    { label: '6 PM', description: 'Evening' },
    { label: '9 PM', description: 'Night' },
  ];

  // Check if no habits need customization
  const hasGoalsToSet = enabledHabits.some(h => 
    ['meals', 'study', 'exercise', 'hydration', 'sleep'].includes(h)
  );

  if (!hasGoalsToSet) {
    // Skip this screen if no goals to set
    handleCompleteSetup();
    return null;
  }

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
      defaultSource={require('../../assets/backgrounds/theme.png')}
    >
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Set Your{'\n'}Goals</Text>
          <Text style={styles.subtitle}>
            Customize your targets for each habit
          </Text>
        </View>

        {/* Weight Goal - Meals */}
        {enabledHabits.includes('meals') && (
          <View style={styles.weightGoalCard}>
            <Text style={styles.cardTitle}>🍽️ Weight Goal</Text>
            <Text style={styles.cardSubtitle}>Affects meal portion sizes</Text>
            
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[styles.optionButton, weightGoal === 'lose' && styles.optionButtonSelected]}
                onPress={() => setWeightGoalState('lose')}
              >
                <Text style={[styles.optionText, weightGoal === 'lose' && styles.optionTextSelected]}>
                  📉 Lose
                </Text>
                {weightGoal === 'lose' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, weightGoal === 'maintain' && styles.optionButtonSelected]}
                onPress={() => setWeightGoalState('maintain')}
              >
                <Text style={[styles.optionText, weightGoal === 'maintain' && styles.optionTextSelected]}>
                  ⚖️ Maintain
                </Text>
                {weightGoal === 'maintain' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, weightGoal === 'gain' && styles.optionButtonSelected]}
                onPress={() => setWeightGoalState('gain')}
              >
                <Text style={[styles.optionText, weightGoal === 'gain' && styles.optionTextSelected]}>
                  📈 Gain
                </Text>
                {weightGoal === 'gain' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Study Goal */}
        {enabledHabits.includes('study') && (
          <View style={styles.studyGoalCard}>
            <Text style={styles.cardTitle}>📚 Study Goal</Text>
            <Text style={styles.cardSubtitle}>Daily study target</Text>
            
            {/* Time Input Row */}
            <View style={styles.timeInputRow}>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowPicker({ type: 'studyHours' })}
              >
                <Text style={styles.timeInputValue}>{studyHours}</Text>
                <Text style={styles.timeInputLabel}>hrs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowPicker({ type: 'studyMinutes' })}
              >
                <Text style={styles.timeInputValue}>{studyMinutes}</Text>
                <Text style={styles.timeInputLabel}>min</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Check-in times:</Text>
            <View style={styles.checkpointsGrid}>
              {CHECKPOINT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.checkpointButton, checkpoints.includes(option.label) && styles.optionButtonSelected]}
                  onPress={() => toggleCheckpoint(option.label)}
                >
                  <Text style={[styles.checkpointText, checkpoints.includes(option.label) && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {checkpoints.includes(option.label) && <Text style={styles.checkmarkSmall}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Exercise Goal */}
        {enabledHabits.includes('exercise') && (
          <View style={styles.exerciseGoalCard}>
            <Text style={styles.cardTitle}>🏃 Exercise Goal</Text>
            <Text style={styles.cardSubtitle}>Daily workout duration</Text>
            
            {/* Time Input Row */}
            <View style={styles.timeInputRow}>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowPicker({ type: 'exerciseHours' })}
              >
                <Text style={styles.timeInputValue}>{exerciseHours}</Text>
                <Text style={styles.timeInputLabel}>hrs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowPicker({ type: 'exerciseMinutes' })}
              >
                <Text style={styles.timeInputValue}>{exerciseMinutes}</Text>
                <Text style={styles.timeInputLabel}>min</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hydration Goal */}
        {enabledHabits.includes('hydration') && (
          <View style={styles.hydrationGoalCard}>
            <Text style={styles.cardTitle}>💧 Hydration Goal</Text>
            <Text style={styles.cardSubtitle}>Daily water intake</Text>
            
            {/* Glasses Input */}
            <View style={styles.timeInputRow}>
              <TouchableOpacity
                style={[styles.timeInput, { flex: 1 }]}
                onPress={() => setShowPicker({ type: 'hydration' })}
              >
                <Text style={styles.timeInputValue}>{hydrationGoalGlasses}</Text>
                <Text style={styles.timeInputLabel}>glasses</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sleep Goal */}
        {enabledHabits.includes('sleep') && (
          <View style={styles.sleepGoalCard}>
            <Text style={styles.cardTitle}>😴 Sleep Goal</Text>
            <Text style={styles.cardSubtitle}>Nightly sleep target</Text>
            
            {/* Time Input Row */}
            <View style={styles.timeInputRow}>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowPicker({ type: 'sleepHours' })}
              >
                <Text style={styles.timeInputValue}>{sleepHours}</Text>
                <Text style={styles.timeInputLabel}>hrs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowPicker({ type: 'sleepMinutes' })}
              >
                <Text style={styles.timeInputValue}>{sleepMinutes}</Text>
                <Text style={styles.timeInputLabel}>min</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.note}>
          💡 You can change these anytime in settings
        </Text>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteSetup}
        >
          <Text style={styles.completeButtonText}>Complete Setup 🎉</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Scrollable Pickers */}
      <ScrollablePicker
        visible={showPicker.type === 'studyHours'}
        onClose={() => setShowPicker({ type: null })}
        onSelect={(value) => {
          setStudyHours(value);
          setShowPicker({ type: null });
        }}
        selectedValue={studyHours}
        values={Array.from({ length: 13 }, (_, i) => i)} // 0-12 hours
        title="Study Hours"
      />

      <ScrollablePicker
        visible={showPicker.type === 'studyMinutes'}
        onClose={() => setShowPicker({ type: null })}
        onSelect={(value) => {
          setStudyMinutes(value);
          setShowPicker({ type: null });
        }}
        selectedValue={studyMinutes}
        values={Array.from({ length: 60 }, (_, i) => i)} // 0-59 minutes
        title="Study Minutes"
      />

      <ScrollablePicker
        visible={showPicker.type === 'exerciseHours'}
        onClose={() => setShowPicker({ type: null })}
        onSelect={(value) => {
          setExerciseHours(value);
          setShowPicker({ type: null });
        }}
        selectedValue={exerciseHours}
        values={Array.from({ length: 6 }, (_, i) => i)} // 0-5 hours
        title="Exercise Hours"
      />

      <ScrollablePicker
        visible={showPicker.type === 'exerciseMinutes'}
        onClose={() => setShowPicker({ type: null })}
        onSelect={(value) => {
          setExerciseMinutes(value);
          setShowPicker({ type: null });
        }}
        selectedValue={exerciseMinutes}
        values={Array.from({ length: 60 }, (_, i) => i)} // 0-59 minutes
        title="Exercise Minutes"
      />

      <ScrollablePicker
        visible={showPicker.type === 'sleepHours'}
        onClose={() => setShowPicker({ type: null })}
        onSelect={(value) => {
          setSleepHours(value);
          setShowPicker({ type: null });
        }}
        selectedValue={sleepHours}
        values={Array.from({ length: 9 }, (_, i) => i + 4)} // 4-12 hours
        title="Sleep Hours"
      />

      <ScrollablePicker
        visible={showPicker.type === 'sleepMinutes'}
        onClose={() => setShowPicker({ type: null })}
        onSelect={(value) => {
          setSleepMinutes(value);
          setShowPicker({ type: null });
        }}
        selectedValue={sleepMinutes}
        values={Array.from({ length: 60 }, (_, i) => i)} // 0-59 minutes
        title="Sleep Minutes"
      />

      <ScrollablePicker
        visible={showPicker.type === 'hydration'}
        onClose={() => setShowPicker({ type: null })}
        onSelect={(value) => {
          setHydrationGoalGlasses(value);
          setShowPicker({ type: null });
        }}
        selectedValue={hydrationGoalGlasses}
        values={Array.from({ length: 16 }, (_, i) => i + 1)} // 1-16 glasses
        title="Water Glasses"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.06,
    left: SCREEN_WIDTH * 0.05,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#63582A',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.08,
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  header: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  title: {
    fontFamily: 'Caviche',
    fontSize: SCREEN_WIDTH * 0.12,
    lineHeight: SCREEN_WIDTH * 0.13,
    color: '#63582A',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  subtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#666',
    textAlign: 'center',
  },
  // Card Styles
  weightGoalCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 14,
    padding: SCREEN_WIDTH * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  studyGoalCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 14,
    padding: SCREEN_WIDTH * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  exerciseGoalCard: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderRadius: 14,
    padding: SCREEN_WIDTH * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#FF5722',
  },
  hydrationGoalCard: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 14,
    padding: SCREEN_WIDTH * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  sleepGoalCard: {
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
    borderRadius: 14,
    padding: SCREEN_WIDTH * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#673AB7',
  },
  cardTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  cardSubtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.028,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  // Options Layout
  optionsRow: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
  },
  optionsColumn: {
    gap: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.025,
    alignItems: 'center',
    position: 'relative',
  },
  optionButtonWide: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.03,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#2E7D32',
  },
  optionSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.028,
    color: '#999',
  },
  optionSubtextSelected: {
    color: '#4CAF50',
  },
  checkmark: {
    position: 'absolute',
    top: SCREEN_WIDTH * 0.01,
    right: SCREEN_WIDTH * 0.01,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Checkpoints
  sectionLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.008,
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  checkpointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH * 0.02,
  },
  checkpointButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.02,
    width: '48%',
    alignItems: 'center',
    position: 'relative',
  },
  checkpointText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
  },
  checkmarkSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  note: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: SCREEN_HEIGHT * 0.022,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.05,
  },
  // Time Input Styles
  timeInputRow: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingVertical: SCREEN_HEIGHT * 0.012,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  timeInputValue: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#4CAF50',
  },
  timeInputLabel: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
  },
});
