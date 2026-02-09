// Water tracking hook for Casual character - optimized for performance
import { useState, useCallback } from 'react';
import { useQuillbyStore } from '../state/store-modular';

export const useWaterTracking = (buddyName: string) => {
  const { userData, logWater } = useQuillbyStore();
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle-sit');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

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

  const handleDrinkWater = useCallback(() => {
    const newCount = userData.waterGlasses + 1;
    const hydrationGoal = userData.hydrationGoalGlasses || 8;
    const currentHour = new Date().getHours();
    
    console.log('[WaterTracking] Drinking water - setting animation to drinking');
    
    // Show drinking animation
    setCurrentAnimation('drinking');
    
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
    
    if (newCount < hydrationGoal) {
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
    } else {
      // Over-hydration messages
      const excess = newCount - hydrationGoal;
      if (excess === 1) {
        newMessage = `💧 Bonus hydration! ${newCount} glasses total.\n🌊 You're really taking care of yourself!`;
      } else if (excess <= 3) {
        newMessage = `💧💧 Super hydrated! ${newCount} glasses today.\n🌊 Your body is loving this extra care!`;
      } else {
        newMessage = `💧💧💧 Hydration master! ${newCount} glasses!\n🌊 Maybe pace yourself a bit? 😅`;
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
