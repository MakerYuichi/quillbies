import React from 'react';
import { View, StyleSheet, Dimensions, Text, ImageBackground, Image } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getThemeColors, getThemeDecorations } from '../../utils/themeColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ThemedScreenProps {
  children: React.ReactNode;
  showBackground?: boolean; // Option to show original background
}

export default function ThemedScreen({ children, showBackground = true }: ThemedScreenProps) {
  const userData = useQuillbyStore((state) => state.userData);
  const themeType = userData.roomCustomization?.themeType;
  const themeColors = getThemeColors(themeType);
  const decorations = getThemeDecorations(themeType);


  if (!themeType) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../../../assets/backgrounds/orange-theme.png')}
          style={styles.wallsBackground}
          resizeMode="cover"
        />
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Decorative elements */}
      {decorations.map((decoration, index) => (
        <Text 
          key={index}
          style={[
            styles.decoration,
            {
              top: `${decoration.top}%`,
              left: `${decoration.left}%`,
              fontSize: decoration.size,
            }
          ]}
        >
          {decoration.emoji}
        </Text>
      ))}
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wallsBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    top: 0,
    left: 0,
    zIndex: 0,
  },
  decoration: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
});
