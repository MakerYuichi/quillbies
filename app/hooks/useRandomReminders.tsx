// Random reminder system for Casual character
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store';

// Message collections
const REMINDER_MESSAGES = {
  water: [
    "Hey, my water bottle's looking lonely... thirsty? 💧",
    "Just thinking about how good water tastes right now...",
    "My plant friend looks thirsty too! Water break? 🌿",
    "Hydration time maybe? I'm getting a bit parched..."
  ],
  meal: {
    breakfast: [
      "My tummy's rumbling... breakfast time maybe? 🍎",
      "Morning! How about some breakfast?",
      "I could go for some breakfast... how about you?",
      "Getting hungry over here... what's for breakfast?"
    ],
    lunch: [
      "Lunch time! My little hamster tummy is ready! 🍽️",
      "I could use some lunch... how about you?",
      "Midday meal break? I'm getting hungry!",
      "Lunch time! Let's refuel for the afternoon!"
    ],
    dinner: [
      "Dinner time! What are we having? 🍽️",
      "Evening meal time! I'm getting hungry!",
      "My tummy says it's dinner time!",
      "How about some dinner? I'm ready to eat!"
    ]
  },
  exercise: [
    "I'm feeling a bit stiff... stretch break maybe? 🤸",
    "Could use some movement! Wanna get active with me?",
    "My legs are getting restless... exercise time?",
    "Feeling cooped up! Let's move around a bit? 🏃"
  ],
  sleep: [
    "Getting sleepy... bedtime soon maybe? 😴",
    "My eyes are getting heavy... sleep schedule check?",
    "I'm yawning... might be time to wind down soon",
    "Feeling drowsy over here... sleep soon?"
  ],
  general: [
    "What are we studying today? I'm curious! 🤔",
    "I rearranged my room a bit! Like it? 🏠",
    "Just practicing my reading... books are heavy!",
    "Thinking about all the things we'll learn today!",
    "My plant friend says hi! 🌿"
  ],
  timeOfDay: {
    morning: [
      "Good morning! Ready to make today awesome? ☀️",
      "Morning! I already did my hamster stretches!",
      "Fresh day, fresh start! Let's make it count!"
    ],
    afternoon: [
      "Afternoon slump? Maybe a snack would help? 🍎",
      "Productive afternoon ahead! We got this!",
      "How's your day going? Mine's been pretty chill so far"
    ],
    evening: [
      "Evening time! Winding down or still going? 🌆",
      "Nice sunset vibes... good study atmosphere!",
      "Evening study sessions are so cozy!"
    ],
    night: [
      "Late night study? I'll keep you company! 🌙",
      "Night owl mode activated! I'm awake too!",
      "Quiet night... perfect for focused work!"
    ]
  }
};

const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export const useRandomReminders = (buddyName: string) => {
  const { userData } = useQuillbyStore();
  const [reminderMessage, setReminderMessage] = useState<string>('');
  const [reminderTimestamp, setReminderTimestamp] = useState<number>(0);

  useEffect(() => {
    // Check for reminders every 15 minutes
    const checkReminders = () => {
      const now = new Date();
      const hour = now.getHours();
      const reminders: string[] = [];

      // Only show reminders if habits are enabled
      const enabledHabits = userData.enabledHabits || [];

      // Morning (6-11 AM): Breakfast reminder
      if (hour >= 6 && hour <= 11 && !userData.ateBreakfast && enabledHabits.includes('meals')) {
        reminders.push(...REMINDER_MESSAGES.meal.breakfast);
      }

      // Lunch time (11 AM-2 PM): Lunch reminder
      if (hour >= 11 && hour <= 14 && userData.mealsLogged < 2 && enabledHabits.includes('meals')) {
        reminders.push(...REMINDER_MESSAGES.meal.lunch);
      }

      // Dinner time (5-8 PM): Dinner reminder
      if (hour >= 17 && hour <= 20 && userData.mealsLogged < 3 && enabledHabits.includes('meals')) {
        reminders.push(...REMINDER_MESSAGES.meal.dinner);
      }

      // Day (10 AM-6 PM): Water reminders
      if (hour >= 10 && hour <= 18 && userData.waterGlasses < 6 && enabledHabits.includes('hydration')) {
        reminders.push(...REMINDER_MESSAGES.water);
      }

      // Evening (5-9 PM): Exercise reminder
      if (hour >= 17 && hour <= 21 && userData.exerciseMinutes < 15 && enabledHabits.includes('exercise')) {
        reminders.push(...REMINDER_MESSAGES.exercise);
      }

      // Night (9 PM-1 AM): Sleep reminder
      if ((hour >= 21 || hour <= 1) && enabledHabits.includes('sleep')) {
        reminders.push(...REMINDER_MESSAGES.sleep);
      }

      // Add time-of-day messages
      if (hour >= 6 && hour < 12) {
        reminders.push(...REMINDER_MESSAGES.timeOfDay.morning);
      } else if (hour >= 12 && hour < 17) {
        reminders.push(...REMINDER_MESSAGES.timeOfDay.afternoon);
      } else if (hour >= 17 && hour < 21) {
        reminders.push(...REMINDER_MESSAGES.timeOfDay.evening);
      } else {
        reminders.push(...REMINDER_MESSAGES.timeOfDay.night);
      }

      // Always add general messages
      reminders.push(...REMINDER_MESSAGES.general);

      // Pick a random reminder
      if (reminders.length > 0) {
        const message = getRandomMessage(reminders);
        setReminderMessage(message);
        setReminderTimestamp(Date.now());
      }
    };

    // Initial check
    checkReminders();

    // Check every 15 minutes (900000 ms)
    const interval = setInterval(checkReminders, 900000);

    return () => clearInterval(interval);
  }, [userData.ateBreakfast, userData.mealsLogged, userData.waterGlasses, userData.exerciseMinutes, userData.enabledHabits]);

  return {
    reminderMessage,
    reminderTimestamp,
  };
};
