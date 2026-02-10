import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface HomeBackgroundProps {
  children: React.ReactNode;
}

export default function HomeBackground({ children }: HomeBackgroundProps) {
  return (
    <ImageBackground
      source={require('../../../assets/backgrounds/theme.png')}
      style={styles.container}
      resizeMode="cover"
      defaultSource={require('../../../assets/backgrounds/theme.png')}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});