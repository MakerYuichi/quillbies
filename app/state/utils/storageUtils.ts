// Storage utilities for the store
import { createJSONStorage } from 'zustand/middleware';

// Temporary fallback storage for development
const tempStorage = {
  data: {} as Record<string, string>,
  getItem: async (key: string) => {
    console.log('[TempStorage] Getting:', key);
    return tempStorage.data[key] || null;
  },
  setItem: async (key: string, value: string) => {
    console.log('[TempStorage] Setting:', key, 'Size:', value.length);
    tempStorage.data[key] = value;
  },
  removeItem: async (key: string) => {
    console.log('[TempStorage] Removing:', key);
    delete tempStorage.data[key];
  },
};

// Try to use AsyncStorage, fallback to tempStorage if not available
let storage;
try {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
  console.log('[Storage] Using AsyncStorage');
} catch (error) {
  storage = tempStorage;
  console.log('[Storage] Using temporary fallback storage');
}

export const createStorage = () => createJSONStorage(() => storage);