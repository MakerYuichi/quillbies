// Room background layers component
import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { getThemeColors, getThemeDecorations } from '../../utils/themeColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoomLayersProps {
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only';
  messPoints?: number; // Add mess points to determine room state
  isSleeping?: boolean; // Add sleeping state to hide lamp
  sleepAnimation?: string; // Add sleep animation state to hide lamp during wake-up
  qCoins?: number; // Add Q-coins count for display
  gems?: number; // Add gems count for display
  hideItems?: boolean; // Hide plants/furniture for shop preview
  showDefaultBackground?: boolean; // Show orange theme background when no theme (home tab only)
}

export default function RoomLayers({ pointerEvents = 'auto', messPoints = 0, isSleeping = false, sleepAnimation = 'idle', qCoins = 0, gems = 0, hideItems = false, showDefaultBackground = false }: RoomLayersProps) {
  const { userData } = useQuillbyStore();
  const roomCustomization = userData.roomCustomization;
  
  console.log('[RoomLayers] Rendering with:', {
    hideItems,
    hasRoomCustomization: !!roomCustomization,
    plantType: roomCustomization?.plantType,
    lightType: roomCustomization?.lightType,
    themeType: roomCustomization?.themeType
  });
  
  // Check if a theme is equipped
  const hasTheme = roomCustomization?.themeType;
  
  // Check if a redecor furniture is equipped (these replace the entire room)
  const hasRedecorFurniture = roomCustomization?.furnitureType?.includes('redecor');
  
  // Helper function to get redecor furniture asset (with mess support)
  const getRedecorAsset = () => {
    if (!hasRedecorFurniture) return null;
    
    const furnitureType = roomCustomization?.furnitureType || '';
    
    // If mess points are high, show messy version of redecor
    if (messPoints > 5) {
      const messLevel = messPoints <= 10 ? 1 : messPoints <= 20 ? 2 : 3;
      
      const messyRedecorMap: { [key: string]: { [key: number]: any } } = {
        'gaming-redecor': {
          1: require('../../../assets/rooms/mess/redecor/gaming/gaming-messy1.png'),
          2: require('../../../assets/rooms/mess/redecor/gaming/gaming-messy2.png'),
          3: require('../../../assets/rooms/mess/redecor/gaming/gaming-messy3.png'),
        },
        'library-redecor': {
          1: require('../../../assets/rooms/mess/redecor/library/library-messy1.png'),
          2: require('../../../assets/rooms/mess/redecor/library/library-messy2.png'),
          3: require('../../../assets/rooms/mess/redecor/library/library-messy3.png'),
        },
        'home-redecor': {
          1: require('../../../assets/rooms/mess/redecor/home/home-messy1.png'),
          2: require('../../../assets/rooms/mess/redecor/home/home-messy2.png'),
          3: require('../../../assets/rooms/mess/redecor/home/home-messy3.png'),
        },
      };
      
      if (messyRedecorMap[furnitureType] && messyRedecorMap[furnitureType][messLevel]) {
        return messyRedecorMap[furnitureType][messLevel];
      }
    }
    
    // Clean version of redecor
    const redecorMap: { [key: string]: any } = {
      'gaming-redecor': require('../../../assets/shop/epic/furniture/gaming-redecor.png'),
      'library-redecor': require('../../../assets/shop/epic/furniture/library-redecor.png'),
      'home-redecor': require('../../../assets/shop/epic/furniture/home-redecor.png'),
    };
    
    return redecorMap[furnitureType];
  };
  
  // Helper function to get plant asset based on plantType ID
  const getPlantAsset = (plantId: string) => {
    const plantAssets: { [key: string]: any } = {
      // Common plants
      'plant': require('../../../assets/rooms/plant.png'),
      'basil': require('../../../assets/shop/common/plants/basil.png'),
      'spider': require('../../../assets/shop/common/plants/spider.png'),
      'fern': require('../../../assets/shop/common/plants/fern.png'),
      'aloe-vera': require('../../../assets/shop/common/plants/aloe-vera.png'),
      'succulent-plant': require('../../../assets/shop/common/plants/succulent-plant.png'),
      'money': require('../../../assets/shop/common/plants/money.png'),
      'peace-lily': require('../../../assets/shop/common/plants/peace-lily.png'),
      'snake': require('../../../assets/shop/common/plants/snake.png'),
      
      // Rare plants
      'blossom': require('../../../assets/shop/rare/plants/blossom.png'),
      'indoor-tree': require('../../../assets/shop/rare/plants/indoor-tree.png'),
      'bamboo': require('../../../assets/shop/rare/plants/bamboo.png'),
      
      // Epic plants
      'swiss-cheese-plant': require('../../../assets/shop/epic/plants/swiss-cheese-plant.png'),
      'sunflower': require('../../../assets/shop/epic/plants/sunflower.png'),
      'rose': require('../../../assets/shop/epic/plants/rose.png'),
      'orchid': require('../../../assets/shop/epic/plants/orchid.png'),
      'lavender': require('../../../assets/shop/epic/plants/lavender.png'),
      'fiddle-leaf': require('../../../assets/shop/epic/plants/fiddle-leaf.png'),
      'tulip': require('../../../assets/shop/epic/plants/tulip.png'),
    };
    
    return plantAssets[plantId] || require('../../../assets/rooms/plant.png');
  };
  
  // Helper function to get furniture asset based on furnitureType ID
  const getFurnitureAsset = (furnitureId: string) => {
    const furnitureAssets: { [key: string]: any } = {
      // Common furniture
      'chair': require('../../../assets/shop/common/furniture/chair.png'),
      'lamp': require('../../../assets/shop/common/furniture/lamp.png'),
      'small-bookshelf': require('../../../assets/shop/common/furniture/small-bookshelf.png'),
      
      // Rare furniture
      'gaming-setup': require('../../../assets/shop/rare/furniture/gaming-setup.png'),
      'comfy-sofa': require('../../../assets/shop/rare/furniture/comfy-sofa.png'),
      'canvas-art': require('../../../assets/shop/rare/furniture/canvas-art.png'),
      
      // Epic furniture
      'throne-chair': require('../../../assets/shop/epic/furniture/throne-chair.png'),
    };
    
    return furnitureAssets[furnitureId];
  };
  
  // Helper function to get furniture dimensions based on furnitureType ID
  const getFurnitureDimensions = (furnitureId: string) => {
    const dimensions: { [key: string]: { width: number; height: number; top: number; left: number } } = {
      'chair': { 
        width: 100, 
        height: 120, 
        top: 230,
        left: 146.5 // (393/2 - 100/2)
      },
      'lamp': { 
        width: 104, 
        height: 136, 
        top: 141,
        left: 144.5 // (393/2 - 104/2)
      },
      'small-bookshelf': { 
        width: 90, 
        height: 130, 
        top: 200,
        left: 151.5 // (393/2 - 90/2)
      },
      'gaming-setup': { 
        width: 180, 
        height: 140, 
        top: 210,
        left: 106.5 // (393/2 - 180/2)
      },
      'comfy-sofa': { 
        width: 300, 
        height: 210, 
        top: 170,
        left: 110 // (393/2 - 160/2)
      },
      'canvas-art': { 
        width: 110, 
        height: 110, 
        top: 100,
        left: 141.5 // (393/2 - 110/2)
      },
      'throne-chair': { 
        width: 130, 
        height: 150, 
        top: 210,
        left: 131.5 // (393/2 - 130/2)
      },
    };
    
    return dimensions[furnitureId] || { width: 120, height: 120, top: 230, left: 136.5 };
  };
  
  // Get theme background if equipped (with mess support)
  const getThemeBackground = () => {
    if (!hasTheme) return null;
    
    // If mess points are high, show messy version of theme
    if (messPoints > 5) {
      const messLevel = messPoints <= 10 ? 1 : messPoints <= 20 ? 2 : 3;
      
      const messyThemeMap: { [key: string]: { [key: number]: any } } = {
        'library': {
          1: require('../../../assets/rooms/mess/themes/library/library-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/library/library-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/library/library-messy3.png'),
        },
        'night': {
          1: require('../../../assets/rooms/mess/themes/night/night-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/night/night-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/night/night-messy3.png'),
        },
        'castle': {
          1: require('../../../assets/rooms/mess/themes/castle/castle-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/castle/castle-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/castle/castle-messy3.png'),
        },
        'space': {
          1: require('../../../assets/rooms/mess/themes/space/space-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/space/space-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/space/space-messy3.png'),
        },
        'cherry-blossom': {
          1: require('../../../assets/rooms/mess/themes/cherry-blossom/blossom-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/cherry-blossom/blossom-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/cherry-blossom/blossom-messy3.png'),
        },
        'galaxy': {
          1: require('../../../assets/rooms/mess/themes/galaxy/galaxy-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/galaxy/galaxy-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/galaxy/galaxy-messy3.png'),
        },
        'japanese-zen': {
          1: require('../../../assets/rooms/mess/themes/japanese-zen/zen-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/japanese-zen/zen-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/japanese-zen/zen-messy3.png'),
        },
        'ocean': {
          1: require('../../../assets/rooms/mess/themes/ocean/ocean-messy1.png'),
          2: require('../../../assets/rooms/mess/themes/ocean/ocean-messy2.png'),
          3: require('../../../assets/rooms/mess/themes/ocean/ocean-messy3.png'),
        },
      };
      
      if (messyThemeMap[hasTheme] && messyThemeMap[hasTheme][messLevel]) {
        return messyThemeMap[hasTheme][messLevel];
      }
    }
    
    // Clean version of theme
    const themeMap: { [key: string]: any } = {
      'library': require('../../../assets/shop/rare/theme/library.png'),
      'night': require('../../../assets/shop/rare/theme/night.png'),
      'castle': require('../../../assets/shop/epic/themes/castle.png'),
      'space': require('../../../assets/shop/epic/themes/space.png'),
      'cherry-blossom': require('../../../assets/shop/epic/themes/cherry-blossom.png'),
      'galaxy': require('../../../assets/shop/legendary/themes/galaxy.png'),
      'japanese-zen': require('../../../assets/shop/legendary/themes/japanese-zen.png'),
      'ocean': require('../../../assets/shop/legendary/themes/ocean.png'),
    };
    
    return themeMap[hasTheme];
  };
  
  // Determine which room wall to show based on mess points
  const getRoomWall = () => {
    if (messPoints <= 5) {
      // Clean room (0-5 mess points)
      return require('../../../assets/rooms/walls.png');
    } else if (messPoints <= 10) {
      // Light mess (6-10 mess points)
      return require('../../../assets/rooms/mess/walls-messy1.png');
    } else if (messPoints <= 20) {
      // Medium mess (11-20 mess points)
      return require('../../../assets/rooms/mess/walls-messy2.png');
    } else {
      // Heavy mess (21+ mess points)
      return require('../../../assets/rooms/mess/walls-messy3.png');
    }
  };

  // Determine which room floor to show based on mess points
  const getRoomFloor = () => {
    if (messPoints <= 5) {
      // Clean room (0-5 mess points)
      return require('../../../assets/rooms/floor.png');
    } else if (messPoints <= 10) {
      // Light mess (6-10 mess points)
      return require('../../../assets/rooms/mess/floor-messy1.png');
    } else if (messPoints <= 20) {
      // Medium mess (11-20 mess points)
      return require('../../../assets/rooms/mess/floor-messy2.png');
    } else {
      // Heavy mess (21+ mess points)
      return require('../../../assets/rooms/mess/floor-messy3.png');
    }
  };
  
  const themeBackground = getThemeBackground();
  const themeColors = getThemeColors(hasTheme);
  const decorations = getThemeDecorations(hasTheme);
  
  return (
    <View pointerEvents={pointerEvents} style={{ flex: 1 }}>
      {/* Default orange theme background when no theme equipped - always show */}
      {!hasTheme && (
        <Image 
          source={require('../../../assets/backgrounds/theme.png')}
          style={styles.defaultBackground}
          resizeMode="cover"
        />
      )}
      
      {/* Theme-based background color for entire screen */}
      {hasTheme && (
        <View style={[styles.fullBackground, { backgroundColor: themeColors.background }]} />
      )}
      
      {/* Theme-based status bar background */}
      {hasTheme && (
        <View style={[styles.statusBarOverlay, { backgroundColor: themeColors.statusBar }]} />
      )}
      
      {/* Decorative elements */}
      {hasTheme && decorations.map((decoration, index) => (
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
      
      {/* Blue decorative background - Show when NO theme (regardless of redecor) */}
      {!hasTheme && (
        <Image 
          source={require('../../../assets/backgrounds/bluebg.png')}
          style={styles.blueBgDecor}
          resizeMode="cover"
        />
      )}
      
      {/* Wall Background - Show when NO theme (regardless of redecor) */}
      {!hasTheme && (
        <Image 
          source={getRoomWall()}
          style={styles.wallLayer}
          resizeMode="cover"
        />
      )}
      
      {/* If redecor furniture is equipped, show it as full room replacement */}
      {hasRedecorFurniture && getRedecorAsset() ? (
        <Image 
          source={getRedecorAsset()}
          style={styles.themeBackground}
          resizeMode="contain"
        />
      ) : hasTheme && themeBackground ? (
        /* If theme is equipped, show only theme background in room area */
        <Image 
          source={themeBackground}
          style={styles.themeBackground}
          resizeMode="contain"
        />
      ) : (
        <>
          {/* LAYER 2: Floor - Changes based on mess points */}
          <View style={styles.floorLayer} />
          
          <Image 
            source={getRoomFloor()}
            style={styles.floorLayer}
            resizeMode="cover"
          />
          
          {/* LAYER 3: Window - Behind lights and photo frames */}
          <Image 
            source={require('../../../assets/rooms/window.png')}
            style={styles.windowDecor}
            resizeMode="contain"
          />

          {/* LAYER 5: Lights - Behind photo frames, hide when sleeping, during wake-up animation, or when redecor furniture is equipped */}
          {!isSleeping && sleepAnimation !== 'sleeping' && sleepAnimation !== 'wake-up' && !hasRedecorFurniture && (
            <>
              {/* Default Fairy Lights - Show when no customization (original default) */}
              {!roomCustomization?.lightType && (
                <Image 
                  source={require('../../../assets/rooms/fairy-lights.png')}
                  style={styles.fairyLightsDecor}
                  resizeMode="contain"
                />
              )}
              
              {/* Colored Fairy Lights - Show when colored fairy lights are equipped */}
              {roomCustomization?.lightType === 'colored-fairy-lights' && (
                <Image 
                  source={require('../../../assets/shop/fairy-lights/colored.png')}
                  style={styles.fairyLightsDecor}
                  resizeMode="contain"
                />
              )}
            </>
          )}
          
          {/* LAYER 6: Photo Frame 1 - In front of lights */}
          <Image 
            source={require('../../../assets/hamsters/casual/photo-frame.png')}
            style={styles.photoFrame1}
            resizeMode="contain"
          />
          
          {/* LAYER 7: Photo Frame 2 - In front of lights */}
          <Image 
            source={require('../../../assets/hamsters/photo-frame2.png')}
            style={styles.photoFrame2}
            resizeMode="contain"
          />
          
          {/* LAYER 8: Customizable Plants - Only show if plantType is set and no redecor furniture */}
          {!hideItems && roomCustomization?.plantType && !hasRedecorFurniture && (
            <>
              <Image 
                source={getPlantAsset(roomCustomization.plantType)}
                style={styles.plantDecor}
                resizeMode="contain"
              />

              <Image 
                source={getPlantAsset(roomCustomization.plantType)}
                style={styles.plantDecor2}
                resizeMode="contain"
              />
            </>
          )}
          
          {/* LAYER 9: Customizable Furniture - Only show if furnitureType is set and NOT a redecor */}
          {!hideItems && roomCustomization?.furnitureType && !hasRedecorFurniture && (
            <Image 
              source={getFurnitureAsset(roomCustomization.furnitureType)}
              style={
                roomCustomization.furnitureType === 'chair' ? styles.furnitureChair :
                roomCustomization.furnitureType === 'lamp' ? styles.furnitureLamp :
                roomCustomization.furnitureType === 'small-bookshelf' ? styles.furnitureSmallBookshelf :
                roomCustomization.furnitureType === 'gaming-setup' ? styles.furnitureGamingSetup :
                roomCustomization.furnitureType === 'comfy-sofa' ? styles.furnitureComfySofa :
                roomCustomization.furnitureType === 'canvas-art' ? styles.furnitureCanvasArt :
                roomCustomization.furnitureType === 'throne-chair' ? styles.furnitureThroneChair :
                styles.furnitureDecor
              }
              resizeMode="contain"
            />
          )}
        </>
      )}
     
      
      {/* LAYER 10: Currency Display - Q-Bies and Gems */}
      <View style={styles.currencyContainer}>
        {/* Q-Bies */}
        <View style={[
          styles.qCoinsContainer,
          hasTheme && { 
            backgroundColor: themeColors.isDark ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: themeColors.isDark ? '#FFB74D' : '#FF9800',
            borderWidth: 2.5,
          }
        ]}>
          <Image 
            source={require('../../../assets/overall/qbies.png')}
            style={styles.qbiesIcon}
            resizeMode="contain"
          />
          <Text style={[
            styles.currencyText, 
            hasTheme && { 
              color: themeColors.isDark ? '#FFFFFF' : '#000000',
              fontWeight: '700',
              textShadowColor: themeColors.isDark ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }
          ]}>
            {qCoins}
          </Text>
        </View>
        
        {/* Gems - Only show if gems > 0 or in shop */}
        {gems >= 0 && (
          <View style={[
            styles.gemsContainer,
            hasTheme && { 
              backgroundColor: themeColors.isDark ? 'rgba(126, 87, 194, 0.5)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: themeColors.isDark ? '#BA68C8' : '#7E57C2',
              borderWidth: 2.5,
            }
          ]}>
            <Text style={styles.gemIcon}>💎</Text>
            <Text style={[
              styles.currencyText, 
              hasTheme && { 
                color: themeColors.isDark ? '#FFFFFF' : '#000000',
                fontWeight: '700',
                textShadowColor: themeColors.isDark ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }
            ]}>
              {gems}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    top: 0,
    left: 0,
    zIndex: 0, // Behind everything
  },
  fullBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    top: 0,
    left: 0,
    zIndex: 1,
  },
  statusBarOverlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 75) / 852, // Just cover status bar area (clock + currency)
    top: 0,
    left: 0,
    zIndex: 5, // Below clock but above room
  },
  decoration: {
    position: 'absolute',
    zIndex: 2, // Below theme background but above status bar
    opacity: 0.6,
  },
  themeBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 490) / 852, // End where scrollable content starts
    top: 0, // Start from top
    left: 0,
    zIndex: 10, // Above decorations so theme image is in front
  },
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
    height: (SCREEN_HEIGHT * 246) / 852, // Reduced by 90px total (336 - 90 = 246)
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
    left: (SCREEN_WIDTH * -8) / 393,
    top: (SCREEN_HEIGHT * -190) / 852, // Positioned above screen to create sky effect
    borderWidth: 1,
    borderColor: '#000000',
    zIndex: 1, // Behind walls but above default background
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
  windowDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 120) / 393, // 120px window width
    height: (SCREEN_HEIGHT * 140) / 852, // 140px window height
    left: (SCREEN_WIDTH * 0) / 393, // Positioned on left side of room
    top: (SCREEN_HEIGHT * 80) / 852, // Positioned higher on wall
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
    width: (SCREEN_WIDTH * 65) / 393, // Increased from 47px to 65px
    height: (SCREEN_HEIGHT * 105) / 852, // Increased from 77px to 105px
    left: (SCREEN_WIDTH * 325) / 383, // Positioned on the right side (adjust as needed)
    top: (SCREEN_HEIGHT * 170) / 852, // Positioned on the floor area (adjust as needed)
  },
  plantDecor2: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 65) / 393, // Increased from 47px to 65px
    height: (SCREEN_HEIGHT * 105) / 852, // Increased from 77px to 105px
    left: (SCREEN_WIDTH * 310) / 430, // Positioned on the right side (adjust as needed)
    top: (SCREEN_HEIGHT * 170) / 852, // Positioned on the floor area (adjust as needed)
  },
  furnitureDecor: {
    position: 'absolute',
    // Dimensions are set dynamically based on furniture type
  },
  furnitureChair: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 500) / 393,
    height: (SCREEN_HEIGHT * 150) / 852,
    left: (SCREEN_WIDTH * 80) / 393, // Centered: (393/2 - 100/2)
    top: (SCREEN_HEIGHT * 270) / 852,
  },
  furnitureLamp: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 104) / 393, // 104px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 136) / 852, // 136px on iPhone 15 Pro
    left: (SCREEN_WIDTH * 12) / 393, // 12px on iPhone 15 Pro
    top: (SCREEN_HEIGHT * 141) / 852, // 141px on iPhone 15 Pro
  },
  furnitureSmallBookshelf: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 200) / 393,
    height: (SCREEN_HEIGHT * 140) / 852,
    left: (SCREEN_WIDTH * -40) / 393, // Centered: (393/2 - 90/2)
    top: (SCREEN_HEIGHT * 140) / 852,
  },
  furnitureGamingSetup: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 300) / 393,
    height: (SCREEN_HEIGHT * 400) / 852,
    left: (SCREEN_WIDTH * 0) / 393, // Centered: (393/2 - 180/2)
    top: (SCREEN_HEIGHT * 20) / 852,
  },
  furnitureComfySofa: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 310) / 393,
    height: (SCREEN_HEIGHT * 300) / 852,
    left: (SCREEN_WIDTH * 50) / 393, // Centered: (393/2 - 160/2)
    top: (SCREEN_HEIGHT * 170) / 852,
  },
  furnitureCanvasArt: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 110) / 393,
    height: (SCREEN_HEIGHT * 210) / 852,
    left: (SCREEN_WIDTH * 10) / 393, // Centered: (393/2 - 110/2)
    top: (SCREEN_HEIGHT * 120) / 852,
  },
  furnitureThroneChair: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 200) / 393,
    height: (SCREEN_HEIGHT * 400) / 852,
    left: (SCREEN_WIDTH * 90) / 393, // Centered: (393/2 - 130/2)
    top: (SCREEN_HEIGHT * 60) / 852,
  },
  fairyLightsDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 330) / 393, // 330px on iPhone 15 Pro
    height: (SCREEN_HEIGHT * 90) / 852, // 90px on iPhone 15 Pro
    left: (SCREEN_WIDTH * -81) / 393, // -81px on iPhone 15 Pro (extends beyond left edge)
    top: (SCREEN_HEIGHT * 75) / 852, // 75px on iPhone 15 Pro
  },
  // Currency Container - Holds both Q-Bies and Gems
  currencyContainer: {
    position: 'absolute',
    right: 16,
    top: 3,
    flexDirection: 'row',
    gap: 12,
    zIndex: 30, // Above everything including decorations
  },
  // Q-Bies Display - Vertical layout (icon on top, value below)
  qCoinsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF9800',
    minWidth: 50,
  },
  qbiesIcon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  currencyText: {
    fontFamily: 'ChakraPetch_700Bold',
    fontSize: 13,
    color: '#333',
  },
  // Gems Display - Vertical layout (icon on top, value below)
  gemsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(126, 87, 194, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#7E57C2',
    minWidth: 50,
  },
  gemIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
});
