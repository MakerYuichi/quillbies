// Exercise tracking hook with timer functionality like sleep
import { useState, useEffect, useRef } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import { playEndSessionSound } from '../../lib/soundManager';
import { soundManager, SOUNDS } from '../../lib/soundManager';

export const useExerciseTracking = (buddyName: string) => {
  const userData = useQuillbyStore((state) => state.userData);
  const logExercise = useQuillbyStore((state) => state.logExercise);
  const resetDay = useQuillbyStore((state) => state.resetDay);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  
  // Track sound loop control
  const soundLoopActive = useRef(false);

  // Sound loop effect - plays jumping and wet grass sounds simultaneously during exercise
  useEffect(() => {
    if (!isExercising) {
      soundLoopActive.current = false;
      // Stop all exercise sounds immediately
      soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
      soundManager.stopSound(SOUNDS.WET_GRASS);
      return;
    }

    soundLoopActive.current = true;

    // Play jumping sound loop - every 2 seconds
    (async () => {
      while (soundLoopActive.current) {
        try {
          await soundManager.playSound(SOUNDS.HAMSTER_JUMPING, 1.0, 0.6);
          console.log(`[Exercise] Playing jumping sound`);
          
          // Wait 2 seconds before next jump
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if loop should stop
          if (!soundLoopActive.current) {
            break;
          }
        } catch (error) {
          console.error(`[Exercise] Error playing jumping sound:`, error);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
      console.log('[Exercise] Jumping sound loop stopped');
    })();

    // Play wet grass sound loop (simultaneously) - continuous background
    (async () => {
      // Small delay before starting wet grass to layer the sounds
      await new Promise(resolve => setTimeout(resolve, 500));
      
      while (soundLoopActive.current) {
        try {
          await soundManager.playSound(SOUNDS.WET_GRASS, 1.0, 0.5);
          console.log(`[Exercise] Playing wet grass sound`);
          
          // Wait 3 seconds before replaying (longer for background ambience)
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Check if loop should stop
          if (!soundLoopActive.current) {
            break;
          }
        } catch (error) {
          console.error(`[Exercise] Error playing wet grass sound:`, error);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      soundManager.stopSound(SOUNDS.WET_GRASS);
      console.log('[Exercise] Wet grass sound loop stopped');
    })();

    return () => {
      console.log('[Exercise] Cleaning up sound loops');
      soundLoopActive.current = false;
      soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
      soundManager.stopSound(SOUNDS.WET_GRASS);
    };
  }, [isExercising]);

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

  const setTimedMessage = (text: string, durationMs = 4000) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage(text);
    setMessageTimestamp(Date.now());
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
      setMessageTimestamp(0);
    }, durationMs);
  };

  const handleStartExercise = (type: 'walk' | 'stretch' | 'cardio' | 'energizer' | 'custom' = 'walk', duration: number | null = null) => {
    // Start exercising
    setIsExercising(true);
    setExerciseType(type);
    setExerciseDuration(duration);
    setExerciseStartTime(Date.now());
    setCurrentAnimation('exercising');
    
    const startMessages: Record<string, string> = {
      walk: `🚶 Let's go for a walk, ${buddyName} is cheering you on!\nTap "Finish" when done!`,
      stretch: `🧘 Stretch it out! ${buddyName} is loosening up too!\nTap "Finish" when done!`,
      cardio: `🔥 Cardio time! ${buddyName} is hyped up!\nTap "Finish" when done!`,
      energizer: `⚡ Quick energizer! ${buddyName} is bouncing with you!\nTap "Finish" when done!`,
      custom: `🏃‍♂️ Custom workout! ${buddyName} is ready for anything!\nTap "Finish" when done!`,
    };
    
    const newMessage = startMessages[type] ?? `🏃‍♂️ Let's do this! Tap "Finish" when done!`;
    setTimedMessage(newMessage);
  };

  const handleFinishExercise = () => {
    if (!exerciseStartTime) return;
    
    // Play end session sound
    playEndSessionSound();
    
    // Stop exercise sounds immediately
    soundLoopActive.current = false;
    soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
    soundManager.stopSound(SOUNDS.WET_GRASS);
    console.log('[Exercise] Stopping exercise sounds immediately');
    
    // Calculate exercise duration for this session
    const exerciseEndTime = Date.now();
    const durationMs = exerciseEndTime - exerciseStartTime;
    const sessionMinutes = Math.floor(durationMs / (1000 * 60));
    const minutesInt = Math.max(1, sessionMinutes); // Minimum 1 minute
    
    // Calculate new accumulated minutes
    const newAccumulatedMinutes = accumulatedMinutes + sessionMinutes;
    setAccumulatedMinutes(newAccumulatedMinutes);
    
    // Reset ALL states immediately to prevent jumping - including animation
    setIsExercising(false);
    setExerciseStartTime(null);
    const targetDuration = exerciseDuration; // Save before resetting
    setExerciseDuration(null);
    setElapsedSeconds(0);
    setCurrentAnimation('idle'); // Reset animation immediately
    
    // Log exercise in store
    logExercise(minutesInt);

    // Update speech bubble with completion message
    const completionMessages: Record<string, string> = {
      walk: `🚶 Great walk! ${buddyName} is proud of you! +${minutesInt}min 💪`,
      stretch: `🧘 Feeling flexible! ${buddyName} loved that stretch! +${minutesInt}min ✨`,
      cardio: `🔥 Crushed it! ${buddyName} is fired up! +${minutesInt}min 🏆`,
      energizer: `⚡ Energized! ${buddyName} is buzzing! +${minutesInt}min 🌟`,
      custom: `🏃‍♂️ Workout done! ${buddyName} is impressed! +${minutesInt}min 💪`,
    };
    const savedType = exerciseType;
    setTimedMessage(completionMessages[savedType] ?? `✅ Exercise done! +${minutesInt}min 💪`);
    
    // Return completion data for modal
    return {
      duration: sessionMinutes,
      targetDuration: targetDuration,
      accumulatedMinutes: newAccumulatedMinutes,
    };
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

  // Cleanup message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

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