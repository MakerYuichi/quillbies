#!/usr/bin/env node

// Storage clearing utility for Quillby
// This will clear all persisted data so the app starts fresh

const fs = require('fs');

console.log('🧹 Quillby Storage Cleaner');
console.log('This will clear all persisted app data for a fresh start.\n');

// Create a React Native component to clear AsyncStorage
const clearStorageComponent = `
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClearStorageScreen() {
  const clearAllData = async () => {
    try {
      console.log('[Clear] Starting storage clear...');
      
      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      console.log('[Clear] AsyncStorage cleared');
      
      // Specifically clear the Zustand storage key
      await AsyncStorage.removeItem('quillby-storage');
      console.log('[Clear] Zustand storage cleared');
      
      Alert.alert(
        'Storage Cleared!', 
        'All app data has been cleared. Please restart the app.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[Clear] Error clearing storage:', error);
      Alert.alert('Error', 'Failed to clear storage: ' + error.message);
    }
  };

  useEffect(() => {
    // Auto-clear on component mount
    clearAllData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
        Clearing Storage...
      </Text>
      <TouchableOpacity 
        onPress={clearAllData}
        style={{ 
          backgroundColor: '#ff4444', 
          padding: 15, 
          borderRadius: 10,
          marginTop: 20
        }}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          Clear Storage Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
`;

// Write the component
fs.writeFileSync('app/clear-storage-screen.tsx', clearStorageComponent);

console.log('✅ Created clear-storage-screen.tsx');
console.log('\n📋 To clear storage:');
console.log('1. Temporarily replace your main screen with this component');
console.log('2. Run the app - it will auto-clear storage');
console.log('3. Restart the app');
console.log('4. Remove the clear-storage-screen.tsx file');
console.log('\nOr use the manual method below:\n');

// Create manual clearing instructions
const manualInstructions = `
## Manual Storage Clearing

### Method 1: Add to your app temporarily
1. Import and use the ClearStorageScreen component
2. It will auto-clear storage on mount
3. Restart your app

### Method 2: Add this code to any component temporarily:
\`\`\`typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this to useEffect or button press
const clearStorage = async () => {
  await AsyncStorage.clear();
  await AsyncStorage.removeItem('quillby-storage');
  console.log('Storage cleared!');
};
\`\`\`

### Method 3: Reset app data (iOS/Android)
- iOS: Delete and reinstall the app
- Android: Go to Settings > Apps > Quillby > Storage > Clear Data

### Method 4: Development only
If using Expo:
- Run: \`expo r -c\` (reset with clear cache)
- Or: Delete node_modules and reinstall
`;

fs.writeFileSync('CLEAR_STORAGE_GUIDE.md', manualInstructions);

console.log('✅ Created CLEAR_STORAGE_GUIDE.md with detailed instructions');
console.log('\n🎯 Quick fix for your issue:');
console.log('The app is loading old cached data. Use one of the methods above to clear it.');