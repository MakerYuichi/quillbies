import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text } from 'react-native';
import { useQuillbyStore } from './state/store';
import { authenticateDevice, isDeviceAuthenticated } from '../lib/deviceAuth';
import { requestNotificationPermissions } from '../lib/notifications';

export default function RootLayout() {
  const initializeUser = useQuillbyStore((state) => state.initializeUser);
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Initialize device authentication and user data on app start
  useEffect(() => {
    initializeAuth();
  }, []);
  
  const initializeAuth = async () => {
    try {
      console.log('[App] Initializing device authentication...');
      
      // Check if already authenticated
      const authenticated = await isDeviceAuthenticated();
      
      if (authenticated) {
        console.log('[App] Device already authenticated');
      } else {
        // Authenticate device
        const result = await authenticateDevice();
        console.log('[App] Device authenticated:', result);
      }
      
      // Initialize local user data
      initializeUser();
      
      // Request notification permissions
      console.log('[App] Requesting notification permissions...');
      const notificationPermission = await requestNotificationPermissions();
      if (notificationPermission) {
        console.log('[App] Notification permissions granted');
      } else {
        console.log('[App] Notification permissions denied');
      }
      
      setIsReady(true);
    } catch (err) {
      console.error('[App] Auth initialization failed:', err);
      setAuthError(String(err));
      // Still mark as ready - app can work with local storage
      setIsReady(true);
    }
  };
  
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          Setting up your account...
        </Text>
      </View>
    );
  }
  
  if (authError) {
    console.warn('[App] Running in offline mode:', authError);
    // Don't block the app - just log the error and continue
  }
  
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false, // Hide header for all screens (onboarding needs full screen)
        }}
      >
      {/* Onboarding Screens - Welcome is now the ENTRY POINT */}
      <Stack.Screen 
        name="onboarding/welcome" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="onboarding/character-select" 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Main App Screens */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Quillby',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FF9800',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="study-session" 
        options={{ 
          title: 'Focus Session',
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      </Stack>
    </SafeAreaProvider>
  );
}
