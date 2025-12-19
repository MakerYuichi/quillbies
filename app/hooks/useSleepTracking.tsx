// Sleep/Wake cycle tracking hook for Casual character
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store';

export const useSleepTracking = (buddyName: string) => {
  const { userData, startSleep, endSleep, getTodaysSleepHours } = useQuillbyStore();
  const [isSleeping, setIsSleeping] = useState(false);
  const [activeSleepSessionId, setActiveSleepSessionId] = useState<string | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

  // Check if there's an active sleep session on mount
  useEffect(() => {
    const activeSession = userData.activeSleepSession;
    if (activeSession && activeSession.id) {
      setIsSleeping(true);
      setActiveSleepSessionId(activeSession.id);
      setCurrentAnimation('sleeping');
    }
  }, [userData.activeSleepSession]);

  const handleSleepButton = () => {
    // Start sleeping session
    const sessionId = startSleep();
    setIsSleeping(true);
    setActiveSleepSessionId(sessionId);
    setCurrentAnimation('sleeping');
    const newMessage = `💤 ${buddyName} is sleeping...\nGoodnight! Tap "Wake Up" when you wake.`;
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  const handleWakeUpButton = () => {
    if (!activeSleepSessionId) return;
    
    // End the sleep session
    endSleep(activeSleepSessionId);
    
    // Show wake-up animation
    setCurrentAnimation('wake-up');
    setTimeout(() => setCurrentAnimation('idle'), 3000); // Back to idle after 3s
    
    // End sleeping state
    setIsSleeping(false);
    setActiveSleepSessionId(null);
    
    // Get updated sleep total after ending session
    const totalSleepHours = getTodaysSleepHours();
    
    // Format total sleep display
    const totalHours = Math.floor(totalSleepHours);
    const totalMins = Math.round((totalSleepHours - totalHours) * 60);
    const totalText = totalMins > 0 
      ? `${totalHours}h ${totalMins}m` 
      : `${totalHours}h`;
    
    // Update message based on TOTAL accumulated sleep
    let newMessage = '';
    if (totalSleepHours < 6) {
      newMessage = `😴 Woke up! (${totalText} total today)\nNeed more sleep! Max energy reduced.`;
    } else if (totalSleepHours >= 6 && totalSleepHours < 8) {
      newMessage = `😊 Good morning! (${totalText} total today)\nGood rest, ${buddyName}!`;
    } else if (totalSleepHours >= 8) {
      newMessage = `⭐ Great sleep! (${totalText} total today)\nPerfect! Bonus +10 Energy!`;
    } else {
      newMessage = `💤 Well rested! (${totalText} total today)\nFeeling refreshed!`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  // Format sleep display for button
  const formatSleepDisplay = () => {
    const totalSleepHours = getTodaysSleepHours();
    
    if (totalSleepHours === 0) return '0h today';
    
    const hours = Math.floor(totalSleepHours);
    const mins = Math.round((totalSleepHours - hours) * 60);
    
    if (mins > 0) {
      return `${hours}h ${mins}m today`;
    }
    return `${hours}h today`;
  };

  return {
    isSleeping,
    sleepHours: getTodaysSleepHours(),
    sleepDisplay: formatSleepDisplay(),
    handleSleepButton,
    handleWakeUpButton,
    sleepAnimation: currentAnimation,
    sleepMessage: message,
    sleepMessageTimestamp: messageTimestamp,
  };
};
