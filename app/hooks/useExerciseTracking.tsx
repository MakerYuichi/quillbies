// Exercise tracking hook with timer functionality like sleep
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store-modular';

export const useExerciseTracking = (buddyName: string) => {
  const { userData, logExercise, resetDay } = useQuillbyStore();
  const [isExercising, setIsExercising] = useState(false);
  const [exerciseStartTime, setExerciseStartTime] = useState<number | null>(null);
  const [exerciseType, setExerciseType] = useState<'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom'>('walk');
  const [exerciseDuration, setExerciseDuration] = useState<number | null>(null); // null = stopwatch, number = countdown
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle');
  const [message, setMessage] = useState<string>('');
  const [messageTimestamp, setMessageTimestamp] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  // Track accumulated minutes separately
  const [accumulatedMinutes, setAccumulatedMinutes] = useState<number>(0);

  // Update elapsed time every second when exercising
  useEffect(() => {
    if (!isExercising || !exerciseStartTime) {
      setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - exerciseStartTime) / 1000);
      setElapsedSeconds(elapsed);
      
      // Auto-finish if countdown timer reaches 0
      if (exerciseDuration !== null && elapsed >= exerciseDuration * 60) {
        handleFinishExercise();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isExercising, exerciseStartTime, exerciseDuration]);

  // Check if it's a new day and reset exercise if needed
  useEffect(() => {
    const today = new Date().toDateString();
    const lastReset = userData.lastExerciseReset || userData.lastCheckInDate;
    if (lastReset !== today) {
      console.log('[Exercise] New day detected - resetting exercise counter');
      setAccumulatedMinutes(0);
      resetDay();
    }
  }, [userData.lastExerciseReset, userData.lastCheckInDate, resetDay]);

  const handleStartExercise = (type: 'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom' = 'walk', duration: number | null = null) => {
    // Start exercising
    setIsExercising(true);
    setExerciseType(type);
    setExerciseDuration(duration);
    setExerciseStartTime(Date.now());
    setCurrentAnimation('exercising');
    
    const exerciseNames = {
      walk: 'Walking',
      stretch: 'Stretching', 
      cardio: 'Cardio',
      energizer: 'Energizing'
    };
    
    const durationText = duration ? `${duration} min` : 'stopwatch mode';
    const newMessage = `🏃‍♂️ Alright, let's do this! ${exerciseNames[type].toLowerCase()} time...\nTap "Finish" when done!`;
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
  };

  const handleFinishExercise = () => {
    if (!exerciseStartTime) return;
    
    // Calculate exercise duration for this session
    const exerciseEndTime = Date.now();
    const durationMs = exerciseEndTime - exerciseStartTime;
    const sessionMinutes = Math.floor(durationMs / (1000 * 60));
    const sessionHours = Math.floor(sessionMinutes / 60);
    const sessionMins = sessionMinutes % 60;
    const minutesInt = Math.max(1, sessionMinutes); // Minimum 1 minute
    
    // Format duration string for this session
    const durationText = sessionHours > 0 
      ? `${sessionHours}h ${sessionMins}m` 
      : `${sessionMinutes}m`;
    
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
    
    // Reset ALL states immediately to prevent jumping - including animation
    setIsExercising(false);
    setExerciseStartTime(null);
    setExerciseDuration(null);
    setElapsedSeconds(0);
    setCurrentAnimation('idle'); // Reset animation immediately
    
    // Log exercise in store
    logExercise(minutesInt);
    
    // Calculate rewards based on duration
    const baseReward = Math.min(sessionMinutes * 2, 30); // 2 energy per minute, max 30
    const coinReward = Math.min(sessionMinutes, 20); // 1 coin per minute, max 20
    
    // Update message based on exercise duration and type
    const exerciseNames = {
      walk: 'Walking',
      stretch: 'Stretching', 
      cardio: 'Cardio workout',
      energizer: 'Energy boost'
    };
    
    let newMessage = '';
    if (sessionMinutes < 5) {
      newMessage = `💪 Quick ${durationText} session! Good little break!\n(${totalText} today)`;
    } else if (sessionMinutes >= 5 && sessionMinutes < 15) {
      newMessage = `🎯 Solid ${durationText} workout! Feeling energized!\n(${totalText} today)`;
    } else if (sessionMinutes >= 15) {
      newMessage = `⭐ Wow, ${durationText}! We crushed it! Bonus energy! ⚡\n(${totalText} today)`;
    }
    
    setMessage(newMessage);
    setMessageTimestamp(Date.now());
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageTimestamp(0);
    }, 3000);
  };

  // Format accumulated exercise for display (with minutes)
  const formatAccumulatedExercise = () => {
    if (accumulatedMinutes === 0) return '0m today';
    
    const hours = Math.floor(accumulatedMinutes / 60);
    const mins = accumulatedMinutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m today`;
    } else if (hours > 0) {
      return `${hours}h today`;
    }
    return `${mins}m today`;
  };

  // Format elapsed time as MM:SS or countdown
  const formatElapsedTime = () => {
    if (exerciseDuration === null) {
      // Stopwatch mode - count up
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // Countdown mode - count down
      const totalSeconds = exerciseDuration * 60;
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return {
    isExercising,
    exerciseType,
    exerciseDisplay: formatAccumulatedExercise(),
    exerciseElapsedTime: formatElapsedTime(),
    elapsedSeconds,
    handleStartExercise,
    handleFinishExercise,
    exerciseAnimation: currentAnimation,
    exerciseMessage: message,
    exerciseMessageTimestamp: messageTimestamp,
  };
};