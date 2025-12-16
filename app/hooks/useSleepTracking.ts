// Sleep/Wake cycle tracking hook for Casual character
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store';

export const useSleepTracking = (buddyName: string) => {
  const { userData, logSleep, resetDay } = useQuillbyStore();
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');

  // Check if it's a new day and reset sleep if needed
  useEffect(() => {
    const today = new Date().toDateString();
    const lastReset = userData.lastSleepReset || userData.lastCheckInDate;
    if (lastReset !== today) {
      console.log('[Sleep] New day detected - resetting sleep counter');
      resetDay();
    }
  }, [userData.lastSleepReset, userData.lastCheckInDate, resetDay]);

  const handleSleepButton = () => {
    // Start sleeping
    setIsSleeping(true);
    setSleepStartTime(Date.now());
    setCurrentAnimation('sleeping');
    setMessage(`💤 ${buddyName} is sleeping...\nGoodnight! Tap "Woke Up" when you wake.`);
  };

  const handleWakeUpButton = () => {
    if (!sleepStartTime) return;
    
    // Calculate sleep duration for this session
    const sleepEndTime = Date.now();
    const durationMs = sleepEndTime - sleepStartTime;
    const totalMinutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hoursInt = Math.round(durationMs / (1000 * 60 * 60)); // For logging
    
    // Format duration string for this session
    const durationText = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m`;
    
    // Calculate what total will be after adding this session
    const newTotal = userData.sleepHours + hoursInt;
    
    // Show wake-up animation
    setCurrentAnimation('wake-up');
    setTimeout(() => setCurrentAnimation('idle'), 3000); // Back to idle after 3s
    
    // End sleeping state
    setIsSleeping(false);
    setSleepStartTime(null);
    
    // Log sleep in store (will accumulate)
    logSleep(hoursInt);
    
    // Update message based on TOTAL accumulated sleep
    if (newTotal < 6) {
      setMessage(`😴 Slept ${durationText} (${newTotal}h total today)\nNeed more sleep! Max energy reduced.`);
    } else if (newTotal >= 6 && newTotal < 8) {
      setMessage(`😊 Slept ${durationText} (${newTotal}h total today)\nGood rest, ${buddyName}!`);
    } else if (newTotal === 8) {
      setMessage(`⭐ Slept ${durationText} (${newTotal}h total today)\nPerfect! Bonus +10 Energy!`);
    } else {
      setMessage(`💤 Slept ${durationText} (${newTotal}h total today)\nWell rested!`);
    }
  };

  // Format accumulated sleep for display
  const formatAccumulatedSleep = () => {
    const hours = Math.floor(userData.sleepHours);
    if (hours === 0) return '0h today';
    return `${hours}h today`;
  };

  return {
    isSleeping,
    sleepHours: userData.sleepHours,
    sleepDisplay: formatAccumulatedSleep(),
    handleSleepButton,
    handleWakeUpButton,
    sleepAnimation: currentAnimation,
    sleepMessage: message,
  };
};
