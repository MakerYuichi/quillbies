// Sleep/Wake cycle tracking hook for Casual character
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store';

export const useSleepTracking = (buddyName: string) => {
  const { userData, logSleep, resetDay } = useQuillbyStore();
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);
  
  // Track accumulated minutes separately (since store only tracks hours)
  const [accumulatedMinutes, setAccumulatedMinutes] = useState<number>(0);

  // Check if it's a new day and reset sleep if needed
  useEffect(() => {
    const today = new Date().toDateString();
    const lastReset = userData.lastSleepReset || userData.lastCheckInDate;
    if (lastReset !== today) {
      console.log('[Sleep] New day detected - resetting sleep counter');
      setAccumulatedMinutes(0); // Reset minutes too
      resetDay();
    }
  }, [userData.lastSleepReset, userData.lastCheckInDate, resetDay]);

  const handleSleepButton = () => {
    // Start sleeping
    setIsSleeping(true);
    setSleepStartTime(Date.now());
    setCurrentAnimation('sleeping');
    const newMessage = `💤 ${buddyName} is sleeping...\nGoodnight! Tap "Woke Up" when you wake.`;
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  const handleWakeUpButton = () => {
    if (!sleepStartTime) return;
    
    // Calculate sleep duration for this session
    const sleepEndTime = Date.now();
    const durationMs = sleepEndTime - sleepStartTime;
    const sessionMinutes = Math.floor(durationMs / (1000 * 60));
    const sessionHours = Math.floor(sessionMinutes / 60);
    const sessionMins = sessionMinutes % 60;
    const hoursInt = Math.round(durationMs / (1000 * 60 * 60)); // For logging (hours only)
    
    // Format duration string for this session
    const durationText = sessionHours > 0 
      ? `${sessionHours}h ${sessionMins}m` 
      : `${sessionMins}m`;
    
    // Calculate new accumulated minutes
    const newAccumulatedMinutes = accumulatedMinutes + sessionMinutes;
    setAccumulatedMinutes(newAccumulatedMinutes);
    
    // Calculate total hours and minutes from accumulated minutes
    const totalHours = Math.floor(newAccumulatedMinutes / 60);
    const totalMins = newAccumulatedMinutes % 60;
    
    // Format total with minutes
    const totalText = totalMins > 0 
      ? `${totalHours}h ${totalMins}m` 
      : `${totalHours}h`;
    
    // Show wake-up animation
    setCurrentAnimation('wake-up');
    setTimeout(() => setCurrentAnimation('idle'), 3000); // Back to idle after 3s
    
    // End sleeping state
    setIsSleeping(false);
    setSleepStartTime(null);
    
    // Log sleep in store (will accumulate hours for energy calculation)
    logSleep(hoursInt);
    
    // Update message based on TOTAL accumulated sleep
    let newMessage = '';
    if (totalHours < 6) {
      newMessage = `😴 Slept ${durationText} (${totalText} total today)\nNeed more sleep! Max energy reduced.`;
    } else if (totalHours >= 6 && totalHours < 8) {
      newMessage = `😊 Slept ${durationText} (${totalText} total today)\nGood rest, ${buddyName}!`;
    } else if (totalHours === 8) {
      newMessage = `⭐ Slept ${durationText} (${totalText} total today)\nPerfect! Bonus +10 Energy!`;
    } else {
      newMessage = `💤 Slept ${durationText} (${totalText} total today)\nWell rested!`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  // Format accumulated sleep for display (with minutes)
  const formatAccumulatedSleep = () => {
    if (accumulatedMinutes === 0) return '0h today';
    
    const hours = Math.floor(accumulatedMinutes / 60);
    const mins = accumulatedMinutes % 60;
    
    if (mins > 0) {
      return `${hours}h ${mins}m today`;
    }
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
    sleepMessageTimestamp: messageTimestamp,
  };
};
