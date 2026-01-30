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
    }, 3000); // Changed to 3 seconds to match water animation duration
    
    // Log meal in store (handles energy calculation)
    logMeal();
    
    // Generate appropriate message based on meal count, time, and weight goal
    const newMealCount = currentMeals + 1;
    const currentHour = new Date().getHours();
    let newMessage = '';
    
    if (newMealCount <= mealGoal) {
      // Normal meals (1-goal) - Time and goal-based messages
      const timeBasedMessages = {
        lose: {
          morning: "🍳 Light breakfast logged! Perfect portion for your goals!",
          lunch: "🥗 Healthy lunch! Staying on track with smaller portions!",
          dinner: "🍽️ Smart dinner choice! Light and satisfying!",
          snack: "🍎 Light snack logged! Good self-control!"
        },
        maintain: {
          morning: "🍳 Good breakfast! Balanced start to the day!",
          lunch: "🥪 Nice lunch! Perfect fuel for afternoon focus!",
          dinner: "🍽️ Solid dinner! Just the right amount!",
          snack: "🍪 Snack time! Keeping energy steady!"
        },
        gain: {
          morning: "🥞 Hearty breakfast! Building up our energy stores!",
          lunch: "🍔 Good lunch! Fueling up for growth!",
          dinner: "🍖 Solid dinner! Perfect for building strength!",
          snack: "🥜 Power snack! Extra nutrition for our goals!"
        }
      };
      
      // Determine meal type based on time and count
      let mealType = 'snack';
      if (currentHour >= 6 && currentHour < 11 && newMealCount === 1) {
        mealType = 'morning';
      } else if (currentHour >= 11 && currentHour < 16 && newMealCount <= 2) {
        mealType = 'lunch';
      } else if (currentHour >= 16 && currentHour < 21 && newMealCount <= 3) {
        mealType = 'dinner';
      }
      
      const baseMessage = timeBasedMessages[weightGoal][mealType];
      
      // Calculate energy for display
      const baseEnergy = 15;
      const portionMultiplier = userData.mealPortionSize || 1.0;
      const energyGained = Math.round(baseEnergy * portionMultiplier);
      
      newMessage = `${baseMessage}\n+${energyGained} Energy • Meal ${newMealCount}/${mealGoal}`;
      
      // Add completion message if this completes the goal
      if (newMealCount === mealGoal) {
        newMessage += `\n🎉 Daily meal goal complete! Well done!`;
      }
      
    } else {
      // Overeating (goal+1) - Time-aware consequence messages
      const timeAwareOvereating = {
        lose: {
          early: "😅 Extra meal early in the day... maybe save room for later?",
          late: "🌙 Late night eating... your body might not love this tomorrow!",
          normal: "😅 That's one more than planned... feeling a bit stuffed!"
        },
        maintain: {
          early: "😅 Extra meal early on... might feel too full later!",
          late: "🌙 Late night munchies got us... tomorrow's a new day!",
          normal: "😅 One more than usual... stomach's definitely full!"
        },
        gain: {
          early: "😅 Extra fuel early... might be too much even for our goals!",
          late: "🌙 Late night eating... even for gaining, this might be much!",
          normal: "😅 That's quite a bit... even for building up!"
        }
      };
      
      let timeCategory = 'normal';
      if (currentHour < 14) timeCategory = 'early';
      else if (currentHour >= 21) timeCategory = 'late';
      
      newMessage = timeAwareOvereating[weightGoal][timeCategory];
      newMessage += `\nMeal ${newMealCount}/${mealGoal} • Maybe take it easy next time!`;
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