// Sleep/Wake cycle tracking hook for Casual character
import { useState, useEffect, useMemo } from 'react';
import { useQuillbyStore } from '../state/store';
import { formatSleepTime } from '../../lib/timeUtils';

export const useSleepTracking = (buddyName: string) => {
  const { userData, startSleep, endSleep, getTodaysSleepHours } = useQuillbyStore();
  const [isSleeping, setIsSleeping] = useState(false);
  const [activeSleepSessionId, setActiveSleepSessionId] = useState<string | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

  // Calculate sleep hours reactively based on sleep sessions
  const totalSleepHours = useMemo(() => {
    return getTodaysSleepHours();
  }, [userData.sleepSessions, getTodaysSleepHours]);

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
    
    // Get updated sleep total after ending session (will be calculated in next render)
    const updatedSleepHours = getTodaysSleepHours();
    
    // Format total sleep display using utility function
    const totalText = formatSleepTime(updatedSleepHours);
    
    // Update message based on TOTAL accumulated sleep
    let newMessage = '';
    if (updatedSleepHours < 6) {
      newMessage = `😴 Woke up! (${totalText} total today)\nNeed more sleep! Max energy reduced.`;
    } else if (updatedSleepHours >= 6 && updatedSleepHours < 8) {
      newMessage = `😊 Good morning! (${totalText} total today)\nGood rest, ${buddyName}!`;
    } else if (updatedSleepHours >= 8) {
      newMessage = `⭐ Great sleep! (${totalText} total today)\nPerfect! Bonus +10 Energy!`;
    } else {
      newMessage = `💤 Well rested! (${totalText} total today)\nFeeling refreshed!`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  // Format sleep display for button - use reactive totalSleepHours
  const formatSleepDisplay = () => {
    if (totalSleepHours === 0) return '0h today';
    
    return `${formatSleepTime(totalSleepHours)} today`;
  };

  return {
    isSleeping,
    sleepHours: totalSleepHours,
    sleepDisplay: formatSleepDisplay(),
    handleSleepButton,
    handleWakeUpButton,
    sleepAnimation: currentAnimation,
    sleepMessage: message,
    sleepMessageTimestamp: messageTimestamp,
  };
};
