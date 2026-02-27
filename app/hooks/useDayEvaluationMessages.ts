import { useState, useEffect, useCallback } from 'react';
import { useQuillbyStore } from '../state/store-modular';

export const useDayEvaluationMessages = (buddyName: string) => {
  const [evaluationMessage, setEvaluationMessage] = useState<string>('');
  const [evaluationTimestamp, setEvaluationTimestamp] = useState<number>(0);
  
  // Safely access userData with error handling
  let userData;
  try {
    const store = useQuillbyStore((state) => state);
    userData = store.userData;
  } catch (error) {
    console.warn('[useDayEvaluationMessages] Store access error:', error);
    return {
      evaluationMessage: '',
      evaluationTimestamp: 0
    };
  }

  const clearEvaluation = useCallback(() => {
    try {
      const { userData: currentUserData } = useQuillbyStore.getState();
      if (currentUserData?.lastDayEvaluation) {
        useQuillbyStore.setState({
          userData: {
            ...currentUserData,
            lastDayEvaluation: undefined
          }
        });
      }
    } catch (error) {
      console.warn('[useDayEvaluationMessages] Error clearing evaluation:', error);
    }
  }, []);

  useEffect(() => {
    try {
      // Check if we have a recent day evaluation to show
      if (!userData?.lastDayEvaluation) return;

      const evaluation = userData.lastDayEvaluation;
      const evaluationDate = new Date(evaluation.date);
      const now = new Date();
      
      // Only show evaluation message if it's from today or yesterday
      const daysDiff = Math.floor((now.getTime() - evaluationDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        clearEvaluation();
        return;
      }

      let message = '';
      
      if (evaluation.wasTerribleDay) {
        // Terrible day - no studying at all
        message = `😔 We didn't study together yesterday... I missed having you focus with me.\n` +
                  `${buddyName} feels lonely when we don't learn together. Tomorrow will be better, right?\n` +
                  `💔 Streak Lost: -1 day | 💰 No Q-Coins earned`;
                  
      } else if (evaluation.wasBadDay) {
        // Bad day - poor study and habits
        message = `😟 Yesterday was rough... only ${evaluation.studyHours}h of ${evaluation.studyGoal}h study goal.\n` +
                  `${buddyName} noticed you missed meals and water too. Are you okay?\n` +
                  `💔 Streak Lost: -1 day | 💰 -${evaluation.qCoinsPenalty} Q-Coins`;
                  
      } else if (evaluation.streakBroken) {
        // Streak broken but not terrible
        message = `😕 Your study streak was broken yesterday...\n` +
                  `${buddyName} believes in you though! Let's start fresh today! 💪`;
      }

      if (message) {
        setEvaluationMessage(message);
        setEvaluationTimestamp(Date.now());
        
        // Clear the evaluation after showing it once
        const clearTimer = setTimeout(() => {
          clearEvaluation();
          setEvaluationMessage('');
          setEvaluationTimestamp(0);
        }, 30000); // Clear after 30 seconds
        
        return () => clearTimeout(clearTimer);
      }
    } catch (error) {
      console.warn('[useDayEvaluationMessages] Effect error:', error);
    }
  }, [userData?.lastDayEvaluation, buddyName, clearEvaluation]);

  return {
    evaluationMessage,
    evaluationTimestamp
  };
};