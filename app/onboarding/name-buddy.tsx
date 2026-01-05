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
  
  // Dynamic orange section position (starts at 75% of screen height)
  const ORANGE_INITIAL_POSITION = SCREEN_HEIGHT * 0.75;
  const orangePosition = useRef(new Animated.Value(ORANGE_INITIAL_POSITION)).current;

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'CevicheOne': require('../../assets/fonts/Caviche-Regular.ttf'),
    'CaveatBrush': require('../../assets/fonts/CaveatBrush-Regular.ttf'),
    ChakraPetch_700Bold,
    ChakraPetch_600SemiBold,
  });

  // Keyboard listeners - MUST be before early return
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      const height = e.endCoordinates.height;
      // Move orange section up above keyboard
      Animated.timing(orangePosition, {
        toValue: ORANGE_INITIAL_POSITION - height - 20,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      // Move orange section back to original position
      Animated.timing(orangePosition, {
        toValue: ORANGE_INITIAL_POSITION,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
    
    // 1. Fade to black screen
    setShowBlackScreen(true);
    Animated.timing(blackScreenOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      // 2. Egg glows intensely and shakes
      Animated.parallel([
        // Intense glow
        Animated.timing(glowScale, {
          toValue: 2.5,
          duration: 600,
          useNativeDriver: true,
        }),
        // Shake sequence
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: -15, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 15, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -15, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 15, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]),
      ]).start(() => {
        // 3. Egg fully cracks
        setEggStage('crack3');
        
        // 4. Wait, then show hamster
        setTimeout(() => {
          setEggStage('hatched');
          Animated.timing(hamsterOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
          
          // 5. Wait, then fade out black screen
          setTimeout(() => {
            Animated.timing(blackScreenOpacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }).start(() => {
              setShowBlackScreen(false);
              
              // 6. Show title and input
              setShowTitle(true);
              setShowInput(true);
              Animated.timing(titleOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }).start();
            });
          }, 1200);
        }, 500);
      });
    });
  };

  const handleNext = () => {
    if (petName.trim().length > 0) {
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
      {/* Full Background */}
      <ImageBackground
        source={require('../../assets/backgrounds/theme.png')}
        style={styles.background}
        resizeMode="cover"
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

        {/* Orange Theme Bottom Section - Moves with keyboard */}
        <Animated.View style={[styles.orangeSection, { top: orangePosition }]}>
          <ImageBackground
            source={require('../../assets/backgrounds/orange-theme.png')}
            style={styles.orangeBackground}
            resizeMode="cover"
          >
            {/* Only show input after hatching */}
            {showInput && (
              <>
                {/* Input Container */}
                <View style={styles.inputContainer}>
                  {/* Typing Line (Left side) */}

                  {/* Text Input */}
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
        </Animated.View>
      </ImageBackground>
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // RESPONSIVE: Title centered horizontally, 8% from top
  title: {
    position: 'absolute',
    width: '100%',
    top: SCREEN_HEIGHT * 0.08,
    fontFamily: 'CevicheOne',
    fontSize: SCREEN_WIDTH * 0.14, // 14% of screen width
    lineHeight: SCREEN_WIDTH * 0.145,
    textAlign: 'center',
    color: '#63582A',
    paddingHorizontal: 10,
  },
  // RESPONSIVE: Egg centered horizontally, 33% from top
  eggContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.68, // 68% of screen width
    height: SCREEN_HEIGHT * 0.29, // 29% of screen height
    left: SCREEN_WIDTH * 0.16, // Center horizontally (16% margin on each side)
    top: SCREEN_HEIGHT * 0.33,
    justifyContent: 'center',
    alignItems: 'center',
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
    bottom: -SCREEN_HEIGHT * 0.05,
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#aa6300ff',
    textAlign: 'center',
    width: SCREEN_WIDTH * 0.8,
  },
  // RESPONSIVE: Orange section at 75% height, full width
  orangeSection: {
    position: 'absolute',
    width: SCREEN_WIDTH, // 28% of screen height
    left: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  orangeBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 1,
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
  // RESPONSIVE: Input container 72% of screen width
  inputContainer: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_HEIGHT * 0.08,
    marginTop: SCREEN_HEIGHT * 0.02,
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
  // RESPONSIVE: Instruction text 90% width
  instruction: {
    width: '90%',
    marginTop: SCREEN_HEIGHT * 0.015,
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: SCREEN_WIDTH * 0.053,
    lineHeight: SCREEN_WIDTH * 0.068,
    textAlign: 'center',
    color: '#000000',
  },
  nextButton: {
    marginTop: SCREEN_HEIGHT * 0.015,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
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
