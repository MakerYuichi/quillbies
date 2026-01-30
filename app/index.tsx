import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';
import { isOnboardingCompleted } from '../lib/deviceOnboarding';

export default function HomeScreen() {
  const router = useRouter();
  const [deviceOnboardingCompleted, setDeviceOnboardingCompleted] = useState<boolean | null>(null);
  
  const { 
    updateEnergy
  } = useQuillbyStore();
  
  // Remove unused variables since we're not rendering the full interface
  
  // Check device-level onboarding completion
  useEffect(() => {
    const checkDeviceOnboarding = async () => {
      try {
        const completed = await isOnboardingCompleted();
        setDeviceOnboardingCompleted(completed);
        
        if (!completed) {
          console.log('[HomeScreen] Device onboarding not completed, redirecting to welcome');
          const timer = setTimeout(() => {
            router.replace('/onboarding/welcome');
          }, 1000);
          
          return () => clearTimeout(timer);
        } else {
          console.log('[HomeScreen] Device onboarding completed, showing welcome back screen');
          // Show welcome back screen for returning users
          router.replace('/welcome-back');
        }
      } catch (err) {
        console.error('[HomeScreen] Error checking device onboarding:', err);
        // On error, assume onboarding not completed
        setDeviceOnboardingCompleted(false);
        router.replace('/onboarding/welcome');
      }
    };
    
    checkDeviceOnboarding();
  }, []);
  
  // Update energy periodically (optimized frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      updateEnergy();
    }, 120000); // Update every 2 minutes for better performance while keeping functionality
    
    return () => clearInterval(interval);
  }, []);
  
  // Show loading while checking onboarding status OR if onboarding is not completed
  // This prevents the prototype content from showing before redirecting to onboarding
  if (deviceOnboardingCompleted === null || deviceOnboardingCompleted === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Setting up your account...</Text>
      </View>
    );
  }
  
  // This code should never be reached since we redirect to welcome-back for completed onboarding
  // But keeping it as a fallback
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
});
