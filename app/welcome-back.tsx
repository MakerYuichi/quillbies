import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';
import { useImageLoading } from './components/ImagePreloader';
import { getThemeColors } from './utils/themeColors';

export default function WelcomeBackScreen() {
  const router = useRouter();
  const { userData } = useQuillbyStore();
  const { imagesLoaded } = useImageLoading();
  
  const selectedCharacter = userData.selectedCharacter || 'casual';
  const themeType = userData.roomCustomization?.themeType;
  const themeColors = getThemeColors(themeType);
  
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
    <View style={[
      styles.container,
      { backgroundColor: themeType ? themeColors.background : '#F5F5F5' }
    ]}>
      <View style={styles.content}>
        {/* Character image */}
        <View style={[
          styles.characterContainer,
          { 
            backgroundColor: themeType ? themeColors.cardBackground : '#FFF3E0',
            borderColor: themeType ? (themeColors.accentBorder || themeColors.buttonPrimary) : '#FF9800'
          }
        ]}>
          <Image 
            source={getCharacterImage()}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={themeType ? themeColors.buttonPrimary : '#FF9800'} 
          />
          <Text style={[
            styles.loadingText,
            { color: themeType ? themeColors.textPrimary : '#333' }
          ]}>
            {imagesLoaded ? 'Ready!' : 'Loading assets...'}
          </Text>
          <Text style={[
            styles.loadingSubtext,
            { color: themeType ? themeColors.textSecondary : '#666' }
          ]}>
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