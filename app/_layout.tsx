import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, StatusBar } from 'react-native';
import { useQuillbyStore } from './state/store-modular';
import { authenticateDevice, isDeviceAuthenticated } from '../lib/deviceAuth';
import { requestNotificationPermissions } from '../lib/notifications';
import { ErrorBoundary } from './components/ErrorBoundary';

// Global error handler for unhandled promise rejections
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  const originalHandler = global.ErrorUtils?.setGlobalHandler;
  if (originalHandler) {
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('[GlobalError] Unhandled error:', error);
      
      // Handle keep awake errors specifically (multiple variations)
      const errorMessage = error?.message || '';
      const errorString = String(error);
      if (errorMessage.includes('keep awake') || 
          errorMessage.includes('KeepAwake') ||
          errorMessage.includes('Unable to activate keep awake') ||
          errorString.includes('keep awake') ||
          errorString.includes('KeepAwake')) {
        console.warn('[GlobalError] Keep awake error caught and ignored:', error);
        return; // Don't crash the app for keep awake errors
      }
      
      // Call original handler for other errors
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
  
  // Handle unhandled promise rejections
  if (typeof global.addEventListener === 'function') {
    global.addEventListener('unhandledrejection', (event) => {
      console.error('[GlobalError] Unhandled promise rejection:', event.reason);
      
      // Handle keep awake promise rejections (multiple variations)
      const reasonMessage = event.reason?.message || '';
      const reasonString = String(event.reason);
      if (reasonMessage.includes('keep awake') || 
          reasonMessage.includes('KeepAwake') ||
          reasonMessage.includes('Unable to activate keep awake') ||
          reasonString.includes('keep awake') ||
          reasonString.includes('KeepAwake')) {
        console.warn('[GlobalError] Keep awake promise rejection caught and ignored:', event.reason);
        event.preventDefault(); // Prevent the error from crashing the app
        return;
      }
    });
  }
  
  // Additional error boundary for React Native
  if (global.ErrorUtils && !global.ErrorUtils.getGlobalHandler) {
    global.ErrorUtils.setGlobalHandler = global.ErrorUtils.setGlobalHandler || (() => {});
  }
};

export default function RootLayout() {
  const initializeUser = useQuillbyStore((state) => state.initializeUser);
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Initialize device authentication and user data on app start
  useEffect(() => {
    // Setup global error handlers first
    setupGlobalErrorHandlers();
    
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
        try {
          const result = await authenticateDevice();
          console.log('[App] Device authenticated:', result);
        } catch (authError) {
          console.warn('[App] Device authentication failed, continuing in offline mode:', authError);
        }
      }
      
      // Initialize local user data
      try {
        initializeUser();
        console.log('[App] User data initialized');
      } catch (userError) {
        console.warn('[App] User initialization failed:', userError);
      }
      
      // Request notification permissions
      try {
        console.log('[App] Requesting notification permissions...');
        const notificationPermission = await requestNotificationPermissions();
        if (notificationPermission) {
          console.log('[App] Notification permissions granted');
        } else {
          console.log('[App] Notification permissions denied');
        }
      } catch (notifError) {
        console.warn('[App] Notification setup failed:', notifError);
      }
      
      setIsReady(true);
    } catch (err) {
      console.error('[App] Critical initialization error:', err);
      setAuthError(String(err));
      // Still mark as ready - app can work with basic functionality
      setIsReady(true);
    }
  };
  
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          Loading Quillby...
        </Text>
      </View>
    );
  }
  
  if (authError) {
    console.warn('[App] Running in offline mode:', authError);
    // Don't block the app - just log the error and continue
  }
  
  return (
    <ErrorBoundary>
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
        
        {/* Welcome Back Screen for returning users */}
        <Stack.Screen 
          name="welcome-back" 
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
    </ErrorBoundary>
  );
}
