// Meal tracking hook with sound and animation
import { useState } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import { soundManager, SOUNDS } from '../../lib/soundManager';

export const useMealTracking = (buddyName: string) => {
  const { userData, logMeal } = useQuillbyStore();
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

  const handleMealLog = async () => {
    console.log('[Meal] Logging meal...');
    
    // Log the meal
    logMeal();
    
    // Play eating sound at 1.5x speed and maximum volume
    const soundDuration = await soundManager.playSound(SOUNDS.HAMSTER_EATING, 1.5, 1.0);
    
    // Show eating animation
    setCurrentAnimation('eating-normal');
    
    // Calculate animation duration based on sound (or default to 3 seconds to match water)
    const animationDuration = soundDuration > 0 ? soundDuration : 3000;
    
    // Update message
    const mealsLogged = userData.mealsLogged + 1;
    const mealGoal = userData.mealGoalCount || 3;
    
    let newMessage = '';
    if (mealsLogged >= mealGoal) {
      newMessage = `🍽️ Yum! All ${mealGoal} meals logged today!\nFeeling energized! ⚡`;
    } else {
      newMessage = `🍽️ Nom nom! Meal ${mealsLogged}/${mealGoal} logged\nTasty! 😋`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
    
    console.log(`[Meal] Animation will last ${animationDuration}ms`);
    console.log(`[Meal] Sound duration was: ${soundDuration}ms`);
    
    // Return to idle after animation completes
    setTimeout(() => {
      setCurrentAnimation('idle');
      // Clear message after animation
      setMessage('');
      setMessageTimestamp(0);
    }, animationDuration);
  };

  // Calculate portion description
  const getPortionDescription = () => {
    const mealsLogged = userData.mealsLogged;
    const mealGoal = userData.mealGoalCount || 3;
    
    if (mealsLogged === 0) return 'No meals yet';
    if (mealsLogged >= mealGoal) return 'All meals done! 🎉';
    return `${mealsLogged}/${mealGoal} meals`;
  };

  return {
    mealsLogged: userData.mealsLogged,
    mealGoal: userData.mealGoalCount || 3,
    portionDescription: getPortionDescription(),
    handleLogMeal: handleMealLog, // Export as handleLogMeal to match existing usage
    mealAnimation: currentAnimation,
    mealMessage: message,
    mealMessageTimestamp: messageTimestamp,
  };
};
