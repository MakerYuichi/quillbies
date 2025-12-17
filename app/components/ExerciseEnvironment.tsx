// Exercise environment component - outdoor setting with sky and grass
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ExerciseEnvironmentProps {
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
}

export default function ExerciseEnvironment({ pointerEvents = 'auto' }: ExerciseEnvironmentProps) {
  return (
    <View pointerEvents={pointerEvents}>
      {/* LAYER 1: Sky Background */}
      <Image 
        source={require('../../assets/exercise/sky.png')}
        style={styles.skyLayer}
        resizeMode="cover"
      />
      
      {/* LAYER 2: Grass Floor */}
      <Image 
        source={require('../../assets/exercise/grass.png')}
        style={styles.grassLayer}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skyLayer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 590) / 852,
    top: -8,
    left: 0,
  },
  grassLayer: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 518) / 393,
    height: (SCREEN_HEIGHT * 336) / 852,
    left: (SCREEN_WIDTH * -90) / 393,
    top: (SCREEN_HEIGHT * 239) / 852,
  },
});