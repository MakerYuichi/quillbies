
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
      Alert.alert('Error', 'Failed to clear storage: ' + error);
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
