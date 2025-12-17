import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';

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
import { useWaterTracking } from '../hooks/useWaterTracking';
import { useSleepTracking } from '../hooks/useSleepTracking';
import { useMealTracking } from '../hooks/useMealTracking';
import { useExerciseTracking } from '../hooks/useExerciseTracking';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { userData, updateEnergy } = useQuillbyStore();
  
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
        <RoomLayers pointerEvents="none" />
      )}
      
      {/* FIXED HAMSTER */}
      <HamsterCharacter 
        selectedCharacter={selectedCharacter}
        currentAnimation={currentAnimation}
        isSleeping={isSleeping}
        pointerEvents="none"
      />
      
      {/* SPEECH BUBBLE - Now in top area where energy bar was */}
      <View style={styles.speechBubbleContainer} pointerEvents="none">
        <SpeechBubble message={hamsterMessage} />
      </View>
      
      {/* BOTTOM CONTROLS AREA - Relative to container */}
      <View style={styles.bottomControlsArea}>
        {/* ENERGY BAR */}
        <View style={styles.energyBarContainer}>
          <EnergyBar current={userData.energy} max={userData.maxEnergyCap} />
        </View>
        
        {/* BUTTONS ROW */}
        {selectedCharacter === 'casual' && (
          <View style={styles.buttonsRow}>
            {!isSleeping && !isExercising ? (
              <>
                {/* Water Button - Only when NOT sleeping or exercising */}
                <WaterButton 
                  waterGlasses={waterGlasses}
                  onPress={handleDrinkWater}
                />
                
                {/* Meal Button - Only when NOT sleeping or exercising */}
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
                
                {/* Sleep Button - Only when NOT sleeping or exercising */}
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
            ) : null}
          </View>
        )}
      </View>
      
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
  // Bottom controls area - relative positioning at bottom of container
  bottomControlsArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 30, // Space from bottom edge
    paddingHorizontal: (SCREEN_WIDTH * 17) / 393,
    flexDirection: 'column', // Buttons at bottom, energy bar above
    alignItems: 'center',
    zIndex: 20,
  },
  // Energy bar container - relative within bottom area
  energyBarContainer: {
    width: (SCREEN_WIDTH * 251) / 280,
    height: (SCREEN_HEIGHT * 25) / 852,
    marginBottom: 70, // Space between buttons and energy bar (since we're using column-reverse)
  },
  // Buttons row - relative within bottom area
  buttonsRow: {
    width: (SCREEN_WIDTH * 355) / 393,
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 6) / 393, // Same gap as original
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
});
