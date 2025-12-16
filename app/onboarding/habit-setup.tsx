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

  // Initialize all habits with their default states
  const [habits, setHabitsState] = useState(
    HABIT_OPTIONS.map(habit => ({
      ...habit,
      enabled: habit.enabledByDefault
    }))
  );

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

  const handleCompleteSetup = () => {
    // Save selected habits to store
    const selectedHabits = habits.filter(h => h.enabled).map(h => h.id);
    setHabits(selectedHabits);
    
    console.log('[Onboarding] Habits selected:', selectedHabits);
    
    // Navigate to main app
    router.replace('/'); // Go to home screen
  };

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
});
