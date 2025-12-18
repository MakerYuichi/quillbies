// Room background layers component
import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoomLayersProps {
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
  messPoints?: number; // Add mess points to determine room state
  isSleeping?: boolean; // Add sleeping state to hide lamp
  qCoins?: number; // Add Q-coins count for display
}

export default function RoomLayers({ pointerEvents = 'auto', messPoints = 0, isSleeping = false, qCoins = 0 }: RoomLayersProps) {
  // Determine which room wall to show based on mess points
  const getRoomWall = () => {
    if (messPoints <= 5) {
      // Clean room (0-5 mess points)
      return require('../../assets/rooms/walls.png');
    } else if (messPoints <= 10) {
      // Light mess (6-10 mess points)
      return require('../../assets/rooms/mess/walls-messy1.png');
    } else if (messPoints <= 20) {
      // Medium mess (11-20 mess points)
      return require('../../assets/rooms/mess/walls-messy2.png');
    } else {
      // Heavy mess (21+ mess points)
      return require('../../assets/rooms/mess/walls-messy3.png');
    }
  };

  // Determine which room floor to show based on mess points
  const getRoomFloor = () => {
    if (messPoints <= 5) {
      // Clean room (0-5 mess points)
      return require('../../assets/rooms/floor.png');
    } else if (messPoints <= 10) {
      // Light mess (6-10 mess points)
      return require('../../assets/rooms/mess/floor-messy1.png');
    } else if (messPoints <= 20) {
      // Medium mess (11-20 mess points)
      return require('../../assets/rooms/mess/floor-messy2.png');
    } else {
      // Heavy mess (21+ mess points)
      return require('../../assets/rooms/mess/floor-messy3.png');
    }
  };
  return (
    <View pointerEvents={pointerEvents}>
      {/* LAYER 1: Wall Background - Changes based on mess points */}
      <Image 
        source={getRoomWall()}
        style={styles.wallLayer}
        resizeMode="cover"
      />
      
      {/* LAYER 2: Floor - Changes based on mess points */}
      <View style={styles.floorLayer} />
      
      <Image 
        source={getRoomFloor()}
        style={styles.floorLayer}
        resizeMode="cover"
      />
      
      {/* LAYER 3: Blue decorative background */}
      <Image 
        source={require('../../assets/backgrounds/bluebg.png')}
        style={styles.blueBgDecor}
        resizeMode="cover"
      />
      
      {/* LAYER 4: Photo Frame 1 */}
      <Image 
        source={require('../../assets/hamsters/casual/photo-frame.png')}
        style={styles.photoFrame1}
        resizeMode="contain"
      />
      
      {/* LAYER 5: Photo Frame 2 */}
      <Image 
        source={require('../../assets/hamsters/photo-frame2.png')}
        style={styles.photoFrame2}
        resizeMode="contain"
      />

       {/* LAYER 6: Fairy Lights */}
      <Image 
        source={require('../../assets/rooms/fairy-lights.png')}
        style={styles.fairyLightsDecor}
        resizeMode="contain"
      />
      
      {/* LAYER 7: Lamp - Hidden when sleeping */}
      {!isSleeping && (
        <Image 
          source={require('../../assets/rooms/lamp.png')}
          style={styles.lampDecor}
          resizeMode="contain"
        />
      )}
      
      {/* LAYER 8: Plant */}
      <Image 
        source={require('../../assets/rooms/plant.png')}
        style={styles.plantDecor}
        resizeMode="contain"
      />

      <Image 
        source={require('../../assets/rooms/plant.png')}
        style={styles.plantDecor2}
        resizeMode="contain"
      />
     
      
      {/* LAYER 9: Q-Coins Display */}
      <Image 
        source={require('../../assets/overall/qbies.png')}
        style={styles.qbiesIcon}
        resizeMode="contain"
      />
      <Text style={styles.qCoinsText}>
        {qCoins}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wallLayer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 590) / 852,
    top: -8,
    left: 0,
  },
  floorLayer: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 518) / 393,
    height: (SCREEN_HEIGHT * 336) / 852,
    left: (SCREEN_WIDTH * -90) / 393,
    top: (SCREEN_HEIGHT * 239) / 852,
    backgroundColor: '#D7CCC8',
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: 'rgba(21, 255, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  blueBgDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 401) / 393,
    height: (SCREEN_HEIGHT * 260) / 852,
    left: -8,
    top: (SCREEN_HEIGHT * -190) / 852,
    borderWidth: 1,
    borderColor: '#000000',
  },
  photoFrame1: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 64) / 393, // 64px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 104) / 852, // 104px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 322) / 393, // 322px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 83) / 852, // 83px on iPhone 15 Pro
  },
  photoFrame2: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 70) / 393, // 70px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 60) / 852, // 60px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 238) / 393, // 238px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 83) / 852, // 83px on iPhone 15 Pro
  },
  lampDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 104) / 393, // 104px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 136) / 852, // 136px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 12) / 393, // 12px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 141) / 852, // 141px on iPhone 15 Pro
  },
  plantDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 47) / 393, // 47px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 77) / 852, // 77px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 340) / 383, // Positioned on the right side (adjust as needed)
    top: (SCREEN_HEIGHT * 200) / 852, // Positioned on the floor area (adjust as needed)
  },
  plantDecor2: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 47) / 393, // 47px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 77) / 852, // 77px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 340) / 430, // Positioned on the right side (adjust as needed)
    top: (SCREEN_HEIGHT * 200) / 852, // Positioned on the floor area (adjust as needed)
  },
  fairyLightsDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 330) / 393, // 330px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 90) / 852, // 90px on iPhone 15 Pro
    left: (SCREEN_WIDTH * -81) / 393, // -81px on iPhone 15 Pro (extends beyond left edge)
    top: (SCREEN_HEIGHT * 75) / 852, // 75px on iPhone 15 Pro
  },
  qbiesIcon: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 38) / 393, // 38px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 38) / 852, // 38px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 345) / 393, // 345px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 9) / 852, // 9px on iPhone 15 Pro
  },
  qCoinsText: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 19) / 393, // 19px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 14) / 852, // 14px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 354) / 393, // 354px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 47) / 852, // 47px on iPhone 15 Pro
    fontFamily: 'ChakraPetch_700Bold',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 14) / 393, // 14px scaled
    lineHeight: (SCREEN_HEIGHT * 18) / 852, // 18px scaled
    color: '#000000',
    opacity: 0.7,
    textAlign: 'center',
  },
});
