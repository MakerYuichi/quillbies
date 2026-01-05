// Sleep/Wake cycle tracking hook for Casual character
import { useState, useEffect, useMemo } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import { formatSleepTime } from '../../lib/timeUtils';

export const useSleepTracking = (buddyName: string) => {
  const { userData, startSleep, endSleep, getTodaysSleepHours } = useQuillbyStore();
  const [isSleeping, setIsSleeping] = useState(false);
  const [activeSleepSessionId, setActiveSleepSessionId] = useState<string | null>(null);
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);
  const [sleepDuration, setSleepDuration] = useState<number | null>(null); // in minutes
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);

  // Calculate sleep hours reactively based on sleep sessions
  const totalSleepHours = useMemo(() => {
    return getTodaysSleepHours();
  }, [userData.sleepSessions, getTodaysSleepHours]);

  // Update elapsed time every second when sleeping
  useEffect(() => {
    if (!isSleeping || !sleepStartTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sleepStartTime) / 1000);
      setElapsedSeconds(elapsed);
      
      // Auto-wake if duration timer reaches target
      if (sleepDuration !== null && elapsed >= sleepDuration * 60) {
        handleWakeUpButton();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSleeping, sleepStartTime, sleepDuration]);

  // Check if there's an active sleep session on mount and restore state
  useEffect(() => {
    const activeSession = userData.activeSleepSession;
    if (activeSession && activeSession.id && activeSession.start) {
      console.log('[Sleep] Restoring active sleep session:', activeSession.id);
      setIsSleeping(true);
      setActiveSleepSessionId(activeSession.id);
      setSleepStartTime(new Date(activeSession.start).getTime());
      setCurrentAnimation('sleeping');
      
      // Calculate elapsed time since session started
      const elapsed = Math.floor((Date.now() - new Date(activeSession.start).getTime()) / 1000);
      setElapsedSeconds(elapsed);
    } else {
      // No active session, ensure states are reset
      setIsSleeping(false);
      setActiveSleepSessionId(null);
      setSleepStartTime(null);
      setSleepDuration(null);
      setElapsedSeconds(0);
      setCurrentAnimation('idle');
    }
  }, [userData.activeSleepSession]);

  const handleSleepButton = (duration: number | null = null) => {
    console.log('[Sleep] Starting sleep session with duration:', duration);
    // Start sleeping session
    const sessionId = startSleep();
    const startTime = Date.now();
    setIsSleeping(true);
    setActiveSleepSessionId(sessionId);
    setSleepStartTime(startTime);
    setSleepDuration(duration);
    setCurrentAnimation('sleeping');
    
    const durationText = duration 
      ? `for ${duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}`
      : 'in stopwatch mode';
    
    const newMessage = `💤 Time for some Z's... night night!\nTap "Wake Up" when you wake.`;
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  const handleWakeUpButton = () => {
    if (!activeSleepSessionId) {
      console.warn('[Sleep] No active session to end');
      return;
    }
    
    console.log('[Sleep] Ending sleep session:', activeSleepSessionId);
    
    // Calculate the duration of this session before ending it
    const sessionDurationHours = sleepStartTime 
      ? (Date.now() - sleepStartTime) / (1000 * 60 * 60)
      : 0;
    
    // End the sleep session
    endSleep(activeSleepSessionId);
    
    // Show wake-up animation
    setCurrentAnimation('wake-up');
    setTimeout(() => setCurrentAnimation('idle'), 3000); // Back to idle after 3s
    
    // Reset sleep states
    setIsSleeping(false);
    setActiveSleepSessionId(null);
    setSleepStartTime(null);
    setSleepDuration(null);
    setElapsedSeconds(0);
    
    // Calculate updated sleep total (current total + this session)
    const currentSleepHours = getTodaysSleepHours();
    const updatedSleepHours = currentSleepHours + sessionDurationHours;
    
    // Format total sleep display using utility function
    const totalText = formatSleepTime(updatedSleepHours);
    
    // Update message based on TOTAL accumulated sleep
    let newMessage = '';
    if (updatedSleepHours < 6) {
      newMessage = `😴 Morning... could use more sleep tbh\n(${totalText} total today)`;
    } else if (updatedSleepHours >= 6 && updatedSleepHours < 8) {
      newMessage = `😊 Good morning! Feeling refreshed!\n(${totalText} total today)`;
    } else if (updatedSleepHours >= 8) {
      newMessage = `⭐ Whoa, great sleep! Super charged! ⚡\n(${totalText} total today)`;
    } else {
      newMessage = `💤 Well rested! (${totalText} total today)\nFeeling refreshed!`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageTimestamp(0);
    }, 3000);
  };

  // Format sleep display for button - use reactive totalSleepHours
  const formatSleepDisplay = () => {
    if (totalSleepHours === 0) return '0h today';
    
    return `${formatSleepTime(totalSleepHours)} today`;
  };

  // Format elapsed sleep time as HH:MM:SS
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isSleeping,
    sleepHours: totalSleepHours,
    sleepDisplay: formatSleepDisplay(),
    sleepElapsedTime: formatElapsedTime(),
    elapsedSeconds,
    handleSleepButton,
    handleWakeUpButton,
    sleepAnimation: currentAnimation,
    sleepMessage: message,
    sleepMessageTimestamp: messageTimestamp,
  };
};
