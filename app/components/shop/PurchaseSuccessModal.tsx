import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { getRarityColor } from '../../core/shopItems';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Asset map for all shop items (same as PurchaseConfirmModal)
const ASSET_MAP: { [key: string]: any } = {
  // Lights
  'assets/rooms/fairy-lights.png': require('../../../assets/rooms/fairy-lights.png'),
  'assets/shop/fairy-lights/colored.png': require('../../../assets/shop/fairy-lights/colored.png'),
  
  // Plants - Common
  'assets/rooms/plant.png': require('../../../assets/rooms/plant.png'),
  'assets/shop/common/plants/basil.png': require('../../../assets/shop/common/plants/basil.png'),
  'assets/shop/common/plants/spider.png': require('../../../assets/shop/common/plants/spider.png'),
  'assets/shop/common/plants/fern.png': require('../../../assets/shop/common/plants/fern.png'),
  'assets/shop/common/plants/aloe-vera.png': require('../../../assets/shop/common/plants/aloe-vera.png'),
  'assets/shop/common/plants/succulent-plant.png': require('../../../assets/shop/common/plants/succulent-plant.png'),
  'assets/shop/common/plants/money.png': require('../../../assets/shop/common/plants/money.png'),
  'assets/shop/common/plants/peace-lily.png': require('../../../assets/shop/common/plants/peace-lily.png'),
  'assets/shop/common/plants/snake.png': require('../../../assets/shop/common/plants/snake.png'),
  
  // Plants - Rare
  'assets/shop/rare/plants/blossom.png': require('../../../assets/shop/rare/plants/blossom.png'),
  'assets/shop/rare/plants/indoor-tree.png': require('../../../assets/shop/rare/plants/indoor-tree.png'),
  'assets/shop/rare/plants/bamboo.png': require('../../../assets/shop/rare/plants/bamboo.png'),
  
  // Plants - Epic
  'assets/shop/epic/plants/swiss-cheese-plant.png': require('../../../assets/shop/epic/plants/swiss-cheese-plant.png'),
  'assets/shop/epic/plants/sunflower.png': require('../../../assets/shop/epic/plants/sunflower.png'),
  'assets/shop/epic/plants/rose.png': require('../../../assets/shop/epic/plants/rose.png'),
  'assets/shop/epic/plants/orchid.png': require('../../../assets/shop/epic/plants/orchid.png'),
  'assets/shop/epic/plants/lavender.png': require('../../../assets/shop/epic/plants/lavender.png'),
  'assets/shop/epic/plants/fiddle-leaf.png': require('../../../assets/shop/epic/plants/fiddle-leaf.png'),
  'assets/shop/epic/plants/tulip.png': require('../../../assets/shop/epic/plants/tulip.png'),
  
  // Furniture - Common
  'assets/shop/common/furniture/chair.png': require('../../../assets/shop/common/furniture/chair.png'),
  'assets/shop/common/furniture/lamp.png': require('../../../assets/shop/common/furniture/lamp.png'),
  'assets/shop/common/furniture/small-bookshelf.png': require('../../../assets/shop/common/furniture/small-bookshelf.png'),
  
  // Furniture - Rare
  'assets/shop/rare/furniture/comfy-sofa.png': require('../../../assets/shop/rare/furniture/comfy-sofa.png'),
  'assets/shop/rare/furniture/canvas-art.png': require('../../../assets/shop/rare/furniture/canvas-art.png'),
  'assets/shop/rare/furniture/gaming-setup.png': require('../../../assets/shop/rare/furniture/gaming-setup.png'),
  
  // Furniture - Epic
  'assets/shop/epic/furniture/gaming-redecor.png': require('../../../assets/shop/epic/furniture/gaming-redecor.png'),
  'assets/shop/epic/furniture/library-redecor.png': require('../../../assets/shop/epic/furniture/library-redecor.png'),
  'assets/shop/epic/furniture/home-redecor.png': require('../../../assets/shop/epic/furniture/home-redecor.png'),
  'assets/shop/epic/furniture/throne-chair.png': require('../../../assets/shop/epic/furniture/throne-chair.png'),
  
  // Themes - Rare
  'assets/shop/rare/theme/library.png': require('../../../assets/shop/rare/theme/library.png'),
  'assets/shop/rare/theme/night.png': require('../../../assets/shop/rare/theme/night.png'),
  
  // Themes - Epic
  'assets/shop/epic/themes/castle.png': require('../../../assets/shop/epic/themes/castle.png'),
  'assets/shop/epic/themes/space.png': require('../../../assets/shop/epic/themes/space.png'),
  'assets/shop/epic/themes/cherry-blossom.png': require('../../../assets/shop/epic/themes/cherry-blossom.png'),
  
  // Themes - Legendary
  'assets/shop/legendary/themes/galaxy.png': require('../../../assets/shop/legendary/themes/galaxy.png'),
  'assets/shop/legendary/themes/japanese-zen.png': require('../../../assets/shop/legendary/themes/japanese-zen.png'),
  'assets/shop/legendary/themes/ocean.png': require('../../../assets/shop/legendary/themes/ocean.png'),
};

interface PurchaseSuccessModalProps {
  visible: boolean;
  item: any;
  onClose: () => void;
}

export default function PurchaseSuccessModal({ visible, item, onClose }: PurchaseSuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const itemScaleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      itemScaleAnim.setValue(0);
      
      // Start animations with stagger
      Animated.sequence([
        // Modal appears
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Item appears with rotation
        Animated.parallel([
          Animated.spring(itemScaleAnim, {
            toValue: 1,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [visible]);
  
  if (!item) return null;
  
  const [color1, color2] = getRarityColor(item.rarity);
  const imageSource = ASSET_MAP[item.assetPath];
  
  // Convert hex to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  const modalBackgroundColor = hexToRgba(color1, 0.15);
  
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Animated glow effect */}
          <Animated.View 
            style={[
              styles.glowEffect,
              { 
                backgroundColor: color1,
                opacity: glowOpacity,
              }
            ]} 
          />
          
          <View style={[styles.modal, { borderColor: color1, backgroundColor: color1 }]}>
            {/* Background emoji pattern for entire modal */}
            <View style={styles.modalBackgroundPattern}>
              <Text style={styles.modalBackgroundEmoji}>
                {item.category === 'light' ? '✨' : 
                 item.category === 'plant' ? '🌿' : 
                 item.category === 'furniture' ? '🛋️' : 
                 item.category === 'theme' ? '🎨' : '✨'}
              </Text>
              <Text style={styles.modalBackgroundEmoji}>
                {item.category === 'light' ? '💡' : 
                 item.category === 'plant' ? '🌱' : 
                 item.category === 'furniture' ? '🪑' : 
                 item.category === 'theme' ? '🖼️' : '💡'}
              </Text>
              <Text style={styles.modalBackgroundEmoji}>
                {item.category === 'light' ? '⭐' : 
                 item.category === 'plant' ? '🍃' : 
                 item.category === 'furniture' ? '🏠' : 
                 item.category === 'theme' ? '🎭' : '⭐'}
              </Text>
              <Text style={styles.modalBackgroundEmoji}>
                {item.category === 'light' ? '✨' : 
                 item.category === 'plant' ? '🌿' : 
                 item.category === 'furniture' ? '🛋️' : 
                 item.category === 'theme' ? '🎨' : '✨'}
              </Text>
            </View>
            
            {/* Success Icon */}
            <View style={[styles.successIconContainer, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
              <Text style={styles.successIcon}>✨</Text>
            </View>
            
            {/* Title */}
            <Text style={[styles.title, { color: '#FFF' }]}>Purchase Successful!</Text>
            
            {/* Item Asset with rotation animation - NO background */}
            <Animated.View 
              style={[
                styles.assetContainer,
                { 
                  borderColor: color1,
                  transform: [
                    { scale: itemScaleAnim },
                    { rotate: rotation }
                  ]
                }
              ]}
            >
              {imageSource ? (
                <Image 
                  source={imageSource}
                  style={styles.assetImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.placeholderIcon}>{item.icon || '🎁'}</Text>
              )}
            </Animated.View>
            
            {/* Item Name */}
            <Text style={styles.itemName}>{item.name}</Text>
            
            {/* Rarity Badge */}
            <View style={[styles.rarityBadge, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
              <Text style={styles.rarityText}>
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </Text>
            </View>
            
            {/* Equipped Badge */}
            <View style={[styles.equippedBadge, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
              <Text style={styles.equippedText}>✓ Equipped & Ready!</Text>
            </View>
            
            {/* Close Button */}
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 280,
    height: 280,
    borderRadius: 140,
    transform: [{ translateX: -140 }, { translateY: -140 }],
    zIndex: -1,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  modalBackgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    opacity: 0.1,
    zIndex: 0,
  },
  modalBackgroundEmoji: {
    fontSize: 60,
    margin: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },
  successIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontFamily: 'ChakraPetch_700Bold',
    marginBottom: 20,
    textAlign: 'center',
    zIndex: 1,
  },
  assetContainer: {
    width: 140,
    height: 140,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1,
  },
  assetImage: {
    width: 120,
    height: 120,
  },
  placeholderIcon: {
    fontSize: 64,
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
    zIndex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    zIndex: 1,
  },
  rarityText: {
    fontSize: 12,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  equippedBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
  },
  equippedText: {
    fontSize: 14,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
  },
  closeButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    textAlign: 'center',
  },
});
