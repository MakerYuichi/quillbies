// Water tracking hook for Casual character
import { useState } from 'react';
import { useQuillbyStore } from '../state/store-modular';

export const useWaterTracking = (buddyName: string) => {
  const { userData, logWater } = useQuillbyStore();
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timeout | null>(null);

  // Helper function to check if all habits are completed for current time
  const areAllHabitsCompletedForCurrentTime = () => {
    const enabledHabits = userData.enabledHabits || [];
    const currentHour = new Date().getHours();
    
    for (const habit of enabledHabits) {
      switch (habit) {
        case 'study':
          const studyHours = (userData.studyMinutesToday || 0) / 60;
          const studyGoal = userData.studyGoalHours || 0;
          let expectedProgress = 0;
          if (currentHour >= 21) expectedProgress = 1.0;
          else if (currentHour >= 18) expectedProgress = 0.75;
          else if (currentHour >= 12) expectedProgress = 0.33;
          else if (currentHour >= 9) expectedProgress = 0.1;
          const expectedHours = studyGoal * expectedProgress;
          if (studyHours < expectedHours) return false;
          break;
          
        case 'hydration':
          const waterGoal = userData.hydrationGoalGlasses || 8;
          let expectedWater = 0;
          if (currentHour >= 22) expectedWater = waterGoal;
          else if (currentHour >= 18) expectedWater = waterGoal * 0.8;
          else if (currentHour >= 14) expectedWater = waterGoal * 0.6;
          else if (currentHour >= 10) expectedWater = waterGoal * 0.4;
          else if (currentHour >= 7) expectedWater = waterGoal * 0.2;
          if (userData.waterGlasses < expectedWater) return false;
          break;
          
        case 'meals':
          const mealGoal = userData.mealGoalCount || 3;
          let expectedMeals = 0;
          if (currentHour >= 20) expectedMeals = mealGoal;
          else if (currentHour >= 14) expectedMeals = 2;
          else if (currentHour >= 10) expectedMeals = 1;
          if (userData.mealsLogged < expectedMeals) return false;
          break;
          
        case 'exercise':
          const exerciseGoal = userData.exerciseGoalMinutes || 30;
          if (currentHour >= 18) {
            if (userData.exerciseMinutes < exerciseGoal * 0.5) return false;
          }
          break;
          
        case 'sleep':
          const sleepGoal = userData.sleepGoalHours || 7;
          if (currentHour >= 6 && currentHour <= 14) {
            // This would need the getTodaysSleepHours function - simplified for now
            // if (getTodaysSleepHours() < sleepGoal * 0.8) return false;
          }
          break;
      }
    }
    return true;
  };

  const handleDrinkWater = () => {
    const newCount = userData.waterGlasses + 1;
    const hydrationGoal = userData.hydrationGoalGlasses || 8; // Use goal from onboarding
    
    // Show drinking animation only when water button is clicked
    setCurrentAnimation('eating'); // This triggers the drinking animation
    
    // Determine what animation to return to after drinking
    setTimeout(() => {
      const shouldBeHappy = areAllHabitsCompletedForCurrentTime();
      setCurrentAnimation(shouldBeHappy ? 'idle-sit-happy' : 'idle');
    }, 2000); // Back to appropriate idle after 2s
    
    // Log water in store
    logWater();
    
    // Update message with casual encouraging feedback
    let newMessage = '';
    if (newCount < hydrationGoal) {
      newMessage = `💧 Only ${hydrationGoal - newCount} more to go! My water bottle's getting lonely...`;
    } else if (newCount === hydrationGoal) {
      newMessage = `🎉 Nice! We hit our water goal!\n${newCount} glasses • Bonus energy! ⚡`;
    } else {
      newMessage = `Woah, ${newCount} glasses? 🌊\nWe're super hydrated today!`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
    
    // Clear any existing timer
    if (messageTimer) {
      clearTimeout(messageTimer);
    }
    
    // Set timer to clear message after 3 seconds
    const timer = setTimeout(() => {
      setMessage('');
      setMessageTimestamp(0);
      setMessageTimer(null);
    }, 3000);
    
    setMessageTimer(timer);
  };

  return {
    waterGlasses: userData.waterGlasses,
    handleDrinkWater,
    waterAnimation: currentAnimation,
    waterMessage: message,
    waterMessageTimestamp: messageTimestamp,
  };
};
