// Water tracking hook for Casual character - optimized for performance
import { useState, useCallback, useRef } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import { soundManager, SOUNDS } from '../../lib/soundManager';

export const useWaterTracking = (buddyName: string) => {
  const userData = useQuillbyStore((state) => state.userData);
  const logWater = useQuillbyStore((state) => state.logWater);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle-sit');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);
  const soundLoopActive = useRef(false);

  // Optimized habit completion check - simplified
  const areAllHabitsCompletedForCurrentTime = useCallback(() => {
    const enabledHabits = userData.enabledHabits || [];
    const currentHour = new Date().getHours();
    
    // Simplified check - only check if it's evening and basic goals are met
    if (currentHour >= 18) {
      const studyGoal = userData.studyGoalHours || 0;
      const studyHours = (userData.studyMinutesToday || 0) / 60;
      const waterGoal = userData.hydrationGoalGlasses || 8;
      
      return studyHours >= studyGoal * 0.7 && userData.waterGlasses >= waterGoal * 0.7;
    }
    
    return false;
  }, [userData.enabledHabits, userData.studyGoalHours, userData.studyMinutesToday, userData.hydrationGoalGlasses, userData.waterGlasses]);

  const handleDrinkWater = useCallback(async () => {
    const hydrationGoal = userData.hydrationGoalGlasses || 8;
    const currentCount = userData.waterGlasses;
    const HARD_LIMIT = 16; // Maximum glasses allowed per day
    
    // Check if at hard limit - don't do anything
    if (currentCount >= HARD_LIMIT) {
      console.log(`[WaterTracking] Hard limit reached (${currentCount}/${HARD_LIMIT}), button disabled`);
      setMessage(`💧 Daily limit reached!\n${HARD_LIMIT} glasses is the maximum for today.`);
      setMessageTimestamp(Date.now());
      setTimeout(() => {
        setMessage('');
        setMessageTimestamp(0);
      }, 3000);
      return;
    }
    
    const newCount = currentCount + 1;
    const currentHour = new Date().getHours();
    
    console.log('[WaterTracking] Drinking water - setting animation to drinking');
    
    // Stop any previous sound loop
    soundLoopActive.current = false;
    await new Promise(resolve => setTimeout(resolve, 150)); // Wait for previous loop to stop
    
    // Show drinking animation
    setCurrentAnimation('drinking');
    
    // Start new sound loop for exactly 3 seconds
    soundLoopActive.current = true;
    const startTime = Date.now();
    
    (async () => {
      while (soundLoopActive.current && (Date.now() - startTime) < 3000) {
        const duration = await soundManager.playSound(SOUNDS.HAMSTER_DRINKING, 1.0, 1.0);
        console.log(`[Water] Sound duration: ${duration}ms`);
        
        // Wait for sound to finish OR until loop should stop
        const waitTime = Math.min(duration || 500, 3000 - (Date.now() - startTime));
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Check if we should continue
        if (!soundLoopActive.current || (Date.now() - startTime) >= 3000) {
          break;
        }
      }
      soundLoopActive.current = false;
      console.log('[Water] Sound loop stopped');
    })();
    
    // Stop sound after exactly 3 seconds
    setTimeout(() => {
      soundLoopActive.current = false;
      soundManager.stopSound(SOUNDS.HAMSTER_DRINKING);
    }, 3000);
    
    // Return to appropriate idle after 3s
    setTimeout(() => {
      const shouldBeHappy = areAllHabitsCompletedForCurrentTime();
      const newAnim = shouldBeHappy ? 'idle-sit-happy' : 'idle-sit';
      console.log('[WaterTracking] Returning to idle animation:', newAnim);
      setCurrentAnimation(newAnim);
    }, 3000);
    
    // Log water in store
    logWater();
    
    // Generate time-aware and progress-aware messages
    let newMessage = '';
    
    // Check if already at or above goal BEFORE this drink
    if (currentCount >= hydrationGoal) {
      newMessage = `💧 Extra hydration logged (${newCount} glasses)\n⚠️ Goal already reached - no coins earned`;
    } else if (newCount < hydrationGoal) {
      const remaining = hydrationGoal - newCount;
      
      // Time-based encouragement
      if (currentHour < 10) {
        newMessage = `🌅 Good morning hydration! ${remaining} more glasses to go today.`;
      } else if (currentHour < 14) {
        newMessage = `☀️ Midday refresh! Only ${remaining} more glasses needed.`;
      } else if (currentHour < 18) {
        newMessage = `🌤️ Afternoon boost! ${remaining} glasses left for today.`;
      } else if (currentHour < 22) {
        newMessage = `🌆 Evening hydration! ${remaining} more to reach our goal.`;
      } else {
        newMessage = `🌙 Late night sip! ${remaining} more glasses to complete today.`;
      }
      
      // Add progress-based encouragement
      const progress = (newCount / hydrationGoal) * 100;
      if (progress >= 75) {
        newMessage += `\n🎯 Almost there! ${Math.round(progress)}% complete!`;
      } else if (progress >= 50) {
        newMessage += `\n💪 Halfway done! Keep it up!`;
      } else if (progress >= 25) {
        newMessage += `\n🚀 Good start! Building the habit!`;
      }
      
    } else if (newCount === hydrationGoal) {
      // Goal achieved messages based on time
      if (currentHour < 12) {
        newMessage = `🎉 Wow! Goal achieved before noon!\n${newCount} glasses • You're a hydration champion! ⚡`;
      } else if (currentHour < 18) {
        newMessage = `🎉 Perfect! Goal reached this afternoon!\n${newCount} glasses • Bonus energy incoming! ⚡`;
      } else {
        newMessage = `🎉 Nice! Daily goal completed!\n${newCount} glasses • Great job staying consistent! ⚡`;
      }
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageTimestamp(0);
    }, 3000);
  }, [userData.waterGlasses, userData.hydrationGoalGlasses, logWater, areAllHabitsCompletedForCurrentTime]);

  return {
    waterGlasses: userData.waterGlasses,
    handleDrinkWater,
    waterAnimation: currentAnimation,
    waterMessage: message,
    waterMessageTimestamp: messageTimestamp,
  };
};
