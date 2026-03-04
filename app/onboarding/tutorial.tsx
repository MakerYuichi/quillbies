import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ImageBackground, Animated, BackHandler, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../state/store-modular';
import { wp, hp, fs, sp } from '../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const tutorialSteps = [
  {
    title: "Welcome to Quillby! 🎉",
    description: "Your AI study companion is here to help you stay focused and productive!",
    icon: "🏠",
    tips: [
      "Meet your hamster buddy who lives with you",
      "Keep your room clean by staying productive",
      "Build healthy study habits together"
    ]
  },
  {
    title: "Energy System ⚡",
    description: "Energy is your fuel for focus sessions. Use it wisely!",
    icon: "⚡",
    tips: [
      "Start each day with 100 energy points",
      "Focus sessions cost 20 energy each",
      "Restore energy: drink water 💧, eat meals 🍎, sleep well 😴"
    ]
  },
  {
    title: "Focus Sessions 📚",
    description: "Your main tool for deep, productive study time.",
    icon: "📚",
    tips: [
      "Tap 'Focus' button to start a session",
      "Stay in the app to build your focus score",
      "Earn coins and keep your room clean"
    ]
  },
  {
    title: "Study Boosts ☕🍎",
    description: "Power up your focus with coffee and apples during sessions!",
    icon: "☕",
    tips: [
      "Coffee: +6 focus boost for 3 minutes (3 free daily)",
      "Apple: +3 instant focus boost (5 free daily)",
      "Premium boosts available after free uses"
    ]
  },
  {
    title: "Daily Habits 💧🍎😴",
    description: "Track healthy habits to keep your energy high.",
    icon: "💧",
    tips: [
      "Water: +5 energy per glass (stay hydrated!)",
      "Meals: +15 energy each (fuel your brain)",
      "Sleep: Determines your morning energy level"
    ]
  },
  {
    title: "Study Goals & Checkpoints ⏰",
    description: "Stay on track with personalized study reminders.",
    icon: "⏰",
    tips: [
      "Set daily study hour goals during onboarding",
      "Get reminded at your chosen checkpoint times",
      "Missing checkpoints makes your room messy!"
    ]
  },
  {
    title: "Mess Points & Room Cleanliness 🧹",
    description: "Keep your room clean by staying productive!",
    icon: "🧹",
    tips: [
      "Missing study checkpoints adds mess points",
      "High mess drains your energy daily (-2 per point)",
      "Clean your room by completing focus sessions",
      "A clean room = more energy for studying!"
    ]
  },
  {
    title: "Earn & Spend Q-Bies! 💰",
    description: "Customize your space with QBies earned from good habits.",
    icon: "qbies",
    tips: [
      "Earn coins from focus sessions and habits",
      "Visit the Shop tab to buy decorations",
      "Unlock new lights, plants, and room items"
    ]
  }
];

export default function TutorialScreen() {
  const router = useRouter();
  const completeOnboarding = useQuillbyStore((state) => state.completeOnboarding);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const iconBounceAnim = useRef(new Animated.Value(1)).current;
  const welcomeAnim = useRef(new Animated.Value(1)).current;
  
  const [fontsLoaded] = useFonts({
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });

  // Welcome animation sequence
  useEffect(() => {
    if (showWelcome) {
      setTimeout(() => {
        Animated.timing(welcomeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowWelcome(false);
        });
      }, 2000); // Show welcome for 2 seconds
    }
  }, []);

  // Animate in when component mounts or step changes
  useEffect(() => {
    if (!showWelcome) {
      animateStepTransition();
    }
  }, [currentStep, showWelcome]);

  // Handle back button - prevent going back to previous onboarding screens
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Show exit confirmation dialog
      Alert.alert(
        'Leave Quillby?',
        'Are you sure you want to exit the app?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('[Tutorial] User canceled exit'),
          },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => {
              console.log('[Tutorial] User confirmed exit');
              BackHandler.exitApp();
            },
          },
        ],
        { cancelable: true }
      );
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, []);

  // Initial animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / tutorialSteps.length,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Icon bounce animation
    const bounceAnimation = () => {
      Animated.sequence([
        Animated.timing(iconBounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(iconBounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat the bounce
        setTimeout(bounceAnimation, 2000);
      });
    };
    
    bounceAnimation();
  }, []);

  const animateStepTransition = () => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.9);

    // Animate in new content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    // Update progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / tutorialSteps.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (!fontsLoaded) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      // Animate out current content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update step and scroll
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        scrollViewRef.current?.scrollTo({ x: nextStep * SCREEN_WIDTH, animated: true });
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    // Animate out with fade
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      handleFinish();
    });
  };

  const handleFinish = async () => {
    console.log('[Tutorial] Completed');
    
    try {
      // Final celebration animation
      await new Promise<void>((resolve) => {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => resolve());
      });
      
      // Complete onboarding with error handling
      console.log('[Tutorial] Starting onboarding completion...');
      await completeOnboarding();
      console.log('[Tutorial] Onboarding completion successful');
      
      // Small delay before navigation to ensure state is updated
      setTimeout(() => {
        console.log('[Tutorial] Navigating to home screen...');
        router.replace('/(tabs)');
      }, 100);
      
    } catch (error) {
      console.error('[Tutorial] Error during completion:', error);
      
      // Fallback: navigate anyway but log the error
      console.log('[Tutorial] Navigating despite error...');
      router.replace('/(tabs)');
    }
  };

  const step = tutorialSteps[currentStep];

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.container}
      resizeMode="cover"
      defaultSource={require('../../assets/backgrounds/theme.png')}
    >
      {/* Welcome Overlay */}
      {showWelcome && (
        <Animated.View 
          style={[
            styles.welcomeOverlay,
            {
              opacity: welcomeAnim,
              transform: [{ scale: welcomeAnim }]
            }
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome to</Text>
          <Text style={styles.welcomeBrand}>Quillby! 🐹</Text>
          <Text style={styles.welcomeSubtitle}>Let's learn how to use your new study companion</Text>
        </Animated.View>
      )}

      {!showWelcome && (
        <>
          {/* Animated Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {tutorialSteps.length}
            </Text>
          </View>

          {/* Animated Progress Dots */}
          <View style={styles.dotsContainer}>
            {tutorialSteps.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  {
                    transform: [{
                      scale: index === currentStep ? 1.2 : 1
                    }]
                  }
                ]}
              />
            ))}
          </View>

          {/* Animated Content */}
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              style={styles.scrollView}
            >
              {tutorialSteps.map((stepData, index) => (
                <View key={index} style={styles.stepContainer}>
                  {/* Animated Icon */}
                  <Animated.View 
                    style={[
                      styles.iconContainer,
                      {
                        transform: [{ scale: iconBounceAnim }]
                      }
                    ]}
                  >
                    {stepData.icon === 'qbies' ? (
                      <Image
                        source={require('../../assets/overall/qbies.png')}
                        style={styles.qbiesIcon}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.icon}>{stepData.icon}</Text>
                    )}
                  </Animated.View>

                  {/* Animated Title */}
                  <Animated.Text 
                    style={[
                      styles.title,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                      }
                    ]}
                  >
                    {stepData.title}
                  </Animated.Text>

                  {/* Animated Description */}
                  <Animated.Text 
                    style={[
                      styles.description,
                      {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                      }
                    ]}
                  >
                    {stepData.description}
                  </Animated.Text>

                  {/* Animated Tips Container */}
                  <Animated.View 
                    style={[
                      styles.tipsContainer,
                      {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                      }
                    ]}
                  >
                    {stepData.tips.map((tip, tipIndex) => (
                      <Animated.View 
                        key={tipIndex} 
                        style={[
                          styles.tipRow,
                          {
                            opacity: fadeAnim,
                            transform: [{
                              translateX: slideAnim.interpolate({
                                inputRange: [-30, 0, 30],
                                outputRange: [-20, 0, 20],
                              })
                            }]
                          }
                        ]}
                      >
                        <Text style={styles.tipBullet}>•</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                      </Animated.View>
                    ))}
                  </Animated.View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Animated Navigation Buttons */}
          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.8}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextButton,
                currentStep === tutorialSteps.length - 1 && styles.finishButton
              ]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.nextButtonText,
                currentStep === tutorialSteps.length - 1 && styles.finishButtonText
              ]}>
                {currentStep === tutorialSteps.length - 1 ? "Let's Go! 🚀" : "Next"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  welcomeTitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(5),
    color: '#FFF',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  welcomeBrand: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(10),
    color: '#FFF',
    textAlign: 'center',
    marginBottom: hp(2),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(3.5),
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: wp(10),
    lineHeight: fs(5),
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.025,
    paddingHorizontal: SCREEN_WIDTH * 0.08,
  },
  progressBarBackground: {
    width: '100%',
    height: hp(0.8),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: hp(0.4),
    marginBottom: hp(1),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: hp(0.4),
  },
  progressText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(3.5),
    color: '#666',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    gap: sp(2),
  },
  progressDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
    width: wp(6),
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: SCREEN_WIDTH * 0.08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: fs(16),
  },
  qbiesIcon: {
    width: wp(16),
    height: wp(16),
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(6),
    color: '#333',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  description: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(4),
    color: '#666',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    lineHeight: fs(5.5),
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: sp(4),
    padding: sp(3.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(1.2),
  },
  tipBullet: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4.5),
    color: '#4CAF50',
    marginRight: wp(2.5),
    marginTop: hp(-0.2),
  },
  tipText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: fs(3.5),
    color: '#333',
    flex: 1,
    lineHeight: fs(5),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.08,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    gap: sp(4),
  },
  skipButton: {
    flex: 1,
    paddingVertical: hp(2),
    borderRadius: sp(3),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  skipButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4),
    color: '#666',
  },
  nextButton: {
    flex: 2,
    paddingVertical: hp(2),
    borderRadius: sp(3),
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: fs(4),
    color: '#FFF',
  },
  finishButton: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
  },
  finishButtonText: {
    color: '#FFF',
  },
});
