// Meal tracking hook for weight-based portions
import { useState } from 'react';
import { useQuillbyStore } from '../state/store-modular';

export const useMealTracking = (buddyName: string) => {
  const { userData, logMeal } = useQuillbyStore();
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

  const handleLogMeal = () => {
    const currentMeals = userData.mealsLogged;
    const weightGoal = userData.weightGoal || 'maintain';
    const mealGoal = userData.mealGoalCount || 3; // Use dynamic meal goal
    
    // Check if already at limit
    if (currentMeals >= mealGoal) {
      console.log(`[Meal] Already logged ${mealGoal} meals today - showing warning`);
      
      // Show warning animation
      setCurrentAnimation('idle');
      
      // Show warning message based on weight goal
      const warningMessages = {
        lose: `👀 Already had ${mealGoal} meals today! Maybe save room for later?`,
        maintain: `👀 Already had ${mealGoal} meals today! Maybe save room for later?`,
        gain: `👀 Already had ${mealGoal} meals today! Maybe save room for later?`
      };
      
      const warningMessage = warningMessages[weightGoal];
      setMessage(warningMessage);
      setMessageTimestamp(Date.now());
      
      // Clear message after 3 seconds
      if (messageTimer) clearTimeout(messageTimer);
      const timer = setTimeout(() => {
        setMessage('');
        setMessageTimestamp(0);
        setMessageTimer(null);
      }, 3000);
      setMessageTimer(timer);
      
      return; // Don't log the meal
    }
    
    // Get weight goal for animation
    let eatingAnimation = 'eating-normal'; // Default for maintain
    if (weightGoal === 'lose') eatingAnimation = 'eating-light';
    if (weightGoal === 'gain') eatingAnimation = 'eating-heavy';
    
    setCurrentAnimation(eatingAnimation);
    
    // Determine what animation to return to after eating
    setTimeout(() => {
      const shouldBeHappy = areAllHabitsCompletedForCurrentTime();
      setCurrentAnimation(shouldBeHappy ? 'idle-sit-happy' : 'idle');
    }, 2000); // Back to appropriate idle after 2s
    
    // Log meal in store (handles energy calculation)
    logMeal();
    
    // Generate appropriate message based on meal count and weight goal
    const newMealCount = currentMeals + 1;
    let newMessage = '';
    
    if (newMealCount <= mealGoal) {
      // Normal meals (1-goal) - Positive messages
      const normalMessages = {
        lose: [
          "🍎 Light snack? Nice self-control!",
          "Feeling good with that portion!",
          "Perfect amount - not too full!"
        ],
        maintain: [
          "🍔 Good balanced meal! Ready to focus!",
          "Nice fuel for our brain power!",
          "That hit the spot! 😋"
        ],
        gain: [
          "🥩 Solid meal! Building up our energy!",
          "Good nutrition for growing strong!",
          "Feeling full and ready to work!"
        ]
      };
      
      const mealNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Extra'];
      const mealIndex = Math.min(currentMeals, normalMessages[weightGoal].length - 1);
      const mealName = mealNames[currentMeals] || 'Meal';
      const baseMessage = normalMessages[weightGoal][mealIndex] || normalMessages[weightGoal][2];
      
      // Calculate energy for display
      const baseEnergy = 15;
      const portionMultiplier = userData.mealPortionSize || 1.0;
      const energyGained = Math.round(baseEnergy * portionMultiplier);
      
      newMessage = `🍽️ ${mealName} logged!\n${baseMessage}\n+${energyGained} Energy`;
      
    } else {
      // Overeating (goal+1) - Consequence messages
      const overeatingMessages = {
        lose: {
          4: "😅 Whoa, maybe a bit too much... feeling stuffed!",
          5: "🤢 Oof, stomach's protesting...",
          6: "Let's take it easy next meal!"
        },
        maintain: {
          4: "😅 Whoa, maybe a bit too much... feeling stuffed!",
          5: "🤢 Oof, stomach's protesting...",
          6: "Let's take it easy next meal!"
        },
        gain: {
          4: "😅 Whoa, maybe a bit too much... feeling stuffed!",
          5: "🤢 Oof, stomach's protesting...",
          6: "Let's take it easy next meal!"
        }
      };
      
      const messageKey = newMealCount > 6 ? 6 : newMealCount;
      newMessage = overeatingMessages[weightGoal][messageKey] || overeatingMessages[weightGoal][6];
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
    
    // Clear message after 3 seconds
    if (messageTimer) clearTimeout(messageTimer);
    const timer = setTimeout(() => {
      setMessage('');
      setMessageTimestamp(0);
      setMessageTimer(null);
    }, 3000);
    setMessageTimer(timer);
  };

  // Get portion size description for button
  const getPortionDescription = () => {
    const weightGoal = userData.weightGoal || 'maintain';
    switch (weightGoal) {
      case 'lose': return 'Small';
      case 'gain': return 'Large';
      default: return 'Normal';
    }
  };

  return {
    mealsLogged: userData.mealsLogged,
    weightGoal: userData.weightGoal || 'maintain',
    portionDescription: getPortionDescription(),
    handleLogMeal,
    mealAnimation: currentAnimation,
    mealMessage: message,
    mealMessageTimestamp: messageTimestamp,
  };
};