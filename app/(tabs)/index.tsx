import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useQuillbyStore } from '../state/store';
import EnergyBar from '../components/EnergyBar';
import RoomLayers from '../components/RoomLayers';
import HamsterCharacter from '../components/HamsterCharacter';
import SpeechBubble from '../components/SpeechBubble';
import WaterButton from '../components/WaterButton';
import SleepButton from '../components/SleepButton';
import MealButton from '../components/MealButton';
import { useWaterTracking } from '../hooks/useWaterTracking';
import { useSleepTracking } from '../hooks/useSleepTracking';
import { useMealTracking } from '../hooks/useMealTracking';

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
    sleepHours,
    sleepDisplay,
    handleSleepButton,
    handleWakeUpButton,
    sleepAnimation,
    sleepMessage,
    sleepMessageTimestamp,
  } = useSleepTracking(buddyName);

  const {
    mealsLogged,
    weightGoal,
    portionDescription,
    handleLogMeal,
    mealAnimation,
    mealMessage,
    mealMessageTimestamp,
  } = useMealTracking(buddyName);
  
  // Determine current animation based on priority: sleep > meal > water
  const currentAnimation = sleepAnimation !== 'idle' ? sleepAnimation : (mealAnimation !== 'idle' ? mealAnimation : waterAnimation);
  
  // Show the most recent message (highest timestamp)
  let hamsterMessage = `Hi ${buddyName}! 👋\nLet's have a productive day!`;
  
  // Find the most recent message among all features
  const messages = [
    { text: waterMessage, timestamp: waterMessageTimestamp },
    { text: sleepMessage, timestamp: sleepMessageTimestamp },
    { text: mealMessage, timestamp: mealMessageTimestamp },
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
    <View style={styles.container}>
      {/* Room background layers */}
      <RoomLayers />
      
      {/* Hamster character */}
      <HamsterCharacter 
        selectedCharacter={selectedCharacter}
        currentAnimation={currentAnimation}
        isSleeping={isSleeping}
      />
      
      {/* Energy Bar */}
      <View style={styles.energyBarContainer} pointerEvents="none">
        <EnergyBar current={userData.energy} max={userData.maxEnergyCap} />
      </View>
      
      {/* Speech Bubble */}
      <SpeechBubble message={hamsterMessage} />
      
      {/* Water and Sleep Buttons (Only for Casual character) */}
      {selectedCharacter === 'casual' && (
        <>
          <View style={styles.buttonsRow}>
            {!isSleeping ? (
              <>
                {/* Water Button - Only when NOT sleeping */}
                <WaterButton 
                  waterGlasses={waterGlasses}
                  onPress={handleDrinkWater}
                />
                
                {/* Meal Button - Only when NOT sleeping */}
                <MealButton 
                  mealsLogged={mealsLogged}
                  portionDescription={portionDescription}
                  onPress={handleLogMeal}
                />
                
                {/* Sleep Button - Only when NOT sleeping */}
                <SleepButton 
                  isSleeping={false}
                  sleepDisplay={sleepDisplay}
                  onSleep={handleSleepButton}
                  onWakeUp={handleWakeUpButton}
                />
              </>
            ) : (
              <>
                {/* Wake Button - Full width when sleeping */}
                <SleepButton 
                  isSleeping={true}
                  sleepDisplay={sleepDisplay}
                  onSleep={handleSleepButton}
                  onWakeUp={handleWakeUpButton}
                />
              </>
            )}
          </View>
          
          {/* Dim Overlay when sleeping */}
          {isSleeping && (
            <View style={styles.dimOverlay} pointerEvents="none" />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Fallback color
  },
  energyBarContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 473) / 852,
    left: (SCREEN_WIDTH * 67) / 393,
    width: (SCREEN_WIDTH * 251) / 393,
    height: (SCREEN_HEIGHT * 25) / 852,
    zIndex: 5,
  },
  buttonsRow: {
    position: 'absolute',
    left: (SCREEN_WIDTH * 17) / 393,
    top: (SCREEN_HEIGHT * 720) / 852, // Moved up from 750 to 720 to avoid tab bar
    width: (SCREEN_WIDTH * 355) / 393,
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 6) / 393, // Smaller gap for 3 buttons
    zIndex: 15,
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
