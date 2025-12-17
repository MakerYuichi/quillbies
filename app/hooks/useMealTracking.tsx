// Meal tracking hook for weight-based portions
import { useState } from 'react';
import { useQuillbyStore } from '../state/store';

export const useMealTracking = (buddyName: string) => {
  const { userData, logMeal } = useQuillbyStore();
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

  const handleLogMeal = () => {
    const currentMeals = userData.mealsLogged;
    const weightGoal = userData.weightGoal || 'maintain';
    
    // Get weight goal for animation
    let eatingAnimation = 'eating-normal'; // Default for maintain
    if (weightGoal === 'lose') eatingAnimation = 'eating-light';
    if (weightGoal === 'gain') eatingAnimation = 'eating-heavy';
    
    setCurrentAnimation(eatingAnimation);
    setTimeout(() => setCurrentAnimation('idle'), 2000); // Back to idle after 2s
    
    // Log meal in store (handles energy calculation)
    logMeal();
    
    // Generate appropriate message based on meal count and weight goal
    const newMealCount = currentMeals + 1;
    let newMessage = '';
    
    if (newMealCount <= 3) {
      // Normal meals (1-3) - Positive messages
      const normalMessages = {
        lose: [
          "🥕 Nice light snack! Staying mindful!",
          "🐹 Feeling satisfied! Good portion control!",
          "✅ I'm full now! Perfect portion control!"
        ],
        maintain: [
          "🍎 Good balanced meal! Great choice!",
          "📚 Energized for studies! Keep it up!",
          "🎯 Perfect nutrition for the day!"
        ],
        gain: [
          "🥑 Nutritious meal! Building strength!",
          "💪 Building energy reserves! Growing strong!",
          "🌱 Full and ready to grow! Excellent!"
        ]
      };
      
      const mealNames = ['Breakfast', 'Lunch', 'Dinner'];
      const mealName = mealNames[currentMeals] || 'Meal';
      const baseMessage = normalMessages[weightGoal][currentMeals] || normalMessages[weightGoal][2];
      
      // Calculate energy for display
      const baseEnergy = 15;
      const portionMultiplier = userData.mealPortionSize || 1.0;
      const energyGained = Math.round(baseEnergy * portionMultiplier);
      
      newMessage = `🍽️ ${mealName} logged!\n${baseMessage}\n+${energyGained} Energy`;
      
    } else {
      // Overeating (4+) - Consequence messages
      const overeatingMessages = {
        lose: {
          4: "😣 Overeating! I feel too full now!\n-5 Energy",
          5: "🤢 Stomach ache! This is too much!\n-10 Energy",
          6: "🚫 Please stop! No more meals today!\n-15 Energy"
        },
        maintain: {
          4: "⚠️ Extra meal! Maintaining balance...\n+0 Energy",
          5: "😫 Too full! Need to focus on studies!\n-5 Energy",
          6: "📚 That's enough! Time to study instead!\n-10 Energy"
        },
        gain: {
          4: "🌱 Extra nutrition! Still growing!\n+3 Energy",
          5: "⏸️ Digesting... Body needs time to process\n+0 Energy",
          6: "😴 Body needs rest! Too much food!\n-5 Energy"
        }
      };
      
      const messageKey = newMealCount > 6 ? 6 : newMealCount;
      newMessage = overeatingMessages[weightGoal][messageKey] || overeatingMessages[weightGoal][6];
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
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