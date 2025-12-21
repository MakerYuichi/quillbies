import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const tutorialSteps = [
  {
    title: "Welcome to Your Room! 🏠",
    description: "This is your study space. Keep it clean by completing tasks and focus sessions!",
    icon: "🏠",
    tips: [
      "Your hamster lives here with you",
      "The room gets messy when you skip tasks",
      "Clean it by completing focus sessions"
    ]
  },
  {
    title: "Energy System ⚡",
    description: "Energy powers your focus sessions. Manage it wisely!",
    icon: "⚡",
    tips: [
      "Start with 100 energy each day",
      "Focus sessions cost 20 energy",
      "Restore energy: drink water, eat meals, sleep well"
    ]
  },
  {
    title: "Focus Sessions 📚",
    description: "Your main tool for productive study time.",
    icon: "📚",
    tips: [
      "Tap 'Start Focus' to begin",
      "Stay in the app to build focus score",
      "Earn coins and reduce room mess"
    ]
  },
  {
    title: "Daily Habits 💧🍎😴",
    description: "Track your healthy habits throughout the day.",
    icon: "💧",
    tips: [
      "Log water: +5 energy per glass",
      "Log meals: +10 energy each",
      "Track sleep: Sets your morning energy"
    ]
  },
  {
    title: "Study Checkpoints ⏰",
    description: "Stay on track with your daily study goals.",
    icon: "⏰",
    tips: [
      "Checkpoints remind you to study",
      "Missing them adds mess to your room",
      "Check your progress in the Stats tab"
    ]
  },
  {
    title: "Earn & Spend Coins",
    description: "Earn Q-Coins and customize your space!",
    icon: "qbies", // Special marker for image
    tips: [
      "Earn coins from habits and focus sessions",
      "Visit the Shop to buy decorations",
      "Unlock new lights and plants"
    ]
  }
];

export default function TutorialScreen() {
  const router = useRouter();
  const { completeOnboarding } = useQuillbyStore();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [fontsLoaded] = useFonts({
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({ x: nextStep * SCREEN_WIDTH, animated: true });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    console.log('[Tutorial] Completed');
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const step = tutorialSteps[currentStep];

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        {tutorialSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive
            ]}
          />
        ))}
      </View>

      {/* Content */}
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
            {/* Icon */}
            {stepData.icon === 'qbies' ? (
              <Image
                source={require('../../assets/overall/qbies.png')}
                style={styles.qbiesIcon}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.icon}>{stepData.icon}</Text>
            )}

            {/* Title */}
            <Text style={styles.title}>{stepData.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{stepData.description}</Text>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              {stepData.tips.map((tip, tipIndex) => (
                <View key={tipIndex} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === tutorialSteps.length - 1 ? "Let's Go! 🚀" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.04,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
    width: 24,
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
  icon: {
    fontSize: 80,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  qbiesIcon: {
    width: 80,
    height: 80,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 28,
    color: '#333',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  description: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
    lineHeight: 26,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.05,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 12,
    marginTop: -2,
  },
  tipText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 16,
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.08,
    paddingVertical: SCREEN_HEIGHT * 0.03,
    gap: 16,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  skipButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#666',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});
