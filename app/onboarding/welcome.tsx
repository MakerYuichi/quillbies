import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import TermsModal from '../components/modals/TermsModal';

export default function WelcomeScreen() {
  const router = useRouter();
  const [showTerms, setShowTerms] = useState(false);
  
  // Load custom fonts (including Caviche from local file)
  const [fontsLoaded] = useFonts({
    'Caviche': require('../../assets/fonts/Caviche-Regular.ttf'),
    'CaveatBrush': require('../../assets/fonts/CaveatBrush-Regular.ttf'),
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });
  
  // Show loading while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Loading fonts...</Text>
      </View>
    );
  }

  const handleGetStarted = () => {
    console.log('[Welcome] User tapped Get Started - showing Terms');
    setShowTerms(true);
  };

  const handleAcceptTerms = () => {
    console.log('[Welcome] User accepted Terms & Conditions');
    setShowTerms(false);
    router.push('/onboarding/character-select');
  };

  const handleDeclineTerms = () => {
    console.log('[Welcome] User declined Terms & Conditions');
    setShowTerms(false);
    Alert.alert(
      'Terms Required',
      'You must accept the Terms & Conditions to use Quillby.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/welcome-bg.png')}
      style={styles.background}
      resizeMode="cover"
      defaultSource={require('../../assets/backgrounds/welcome-bg.png')}
    >
      {/* Semi-transparent overlay for text readability */}
      <View style={styles.overlay}>
        {/* Content Container - Centered */}
        <View style={styles.contentContainer}>
          {/* Title and Description */}
          <View style={styles.textSection}>
            {/* Headline with Caveat font */}
            <Text style={styles.title}>Your Quillby Is Waiting...</Text>
            
            {/* Body Text with Chakra Petch font */}
            <Text style={styles.description}>
              Meet your personal accountability hamster. Quillby stays with you, studies with you, takes breaks with you, and helps you build unstoppable focus.
            </Text>
          </View>
          
          {/* Main Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.beginButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.beginButtonText}>Let's Begin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Terms & Conditions Modal */}
      <TermsModal
        visible={showTerms}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A237E',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  contentContainer: {
    flex: 1, 
    width: '100%',
    maxWidth: 400,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  textSection: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Caviche', // Custom Caviche font
    fontSize: 70,
    color: '#63582A',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  description: {
    fontFamily: 'ChakraPetch_400Regular', // Custom Chakra Petch font
    fontSize: 18,
    color: '#000000ff',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '90%',
  },
  beginButton: {
    backgroundColor: '#d4a257ff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  beginButtonText: {
    fontFamily: 'CaveatBrush',
    color: '#000000ff',
    fontSize: 48,
  },
});
