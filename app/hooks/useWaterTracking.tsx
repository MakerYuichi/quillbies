// Water tracking hook for Casual character
import { useState } from 'react';
import { useQuillbyStore } from '../state/store';

export const useWaterTracking = (buddyName: string) => {
  const { userData, logWater } = useQuillbyStore();
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

  const handleDrinkWater = () => {
    const newCount = userData.waterGlasses + 1;
    
    // Show eating/drinking animation
    setCurrentAnimation('eating');
    setTimeout(() => setCurrentAnimation('idle'), 2000); // Back to idle after 2s
    
    // Log water in store
    logWater();
    
    // Update message with encouraging feedback
    let newMessage = '';
    if (newCount < 8) {
      newMessage = `💧 ${8 - newCount} to go! Keep drinking!`;
    } else if (newCount === 8) {
      newMessage = `🎉 Daily goal reached!\n8/8 glasses • Bonus +20 Energy!`;
    } else {
      newMessage = `Wow! ${newCount} glasses! 🌊\nExtra hydrated! +5 Energy`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  return {
    waterGlasses: userData.waterGlasses,
    handleDrinkWater,
    waterAnimation: currentAnimation,
    waterMessage: message,
    waterMessageTimestamp: messageTimestamp,
  };
};
