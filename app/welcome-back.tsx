import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';

export default function WelcomeBackScreen() {
  const router = useRouter();
  const { userData } = useQuillbyStore();
  
  const buddyName = userData.buddyName || 'Quillby';
  const userName = userData.userName || 'Friend';
  const selectedCharacter = userData.selectedCharacter || 'casual';
  
  // Auto-redirect to home after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleContinue = () => {
    router.replace('/(tabs)');
  };
  
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
        {/* Welcome Back Message */}
        <Text style={styles.welcomeTitle}>Welcome back, {userName}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>{buddyName} missed you!</Text>
        
        {/* Character Image */}
        <View style={styles.characterContainer}>
          <Image 
            source={getCharacterImage()}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
        
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.buddyName}>& {buddyName}</Text>
        </View>
        
        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>
        
        {/* Auto-redirect message */}
        <Text style={styles.autoRedirectText}>Automatically continuing in 3 seconds...</Text>
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
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
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
    marginBottom: 30,
  },
  characterImage: {
    width: 160,
    height: 160,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  buddyName: {
    fontSize: 20,
    color: '#FF9800',
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  autoRedirectText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});