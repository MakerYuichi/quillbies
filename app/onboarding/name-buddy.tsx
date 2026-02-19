import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_700Bold, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../state/store-modular';
import { playUISubmitSound } from '../../lib/soundManager';

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function NameBuddyScreen() {
  const router = useRouter();
  const [petName, setPetName] = useState('');
  const setBuddyName = useQuillbyStore((state) => state.setBuddyName);
  
  // Hatching sequence state
  const [tapCount, setTapCount] = useState(0);
  const [eggStage, setEggStage] = useState('normal'); // 'normal', 'crack1', 'crack2', 'hatching', 'hatched'
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showInput, setShowInput] = useState(false);
  
  // Animations
  const glowScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const blackScreenOpacity = useRef(new Animated.Value(0)).current;
  const hamsterOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'CevicheOne': require('../../assets/fonts/Caviche-Regular.ttf'),
    'CaveatBrush': require('../../assets/fonts/CaveatBrush-Regular.ttf'),
    ChakraPetch_700Bold,
    ChakraPetch_600SemiBold,
  });

  // Show loading while fonts load - AFTER all hooks
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  const handleEggTap = () => {
    if (eggStage === 'hatching' || eggStage === 'hatched') return; // Don't allow tapping during/after hatch
    
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    console.log(`[Hatching] Tap ${newCount}/3`);
    
    switch(newCount) {
      case 1:
        // First crack + gentle glow
        setEggStage('crack1');
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        break;
        
      case 2:
        // Second crack + stronger glow
        setEggStage('crack2');
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        break;
        
      case 3:
        // Final hatch - BLACK SCREEN SEQUENCE
        startFinalHatchSequence();
        break;
    }
  };

  const startFinalHatchSequence = () => {
    console.log('[Hatching] Starting final hatch sequence!');
    setEggStage('hatching');
    
    // 1. Fade to black screen (faster)
    setShowBlackScreen(true);
    Animated.timing(blackScreenOpacity, {
      toValue: 1,
      duration: 200, // Reduced from 400ms
      useNativeDriver: true,
    }).start(() => {
      // 2. Egg glows intensely and shakes (faster)
      Animated.parallel([
        // Intense glow
        Animated.timing(glowScale, {
          toValue: 2.5,
          duration: 400, // Reduced from 600ms
          useNativeDriver: true,
        }),
        // Shake sequence (faster)
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }), // Reduced from 80ms
          Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
      ]).start(() => {
        // 3. Egg fully cracks
        setEggStage('crack3');
        
        // 4. Show hamster immediately (reduced delay)
        setTimeout(() => {
          setEggStage('hatched');
          Animated.timing(hamsterOpacity, {
            toValue: 1,
            duration: 400, // Reduced from 600ms
            useNativeDriver: true,
          }).start();
          
          // 5. Fade out black screen faster
          setTimeout(() => {
            Animated.timing(blackScreenOpacity, {
              toValue: 0,
              duration: 400, // Reduced from 600ms
              useNativeDriver: true,
            }).start(() => {
              setShowBlackScreen(false);
              
              // 6. Show title and input immediately
              setShowTitle(true);
              setShowInput(true);
              Animated.timing(titleOpacity, {
                toValue: 1,
                duration: 300, // Reduced from 400ms
                useNativeDriver: true,
              }).start();
            });
          }, 600); // Reduced from 1200ms
        }, 300); // Reduced from 500ms
      });
    });
  };

  const handleNext = () => {
    if (petName.trim().length > 0) {
      playUISubmitSound();
      // Save name to store
      setBuddyName(petName.trim());
      // Navigate to profile screen
      router.push('/onboarding/profile');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          <ImageBackground
            source={require('../../assets/backgrounds/theme.png')}
            style={styles.background}
            resizeMode="cover"
            defaultSource={require('../../assets/backgrounds/theme.png')}
          >
            {/* Title - Only shows after hatching */}
            {showTitle && (
              <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
                Name Your New{'\n'}FRIEND
              </Animated.Text>
            )}

            {/* Egg/Hamster Container - Only show when not in black screen mode */}
            {!showBlackScreen && (
              <TouchableWithoutFeedback onPress={handleEggTap}>
                <View style={styles.eggContainer}>
                  {/* Normal Egg */}
                  {eggStage === 'normal' && (
                    <Image
                      source={require('../../assets/onboarding/egg-only.png')}
                      style={styles.eggImage}
                      resizeMode="contain"
                    />
                  )}
                  
                  {/* First Crack */}
                  {eggStage === 'crack1' && (
                    <Image
                      source={require('../../assets/onboarding/egg-crack1.png')}
                      style={styles.eggImage}
                      resizeMode="contain"
                    />
                  )}
                  
                  {/* Second Crack */}
                  {eggStage === 'crack2' && (
                    <Image
                      source={require('../../assets/onboarding/egg-crack2.png')}
                      style={styles.eggImage}
                      resizeMode="contain"
                    />
                  )}
                  
                  {/* Hatched - Show hamster */}
                  {eggStage === 'hatched' && (
                    <Animated.Image
                      source={require('../../assets/onboarding/hamster-egghatch.png')}
                      style={[
                        styles.hamsterImage,
                        { opacity: hamsterOpacity }
                      ]}
                      resizeMode="contain"
                    />
                  )}

                  {/* Tap instruction (only before hatching sequence) */}
                  {eggStage !== 'hatching' && eggStage !== 'hatched' && (
                    <Text style={styles.tapInstruction}>
                      Tap the egg {3 - tapCount} more time{tapCount < 2 ? 's' : ''} to hatch! 🥚
                    </Text>
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
            
            {/* BLACK SCREEN OVERLAY - Cinematic hatching */}
            {showBlackScreen && (
              <Animated.View style={[styles.blackOverlay, { opacity: blackScreenOpacity }]}>
                {/* Glowing Egg in Center */}
                <Animated.View style={[
                  styles.glowContainer,
                  {
                    transform: [
                      { scale: glowScale },
                      { translateX: shakeAnim }
                    ]
                  }
                ]}>
                  {/* Glow Effect */}
                  <Animated.View style={[
                    styles.glowEffect,
                    { transform: [{ scale: glowScale }] }
                  ]} />
                  
                  {/* Egg Stages */}
                  {eggStage === 'hatching' && (
                    <Image
                      source={require('../../assets/onboarding/egg-crack2.png')}
                      style={styles.eggImageCenter}
                      resizeMode="contain"
                    />
                  )}
                  
                  {eggStage === 'crack3' && (
                    <Image
                      source={require('../../assets/onboarding/egg-crack3.png')}
                      style={styles.eggImageCenter}
                      resizeMode="contain"
                    />
                  )}
                  
                  {eggStage === 'hatched' && (
                    <Animated.Image
                      source={require('../../assets/onboarding/hamster-egghatch.png')}
                      style={[
                        styles.hamsterImageCenter,
                        { opacity: hamsterOpacity }
                      ]}
                      resizeMode="contain"
                    />
                  )}
                </Animated.View>
              </Animated.View>
            )}
          </ImageBackground>

          {/* Orange Theme Bottom Section - Absolute positioned at bottom */}
          <View style={styles.orangeSection}>
            <ImageBackground
              source={require('../../assets/backgrounds/orange-theme.png')}
              style={styles.orangeBackground}
              resizeMode="cover"
              defaultSource={require('../../assets/backgrounds/orange-theme.png')}
            >
              {/* Only show input after hatching */}
              {showInput && (
                <>
                  {/* Input Container */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={petName}
                      onChangeText={setPetName}
                      placeholder="QuillBy"
                      placeholderTextColor="rgba(92, 93, 70, 0.31)"
                      autoFocus={false}
                      maxLength={20}
                    />
                  </View>

                  {/* Instruction Text */}
                  <Text style={styles.instruction}>
                    Your study buddy has just hatched! Give it a name to begin your journey together
                  </Text>

                  {/* Next Button */}
                  <TouchableOpacity
                    style={[styles.nextButton, petName.trim().length === 0 && styles.nextButtonDisabled]}
                    disabled={petName.trim().length === 0}
                    onPress={handleNext}
                  >
                    <Text style={styles.nextButtonText}>Next →</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {/* Before hatching - show hint */}
              {!showInput && (
                <Text style={styles.hatchHint}>
                  Tap the egg above to begin! 👆
                </Text>
              )}
            </ImageBackground>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // RESPONSIVE: Title centered, positioned from top
  title: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.08,
    width: '100%',
    fontFamily: 'CevicheOne',
    fontSize: SCREEN_WIDTH * 0.14,
    lineHeight: SCREEN_WIDTH * 0.145,
    textAlign: 'center',
    color: '#63582A',
    paddingHorizontal: 10,
    zIndex: 2,
  },
  // RESPONSIVE: Egg container centered
  eggContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3,
    left: SCREEN_WIDTH * 0.16,
    width: SCREEN_WIDTH * 0.68,
    height: SCREEN_HEIGHT * 0.29,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  eggImage: {
    width: '100%',
    height: '100%',
  },
  hamsterImage: {
    width: '100%',
    height: '100%',
  },
  // RESPONSIVE: Instruction below egg
  tapInstruction: {
    position: 'absolute',
    bottom: -30,
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#aa6300ff',
    textAlign: 'center',
    width: '100%',
  },
  // RESPONSIVE: Orange section - absolute positioned at bottom, full width
  orangeSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: SCREEN_HEIGHT * 0.35,
    maxHeight: SCREEN_HEIGHT * 0.45,
    width: SCREEN_WIDTH,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 5,
  },
  orangeBackground: {
    width: '105%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  hatchHint: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#000000',
    textAlign: 'center',
  },
  // BLACK SCREEN OVERLAY
  blackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: SCREEN_WIDTH * 0.375,
    backgroundColor: '#fffb00ff',
    opacity: 0.7,
    shadowColor: '#fffb00ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 60,
    elevation: 20,
  },
  eggImageCenter: {
    width: SCREEN_WIDTH * 0.68,
    height: SCREEN_HEIGHT * 0.29,
  },
  hamsterImageCenter: {
    width: SCREEN_WIDTH * 0.68,
    height: SCREEN_HEIGHT * 0.29,
  },
  // RESPONSIVE: Input container
  inputContainer: {
    width: SCREEN_WIDTH * 0.72,
    minHeight: 60,
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#705400',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  
  textInput: {
    flex: 1,
    fontFamily: 'CaveatBrush',
    fontSize: SCREEN_WIDTH * 0.12,
    lineHeight: SCREEN_WIDTH * 0.15,
    color: '#5C5D46',
    textAlign: 'center',
    paddingVertical: 0,
  },
  // RESPONSIVE: Instruction text
  instruction: {
    width: '90%',
    marginTop: 12,
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: SCREEN_WIDTH * 0.04,
    lineHeight: SCREEN_WIDTH * 0.05,
    textAlign: 'center',
    color: '#000000',
  },
  nextButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.045,
  },
});
