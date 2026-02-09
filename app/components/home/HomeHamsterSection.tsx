import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import RoomLayers from '../room/RoomLayers';
import ExerciseEnvironment from '../games/ExerciseEnvironment';
import HamsterCharacter from '../character/HamsterCharacter';
import SpeechBubble from '../character/SpeechBubble';
import EnergyBar from '../progress/EnergyBar';
import RealTimeClock from '../ui/RealTimeClock';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeHamsterSectionProps {
  userData: any;
  selectedCharacter: string;
  buddyName: string;
  waterTracking: any;
  sleepTracking: any;
  mealTracking: any;
  exerciseTracking: any;
  randomReminders: any;
  idleMessages: any;
  timeBasedFeedback: any;
  firstTimeWelcome: any;
  dayEvaluation: any;
}

export default function HomeHamsterSection({
  userData,
  selectedCharacter,
  buddyName,
  waterTracking,
  sleepTracking,
  mealTracking,
  exerciseTracking,
  randomReminders,
  idleMessages,
  timeBasedFeedback,
  firstTimeWelcome,
  dayEvaluation
}: HomeHamsterSectionProps) {
  
  // Determine current animation based on priority
  const getBaseAnimation = () => {
    console.log('[HomeHamsterSection] Animation check:', {
      sleep: sleepTracking.sleepAnimation,
      exercise: exerciseTracking.exerciseAnimation,
      meal: mealTracking.mealAnimation,
      water: waterTracking.waterAnimation
    });
    
    if (sleepTracking.sleepAnimation !== 'idle' && sleepTracking.sleepAnimation !== 'idle-sit') return sleepTracking.sleepAnimation;
    if (exerciseTracking.exerciseAnimation !== 'idle' && exerciseTracking.exerciseAnimation !== 'idle-sit') return exerciseTracking.exerciseAnimation;
    if (mealTracking.mealAnimation !== 'idle' && mealTracking.mealAnimation !== 'idle-sit') return mealTracking.mealAnimation;
    if (waterTracking.waterAnimation !== 'idle' && waterTracking.waterAnimation !== 'idle-sit') return waterTracking.waterAnimation;
    
    if (firstTimeWelcome.isShowingWelcome) return 'idle-sit-happy';
    
    return 'idle-sit';
  };
  
  const currentAnimation = getBaseAnimation();
  
  // Get the most recent message
  const getHamsterMessage = () => {
    const messages = [
      { text: waterTracking.waterMessage, timestamp: waterTracking.waterMessageTimestamp, priority: 5 },
      { text: sleepTracking.sleepMessage, timestamp: sleepTracking.sleepMessageTimestamp, priority: 5 },
      { text: mealTracking.mealMessage, timestamp: mealTracking.mealMessageTimestamp, priority: 5 },
      { text: exerciseTracking.exerciseMessage, timestamp: exerciseTracking.exerciseMessageTimestamp, priority: 5 },
      { text: randomReminders.reminderMessage, timestamp: randomReminders.reminderTimestamp, priority: 3 },
      { text: idleMessages.idleMessage, timestamp: idleMessages.idleTimestamp, priority: 2 },
      { text: timeBasedFeedback.feedbackMessage, timestamp: timeBasedFeedback.feedbackTimestamp, priority: 4 },
      { text: firstTimeWelcome.welcomeMessage, timestamp: firstTimeWelcome.welcomeTimestamp, priority: 6 },
      { text: dayEvaluation.evaluationMessage, timestamp: dayEvaluation.evaluationTimestamp, priority: 4 }
    ].filter(msg => msg.text && msg.timestamp > 0);

    if (messages.length > 0) {
      const mostRecent = messages.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return b.timestamp - a.timestamp;
      })[0];
      return mostRecent.text;
    }

    // Default message
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

  return (
    <>
      {/* Background Layers */}
      {exerciseTracking.isExercising ? (
        <>
          <ExerciseEnvironment pointerEvents="none" />
          <View style={styles.exerciseTimerContainer}>
            <Text style={styles.exerciseTimerLabel}>
              {buddyName}'s {exerciseTracking.exerciseType === 'walk' ? 'Walking' : 
                           exerciseTracking.exerciseType === 'stretch' ? 'Stretching' : 
                           exerciseTracking.exerciseType === 'cardio' ? 'Cardio' : 'Energizer'} Session
            </Text>
            <Text style={styles.exerciseTimerValue}>{exerciseTracking.exerciseElapsedTime}</Text>
          </View>
        </>
      ) : (
        <>
          <RoomLayers 
            pointerEvents="none" 
            messPoints={userData.messPoints} 
            isSleeping={sleepTracking.isSleeping} 
            qCoins={userData.qCoins} 
          />
          {sleepTracking.isSleeping && (
            <View style={styles.sleepTimerContainer}>
              <Text style={styles.sleepTimerLabel}>
                💤 {buddyName} is Sleeping
              </Text>
              <Text style={styles.sleepTimerValue}>{sleepTracking.sleepElapsedTime}</Text>
            </View>
          )}
        </>
      )}

      {/* Energy Bar */}
      <View style={styles.energyBarContainer}>
        <EnergyBar 
          current={userData.energy} 
          max={userData.maxEnergyCap || 100}
        />
      </View>

      {/* Real Time Clock */}
      <View style={styles.clockContainer}>
        <RealTimeClock />
      </View>

      {/* Hamster Character */}
      <View style={styles.hamsterContainer}>
        <HamsterCharacter
          selectedCharacter={selectedCharacter}
          currentAnimation={currentAnimation}
          isSleeping={sleepTracking.isSleeping}
        />
      </View>

      {/* Speech Bubble */}
      <View style={styles.speechBubbleContainer}>
        <SpeechBubble
          message={getHamsterMessage()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  exerciseTimerContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 100) / 852,
    left: (SCREEN_WIDTH * 20) / 393,
    right: (SCREEN_WIDTH * 20) / 393,
    backgroundColor: 'rgba(255, 87, 34, 0.9)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    zIndex: 25,
  },
  exerciseTimerLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseTimerValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
  },
  sleepTimerContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 100) / 852,
    left: (SCREEN_WIDTH * 20) / 393,
    right: (SCREEN_WIDTH * 20) / 393,
    backgroundColor: 'rgba(103, 58, 183, 0.9)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    zIndex: 25,
  },
  sleepTimerLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  sleepTimerValue: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
  },
  energyBarContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 50) / 852,
    left: (SCREEN_WIDTH * 17) / 393,
    right: (SCREEN_WIDTH * 17) / 393,
    zIndex: 20,
  },
  clockContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 50) / 852,
    right: (SCREEN_WIDTH * 17) / 393,
    zIndex: 21,
  },
  hamsterContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 200) / 852,
    left: (SCREEN_WIDTH * 100) / 393,
    zIndex: 15,
  },
  speechBubbleContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 450) / 852,
    left: (SCREEN_WIDTH * 17) / 393,
    width: (SCREEN_WIDTH * 355) / 393,
    zIndex: 20,
  },
});