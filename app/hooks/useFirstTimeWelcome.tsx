// First-time welcome message when user enters the app
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFirstTimeWelcome = (userName: string, buddyName: string, onboardingCompleted: boolean) => {
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [welcomeTimestamp, setWelcomeTimestamp] = useState<number>(0);
  const [isShowingWelcome, setIsShowingWelcome] = useState<boolean>(false);

  useEffect(() => {
    const checkFirstTimeToday = async () => {
      try {
        // Only show welcome if onboarding is completed
        if (!onboardingCompleted) return;
        
        const today = new Date().toDateString();
        const lastWelcomeDate = await AsyncStorage.getItem('lastWelcomeDate');
        
        // Show welcome if it's a new day or first time ever
        if (lastWelcomeDate !== today) {
          const displayName = userName || 'there';
          const welcomeMsg = `Hi ${displayName}! I'm ${buddyName}! 👋\nYou study, ${buddyName} helps! Let's have a great day together! 😊`;
          
          setWelcomeMessage(welcomeMsg);
          setWelcomeTimestamp(Date.now());
          setIsShowingWelcome(true);
          
          // Clear welcome message after 4 seconds
          setTimeout(() => {
            setWelcomeMessage('');
            setWelcomeTimestamp(0);
            setIsShowingWelcome(false);
          }, 4000);
          
          // Save today's date
          await AsyncStorage.setItem('lastWelcomeDate', today);
          
          console.log('[Welcome] Showing first-time welcome for today');
        }
      } catch (error) {
        console.warn('[Welcome] Error checking first-time status:', error);
      }
    };

    // Only show welcome if we have both names and onboarding is done
    if (userName && buddyName && onboardingCompleted) {
      checkFirstTimeToday();
    }
  }, [userName, buddyName, onboardingCompleted]);

  return {
    welcomeMessage,
    welcomeTimestamp,
    isShowingWelcome,
  };
};