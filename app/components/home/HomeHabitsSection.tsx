import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import WaterButton from '../habits/WaterButton';
import SleepButton from '../habits/SleepButton';
import MealButton from '../habits/MealButton';
import ExerciseButton from '../habits/ExerciseButton';
import CleanButton from '../habits/CleanButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeHabitsSectionProps {
  userData: any;
  waterTracking: any;
  sleepTracking: any;
  mealTracking: any;
  exerciseTracking: any;
  onShowExerciseModal: () => void;
  onShowSleepModal: () => void;
}

export default function HomeHabitsSection({
  userData,
  waterTracking,
  sleepTracking,
  mealTracking,
  exerciseTracking,
  onShowExerciseModal,
  onShowSleepModal
}: HomeHabitsSectionProps) {
  
  const handleDrinkWaterWithReset = () => {
    waterTracking.handleDrinkWater();
  };

  const handleLogMealWithReset = () => {
    mealTracking.handleLogMeal();
  };

  const handleStartExerciseWithReset = () => {
    onShowExerciseModal();
  };

  const handleStartSleepWithReset = () => {
    onShowSleepModal();
  };

  const handleFinishExerciseWithReset = () => {
    exerciseTracking.handleFinishExercise();
  };

  const handleWakeUpButtonWithReset = () => {
    sleepTracking.handleWakeUpButton();
  };

  return (
    <View style={styles.scrollableContent}>
      <View style={styles.scrollContentContainer}>
        <View style={styles.contentSpacer} />
        
        {/* Habit Buttons */}
        <View style={styles.habitsContainer}>
          {sleepTracking.isSleeping ? (
            <>
              <SleepButton 
                isSleeping={true}
                sleepDisplay={sleepTracking.sleepDisplay}
                sleepElapsedTime={sleepTracking.sleepElapsedTime}
                onSleep={handleStartSleepWithReset}
                onWakeUp={handleWakeUpButtonWithReset}
              />
            </>
          ) : exerciseTracking.isExercising ? (
            <>
              <ExerciseButton 
                isExercising={true}
                exerciseDisplay={exerciseTracking.exerciseDisplay}
                exerciseElapsedTime={exerciseTracking.exerciseElapsedTime}
                onStartExercise={handleStartExerciseWithReset}
                onFinishExercise={handleFinishExerciseWithReset}
              />
            </>
          ) : (
            <>
              {/* Water Button */}
              {userData.enabledHabits?.includes('hydration') && (
                <WaterButton 
                  waterGlasses={waterTracking.waterGlasses}
                  hydrationGoal={userData.hydrationGoalGlasses || 8}
                  onPress={handleDrinkWaterWithReset}
                />
              )}

              {/* Meal Button */}
              {userData.enabledHabits?.includes('meals') && (
                <MealButton 
                  mealsLogged={mealTracking.mealsLogged}
                  portionDescription={mealTracking.portionDescription}
                  onPress={handleLogMealWithReset}
                />
              )}

              {/* Exercise Button */}
              {userData.enabledHabits?.includes('exercise') && (
                <ExerciseButton 
                  isExercising={false}
                  exerciseDisplay=""
                  exerciseElapsedTime=""
                  onStartExercise={handleStartExerciseWithReset}
                  onFinishExercise={handleFinishExerciseWithReset}
                />
              )}

              {/* Sleep Button */}
              {userData.enabledHabits?.includes('sleep') && (
                <SleepButton 
                  isSleeping={false}
                  sleepDisplay=""
                  sleepElapsedTime=""
                  onSleep={handleStartSleepWithReset}
                  onWakeUp={handleWakeUpButtonWithReset}
                />
              )}

              {/* Clean Button */}
              {userData.messPoints > 5 && (
                <CleanButton 
                  messPoints={userData.messPoints}
                  onPress={() => {/* TODO: Add cleaning functionality */}}
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollableContent: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 580) / 852,
    left: 0,
    right: 0,
    bottom: 30,
    zIndex: 15,
  },
  scrollContentContainer: {
    paddingHorizontal: (SCREEN_WIDTH * 17) / 393,
    paddingBottom: 20,
    flexGrow: 1,
  },
  contentSpacer: {
    flex: 1,
  },
  habitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: (SCREEN_WIDTH * 8) / 393,
    justifyContent: 'space-between',
    marginBottom: (SCREEN_HEIGHT * 15) / 852,
  },
});