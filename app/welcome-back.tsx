import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';

export default function WelcomeBackScreen() {
  const router = useRouter();
  const { userData } = useQuillbyStore();
  
  const selectedCharacter = userData.selectedCharacter || 'casual';
  
  // Auto-redirect to home with a minimal delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 200); // Reduced to 200ms for faster transition
    
    return () => clearTimeout(timer);
  }, [router]);
  
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
        {/* Only show the character image */}
        <View style={styles.characterContainer}>
          <Image 
            source={getCharacterImage()}
            style={styles.characterImage}
            resizeMode="contain"
          />
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
  },
  characterImage: {
    width: 160,
    height: 160,
  },
});