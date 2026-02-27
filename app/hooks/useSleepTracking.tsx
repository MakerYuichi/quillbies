// Sleep/Wake cycle tracking hook for Casual character
import { useState, useEffect, useMemo } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import { formatSleepTime } from '../../lib/timeUtils';
import { soundManager, SOUNDS, playEndSessionSound } from '../../lib/soundManager';

export const useSleepTracking = (buddyName: string) => {
  const userData = useQuillbyStore((state) => state.userData);
  const startSleep = useQuillbyStore((state) => state.startSleep);
  const endSleep = useQuillbyStore((state) => state.endSleep);
  const getTodaysSleepHours = useQuillbyStore((state) => state.getTodaysSleepHours);
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
      // Only set to sleeping if not currently showing wake-up animation
      if (currentAnimation !== 'wake-up') {
        setCurrentAnimation('sleeping');
      }
      
      // Calculate elapsed time since session started
      const elapsed = Math.floor((Date.now() - new Date(activeSession.start).getTime()) / 1000);
      setElapsedSeconds(elapsed);
    } else if (!activeSession && currentAnimation !== 'wake-up') {
      // No active session, ensure states are reset (but don't interrupt wake-up animation)
      setIsSleeping(false);
      setActiveSleepSessionId(null);
      setSleepStartTime(null);
      setSleepDuration(null);
      setElapsedSeconds(0);
      // Only reset to idle if not showing wake-up animation
      if (currentAnimation === 'sleeping') {
        setCurrentAnimation('idle');
      }
    }
  }, [userData.activeSleepSession]);

  const handleSleepButton = (duration: number | null = null) => {
    console.log('[Sleep] Starting sleep session with duration:', duration);
    
    // Stop main app background music when going to sleep
    console.log('[Sleep] Stopping main app background music...');
    soundManager.stopBackgroundMusic();
    
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

  const handleWakeUpButton = async () => {
    if (!activeSleepSessionId) {
      console.warn('[Sleep] No active session to end');
      return;
    }
    
    console.log('[Sleep] Ending sleep session:', activeSleepSessionId);
    
    // Calculate the duration of this session before ending it
    const sessionDurationHours = sleepStartTime 
      ? (Date.now() - sleepStartTime) / (1000 * 60 * 60)
      : 0;
    
    // Play end session sound
    playEndSessionSound();
    
    // Show wake-up animation IMMEDIATELY before any state changes
    setCurrentAnimation('wake-up');
    
    // Play yawn sound during wake-up animation
    await soundManager.playSound(SOUNDS.HAMSTER_YAWN, 1.0, 1.0);
    console.log('[Sleep] Playing yawn sound during wake-up');
    
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
    
    // End the sleep session AFTER setting animation and message
    endSleep(activeSleepSessionId);
    
    // Reset sleep states AFTER a delay to allow animation to show
    setTimeout(() => {
      setIsSleeping(false);
      setActiveSleepSessionId(null);
      setSleepStartTime(null);
      setSleepDuration(null);
      setElapsedSeconds(0);
    }, 100); // Small delay to prevent immediate state reset
    
    // Return to idle after wake-up animation completes (3 seconds)
    setTimeout(() => {
      setCurrentAnimation('idle');
      // Clear message after animation completes
      setMessage('');
      setMessageTimestamp(0);
      
      // Restart main app background music after waking up
      console.log('[Sleep] Restarting main app background music...');
      soundManager.playBackgroundMusic(
        SOUNDS.GAME_MUSIC,
        require('../../assets/sounds/background_music/gamemusic.mp3'),
        0.15, // Very low volume (15%)
        true // Loop
      );
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
