import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../state/store';

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Habit options
const HABIT_OPTIONS = [
  {
    id: 'study',
    title: 'Study Focus & Accountability',
    description: 'Pomodoro sessions, distraction tracking, goal setting',
    icon: '📚',
    enabledByDefault: true,
  },
  {
    id: 'meals',
    title: 'Meal Reminders',
    description: 'Gentle reminders to eat breakfast, lunch, dinner',
    icon: '🍎',
    enabledByDefault: false,
  },
  {
    id: 'hydration',
    title: 'Hydration Tracking',
    description: 'Log water intake, get reminders to drink',
    icon: '💧',
    enabledByDefault: false,
  },
  {
    id: 'sleep',
    title: 'Sleep Schedule',
    description: 'Bedtime reminders, sleep logging, consistency tracking',
    icon: '😴',
    enabledByDefault: false,
  },
  {
    id: 'exercise',
    title: 'Exercise Motivation',
    description: 'Workout reminders, activity logging, streak building',
    icon: '🏃',
    enabledByDefault: false,
  },
];

export default function HabitSetupScreen() {
  const router = useRouter();
  const setHabits = useQuillbyStore((state) => state.setHabits);
  const setWeightGoal = useQuillbyStore((state) => state.setWeightGoal);
  const setStudyGoal = useQuillbyStore((state) => state.setStudyGoal);

  // Initialize all habits with their default states
  const [habits, setHabitsState] = useState(
    HABIT_OPTIONS.map(habit => ({
      ...habit,
      enabled: habit.enabledByDefault
    }))
  );

  // Weight goal state (only shown when meals habit is enabled)
  const [weightGoal, setWeightGoalState] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  // Study goal state (only shown when study habit is enabled)
  const [studyGoalHours, setStudyGoalHours] = useState<number>(3);
  const [checkpoints, setCheckpoints] = useState<string[]>(['12 PM', '6 PM', '9 PM']); // Default: lunch, evening, end of day

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Caviche': require('../../assets/fonts/Caviche-Regular.ttf'),
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });

  // Show loading while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  const toggleHabit = (id: string) => {
    setHabitsState(prev =>
      prev.map(habit =>
        habit.id === id
          ? { ...habit, enabled: !habit.enabled }
          : habit
      )
    );
  };

  const toggleCheckpoint = (timeLabel: string) => {
    setCheckpoints(prev => 
      prev.includes(timeLabel) 
        ? prev.filter(t => t !== timeLabel)
        : [...prev, timeLabel].sort((a, b) => {
          // Sort by time order (9 AM, 12 PM, 3 PM, 6 PM, 9 PM)
          const timeOrder = ['9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
          return timeOrder.indexOf(a) - timeOrder.indexOf(b);
        })
    );
  };

  const STUDY_GOAL_OPTIONS = [
    { hours: 1, label: '1 hour/day', description: 'Light' },
    { hours: 2, label: '2 hours/day', description: 'Moderate' },
    { hours: 3, label: '3 hours/day', description: 'Standard (recommended)' },
    { hours: 4, label: '4 hours/day', description: 'Intensive' },
  ];

  const CHECKPOINT_OPTIONS = [
    { label: '9 AM', description: 'Morning start' },
    { label: '12 PM', description: 'Lunch check' },
    { label: '3 PM', description: 'Afternoon' },
    { label: '6 PM', description: 'Evening' },
    { label: '9 PM', description: 'End of day' },
  ];

  const handleCompleteSetup = () => {
    // Save selected habits to store
    const selectedHabits = habits.filter(h => h.enabled).map(h => h.id);
    setHabits(selectedHabits);
    
    // Save weight goal if meals habit is enabled
    const mealsEnabled = habits.find(h => h.id === 'meals')?.enabled;
    if (mealsEnabled) {
      setWeightGoal(weightGoal);
    }
    
    // Save study goal if study habit is enabled
    const studyEnabled = habits.find(h => h.id === 'study')?.enabled;
    if (studyEnabled) {
      setStudyGoal(studyGoalHours, checkpoints);
    }
    
    console.log('[Onboarding] Habits selected:', selectedHabits);
    console.log('[Onboarding] Weight goal:', mealsEnabled ? weightGoal : 'N/A');
    console.log('[Onboarding] Complete! Navigating to main app...');
    
    // Navigate to main app with tabs
    router.replace('/(tabs)');
  };

  // Check if meals habit is enabled
  const isMealsEnabled = habits.find(h => h.id === 'meals')?.enabled || false;
  
  // Check if study habit is enabled
  const isStudyEnabled = habits.find(h => h.id === 'study')?.enabled || false;

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Customize Your{'\n'}Journey</Text>
          <Text style={styles.subtitle}>
            What would you like Quillby to help with?
          </Text>
        </View>

        {/* Habit Cards */}
        <View style={styles.habitsContainer}>
          {habits.map((habit) => (
            <View 
              key={habit.id} 
              style={[
                styles.habitCard,
                habit.id === 'study' && styles.studyCard // Highlight core habit
              ]}
            >
              {/* Left: Icon and Text */}
              <View style={styles.habitInfo}>
                <Text style={styles.habitIcon}>{habit.icon}</Text>
                <View style={styles.habitTextContainer}>
                  <Text style={styles.habitTitle}>
                    {habit.title}
                    {habit.id === 'study' && (
                      <Text style={styles.coreLabel}> (Core)</Text>
                    )}
                  </Text>
                  <Text style={styles.habitDescription}>{habit.description}</Text>
                </View>
              </View>

              {/* Right: Toggle Switch */}
              <Switch
                value={habit.enabled}
                onValueChange={() => toggleHabit(habit.id)}
                trackColor={{ false: '#CCCCCC', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CCCCCC"
              />
            </View>
          ))}
        </View>

        {/* Weight Goal Selection - Only show when meals habit is enabled */}
        {isMealsEnabled && (
          <View style={styles.weightGoalCard}>
            <Text style={styles.weightGoalTitle}>🍽️ Your Weight Goal</Text>
            <Text style={styles.weightGoalSubtitle}>(Affects meal portion sizes)</Text>
            
            <View style={styles.weightGoalContainer}>
              <TouchableOpacity
                style={[styles.goalButton, weightGoal === 'lose' && styles.goalButtonSelected]}
                onPress={() => setWeightGoalState('lose')}
              >
                <View style={styles.goalButtonContent}>
                  <Text style={[styles.goalButtonText, weightGoal === 'lose' && styles.goalButtonTextSelected]}>
                    📉 Lose Weight
                  </Text>
                  <Text style={[styles.goalSubtext, weightGoal === 'lose' && styles.goalSubtextSelected]}>
                    3 small meals/day
                  </Text>
                </View>
                {weightGoal === 'lose' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.goalButton, weightGoal === 'maintain' && styles.goalButtonSelected]}
                onPress={() => setWeightGoalState('maintain')}
              >
                <View style={styles.goalButtonContent}>
                  <Text style={[styles.goalButtonText, weightGoal === 'maintain' && styles.goalButtonTextSelected]}>
                    ⚖️ Maintain
                  </Text>
                  <Text style={[styles.goalSubtext, weightGoal === 'maintain' && styles.goalSubtextSelected]}>
                    3 normal meals/day
                  </Text>
                </View>
                {weightGoal === 'maintain' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.goalButton, weightGoal === 'gain' && styles.goalButtonSelected]}
                onPress={() => setWeightGoalState('gain')}
              >
                <View style={styles.goalButtonContent}>
                  <Text style={[styles.goalButtonText, weightGoal === 'gain' && styles.goalButtonTextSelected]}>
                    📈 Gain Weight
                  </Text>
                  <Text style={[styles.goalSubtext, weightGoal === 'gain' && styles.goalSubtextSelected]}>
                    3 large meals/day
                  </Text>
                </View>
                {weightGoal === 'gain' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Study Goal Configuration - Only show when study habit is enabled */}
        {isStudyEnabled && (
          <View style={styles.studyGoalCard}>
            <Text style={styles.studyGoalTitle}>📚 Daily Study Goal</Text>
            <Text style={styles.studyGoalSubtitle}>(Affects accountability checkpoints)</Text>
            
            {/* Study Hours Selection */}
            <View style={styles.studyHoursContainer}>
              {STUDY_GOAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.hours}
                  style={[styles.studyHourButton, studyGoalHours === option.hours && styles.studyHourButtonSelected]}
                  onPress={() => setStudyGoalHours(option.hours)}
                >
                  <View style={styles.studyHourButtonContent}>
                    <Text style={[styles.studyHourButtonText, studyGoalHours === option.hours && styles.studyHourButtonTextSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.studyHourSubtext, studyGoalHours === option.hours && styles.studyHourSubtextSelected]}>
                      {option.description}
                    </Text>
                  </View>
                  {studyGoalHours === option.hours && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Checkpoint Times Selection */}
            <Text style={styles.checkpointTitle}>Check-in Times (choose one or more):</Text>
            <View style={styles.checkpointsContainer}>
              {CHECKPOINT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.checkpointButton, checkpoints.includes(option.label) && styles.checkpointButtonSelected]}
                  onPress={() => toggleCheckpoint(option.label)}
                >
                  <View style={styles.checkpointButtonContent}>
                    <Text style={[styles.checkpointButtonText, checkpoints.includes(option.label) && styles.checkpointButtonTextSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.checkpointSubtext, checkpoints.includes(option.label) && styles.checkpointSubtextSelected]}>
                      {option.description}
                    </Text>
                  </View>
                  {checkpoints.includes(option.label) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Note */}
        <Text style={styles.note}>
          💡 You can change these anytime in settings
        </Text>

        {/* Complete Button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteSetup}
        >
          <Text style={styles.completeButtonText}>Complete Setup 🎉</Text>
        </TouchableOpacity>

      </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.08,
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  // Header
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
    lineHeight: SCREEN_WIDTH * 0.06,
  },
  // Habits Container
  habitsContainer: {
    gap: SCREEN_HEIGHT * 0.015,
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  // Habit Card
  habitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  // Study card (core habit) - special styling
  studyCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.03,
  },
  habitIcon: {
    fontSize: SCREEN_WIDTH * 0.08,
    marginRight: SCREEN_WIDTH * 0.03,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  coreLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#4CAF50',
  },
  habitDescription: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    lineHeight: SCREEN_WIDTH * 0.04,
  },
  // Note
  note: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  // Complete Button
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
  // Weight Goal Styles
  weightGoalCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.025,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  weightGoalTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  weightGoalSubtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  weightGoalContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
  },
  goalButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    position: 'relative',
  },
  goalButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  goalButtonContent: {
    alignItems: 'center',
  },
  goalButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalButtonTextSelected: {
    color: '#2E7D32',
  },
  goalSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.025,
    color: '#999',
    textAlign: 'center',
  },
  goalSubtextSelected: {
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
  // Study Goal Styles
  studyGoalCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.025,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  studyGoalTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  studyGoalSubtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  studyHoursContainer: {
    gap: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  studyHourButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.03,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  studyHourButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  studyHourButtonContent: {
    flex: 1,
  },
  studyHourButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#666',
    marginBottom: 2,
  },
  studyHourButtonTextSelected: {
    color: '#2E7D32',
  },
  studyHourSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.028,
    color: '#999',
  },
  studyHourSubtextSelected: {
    color: '#4CAF50',
  },
  checkpointTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  checkpointsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH * 0.02,
  },
  checkpointButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.025,
    width: '48%',
    alignItems: 'center',
    position: 'relative',
  },
  checkpointButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  checkpointButtonContent: {
    alignItems: 'center',
  },
  checkpointButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  checkpointButtonTextSelected: {
    color: '#2E7D32',
  },
  checkpointSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.025,
    color: '#999',
    textAlign: 'center',
  },
  checkpointSubtextSelected: {
    color: '#4CAF50',
  },
});
