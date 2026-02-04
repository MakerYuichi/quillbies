// Test Helper Utilities for Quillby App
// Reusable functions and mocks for testing

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  energy: 100,
  maxEnergyCap: 100,
  qCoins: 100,
  messPoints: 0,
  waterGlasses: 0,
  mealsLogged: 0,
  studyMinutesToday: 0,
  exerciseMinutes: 0,
  sleepHours: 0,
  onboardingCompleted: true,
  buddyName: 'TestBuddy',
  selectedCharacter: 'casual',
  studyGoalHours: 4,
  hydrationGoalGlasses: 8,
  mealGoalCount: 3,
  exerciseGoalMinutes: 30,
  sleepGoalHours: 8,
  purchasedItems: [],
  timezone: 'America/Los_Angeles',
  location: 'San Francisco, CA',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const generateMockSession = (overrides = {}) => ({
  id: `session-${Date.now()}`,
  userId: 'test-user-123',
  duration: 25,
  focusScore: 85,
  timestamp: Date.now(),
  sessionType: 'focus',
  completed: true,
  energyDrained: 20,
  qCoinsEarned: 10,
  customName: null,
  backgroundMusic: false,
  strictMode: false,
  ...overrides
});

export const generateMockHabitLog = (habitType, overrides = {}) => ({
  id: `habit-${habitType}-${Date.now()}`,
  userId: 'test-user-123',
  habitType,
  timestamp: Date.now(),
  value: 1,
  energyBonus: getHabitEnergyBonus(habitType),
  ...overrides
});

export const generateMockDeadline = (overrides = {}) => ({
  id: `deadline-${Date.now()}`,
  userId: 'test-user-123',
  title: 'Test Assignment',
  description: 'Complete the test assignment',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  priority: 'medium',
  completed: false,
  createdAt: new Date().toISOString(),
  ...overrides
});

// Helper functions
export const getHabitEnergyBonus = (habitType) => {
  const bonuses = {
    water: 2,
    meal: 15,
    exercise: 10,
    sleep: 25
  };
  return bonuses[habitType] || 0;
};

export const calculateEnergyCapFromMess = (messPoints) => {
  const reduction = Math.floor(messPoints / 3) * 5;
  return Math.max(50, 100 - reduction);
};

export const calculateSessionEnergyDrain = (duration, sessionType = 'focus') => {
  const baseDrain = sessionType === 'premium' ? 15 : 20;
  const durationMultiplier = duration / 25;
  return Math.ceil(baseDrain * durationMultiplier);
};

export const isValidEnergyState = (energy, maxEnergyCap) => {
  return energy >= 0 && 
         energy <= maxEnergyCap && 
         maxEnergyCap >= 50 && 
         maxEnergyCap <= 100;
};

// Storage helpers
export const clearTestStorage = async () => {
  await AsyncStorage.clear();
};

export const setTestStorageData = async (key, data) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

export const getTestStorageData = async (key) => {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Mock store helpers
export const createMockStore = (initialState = {}) => {
  const defaultState = {
    // User state
    ...generateMockUser(),
    
    // Session state
    currentSession: null,
    sessionHistory: [],
    
    // Habit state
    todayHabits: {
      water: { count: 0, goal: 8, lastLogged: null },
      meals: { count: 0, goal: 3, lastLogged: null },
      exercise: { minutes: 0, goal: 30, lastLogged: null },
      sleep: { hours: 0, goal: 8, lastLogged: null }
    },
    
    // Deadline state
    deadlines: [],
    
    // Shop state
    purchasedItems: [],
    
    // UI state
    isLoading: false,
    error: null,
    
    ...initialState
  };
  
  const store = {
    ...defaultState,
    
    // Actions
    updateEnergy: jest.fn((energy) => {
      store.energy = Math.max(0, Math.min(store.maxEnergyCap, energy));
    }),
    
    updateMessPoints: jest.fn((points) => {
      store.messPoints = Math.max(0, points);
      store.maxEnergyCap = calculateEnergyCapFromMess(store.messPoints);
    }),
    
    logHabit: jest.fn((habitType, value = 1) => {
      const habit = store.todayHabits[habitType];
      if (habit) {
        habit.count += value;
        habit.lastLogged = Date.now();
        
        // Add energy bonus
        const bonus = getHabitEnergyBonus(habitType) * value;
        store.updateEnergy(store.energy + bonus);
      }
    }),
    
    startFocusSession: jest.fn((config) => {
      const energyDrain = calculateSessionEnergyDrain(config.duration, config.sessionType);
      if (store.energy >= energyDrain) {
        store.currentSession = {
          ...generateMockSession(),
          ...config,
          startTime: Date.now()
        };
        store.updateEnergy(store.energy - energyDrain);
        return true;
      }
      return false;
    }),
    
    endFocusSession: jest.fn((focusScore = 85) => {
      if (store.currentSession) {
        const completedSession = {
          ...store.currentSession,
          focusScore,
          completed: true,
          endTime: Date.now()
        };
        
        store.sessionHistory.push(completedSession);
        store.studyMinutesToday += completedSession.duration;
        store.qCoins += Math.floor(focusScore / 10);
        store.currentSession = null;
        
        return completedSession;
      }
      return null;
    }),
    
    addDeadline: jest.fn((deadline) => {
      const newDeadline = { ...generateMockDeadline(), ...deadline };
      store.deadlines.push(newDeadline);
      return newDeadline;
    }),
    
    purchaseItem: jest.fn((itemId, cost) => {
      if (store.qCoins >= cost) {
        store.qCoins -= cost;
        store.purchasedItems.push(itemId);
        return true;
      }
      return false;
    }),
    
    // Test helpers
    __reset: () => {
      Object.assign(store, defaultState);
      jest.clearAllMocks();
    },
    
    __setState: (newState) => {
      Object.assign(store, newState);
    }
  };
  
  return store;
};

// Component testing helpers
export const renderWithStore = (component, store = createMockStore()) => {
  // This would typically use a Provider wrapper
  // For now, just return the component with mocked store
  return {
    component,
    store,
    rerender: (newComponent) => ({ component: newComponent, store })
  };
};

export const waitForAsyncUpdates = async () => {
  // Wait for any pending async operations
  await new Promise(resolve => setTimeout(resolve, 0));
};

// Time helpers
export const mockCurrentTime = (timestamp) => {
  jest.spyOn(Date, 'now').mockReturnValue(timestamp);
  jest.spyOn(global.Date, 'now').mockReturnValue(timestamp);
};

export const restoreTime = () => {
  Date.now.mockRestore?.();
  global.Date.now.mockRestore?.();
};

export const advanceTime = (milliseconds) => {
  jest.advanceTimersByTime(milliseconds);
};

// Network helpers
export const mockNetworkSuccess = (data) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data)
  });
};

export const mockNetworkError = (status = 500, message = 'Network Error') => {
  return Promise.reject(new Error(message));
};

// Validation helpers
export const validateUserData = (userData) => {
  const errors = [];
  
  if (!userData.buddyName || userData.buddyName.length === 0) {
    errors.push('Buddy name is required');
  }
  
  if (userData.buddyName && userData.buddyName.length > 20) {
    errors.push('Buddy name must be 20 characters or less');
  }
  
  if (!userData.selectedCharacter) {
    errors.push('Character selection is required');
  }
  
  if (userData.studyGoalHours < 1 || userData.studyGoalHours > 12) {
    errors.push('Study goal must be between 1 and 12 hours');
  }
  
  if (userData.hydrationGoalGlasses < 4 || userData.hydrationGoalGlasses > 15) {
    errors.push('Water goal must be between 4 and 15 glasses');
  }
  
  if (!isValidEnergyState(userData.energy, userData.maxEnergyCap)) {
    errors.push('Invalid energy state');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateSessionConfig = (config) => {
  const errors = [];
  
  if (!config.duration || config.duration < 1 || config.duration > 120) {
    errors.push('Session duration must be between 1 and 120 minutes');
  }
  
  if (config.customName && config.customName.length > 25) {
    errors.push('Custom session name must be 25 characters or less');
  }
  
  if (!['focus', 'premium'].includes(config.sessionType)) {
    errors.push('Invalid session type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Performance helpers
export const measurePerformance = (fn, name = 'operation') => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  
  return {
    result,
    duration: end - start
  };
};

export const measureAsyncPerformance = async (fn, name = 'async operation') => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  
  return {
    result,
    duration: end - start
  };
};

// Test data cleanup
export const cleanupTestData = async () => {
  await clearTestStorage();
  restoreTime();
  jest.clearAllMocks();
  jest.clearAllTimers();
};

// Export all helpers as default object
export default {
  generateMockUser,
  generateMockSession,
  generateMockHabitLog,
  generateMockDeadline,
  getHabitEnergyBonus,
  calculateEnergyCapFromMess,
  calculateSessionEnergyDrain,
  isValidEnergyState,
  clearTestStorage,
  setTestStorageData,
  getTestStorageData,
  createMockStore,
  renderWithStore,
  waitForAsyncUpdates,
  mockCurrentTime,
  restoreTime,
  advanceTime,
  mockNetworkSuccess,
  mockNetworkError,
  validateUserData,
  validateSessionConfig,
  measurePerformance,
  measureAsyncPerformance,
  cleanupTestData
};