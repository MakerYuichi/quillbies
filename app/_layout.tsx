import { Stack } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Text, Image, AppState, AppStateStatus, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useQuillbyStore } from './state/store-modular';
import { initializeRevenueCat } from '../lib/revenueCat';
import { authenticateDevice, isDeviceAuthenticated } from '../lib/deviceAuth';
import { requestNotificationPermissions, sendMessNotification } from '../lib/notifications';
import { ErrorBoundary } from './components/ErrorBoundary';
import ImagePreloader from './components/ImagePreloader';
import { getThemeColors } from './utils/themeColors';



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
    require('../assets/shop/fairy-lights/colored.png'),
    require('../assets/shop/common/plants/succulent-plant.png'),
    require('../assets/shop/epic/plants/swiss-cheese-plant.png'),
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
  // Suppress console.error for keep awake errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorString = args.join(' ');
    if (errorString.includes('keep awake') || 
        errorString.includes('KeepAwake') ||
        errorString.includes('Unable to activate keep awake')) {
      console.warn('[Suppressed] Keep awake error:', ...args);
      return;
    }
    originalConsoleError(...args);
  };

  // Handle unhandled promise rejections
  const originalHandler = (global as any).ErrorUtils?.setGlobalHandler;
  if (originalHandler) {
    (global as any).ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
      // Handle keep awake errors specifically (multiple variations)
      const errorMessage = error?.message || '';
      const errorString = String(error);
      if (errorMessage.includes('keep awake') || 
          errorMessage.includes('KeepAwake') ||
          errorMessage.includes('Unable to activate keep awake') ||
          errorString.includes('keep awake') ||
          errorString.includes('KeepAwake')) {
        console.warn('[GlobalError] Keep awake error caught and ignored');
        return; // Don't crash the app for keep awake errors
      }
      
      console.error('[GlobalError] Unhandled error:', error);
      
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
  // ===== ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL RETURNS =====
  
  // Load Schoolbell font - MUST be called before any conditional returns
  const [fontsLoaded] = useFonts({
    'Schoolbell': require('../assets/fonts/Schoolbell-Regular.ttf'),
  });
  
  // Check if store is initialized - prevent crashes during hydration
  const [storeReady, setStoreReady] = useState(false);
  const [storeInitialized, setStoreInitialized] = useState(false);
  
  // ALWAYS call ALL hooks first - never conditionally
  // Call store hooks with safe defaults
  const initializeUser = useQuillbyStore((state) => state.initializeUser);
  const loadFromDatabase = useQuillbyStore((state) => state.loadFromDatabase);
  const userData = useQuillbyStore((state) => state.userData ?? {
    messPoints: 0,
    energy: 100,
    maxEnergyCap: 100,
    qCoins: 0,
    gems: 0,
    roomCustomization: null,
    purchasedItems: [],
    onboardingCompleted: false,
    isPremium: false,
  });
  
  const [isReady, setIsReady] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastMessPoints = useRef<number>(0);
  
  // Check if store is available
  useEffect(() => {
    try {
      // Test if store is accessible
      const state = useQuillbyStore.getState();
      if (state) {
        setStoreInitialized(true);
      }
    } catch (error) {
      console.error('[App] Store not initialized yet:', error);
      // Retry after a short delay
      const retry = setTimeout(() => {
        try {
          const state = useQuillbyStore.getState();
          if (state) {
            setStoreInitialized(true);
          }
        } catch (e) {
          console.error('[App] Store initialization failed:', e);
          // Force initialization anyway to prevent infinite loading
          setStoreInitialized(true);
        }
      }, 100);
      return () => clearTimeout(retry);
    }
  }, []);
  
  useEffect(() => {
    if (!storeInitialized) return;
    
    // Give store time to hydrate from persist middleware (automatic)
    const timer = setTimeout(() => {
      console.log('[App] Store marked as ready');
      setStoreReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [storeInitialized]);
  
  // Track app state changes to send notifications when app goes to background
  useEffect(() => {
    if (!userData || userData.messPoints === undefined) return; // Wait for userData to be initialized
    
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // App is going to background
      if (appState.current.match(/active/) && nextAppState === 'background') {
        console.log('[App] Going to background, checking mess points...');
        
        // Check if mess points increased and room is messy
        if (userData?.messPoints && userData.messPoints >= 4 && userData.messPoints !== lastMessPoints.current) {
          console.log(`[App] Mess points increased to ${userData.messPoints}, sending notification`);
          await sendMessNotification(userData.messPoints);
          lastMessPoints.current = userData.messPoints;
        }
      }
      
      // App is coming to foreground
      if (appState.current.match(/background/) && nextAppState === 'active') {
        console.log('[App] Coming to foreground');
        if (userData?.messPoints !== undefined) {
          lastMessPoints.current = userData.messPoints; // Update reference
        }
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [userData?.messPoints]);
  
  // Initialize last mess points reference
  useEffect(() => {
    if (userData?.messPoints !== undefined) {
      lastMessPoints.current = userData.messPoints;
    }
  }, [userData?.messPoints]);
  
  // Memoize the initialization function to prevent re-runs
  const initializeAuth = useCallback(async () => {
    try {
      console.log('[App] Initializing device authentication...');
      
      // Initialize RevenueCat
      try {
        console.log('[App] Initializing RevenueCat...');
        await initializeRevenueCat();
        console.log('[App] RevenueCat initialized successfully');
      } catch (rcError) {
        console.warn('[App] RevenueCat initialization failed:', rcError);
      }
      
      // Preload images first for instant display
      await preloadImages();
      
      // Preload sounds (don't activate yet - needs user gesture)
      try {
        const { preloadSounds } = await import('../lib/soundManager');
        await preloadSounds();
        console.log('[App] Sounds preloaded (activation will happen on first user interaction)');
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
      setShowStartButton(true); // Show start button instead of going directly to app
    } catch (err) {
      console.error('[App] Critical initialization error:', err);
      setAuthError(String(err));
      // Still mark as ready - app can work with basic functionality
      setIsReady(true);
      setShowStartButton(true);
    }
  }, [initializeUser, loadFromDatabase]);
  
  // Initialize device authentication and user data on app start
  useEffect(() => {
    // Setup global error handlers first
    setupGlobalErrorHandlers();
    
    initializeAuth();
  }, [initializeAuth]);
  
  // Handle start button press - activate audio and prime sounds
  const handleStartPress = useCallback(async () => {
    try {
      console.log('[App] Start button pressed - activating audio...');
      const { soundManager, SOUNDS } = await import('../lib/soundManager');
      
      // Activate audio system
      await soundManager.activate();
      
      // Prime all UI sounds by playing them silently
      console.log('[App] Priming UI sounds...');
      await soundManager.playSound(SOUNDS.TOGGLE, 1.0, 0.0);
      await soundManager.playSound(SOUNDS.TAB, 1.0, 0.0);
      await soundManager.playSound(SOUNDS.END_SESSION, 1.0, 0.0);
      await soundManager.playSound(SOUNDS.EQUIP, 1.0, 0.0);
      await soundManager.playSound(SOUNDS.UI_SUBMIT, 1.0, 0.0);
      
      console.log('[App] Audio system ready!');
      setShowStartButton(false);
    } catch (error) {
      console.warn('[App] Failed to activate audio:', error);
      // Continue anyway
      setShowStartButton(false);
    }
  }, []);
  
  // ===== NOW CONDITIONAL RETURNS ARE SAFE =====

  // Show loading screen while store initializes
  if (!storeInitialized || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          Initializing...
        </Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }
  
  if (!isReady || !fontsLoaded) {
    const themeType = userData?.roomCustomization?.themeType;
    const themeColors = getThemeColors(themeType);
    
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: themeType ? themeColors.background : '#FFF' 
      }}>
        <ActivityIndicator 
          size="large" 
          color={themeType ? themeColors.buttonPrimary : '#FF9800'} 
        />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16, 
          color: themeType ? themeColors.textSecondary : '#666' 
        }}>
          Loading Quillby...
        </Text>
      </View>
    );
  }
  
  // Show start button after loading
  if (showStartButton) {
    const themeType = userData.roomCustomization?.themeType;
    const themeColors = getThemeColors(themeType);
    
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: themeType ? themeColors.background : '#FFF8E1',
      }}>
        {/* Background */}
        <Image
          source={require('../assets/backgrounds/theme.png')}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: themeType ? 0.3 : 1,
          }}
          resizeMode="cover"
        />
        
        {/* Content */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          {/* Hamster Character */}
          <Image
            source={require('../assets/hamsters/casual/idle-sit-happy.png')}
            style={{
              width: 180,
              height: 180,
              marginBottom: 30,
            }}
            resizeMode="contain"
          />
          
          {/* Title */}
          <Text style={{ 
            fontSize: 42, 
            fontWeight: 'bold', 
            color: themeType ? themeColors.buttonPrimary : '#FF9800', 
            marginBottom: 10,
            fontFamily: 'Chakra Petch',
            textShadowColor: themeType ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 152, 0, 0.3)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>
            Quillby
          </Text>
          
          {/* Subtitle */}
          <Text style={{ 
            fontSize: 17, 
            color: themeType ? themeColors.textSecondary : '#666', 
            marginBottom: 50, 
            textAlign: 'center', 
            paddingHorizontal: 40,
            lineHeight: 26,
            fontFamily: 'Chakra Petch',
          }}>
            Ready to boost your productivity{'\n'}with your new hamster buddy?
          </Text>
          
          {/* Start Button */}
          <TouchableOpacity
            onPress={handleStartPress}
            activeOpacity={0.8}
            style={{
              backgroundColor: themeType ? themeColors.buttonPrimary : '#FF9800',
              paddingHorizontal: 60,
              paddingVertical: 20,
              borderRadius: 35,
              shadowColor: themeType ? themeColors.buttonPrimary : '#FF9800',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 10,
              borderWidth: 4,
              borderColor: themeType ? (themeColors.accentBorder || themeColors.buttonPrimary) : '#FFA726',
            }}
          >
            <Text style={{ 
              fontSize: 22, 
              fontWeight: 'bold', 
              color: themeType ? themeColors.buttonText : '#FFF',
              letterSpacing: 1,
              fontFamily: 'Chakra Petch',
            }}>
              Let's do it! 🚀
            </Text>
          </TouchableOpacity>
          
          {/* Q-Coins decoration */}
          <Image
            source={require('../assets/overall/qbies.png')}
            style={{
              width: 40,
              height: 40,
              marginTop: 40,
              opacity: 0.6,
            }}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }
  
  if (authError) {
    console.warn('[App] Running in offline mode:', authError);
    // Don't block the app - just log the error and continue
  }
  
  // Wait for store to be ready before rendering
  if (!storeReady || !userData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Initializing store...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        {/* Image Preloader temporarily disabled due to React 19 Context compatibility issue */}
        {/* Will be fixed in a future update - images will load on-demand for now */}
        {/* <ImagePreloader> */}
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
        {/* </ImagePreloader> */}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
