import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { getRarityColor } from '../../core/shopItems';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PurchaseConfirmModalProps {
  visible: boolean;
  item: {
    id: string;
    name: string;
    icon: string;
    rarity: string;
    price: number;
    gemPrice?: number;
    category: string;
    assetPath: string;
  } | null;
  useGems: boolean;
  userQCoins: number;
  userGems: number;
  onConfirm: (useGems: boolean) => void;
  onCancel: () => void;
}

// Asset map for all shop items
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

export default function PurchaseConfirmModal({ 
  visible, 
  item, 
  useGems,
  userQCoins,
  userGems,
  onConfirm, 
  onCancel 
}: PurchaseConfirmModalProps) {
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
  
  // Check if item can be bought with both currencies
  const hasBothCurrencies = item.price > 0 && item.gemPrice && item.gemPrice > 0;
  
  // Check affordability
  const canAffordQBies = userQCoins >= item.price;
  const canAffordGems = item.gemPrice ? userGems >= item.gemPrice : false;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <BlurView intensity={40} style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onCancel}
        />
        
        <View style={styles.modalContainer}>
          {/* Rarity glow effect - using positioned colored layer */}
          <View 
            style={[
              styles.glowEffect,
              { 
                backgroundColor: color1,
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
            
            {/* Item Image */}
            <View style={styles.imageContainer}>
              {imageSource && (
                <Image 
                  source={imageSource} 
                  style={styles.itemImage}
                  resizeMode="contain"
                />
              )}
            </View>
            
            {/* Item Name */}
            <Text style={styles.itemName}>{item.name}</Text>
            
            {/* Rarity Badge */}
            <View style={[styles.rarityBadge, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
              <Text style={styles.rarityText}>
                {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
              </Text>
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Purchase Question */}
            <Text style={styles.questionText}>Purchase this item?</Text>
            
            {/* Buttons - Show dual currency if available */}
            {hasBothCurrencies ? (
              <View style={styles.dualCurrencyContainer}>
                {/* QBies Option */}
                <TouchableOpacity 
                  style={[
                    styles.currencyButton, 
                    styles.qbiesButton,
                    !canAffordQBies && styles.currencyButtonDisabled
                  ]}
                  onPress={() => canAffordQBies && onConfirm(false)}
                  activeOpacity={canAffordQBies ? 0.7 : 1}
                  disabled={!canAffordQBies}
                >
                  <View style={styles.currencyButtonContent}>
                    {!canAffordQBies && (
                      <Text style={styles.lockIcon}>🔒</Text>
                    )}
                    <Image
                      source={require('../../../assets/overall/qbies.png')}
                      style={[
                        styles.currencyButtonIcon,
                        !canAffordQBies && styles.currencyIconDisabled
                      ]}
                      resizeMode="contain"
                    />
                    <Text style={[
                      styles.currencyButtonAmount,
                      !canAffordQBies && styles.currencyTextDisabled
                    ]}>{item.price}</Text>
                  </View>
                  <Text style={[
                    styles.currencyButtonLabel,
                    !canAffordQBies && styles.currencyTextDisabled
                  ]}>
                    {canAffordQBies ? 'Buy with QBies' : `Need ${item.price - userQCoins} more`}
                  </Text>
                </TouchableOpacity>
                
                {/* Gems Option */}
                <TouchableOpacity 
                  style={[
                    styles.currencyButton, 
                    styles.gemsButton,
                    !canAffordGems && styles.currencyButtonDisabled
                  ]}
                  onPress={() => canAffordGems && onConfirm(true)}
                  activeOpacity={canAffordGems ? 0.7 : 1}
                  disabled={!canAffordGems}
                >
                  <View style={styles.currencyButtonContent}>
                    {!canAffordGems && (
                      <Text style={styles.lockIcon}>🔒</Text>
                    )}
                    <Text style={[
                      styles.gemButtonIcon,
                      !canAffordGems && styles.currencyTextDisabled
                    ]}>💎</Text>
                    <Text style={[
                      styles.currencyButtonAmount,
                      !canAffordGems && styles.currencyTextDisabled
                    ]}>{item.gemPrice}</Text>
                  </View>
                  <Text style={[
                    styles.currencyButtonLabel,
                    !canAffordGems && styles.currencyTextDisabled
                  ]}>
                    {canAffordGems ? 'Buy with Gems' : `Need ${(item.gemPrice || 0) - userGems} more`}
                  </Text>
                </TouchableOpacity>
                
                {/* Cancel Button - Full Width Below */}
                <TouchableOpacity 
                  style={styles.cancelButtonFull}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Single currency option (original layout)
              <>
                {/* Price Display */}
                <View style={styles.priceContainer}>
                  {useGems || item.gemPrice ? (
                    <View style={styles.priceRow}>
                      <Text style={styles.gemIconLarge}>💎</Text>
                      <Text style={styles.priceAmount}>{item.gemPrice || 0}</Text>
                      <Text style={styles.currencyLabel}>gems</Text>
                    </View>
                  ) : (
                    <View style={styles.priceRow}>
                      <Image
                        source={require('../../../assets/overall/qbies.png')}
                        style={styles.currencyIconLarge}
                        resizeMode="contain"
                      />
                      <Text style={styles.priceAmount}>{item.price}</Text>
                      <Text style={styles.currencyLabel}>QBies</Text>
                    </View>
                  )}
                </View>
                
                {/* Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.confirmButton, { backgroundColor: color1 }]}
                    onPress={() => onConfirm(useGems)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmButtonText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
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
    width: 250,
    height: 250,
    borderRadius: 125,
    transform: [{ translateX: -125 }, { translateY: -125 }],
    opacity: 0.25,
    zIndex: -1,
  },
  modal: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  itemIcon: {
    fontSize: 64,
  },
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  rarityText: {
    fontSize: 12,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 16,
    zIndex: 1,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    marginBottom: 12,
    zIndex: 1,
  },
  priceContainer: {
    marginBottom: 24,
    zIndex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyIconLarge: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  gemIconLarge: {
    fontSize: 28,
    marginRight: 8,
  },
  priceAmount: {
    fontSize: 32,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
    marginRight: 8,
  },
  currencyLabel: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    zIndex: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
  },
  // Dual currency styles
  dualCurrencyContainer: {
    width: '100%',
    gap: 12,
  },
  currencyButton: {
    width: '100%',
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  currencyButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.05,
    elevation: 1,
  },
  qbiesButton: {
    backgroundColor: '#FF9800',
    borderWidth: 2,
    borderColor: '#F57C00',
  },
  gemsButton: {
    backgroundColor: '#9C27B0',
    borderWidth: 2,
    borderColor: '#7B1FA2',
  },
  currencyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lockIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  currencyButtonIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  currencyIconDisabled: {
    opacity: 0.5,
  },
  gemButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  currencyButtonAmount: {
    fontSize: 24,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
  },
  currencyTextDisabled: {
    opacity: 0.7,
  },
  currencyButtonLabel: {
    fontSize: 14,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    opacity: 0.9,
  },
  cancelButtonFull: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
});
