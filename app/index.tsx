import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';
import { isOnboardingCompleted } from '../lib/deviceOnboarding';

export default function HomeScreen() {
  const router = useRouter();
  const [deviceOnboardingCompleted, setDeviceOnboardingCompleted] = useState<boolean | null>(null);
  
  const { 
    updateEnergy,
    userData
  } = useQuillbyStore();
  
  const selectedCharacter = userData.selectedCharacter || 'casual';
  
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
  
  const getCharacterImage = () => {
    switch (selectedCharacter) {
      case 'energetic':
        return require('../assets/onboarding/hamster-energetic.png');
      case 'scholar':
        return require('../assets/onboarding/hamster-scholar.png');
      case 'casual':
      default:
        return require('../assets/hamsters/casual/idle-sit-happy.png');
    }
  };
  
  // Show loading while checking onboarding status
  if (deviceOnboardingCompleted === null || deviceOnboardingCompleted === false) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Character image */}
          <View style={styles.characterContainer}>
            <Image 
              source={getCharacterImage()}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.loadingText}>
              {deviceOnboardingCompleted === false ? 'Starting your journey...' : 'Loading...'}
            </Text>
            <Text style={styles.loadingSubtext}>
              Preparing your study companion
            </Text>
          </View>
        </View>
      </View>
    );
  }
  
  // This code should never be reached since we redirect to welcome-back for completed onboarding
  // But keeping it as a fallback
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF3E0',
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  characterImage: {
    width: 160,
    height: 160,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
