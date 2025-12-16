// Water tracking hook for Casual character
import { useState } from 'react';
import { useQuillbyStore } from '../state/store';

export const useWaterTracking = (buddyName: string) => {
  const { userData, logWater } = useQuillbyStore();
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');

  const handleDrinkWater = () => {
    const newCount = userData.waterGlasses + 1;
    
    // Show eating/drinking animation
    setCurrentAnimation('eating');
    setTimeout(() => setCurrentAnimation('idle'), 2000); // Back to idle after 2s
    
    // Log water in store
    logWater();
    
    // Update message with encouraging feedback
    if (newCount < 8) {
      setMessage(`💧 ${8 - newCount} to go! Keep drinking!`);
    } else if (newCount === 8) {
      setMessage(`🎉 Daily goal reached!\n8/8 glasses • Bonus +20 Energy!`);
    } else {
      setMessage(`Wow! ${newCount} glasses! 🌊\nExtra hydrated! +5 Energy`);
    }
  };

  return {
    waterGlasses: userData.waterGlasses,
    handleDrinkWater,
    waterAnimation: currentAnimation,
    waterMessage: message,
  };
};
