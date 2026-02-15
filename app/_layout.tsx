import { Stack } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, Image, AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useQuillbyStore } from './state/store-modular';
import { authenticateDevice, isDeviceAuthenticated } from '../lib/deviceAuth';
import { requestNotificationPermissions, sendMessNotification } from '../lib/notifications';
import { ErrorBoundary } from './components/ErrorBoundary';
import ImagePreloader from './components/ImagePreloader';

// Preload critical images at app startup
const preloadImages = async () => {
  const images = [
    // Theme background
    require('../assets/backgrounds/theme.png'),
    // Room essentials
    require('../assets/rooms/walls.png'),
    require('../assets/rooms/floor.png'),
    // Hamster idle states
    require('../assets/hamsters/casual/idle-sit.png'),
    require('../assets/hamsters/casual/idle-sit-happy.png'),
    // Common hamster states
    require('../assets/hamsters/casual/drinking.png'),
    require('../assets/hamsters/casual/eating-normal.png'),
    require('../assets/hamsters/casual/sleeping.png'),
    require('../assets/hamsters/casual/wake-up.png'),
    // Decorations
    require('../assets/backgrounds/bluebg.png'),
    require('../assets/hamsters/casual/photo-frame.png'),
    require('../assets/hamsters/photo-frame2.png'),
    require('../assets/rooms/lamp.png'),
    require('../assets/rooms/fairy-lights.png'),
    require('../assets/rooms/plant.png'),
    require('../assets/overall/qbies.png'),
    // Exercise environment
    require('../assets/exercise/sky.png'),
    require('../assets/exercise/grass.png'),
    require('../assets/hamsters/casual/jumping.gif'),
    // Shop decorations
    require('../assets/shop/decoration/fairy-lights/colored.png'),
    require('../assets/shop/decoration/plants/succulent-plant.png'),
    require('../assets/shop/decoration/plants/swiss-cheese-plant.png'),
  ];

  try {
    console.log('[App] Preloading', images.length, 'critical images...');
    await Promise.all(
      images.map(image => {
        try {
          return Image.prefetch(Image.resolveAssetSource(image).uri);
        } catch (error) {
          console.warn('[App] Failed to preload image:', error);
          return Promise.resolve();
        }
      })
    );
    console.log('[App] Image preloading complete');
  } catch (error) {
    console.warn('[App] Image preloading failed:', error);
  }
};

// Global error handler for unhandled promise rejections
const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  const originalHandler = (global as any).ErrorUtils?.setGlobalHandler;
  if (originalHandler) {
    (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
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
    global.addEventListener('unhandledrejection', (event: any) => {
      // Handle keep awake promise rejections (multiple variations)
      const reasonMessage = event.reason?.message || '';
      const reasonString = String(event.reason);
      const reasonName = event.reason?.name || '';
      
      if (reasonMessage.includes('keep awake') || 
          reasonMessage.includes('KeepAwake') ||
          reasonMessage.includes('Unable to activate keep awake') ||
          reasonString.includes('keep awake') ||
          reasonString.includes('KeepAwake') ||
          reasonName.includes('KeepAwake')) {
        console.warn('[GlobalError] Keep awake promise rejection caught and ignored');
        event.preventDefault(); // Prevent the error from crashing the app
        return;
      }
      
      console.error('[GlobalError] Unhandled promise rejection:', event.reason);
    });
  }
  
  // Additional error boundary for React Native
  if ((global as any).ErrorUtils && !(global as any).ErrorUtils.getGlobalHandler) {
    (global as any).ErrorUtils.setGlobalHandler = (global as any).ErrorUtils.setGlobalHandler || (() => {});
  }
};

export default function RootLayout() {
  // Load Schoolbell font
  const [fontsLoaded] = useFonts({
    'Schoolbell': require('../assets/fonts/Schoolbell-Regular.ttf'),
  });
  
  // Use separate selectors to prevent object recreation
  const initializeUser = useQuillbyStore((state) => state.initializeUser);
  const loadFromDatabase = useQuillbyStore((state) => state.loadFromDatabase);
  const userData = useQuillbyStore((state) => state.userData);
  
  const [isReady, setIsReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastMessPoints = useRef<number>(0);
  
  // Track app state changes to send notifications when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // App is going to background
      if (appState.current.match(/active/) && nextAppState === 'background') {
        console.log('[App] Going to background, checking mess points...');
        
        // Check if mess points increased and room is messy
        if (userData.messPoints >= 4 && userData.messPoints !== lastMessPoints.current) {
          console.log(`[App] Mess points increased to ${userData.messPoints}, sending notification`);
          await sendMessNotification(userData.messPoints);
          lastMessPoints.current = userData.messPoints;
        }
      }
      
      // App is coming to foreground
      if (appState.current.match(/background/) && nextAppState === 'active') {
        console.log('[App] Coming to foreground');
        lastMessPoints.current = userData.messPoints; // Update reference
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [userData.messPoints]);
  
  // Initialize last mess points reference
  useEffect(() => {
    lastMessPoints.current = userData.messPoints;
  }, [userData.messPoints]);
  
  // Memoize the initialization function to prevent re-runs
  const initializeAuth = useCallback(async () => {
    try {
      console.log('[App] Initializing device authentication...');
      
      // Preload images first for instant display
      await preloadImages();
      
      // Preload sounds
      try {
        const { preloadSounds } = await import('../lib/soundManager');
        await preloadSounds();
        console.log('[App] Sounds preloaded');
      } catch (soundError) {
        console.warn('[App] Sound preloading failed:', soundError);
      }
      
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
      
      // Initialize local user data (only if needed)
      try {
        initializeUser();
        console.log('[App] User data initialized');
      } catch (userError) {
        console.warn('[App] User initialization failed:', userError);
      }
      
      // Load data from database after initialization
      try {
        console.log('[App] Loading data from database...');
        await loadFromDatabase();
        console.log('[App] Database data loaded');
      } catch (dbError) {
        console.warn('[App] Database load failed, continuing with local data:', dbError);
      }
      
      // Request notification permissions
      try {
        console.log('[App] Requesting notification permissions...');
        const notificationPermission = await requestNotificationPermissions();
        if (notificationPermission) {
          console.log('[App] Notification permissions granted');
          
          // Setup enhanced notification system
          const { setupNotifications, scheduleAllNotifications } = await import('../lib/enhancedNotifications');
          await setupNotifications();
          
          // Schedule all notifications (habits, deadlines, sleep, motivation, study)
          const userData = useQuillbyStore.getState().userData;
          const deadlines = useQuillbyStore.getState().deadlines;
          await scheduleAllNotifications(userData, deadlines);
          
          console.log('[App] Enhanced notification system initialized');
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
  }, [initializeUser, loadFromDatabase]);
  
  // Initialize device authentication and user data on app start
  useEffect(() => {
    // Setup global error handlers first
    setupGlobalErrorHandlers();
    
    initializeAuth();
  }, [initializeAuth]);
  
  if (!isReady || !fontsLoaded) {
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
        {/* Image Preloader - Wraps entire app to provide loading context */}
        <ImagePreloader>
          <StatusBar style="light" hidden={true} />
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
            presentation: 'fullScreenModal',
            headerShown: false,
            gestureEnabled: false,
            animation: 'slide_from_bottom',
          }} 
        />
        </Stack>
        </ImagePreloader>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
