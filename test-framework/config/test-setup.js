// Global Test Setup for Quillby App
// This file runs before all tests

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-constants', () => ({
  default: {
    appOwnership: 'standalone',
    deviceId: 'test-device-id',
    sessionId: 'test-session-id'
  }
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  setNotificationHandler: jest.fn()
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10
    }
  })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{
    city: 'San Francisco',
    region: 'CA',
    country: 'US',
    timezone: 'America/Los_Angeles'
  }]))
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve())
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve())
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInAnonymously: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null })),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null }))
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: jest.fn((callback) => callback({ data: [], error: null }))
    }))
  }))
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn()
  }),
  useRoute: () => ({
    params: {},
    name: 'TestScreen'
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }) => children
}));

// Mock Zustand
jest.mock('zustand', () => ({
  create: (createState) => {
    const store = createState((set, get) => ({
      ...createState(set, get),
      // Add test helpers
      __testReset: () => set(createState(set, get))
    }));
    return store;
  }
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  State: {
    BEGAN: 'BEGAN',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    END: 'END'
  },
  Directions: {
    RIGHT: 1,
    LEFT: 2,
    UP: 4,
    DOWN: 8
  }
}));

// Global test utilities
global.mockUserData = {
  energy: 100,
  maxEnergyCap: 100,
  qCoins: 100,
  messPoints: 0,
  waterGlasses: 0,
  mealsLogged: 0,
  studyMinutesToday: 0,
  exerciseMinutes: 0,
  onboardingCompleted: true,
  buddyName: 'TestBuddy',
  selectedCharacter: 'casual',
  studyGoalHours: 4,
  hydrationGoalGlasses: 8,
  mealGoalCount: 3,
  exerciseGoalMinutes: 30,
  sleepGoalHours: 8,
  purchasedItems: ['premium'],
  timezone: 'America/Los_Angeles',
  location: 'San Francisco, CA'
};

global.mockSessionData = {
  id: 'test-session-1',
  duration: 25,
  focusScore: 85,
  timestamp: Date.now(),
  sessionType: 'focus',
  completed: true
};

global.mockHabitData = {
  water: { count: 3, goal: 8, lastLogged: Date.now() },
  meals: { count: 2, goal: 3, lastLogged: Date.now() },
  exercise: { minutes: 20, goal: 30, lastLogged: Date.now() },
  sleep: { hours: 7.5, goal: 8, lastLogged: Date.now() }
};

// Test environment setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset console methods
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  
  // Mock current time for consistent testing
  jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01 00:00:00 UTC
});

afterEach(() => {
  // Restore console methods
  console.warn.mockRestore?.();
  console.error.mockRestore?.();
  
  // Restore Date.now
  Date.now.mockRestore?.();
});

// Global error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock timers for consistent testing
jest.useFakeTimers();

// Custom matchers for better assertions
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveValidEnergyState(received) {
    const hasValidEnergy = received.energy >= 0 && received.energy <= received.maxEnergyCap;
    const hasValidCap = received.maxEnergyCap >= 50 && received.maxEnergyCap <= 100;
    
    if (hasValidEnergy && hasValidCap) {
      return {
        message: () => `expected energy state to be invalid`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected valid energy state (energy: ${received.energy}/${received.maxEnergyCap})`,
        pass: false,
      };
    }
  }
});