// Activity card component for stats screen with 3D flip animation
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ActivityCardProps {
  title: string;
  value: string;
  subtitle: string;
  image: any;
  backgroundColor: string;
  icon: string;
  detailedStats?: React.ReactNode;
}

export default function ActivityCard({ title, value, subtitle, image, backgroundColor, icon, detailedStats }: ActivityCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    
    setIsFlipped(!isFlipped);
  };

  // 3D rotation interpolations
  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  // Opacity for smooth transition
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  // Scale for depth effect
  const scale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.95, 1],
  });

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity 
        style={[styles.cardContainer, { backgroundColor }]}
        onPress={handleFlip}
        activeOpacity={0.95}
      >
        {/* Front of card */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: frontOpacity,
              transform: [{ rotateY: frontRotateY }, { perspective: 1000 }],
            },
          ]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          <View style={styles.frontContent}>
            <View style={styles.textSection}>
              <Text style={styles.icon}>{icon}</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Image 
              source={image}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          <View style={styles.tapHintContainer}>
            <Text style={styles.tapHint}>👆 Tap for details</Text>
          </View>
        </Animated.View>

        {/* Back of card */}
        <Animated.View 
          style={[
            styles.card,
            styles.cardBack,
            {
              opacity: backOpacity,
              transform: [{ rotateY: backRotateY }, { perspective: 1000 }],
            },
          ]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <View style={styles.backContent}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsIcon}>{icon}</Text>
              <Text style={styles.detailsTitle}>{title} Details</Text>
            </View>
            <View style={styles.detailsStats}>
              {detailedStats}
            </View>
            <View style={styles.tapHintContainer}>
              <Text style={styles.tapHint}>👆 Tap to flip back</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: 180,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: SCREEN_WIDTH * 0.04,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
  },
  frontContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
  },
  icon: {
    fontSize: SCREEN_WIDTH * 0.06,
    marginBottom: 4,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  value: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  image: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.25,
    marginLeft: 12,
  },
  backContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  detailsIcon: {
    fontSize: SCREEN_WIDTH * 0.05,
    marginRight: 8,
  },
  detailsTitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontWeight: '700',
    color: '#FFF',
  },
  detailsStats: {
    flex: 1,
  },
  tapHintContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tapHint: {
    fontSize: SCREEN_WIDTH * 0.028,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});

