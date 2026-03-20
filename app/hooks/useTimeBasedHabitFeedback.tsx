// Time-based habit feedback system - shows concerns when behind schedule
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store-modular';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTimeBasedHabitFeedback = (buddyName: string) => {
  const userData = useQuillbyStore((state) => state.userData);
  const getTodaysSleepHours = useQuillbyStore((state) => state.getTodaysSleepHours);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackTimestamp, setFeedbackTimestamp] = useState<number>(0);

  useEffect(() => {
    const checkHabitProgress = async () => {
      const enabledHabits = userData.enabledHabits || [];
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const timeString = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      // Check if this is the first day after onboarding
      const today = new Date().toDateString();
      const firstAppUseDate = await AsyncStorage.getItem('firstAppUseDate');
      const isFirstDay = !firstAppUseDate || firstAppUseDate === today;
      
      // Save first app use date if not set
      if (!firstAppUseDate) {
        await AsyncStorage.setItem('firstAppUseDate', today);
      }
      
      const concerns: string[] = [];
      
      // On first day, show gentle reminders instead of "behind schedule" messages
      if (isFirstDay) {
        // First day gentle reminders
        const firstDayReminders = [];
        
        if (enabledHabits.includes('hydration') && currentHour >= 10) {
          const waterGoal = userData.hydrationGoalGlasses || 8;
          if (userData.waterGlasses < 2) {
            firstDayReminders.push(`Hey! Let's start building our water habit! 💧😊\nTry to have a glass when you can - no pressure today!`);
          }
        }
        
        if (enabledHabits.includes('meals') && currentHour >= 11) {
          if (userData.mealsLogged === 0) {
            firstDayReminders.push(`Don't forget breakfast when you're ready! 🍳😊\nWe're just getting started with our meal routine!`);
          }
        }
        
        if (enabledHabits.includes('study') && currentHour >= 14) {
          const studyHours = (userData.studyMinutesToday || 0) / 60;
          if (studyHours === 0) {
            firstDayReminders.push(`Ready to try a study session? 📚😊\nNo worries if not today - tomorrow we'll start our routine properly!`);
          }
        }
        
        if (enabledHabits.includes('exercise') && currentHour >= 16) {
          if (userData.exerciseMinutes === 0) {
            firstDayReminders.push(`Maybe a little stretch later? 🤸😊\nJust getting familiar with everything today!`);
          }
        }
        
        // Show one random first-day reminder
        if (firstDayReminders.length > 0) {
          const randomReminder = firstDayReminders[Math.floor(Math.random() * firstDayReminders.length)];
          concerns.push(randomReminder);
        }
        
      } else {
        // Regular time-based concerns for subsequent days
        // Check each enabled habit for time-based concerns
        for (const habit of enabledHabits) {
          switch (habit) {
            case 'study':
              const studyHours = (userData.studyMinutesToday || 0) / 60;
              const studyGoal = userData.studyGoalHours || 0;
              
              let expectedProgress = 0;
              let timeContext = '';
              
              if (currentHour >= 21) {
                expectedProgress = 1.0;
                timeContext = `It's ${timeString}`;
              } else if (currentHour >= 18) {
                expectedProgress = 0.75;
                timeContext = `It's ${timeString}`;
              } else if (currentHour >= 12) {
                expectedProgress = 0.33;
                timeContext = `It's ${timeString}`;
              } else if (currentHour >= 9) {
                expectedProgress = 0.1;
                timeContext = `It's ${timeString}`;
              }
              
              const expectedHours = studyGoal * expectedProgress;
              if (studyHours < expectedHours && expectedProgress > 0) {
                const behind = expectedHours - studyHours;
                const h = Math.floor(behind);
                const m = Math.round((behind - h) * 60);
                const behindText = h > 0 ? `${h}h ${m}min` : `${m}min`;
                concerns.push(`${timeContext} and we're ${behindText} behind on studying... 📚😟\nI feel sad when we fall behind our study goals!`);
              }
              break;
              
            case 'hydration':
              const waterGoal = userData.hydrationGoalGlasses || 8;
              let expectedWater = 0;
              let waterTimeContext = '';
              
              if (currentHour >= 22) {
                expectedWater = waterGoal;
                waterTimeContext = `It's ${timeString}`;
              } else if (currentHour >= 18) {
                expectedWater = waterGoal * 0.8;
                waterTimeContext = `It's ${timeString}`;
              } else if (currentHour >= 14) {
                expectedWater = waterGoal * 0.6;
                waterTimeContext = `It's ${timeString}`;
              } else if (currentHour >= 10) {
                expectedWater = waterGoal * 0.4;
                waterTimeContext = `It's ${timeString}`;
              } else if (currentHour >= 7) {
                expectedWater = waterGoal * 0.2;
                waterTimeContext = `It's ${timeString}`;
              }
              
              if (userData.waterGlasses < expectedWater && expectedWater > 0) {
                const behind = Math.ceil(expectedWater - userData.waterGlasses);
                concerns.push(`${waterTimeContext} and I still haven't had enough water... need ${behind} more glasses 💧😔\nI get worried when we don't stay hydrated!`);
              }
              break;
              
            case 'meals':
              const mealGoal = userData.mealGoalCount || 3;
              let expectedMeals = 0;
              let mealTimeContext = '';
              
              if (currentHour >= 20) {
                expectedMeals = mealGoal;
                mealTimeContext = `It's ${timeString}`;
              } else if (currentHour >= 14) {
                expectedMeals = 2;
                mealTimeContext = `It's ${timeString}`;
              } else if (currentHour >= 10) {
                expectedMeals = 1;
                mealTimeContext = `It's ${timeString}`;
              }
              
              if (userData.mealsLogged < expectedMeals && expectedMeals > 0) {
                const behind = expectedMeals - userData.mealsLogged;
                const mealType = expectedMeals === 1 ? 'breakfast' : 
                               expectedMeals === 2 ? 'lunch' : 'dinner';
                concerns.push(`${mealTimeContext} and we missed ${mealType}... tummy's getting sad 🍽️😕\nI feel down when we skip meals - our body needs fuel!`);
              }
              break;
              
            case 'exercise':
              const exerciseGoal = userData.exerciseGoalMinutes || 30;
              if (currentHour >= 18) {
                const expectedExercise = exerciseGoal * 0.5;
                if (userData.exerciseMinutes < expectedExercise) {
                  concerns.push(`It's ${timeString} and we haven't moved much today... feeling sluggish 🏃😴\nI get sad when we don't move our body - it makes me feel tired!`);
                }
              }
              break;
              
            case 'sleep':
              if (currentHour >= 6 && currentHour <= 14) {
                const sleepGoal = userData.sleepGoalHours || 7;
                const todaysSleepHours = getTodaysSleepHours();
                const expectedSleep = sleepGoal * 0.8;
                
                if (todaysSleepHours < expectedSleep) {
                  const behind = expectedSleep - todaysSleepHours;
                  const h = Math.floor(behind);
                  const m = Math.round((behind - h) * 60);
                  const behindText = h > 0 ? `${h}h ${m}min` : `${m}min`;
                  concerns.push(`Didn't get enough sleep last night... ${behindText} short and feeling tired 😴💤\nI feel groggy when we don't get enough rest!`);
                }
              }
              break;
          }
        }
      }
      
      // If we have concerns, show the most urgent one
      if (concerns.length > 0) {
        const message = concerns[0]; // Show first (most urgent) concern
        setFeedbackMessage(message);
        setFeedbackTimestamp(Date.now());
      } else if (!isFirstDay) {
        // No concerns - maybe show positive feedback occasionally (but not on first day)
        const shouldShowPositive = Math.random() < 0.1; // 10% chance every 5 minutes
        if (shouldShowPositive && enabledHabits.length > 0) {
          const positiveMessages = [
            `${timeString} and we're doing great! All habits on track! 😊✨`,
            `Loving how we're keeping up with everything today! 💪😄`,
            `${timeString} - feeling good about our progress! 🌟`,
            `We're crushing it today! Everything's on schedule! 🎯😊`,
            `${timeString} and I'm so proud of us! Great job! 🎉💚`
          ];
          
          const randomMessage = positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
          setFeedbackMessage(randomMessage);
          setFeedbackTimestamp(Date.now());
        }
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkHabitProgress, 5 * 60 * 1000);
    
    // Initial check
    checkHabitProgress();

    return () => clearInterval(interval);
  }, [userData.studyMinutesToday, userData.waterGlasses, userData.mealsLogged, userData.exerciseMinutes, userData.enabledHabits, getTodaysSleepHours]);

  return {
    feedbackMessage,
    feedbackTimestamp,
  };
};