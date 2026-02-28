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
    
    const mealGoal = userData.mealGoalCount || 3;
    const currentCount = userData.mealsLogged;
    
    // Calculate hard limit based on meal goal
    let hardLimit = 4;
    if (mealGoal === 2) {
      hardLimit = 2; // Lose weight: strict, no extras
    } else if (mealGoal === 3) {
      hardLimit = 4; // Normal: 3 goal + 1 extra = 4 max
    } else if (mealGoal >= 4) {
      hardLimit = 5; // Gain weight: 4 goal + 1 extra = 5 max
    }
    
    // Check if at hard limit - don't do anything
    if (currentCount >= hardLimit) {
      console.log(`[MealTracking] Hard limit reached (${currentCount}/${hardLimit}), button disabled`);
      setMessage(`🍽️ Daily limit reached!\n${hardLimit} meals is the maximum for today.`);
      setMessageTimestamp(Date.now());
      setTimeout(() => {
        setMessage('');
        setMessageTimestamp(0);
      }, 3000);
      return;
    }
    
    // Stop any previous sound loop
    soundLoopActive.current = false;
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log the meal
    logMeal();
    
    // Show eating animation based on meal goal count
    let eatingAnimation = 'eating-normal';
    
    if (mealGoal === 2) {
      eatingAnimation = 'eating-light'; // Lose weight (2 meals)
    } else if (mealGoal === 3) {
      eatingAnimation = 'eating-normal'; // Normal (3 meals)
    } else if (mealGoal >= 4) {
      eatingAnimation = 'eating-heavy'; // Gain weight (4+ meals)
    }
    
    console.log(`[Meal] Using animation: ${eatingAnimation} for meal goal: ${mealGoal}`);
    setCurrentAnimation(eatingAnimation);
    
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
    
    let newMessage = '';
    
    // Check if this meal is beyond the goal (no coins earned)
    if (mealsLogged > mealGoal) {
      newMessage = `🍽️ Extra meal logged (${mealsLogged}/${hardLimit})\n⚠️ Goal already reached - no coins earned`;
    } else if (mealsLogged >= mealGoal) {
      newMessage = `🍽️ Yum! All ${mealGoal} meals logged today!\nFeeling energized! ⚡`;
    } else {
      const remaining = mealGoal - mealsLogged;
      newMessage = `🍽️ Nom nom! Meal ${mealsLogged}/${mealGoal} logged\n${remaining} more to go! 😋`;
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
