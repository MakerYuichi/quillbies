// Idle message system - shows casual messages when user is inactive
import { useState, useEffect } from 'react';
import { useQuillbyStore } from '../state/store-modular';

// Idle message collections - now as a function to use buddyName
const getIdleMessages = (buddyName: string) => ({
  general: [
    `Whatcha working on? Curious ${buddyName} here! 🤔`,
    "Just rearranged my room a bit - what do you think? 🏠",
    "Just practicing my reading... books are heavy!",
    "Thinking about all the things we'll learn today!",
    "My plant buddy says hi! 🌿",
    "I've been doing some hamster yoga... very relaxing!",
    "Did you know hamsters can run 5 miles a night? I prefer studying though 📚",
    "I organized my seed collection by size today!",
    "Sometimes I wonder what it's like to be a big hamster...",
    "I found a cozy spot for napping later! 😴"
  ],
  morning: [
    "Mornin'! Ready to make today awesome? ☀️",
    "Morning! I already did my hamster stretches!",
    "Fresh day, fresh start! Let's make it count!",
    "The early hamster gets the... knowledge? 📚",
    "Morning sunshine! What's on the agenda today?",
    "I love mornings! So much potential for learning!",
    "Rise and shine! Time to be productive! ✨"
  ],
  afternoon: [
    "Afternoon slump? Maybe a snack would help? 🍎",
    "Productive afternoon ahead! We got this!",
    "How's your day going? Mine's been pretty chill so far",
    "Halfway through the day! Looking good! 💪",
    "Afternoon vibes... perfect for focused work!",
    "The sun's nice and warm right now ☀️",
    "Lunch digested? Ready for more studying?"
  ],
  evening: [
    "Evening time! Winding down or still going? 🌆",
    "Nice sunset vibes... good study atmosphere!",
    "Evening study sessions are so cozy!",
    "The evening is my favorite time to learn!",
    "Golden hour! Everything looks so pretty! 🌅",
    "Evening energy is different... more focused somehow",
    "Almost dinner time! But first, studies! 📖"
  ],
  night: [
    "Late night study? I'll keep you company! 🌙",
    "Night owl mode activated! I'm awake too!",
    "Quiet night... perfect for focused work!",
    "The stars are out! So peaceful! ✨",
    "Late night studying hits different, doesn't it?",
    "I'm a nocturnal hamster anyway! Let's go! 🌙",
    "Night time is the right time for deep focus!"
  ],
  energyBased: {
    high: [
      "So much energy! Let's do something fun! ⚡",
      "So much energy! Ready for anything! 💪",
      "Feeling pumped! What should we tackle first?",
      "I could run a marathon! Well, a hamster-sized one! 🏃"
    ],
    medium: [
      "Chillin'... good vibes today 😊",
      "Nice and relaxed... good study mood!",
      "Comfortable energy level... not too much, not too little!",
      "Just the right amount of energy for focus! 🎯"
    ],
    low: [
      "Taking it easy... conserving my hammy energy 😴",
      "Feeling a bit sleepy... but I'm here for you!",
      "Low energy mode... but still ready to help! 💤",
      "Maybe we both need a little rest soon?"
    ]
  },
  messBased: {
    clean: [
      "Room's looking tidy! Nice work! ✨",
      "I love when everything is tidy! So peaceful!",
      "Clean room, clear mind! Ready to study! 📚",
      "Everything in its place! Feels good!"
    ],
    messy: [
      "Could use a quick tidy-up later maybe? 🧹",
      "I can barely see my desk under all this mess!",
      "Cleaning might help us focus better... just saying! 🗑️",
      "My mom would not approve of this mess... 😅"
    ]
  },
  studyMotivation: [
    "Every bit of studying adds up! 📚",
    "You're doing great! Keep going! 💪",
    "Learning's like leveling up! 🎮",
    "Small steps every day lead to big achievements! ⭐",
    "I believe in us! We can do this! 📚",
    "Knowledge is the best treasure! Let's collect some! 💎"
  ]
});

const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

export const useIdleMessages = (buddyName: string) => {
  const userData = useQuillbyStore((state) => state.userData);
  const [idleMessage, setIdleMessage] = useState<string>('');
  const [idleTimestamp, setIdleTimestamp] = useState<number>(0);
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(Date.now());

  // Reset interaction time when user does something
  const resetIdleTimer = () => {
    setLastInteractionTime(Date.now());
  };

  useEffect(() => {
    const IDLE_MESSAGES = getIdleMessages(buddyName);
    
    const checkIdle = () => {
      const now = Date.now();
      const timeSinceInteraction = now - lastInteractionTime;
      
      // Show idle message after 2 minutes of inactivity
      if (timeSinceInteraction > 120000) { // 2 minutes
        const hour = new Date().getHours();
        const messages: string[] = [];

        // Add time-of-day messages
        if (hour >= 6 && hour < 12) {
          messages.push(...IDLE_MESSAGES.morning);
        } else if (hour >= 12 && hour < 17) {
          messages.push(...IDLE_MESSAGES.afternoon);
        } else if (hour >= 17 && hour < 21) {
          messages.push(...IDLE_MESSAGES.evening);
        } else {
          messages.push(...IDLE_MESSAGES.night);
        }

        // Add energy-based messages
        const energyPercent = (userData.energy / 100) * 100;
        if (energyPercent > 70) {
          messages.push(...IDLE_MESSAGES.energyBased.high);
        } else if (energyPercent > 40) {
          messages.push(...IDLE_MESSAGES.energyBased.medium);
        } else {
          messages.push(...IDLE_MESSAGES.energyBased.low);
        }

        // Add mess-based messages
        if (userData.messPoints > 5) {
          messages.push(...IDLE_MESSAGES.messBased.messy);
        } else {
          messages.push(...IDLE_MESSAGES.messBased.clean);
        }

        // Always add general messages and study motivation
        messages.push(...IDLE_MESSAGES.general);
        messages.push(...IDLE_MESSAGES.studyMotivation);

        // Pick a random message
        const message = getRandomMessage(messages);
        setIdleMessage(message);
        setIdleTimestamp(now);
        
        // Reset timer so we don't spam messages
        setLastInteractionTime(now);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkIdle, 30000);

    return () => clearInterval(interval);
  }, [lastInteractionTime, userData.energy, userData.messPoints, buddyName]);

  return {
    idleMessage,
    idleTimestamp,
    resetIdleTimer,
  };
};
