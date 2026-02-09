import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';
import { useImageLoading } from './components/ImagePreloader';

export default function WelcomeBackScreen() {
  const router = useRouter();
  const { userData } = useQuillbyStore();
  const { imagesLoaded } = useImageLoading();
  
  const selectedCharacter = userData.selectedCharacter || 'casual';
  
  // Navigate to home when images are loaded
  useEffect(() => {
    if (imagesLoaded) {
      console.log('[WelcomeBack] Images ready, navigating to home');
      // Small delay to show "Ready!" message
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 300);
    }
  }, [imagesLoaded, router]);
  
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
            {imagesLoaded ? 'Ready!' : 'Loading assets...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            Preparing your study companion
          </Text>
        </View>
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