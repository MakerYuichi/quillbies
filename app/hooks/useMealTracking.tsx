// Meal tracking hook with sound and animation
import { useState, useRef } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import { soundManager, SOUNDS } from '../../lib/soundManager';

export const useMealTracking = (buddyName: string) => {
  const userData = useQuillbyStore((state) => state.userData);
  const logMeal = useQuillbyStore((state) => state.logMeal);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);
  const soundLoopActive = useRef(false);

  const handleMealLog = async () => {
    console.log('[Meal] Logging meal...');
    
    // Stop any previous sound loop
    soundLoopActive.current = false;
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log the meal
    logMeal();
    
    // Show eating animation
    setCurrentAnimation('eating-normal');
    
    // Start new sound loop for exactly 3 seconds
    soundLoopActive.current = true;
    const startTime = Date.now();
    
    (async () => {
      while (soundLoopActive.current && (Date.now() - startTime) < 3000) {
        await soundManager.playSound(SOUNDS.HAMSTER_EATING, 1.5, 1.0);
        // Small delay between loops
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      soundLoopActive.current = false;
      console.log('[Meal] Sound loop stopped');
    })();
    
    // Stop sound after exactly 3 seconds
    setTimeout(() => {
      soundLoopActive.current = false;
    }, 3000);
    
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
    
    // Return to idle after 3 seconds
    setTimeout(() => {
      setCurrentAnimation('idle');
      setMessage('');
      setMessageTimestamp(0);
    }, 3000);
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
