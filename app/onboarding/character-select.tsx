import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../state/store-modular';
import { responsiveWidth, responsiveHeight, responsiveFontSize, responsiveSpacing, isTablet } from '../utils/responsive';

export default function CharacterSelectScreen() {
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const setCharacter = useQuillbyStore((state) => state.setCharacter);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'CevicheOne': require('../../assets/fonts/Caviche-Regular.ttf'),
    'CaveatBrush': require('../../assets/fonts/CaveatBrush-Regular.ttf'),
    ChakraPetch_600SemiBold,
  });

  // Handle back button - navigate to previous onboarding screen without alert
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Navigate back to welcome screen
      router.back();
      return true; // Prevent default behavior
    });

    return () => backHandler.remove();
  }, [router]);

  // Show loading while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  const handleSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleNext = () => {
    if (selectedCharacter) {
      // Save to global state
      setCharacter(selectedCharacter);
      // Navigate to next screen
      router.push('/onboarding/name-buddy');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Theme */}
      <ImageBackground
        source={require('../../assets/backgrounds/theme.png')}
        style={styles.themeBackground}
        resizeMode="cover"
        defaultSource={require('../../assets/backgrounds/theme.png')}
      >
        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>
            Choose Your{'\n'}COMPANION
          </Text>

          {/* CASUAL Card */}
          <TouchableOpacity
            style={[
              styles.characterCard,
              styles.casualCard,
              selectedCharacter === 'casual' && styles.selectedCasualCard,
            ]}
            onPress={() => handleSelect('casual')}
          >
            <Image
              source={require('../../assets/onboarding/hamster-casual.png')}
              style={styles.casualImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.casualLabel}>Casual</Text>
          
          {/* Speech Bubble for Casual */}
          {selectedCharacter === 'casual' && (
            <View style={[styles.attachedSpeechBubble, { left: responsiveWidth(210), top: responsiveHeight(205) }]}>
              <View style={[styles.speechTail, { 
                left: -responsiveSpacing(15),
                borderRightColor: '#FFFFFF'
              }]} />
              <View style={styles.bubbleContent}>
                <Text style={[styles.bubbleTitle, { color: '#008339' }]}>
                  The Supportive Friend 
                </Text>
                <Text style={styles.bubbleMessage}>
                  "I'll be your gentle companion."
                </Text>
              </View>
            </View>
          )}

          {/* ENERGETIC Card */}
          <TouchableOpacity
            style={[
              styles.characterCard,
              styles.energeticCard,
              selectedCharacter === 'energetic' && styles.selectedEnergeticCard,
              styles.disabledCard,
            ]}
            onPress={() => {}}
            disabled={true}
          >
            <Image
              source={require('../../assets/onboarding/hamster-energetic.png')}
              style={[styles.energeticImage, styles.disabledImage]}
              resizeMode="contain"
            />
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.energeticLabel, styles.disabledLabel]}>Energetic</Text>
          
          {/* Speech Bubble for Energetic */}
          {selectedCharacter === 'energetic' && (
            <View style={[styles.attachedSpeechBubble, { left: responsiveWidth(10), top: responsiveHeight(360) }]}>
              <View style={[styles.speechTail, { 
                right: -responsiveSpacing(15),
                left: 'auto',
                borderRightWidth: 0,
                borderLeftWidth: responsiveSpacing(15),
                borderLeftColor: '#FFFFFF'
              }]} />
              <View style={styles.bubbleContent}>
                <Text style={[styles.bubbleTitle, { color: '#FF0000' }]}>
                  The Motivator 
                </Text>
                <Text style={styles.bubbleMessage}>
                  "Let's crush those deadlines!"
                </Text>
              </View>
            </View>
          )}

          {/* SCHOLAR Card */}
          <TouchableOpacity
            style={[
              styles.characterCard,
              styles.scholarCard,
              selectedCharacter === 'scholar' && styles.selectedScholarCard,
              styles.disabledCard,
            ]}
            onPress={() => {}}
            disabled={true}
          >
            <Image
              source={require('../../assets/onboarding/hamster-scholar.png')}
              style={[styles.scholarImage, styles.disabledImage]}
              resizeMode="contain"
            />
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.scholarLabel, styles.disabledLabel]}>Scholar</Text>
          
          {/* Speech Bubble for Scholar */}
          {selectedCharacter === 'scholar' && (
            <View style={[styles.attachedSpeechBubble, { left: responsiveWidth(220), top: responsiveHeight(530) }]}>
              <View style={[styles.speechTail, { 
                left: -responsiveSpacing(15),
                borderRightColor: '#FFFFFF'
              }]} />
              <View style={styles.bubbleContent}>
                <Text style={[styles.bubbleTitle, { color: '#ED8600' }]}>
                  The Study Partner 
                </Text>
                <Text style={styles.bubbleMessage}>
                  "Serious focus, academic vibes."
                </Text>
              </View>
            </View>
          )}

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedCharacter && styles.nextButtonDisabled,
            ]}
            disabled={!selectedCharacter}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {selectedCharacter ? 'Next →' : 'Choose a companion'}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  themeBackground: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  title: {
    position: 'absolute',
    width: '100%',
    top: responsiveHeight(34),
    fontFamily: 'CevicheOne',
    fontSize: responsiveFontSize(48),
    lineHeight: responsiveFontSize(50),
    textAlign: 'center',
    color: '#63582A',
    paddingHorizontal: responsiveSpacing(8),
  },
  // Character Cards Base Style (Ellipses)
  characterCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // CASUAL ELLIPSE - Top Left
  casualCard: {
    width: responsiveWidth(165),
    height: responsiveHeight(171),
    left: responsiveWidth(10),
    top: responsiveHeight(155),
    borderRadius: responsiveWidth(85),
    shadowColor: '#008339',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  casualImage: {
    width: responsiveWidth(145),
    height: responsiveHeight(176),
  },
  casualLabel: {
    position: 'absolute',
    left: responsiveWidth(51),
    top: responsiveHeight(328),
    fontFamily: 'CaveatBrush',
    fontSize: responsiveFontSize(32),
    lineHeight: responsiveFontSize(40),
    textAlign: 'center',
    color: '#000000',
  },
  // ENERGETIC ELLIPSE - Right Middle
  energeticCard: {
    width: responsiveWidth(165),
    height: responsiveHeight(171),
    left: responsiveWidth(205),
    top: responsiveHeight(330),
    borderRadius: responsiveWidth(85),
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 5,
    shadowRadius: 4,
    elevation: 4,
  },
  energeticImage: {
    width: responsiveWidth(143),
    height: responsiveHeight(193),
  },
  energeticLabel: {
    position: 'absolute',
    left: responsiveWidth(238),
    top: responsiveHeight(503),
    fontFamily: 'CaveatBrush',
    fontSize: responsiveFontSize(32),
    lineHeight: responsiveFontSize(40),
    textAlign: 'center',
    color: '#000000',
  },
  // SCHOLAR ELLIPSE - Bottom Left
  scholarCard: {
    width: responsiveWidth(165),
    height: responsiveHeight(171),
    left: responsiveWidth(22),
    top: responsiveHeight(505),
    borderRadius: responsiveWidth(85),
    shadowColor: '#ED8600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  scholarImage: {
    width: responsiveWidth(158),
    height: responsiveHeight(162),
  },
  scholarLabel: {
    position: 'absolute',
    left: responsiveWidth(66),
    top: responsiveHeight(678),
    fontFamily: 'CaveatBrush',
    fontSize: responsiveFontSize(32),
    lineHeight: responsiveFontSize(40),
    textAlign: 'center',
    color: '#000000',
  },
  // SELECTION EFFECTS (Each character gets its own color)
  selectedCasualCard: {
    borderWidth: 3,
    borderColor: '#008339', // Green for Casual
    transform: [{ scale: 1.08 }],
  },
  selectedEnergeticCard: {
    borderWidth: 3,
    borderColor: '#FF0000', // Red for Energetic
    transform: [{ scale: 1.08 }],
  },
  selectedScholarCard: {
    borderWidth: 3,
    borderColor: '#ED8600', // Orange for Scholar
    transform: [{ scale: 1.08 }],
  },
  // ATTACHED SPEECH BUBBLE (appears beside selected hamster)
  attachedSpeechBubble: {
    position: 'absolute',
    width: responsiveWidth(180),
    backgroundColor: '#FFFFFF',
    borderRadius: responsiveSpacing(20),
    padding: responsiveSpacing(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  speechTail: {
    position: 'absolute',
    top: responsiveSpacing(20),
    width: 0,
    height: 0,
    borderTopWidth: responsiveSpacing(10),
    borderBottomWidth: responsiveSpacing(10),
    borderRightWidth: responsiveSpacing(15),
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  bubbleContent: {
    alignItems: 'center',
  },
  bubbleTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: responsiveFontSize(14),
    textAlign: 'center',
    marginBottom: responsiveSpacing(8),
  },
  bubbleMessage: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: responsiveFontSize(12),
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: responsiveFontSize(16),
  },
  // NEXT BUTTON
  nextButton: {
    position: 'absolute',
    bottom: responsiveHeight(25),
    left: '50%',
    marginLeft: responsiveWidth(-90),
    backgroundColor: '#FF9800',
    paddingHorizontal: responsiveSpacing(36),
    paddingVertical: responsiveSpacing(14),
    borderRadius: responsiveSpacing(22),
    minWidth: responsiveWidth(180),
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: responsiveFontSize(16),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // COMING SOON STYLES
  disabledCard: {
    opacity: 0.6,
  },
  disabledImage: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.5,
  },
  comingSoonBadge: {
    position: 'absolute',
    backgroundColor: '#FF9800',
    paddingHorizontal: responsiveSpacing(11),
    paddingVertical: responsiveSpacing(5),
    borderRadius: responsiveSpacing(11),
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  comingSoonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: responsiveFontSize(12),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
