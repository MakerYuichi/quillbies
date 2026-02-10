import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface InstantThemeBackgroundProps {
  children: React.ReactNode;
}

export default function InstantThemeBackground({ children }: InstantThemeBackgroundProps) {
  // Show theme immediately without any delay
  return (
    <ImageBackground
      source={require('../../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
      defaultSource={require('../../../assets/backgrounds/theme.png')}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});