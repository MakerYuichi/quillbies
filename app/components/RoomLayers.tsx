// Room background layers component
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoomLayersProps {
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
  messPoints?: number; // Add mess points to determine room state
}

export default function RoomLayers({ pointerEvents = 'auto', messPoints = 0 }: RoomLayersProps) {
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
      
      {/* LAYER 4: Room Decorations - Shelf */}
      <Image 
        source={require('../../assets/study-session/studyroom-shelf.png')}
        style={styles.shelfDecor}
        resizeMode="contain"
      />
      
      {/* LAYER 5: Clock decoration */}
      <Image 
        source={require('../../assets/rooms/clock.png')}
        style={styles.clockDecor}
        resizeMode="contain"
      />
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
  shelfDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 133) / 393,
    height: (SCREEN_HEIGHT * 93) / 852,
    left: (SCREEN_WIDTH * 242) / 393,
    top: (SCREEN_HEIGHT * 70) / 852,
  },
  clockDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 65) / 393,
    height: (SCREEN_HEIGHT * 64) / 852,
    left: (SCREEN_WIDTH * 324) / 393,
    top: 0,
  },
});
