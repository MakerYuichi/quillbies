import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQuillbyStore } from './state/store';

export default function RootLayout() {
  const initializeUser = useQuillbyStore((state) => state.initializeUser);
  
  // Initialize user data on app start
  useEffect(() => {
    initializeUser();
  }, []);
  
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
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FF9800',
          },
          headerTintColor: '#fff',
        }} 
      />
      </Stack>
    </SafeAreaProvider>
  );
}
