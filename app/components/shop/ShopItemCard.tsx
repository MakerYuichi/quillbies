import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { getRarityColor } from '../../core/shopItems';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShopItemCardProps {
  item: {
    id: string;
    name: string;
    icon: string;
    rarity: string;
    price: number;
    gemPrice?: number;
    category: string;
    assetPath: string;
  };
  isPurchased: boolean;
  isEquipped: boolean;
  onPress: () => void;
  onPreview?: () => void;
  isTheme?: boolean;
}

// Asset map for all shop items
const ASSET_MAP: { [key: string]: any } = {
  // Lights
  'assets/rooms/fairy-lights.png': require('../../../assets/rooms/fairy-lights.png'),
  'assets/rooms/lamp.png': require('../../../assets/rooms/lamp.png'),
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

export default function ShopItemCard({ item, isPurchased, isEquipped, onPress, isTheme = false }: ShopItemCardProps) {
  const [color1] = getRarityColor(item.rarity);
  
  const getRarityStars = () => {
    switch (item.rarity) {
      case 'common': return '⭐';
      case 'rare': return '⭐⭐';
      case 'epic': return '⭐⭐⭐';
      case 'legendary': return '⭐⭐⭐⭐';
      default: return '⭐';
    }
  };
  
  const imageSource = ASSET_MAP[item.assetPath];
  const cardWidth = isTheme ? (SCREEN_WIDTH - 48) / 2 : (SCREEN_WIDTH - 48) / 3;
  const cardHeight = isTheme ? 140 : 120; // Themes taller, others smaller
  
  // Determine price layout
  const hasBothPrices = item.price > 0 && item.gemPrice;
  const hasOnlyCoins = item.price > 0 && !item.gemPrice;
  const hasOnlyGems = !item.price && item.gemPrice;
  
  return (
    <TouchableOpacity style={[styles.container, { width: cardWidth }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.card, { borderColor: color1, height: cardHeight }]}>
        <View style={[styles.innerGlow, { backgroundColor: color1, opacity: 0.15 }]} />
        
        {/* Rarity Stars - Top Right Corner */}
        <View style={styles.rarityBadge}>
          <Text style={styles.rarityStars}>{getRarityStars()}</Text>
        </View>
        
        {/* Equipped Badge - Top Left */}
        {isEquipped && (
          <View style={[styles.equippedBadge, { backgroundColor: color1 }]}>
            <Text style={styles.equippedText}>✓</Text>
          </View>
        )}
        
        {/* Item Image - Full for themes, contained for others */}
        {imageSource ? (
          <Image 
            source={imageSource} 
            style={isTheme ? styles.itemImageFull : styles.itemImageContained} 
            resizeMode="contain" 
          />
        ) : (
          <View style={styles.iconContainerFull}>
            <Text style={[styles.itemIcon, isTheme && styles.itemIconLarge]}>{item.icon}</Text>
          </View>
        )}
        
        {/* Pricing at bottom */}
        {!isPurchased && (
          <View style={styles.pricingOverlay}>
            {/* Only Coins - Bottom Center */}
            {hasOnlyCoins && (
              <View style={styles.priceCenterContainer}>
                <View style={styles.priceRow}>
                  <Image source={require('../../../assets/overall/qbies.png')} style={styles.currencyIcon} resizeMode="contain" />
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              </View>
            )}
            
            {/* Only Gems - Bottom Center */}
            {hasOnlyGems && (
              <View style={styles.priceCenterContainer}>
                <View style={styles.priceRow}>
                  <Text style={styles.gemIcon}>💎</Text>
                  <Text style={styles.priceText}>{item.gemPrice}</Text>
                </View>
              </View>
            )}
            
            {/* Both Prices - Coins Left, OR Center, Gems Right */}
            {hasBothPrices && (
              <View style={styles.priceRowSpread}>
                {/* Coins - Bottom Left */}
                <View style={styles.priceRow}>
                  <Image source={require('../../../assets/overall/qbies.png')} style={styles.currencyIcon} resizeMode="contain" />
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
                
                {/* OR - Center */}
                <Text style={styles.orText}>OR</Text>
                
                {/* Gems - Bottom Right */}
                <View style={styles.priceRow}>
                  <Text style={styles.gemIcon}>💎</Text>
                  <Text style={styles.priceText}>{item.gemPrice}</Text>
                </View>
              </View>
            )}
            
            {/* Free */}
            {item.price === 0 && !item.gemPrice && (
              <View style={styles.priceCenterContainer}>
                <Text style={styles.freeText}>Free</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Owned indicator */}
        {isPurchased && !isEquipped && (
          <View style={styles.ownedOverlay}>
            <Text style={styles.ownedText}>Owned</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 8, position: 'relative' },
  card: { 
    borderRadius: 12, 
    borderWidth: 3, 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative', 
    backgroundColor: '#FFF', 
    overflow: 'hidden' 
  },
  innerGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9, zIndex: 0 },
  
  // Rarity Badge - Top Right Corner
  rarityBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  rarityStars: { 
    fontSize: 7,
    lineHeight: 9,
  },
  
  // Equipped Badge - Top Left
  equippedBadge: { 
    position: 'absolute', 
    top: 3, 
    left: 3, 
    width: 18, 
    height: 18, 
    borderRadius: 9, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 10 
  },
  equippedText: { fontSize: 11, fontFamily: 'ChakraPetch_700Bold', color: '#FFF' },
  
  // Item Image - Full for themes
  itemImageFull: { 
    width: '100%', 
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  
  // Item Image - Contained for plants/furniture/lights (smaller, centered)
  itemImageContained: {
    width: '70%',
    height: '70%',
    position: 'absolute',
    zIndex: 1,
  },
  
  iconContainerFull: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  itemIcon: { fontSize: 40 },
  itemIconLarge: { fontSize: 48 },
  
  // Pricing Overlay - Bottom of card
  pricingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 3,
    paddingHorizontal: 4,
    zIndex: 10,
  },
  
  // Price Center Container - For single currency
  priceCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Price Row Spread - For both currencies
  priceRowSpread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  currencyIcon: { 
    width: 12, 
    height: 12, 
    marginRight: 2,
  },
  gemIcon: { 
    fontSize: 11, 
    marginRight: 2,
  },
  priceText: { 
    fontSize: 11, 
    fontFamily: 'ChakraPetch_700Bold', 
    color: '#333' 
  },
  orText: { 
    fontSize: 7, 
    fontFamily: 'ChakraPetch_600SemiBold', 
    color: '#666',
    marginHorizontal: 3,
  },
  freeText: { 
    fontSize: 11, 
    fontFamily: 'ChakraPetch_700Bold', 
    color: '#4CAF50' 
  },
  
  // Owned Overlay
  ownedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingVertical: 3,
    alignItems: 'center',
    zIndex: 10,
  },
  ownedText: { 
    fontSize: 9, 
    fontFamily: 'ChakraPetch_700Bold', 
    color: '#FFF' 
  },
});
