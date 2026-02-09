import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../state/store-modular';

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
            <View style={[styles.attachedSpeechBubble, { left: 210, top: 240 }]}>
              <View style={[styles.speechTail, { 
                left: -15,
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
            <View style={[styles.attachedSpeechBubble, { left: 10, top: 420 }]}>
              <View style={[styles.speechTail, { 
                right: -15,
                left: 'auto',
                borderRightWidth: 0,
                borderLeftWidth: 15,
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
            <View style={[styles.attachedSpeechBubble, { left: 220, top: 620 }]}>
              <View style={[styles.speechTail, { 
                left: -15,
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
    width: 408,
    left: -7,
    top: 53,
    fontFamily: 'CevicheOne',
    fontSize: 55,
    lineHeight: 57,
    textAlign: 'center',
    color: '#63582A',
  },
  // Character Cards Base Style (Ellipses)
  characterCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 95, // Makes it elliptical (half of width/height)
  },
  // CASUAL ELLIPSE
  casualCard: {
    width: 185,
    height: 191,
    left: 10,
    top: 210,
    shadowColor: '#008339',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  casualImage: {
    width: 162,
    height: 196,
  },
  casualLabel: {
    position: 'absolute',
    width: 85,
    left: 51,
    top: 403,
    fontFamily: 'CaveatBrush',
    fontSize: 36,
    lineHeight: 45,
    textAlign: 'center',
    color: '#000000',
  },
  // ENERGETIC ELLIPSE
  energeticCard: {
    width: 185,
    height: 191,
    left: 195,
    top: 387,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 5,
    shadowRadius: 4,
    elevation: 4,
  },
  energeticImage: {
    width: 160,
    height: 215,
  },
  energeticLabel: {
    position: 'absolute',
    width: 119,
    left: 228,
    top: 595,
    fontFamily: 'CaveatBrush',
    fontSize: 36,
    lineHeight: 45,
    textAlign: 'center',
    color: '#000000',
  },
  // SCHOLAR ELLIPSE
  scholarCard: {
    width: 185,
    height: 191,
    left: 22,
    top: 589,
    shadowColor: '#ED8600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  scholarImage: {
    width: 177,
    height: 181,
  },
  scholarLabel: {
    position: 'absolute',
    width: 96,
    left: 66,
    top: 780,
    fontFamily: 'CaveatBrush',
    fontSize: 36,
    lineHeight: 45,
    textAlign: 'center',
    color: '#000000',
  },
  // SELECTION EFFECTS (Each character gets its own color)
  selectedCasualCard: {
    borderWidth: 3,
    borderColor: '#008339', // Green for Casual
    transform: [{ scale: 1.10 }],
  },
  selectedEnergeticCard: {
    borderWidth: 3,
    borderColor: '#FF0000', // Red for Energetic
    transform: [{ scale: 1.10 }],
  },
  selectedScholarCard: {
    borderWidth: 3,
    borderColor: '#ED8600', // Orange for Scholar
    transform: [{ scale: 1.10 }],
  },
  // ATTACHED SPEECH BUBBLE (appears beside selected hamster)
  attachedSpeechBubble: {
    position: 'absolute',
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  speechTail: {
    position: 'absolute',
    top: 20,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  bubbleContent: {
    alignItems: 'center',
  },
  bubbleTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  bubbleMessage: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  // NEXT BUTTON
  nextButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -100, // Half of minWidth to center
    backgroundColor: '#FF9800',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 18,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
