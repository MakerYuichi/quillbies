// Hamster character display component
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HamsterCharacterProps {
  selectedCharacter: string;
  currentAnimation: string;
  isSleeping: boolean;
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
}

export default function HamsterCharacter({ selectedCharacter, currentAnimation, isSleeping, pointerEvents = 'auto' }: HamsterCharacterProps) {
  // Get the correct hamster image/GIF based on selected character and animation
  const getCharacterImage = () => {
    // For casual character, check if we have the animation
    if (selectedCharacter === 'casual') {
      // Water drinking animation (only for water button)
      if (currentAnimation === 'eating') {
        try {
          return require('../../assets/hamsters/casual/drinking.png');
        } catch {
          return require('../../assets/hamsters/casual/idle-sit.png');
        }
      }
      // Normal eating animation (for maintain weight goal)
      if (currentAnimation === 'eating-normal') {
        try {
          return require('../../assets/hamsters/casual/eating-normal.png');
        } catch {
          // Fallback to idle
          return require('../../assets/hamsters/casual/idle-sit.png');
        }
      }
      // Light eating animation (for lose weight goal)
      if (currentAnimation === 'eating-light') {
        try {
          return require('../../assets/hamsters/casual/eating-light.png');
        } catch {
          // Fallback to normal eating
          try {
            return require('../../assets/hamsters/casual/eating-normal.png');
          } catch {
            return require('../../assets/hamsters/casual/idle-sit.png');
          }
        }
      }
      // Heavy eating animation (for gain weight goal)
      if (currentAnimation === 'eating-heavy') {
        try {
          return require('../../assets/hamsters/casual/eating-heavy.png');
        } catch {
          // Fallback to normal eating
          try {
            return require('../../assets/hamsters/casual/eating-normal.png');
          } catch {
            return require('../../assets/hamsters/casual/idle-sit.png');
          }
        }
      }
      if (currentAnimation === 'sleeping' || isSleeping) {
        try {
          return require('../../assets/hamsters/casual/sleeping.png');
        } catch {
          return require('../../assets/hamsters/casual/idle-sit.png');
        }
      }
      if (currentAnimation === 'wake-up') {
        try {
          return require('../../assets/hamsters/casual/wake-up.png');
        } catch {
          return require('../../assets/hamsters/casual/idle-sit.png');
        }
      }
      // Exercise animations - using jumping GIF for all exercise types
      if (currentAnimation === 'exercising' || currentAnimation === 'exercise-complete') {
        try {
          return require('../../assets/hamsters/casual/jumping.gif');
        } catch {
          return require('../../assets/hamsters/casual/idle-sit.png');
        }
      }
      // Study animation - focused studying pose
      if (currentAnimation === 'studying') {
        try {
          return require('../../assets/hamsters/casual/studying.png');
        } catch {
          // Fallback to idle if studying image doesn't exist
          return require('../../assets/hamsters/casual/idle-sit.png');
        }
      }
      return require('../../assets/hamsters/casual/idle-sit.png');
    }
    
    // Other characters
    switch (selectedCharacter) {
      case 'energetic':
        return require('../../assets/onboarding/hamster-energetic.png');
      case 'scholar':
        return require('../../assets/onboarding/hamster-scholar.png');
      default:
        return require('../../assets/hamsters/casual/idle-sit.png');
    }
  };

  return (
    <View pointerEvents={pointerEvents}>
      {/* Small white background for hamster belly */}
      <View style={styles.hamsterBellyBg} pointerEvents="none" />
      
      <View style={styles.petContainer} pointerEvents="none">
        <Image 
          source={getCharacterImage()}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hamsterBellyBg: {
    position: 'absolute',
    right: (SCREEN_WIDTH * 120) / 290,
    top: (SCREEN_HEIGHT * 280) / 852,
    width: (SCREEN_WIDTH * 100) / 550,
    height: (SCREEN_HEIGHT * 100) / 1400,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    zIndex: 9,
  },
  petContainer: {
    position: 'absolute',
    right: (SCREEN_WIDTH * 46) / 393,
    top: (SCREEN_HEIGHT * 192) / 852,
    width: (SCREEN_WIDTH * 312) / 393,
    height: (SCREEN_HEIGHT * 234) / 852,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
});
