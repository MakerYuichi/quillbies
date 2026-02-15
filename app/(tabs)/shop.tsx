import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ImageBackground, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useQuillbyStore } from '../state/store-modular';
import QuillbyPlusModal from '../components/shop/QuillbyPlusSection';
import { useImageLoading } from '../components/ImagePreloader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ShopScreen() {
  const { userData, getShopItems, purchaseItem, updateRoomCustomization } = useQuillbyStore();
  const { imagesLoaded } = useImageLoading();
  const [selectedCategory, setSelectedCategory] = useState<'light' | 'plant'>('light');
  const [previewLight, setPreviewLight] = useState<string>(userData.roomCustomization?.lightType || 'fairy-lights');
  const [previewPlant, setPreviewPlant] = useState<string>(userData.roomCustomization?.plantType || 'plant');
  const [showPlusModal, setShowPlusModal] = useState(false);
  const [insufficientCoins, setInsufficientCoins] = useState(false);
  const [requiredCoins, setRequiredCoins] = useState(0);
  
  const buddyName = userData.buddyName || 'Quillby';
  const shopItems = getShopItems();
  
  const filteredItems = shopItems.filter(item => item.category === selectedCategory);

  // Sync preview state with actual room customization when it changes
  useEffect(() => {
    setPreviewLight(userData.roomCustomization?.lightType || 'fairy-lights');
    setPreviewPlant(userData.roomCustomization?.plantType || 'plant');
  }, [userData.roomCustomization]);

  const handleItemPreview = (item: any) => {
    // Update preview state to show how the room would look
    if (item.category === 'light') {
      setPreviewLight(item.assetPath);
    } else if (item.category === 'plant') {
      setPreviewPlant(item.assetPath);
    }
  };

  const handlePurchaseAndEquip = async (item: any) => {
    console.log(`[Shop] Handling purchase/equip for:`, item);
    console.log(`[Shop] Current room customization:`, userData.roomCustomization);
    
    // Handle free default items (fairy-lights and plant)
    if (item.id === 'fairy-lights') {
      // Reset to default fairy lights (pass empty string to clear)
      console.log(`[Shop] Equipping default fairy lights (resetting customization)`);
      updateRoomCustomization('', undefined);
      setPreviewLight('fairy-lights');
      return;
    }
    
    if (item.id === 'plant') {
      // Reset to default plant (pass empty string to clear)
      console.log(`[Shop] Equipping default plant (resetting customization)`);
      updateRoomCustomization(undefined, '');
      setPreviewPlant('plant');
      return;
    }
    
    if (userData.purchasedItems?.includes(item.id)) {
      // Item already purchased, equip it
      if (item.category === 'light') {
        console.log(`[Shop] Equipping light: ${item.assetPath}`);
        updateRoomCustomization(item.assetPath, undefined);
        setPreviewLight(item.assetPath);
      } else if (item.category === 'plant') {
        console.log(`[Shop] Equipping plant: ${item.assetPath}`);
        updateRoomCustomization(undefined, item.assetPath);
        setPreviewPlant(item.assetPath);
      }
    } else {
      // Check if user has enough coins
      if (userData.qCoins < item.price) {
        // Show Plus modal with insufficient coins message
        setRequiredCoins(item.price);
        setInsufficientCoins(true);
        setShowPlusModal(true);
        return;
      }
      
      // Purchase item (async)
      const success = await purchaseItem(item.id, item.price);
      if (success) {
        // Auto-equip after purchase
        if (item.category === 'light') {
          console.log(`[Shop] Purchasing and equipping light: ${item.assetPath}`);
          updateRoomCustomization(item.assetPath, undefined);
          setPreviewLight(item.assetPath);
        } else if (item.category === 'plant') {
          console.log(`[Shop] Purchasing and equipping plant: ${item.assetPath}`);
          updateRoomCustomization(undefined, item.assetPath);
          setPreviewPlant(item.assetPath);
        }
      }
    }
  };

  const resetPreview = () => {
    setPreviewLight('lamp'); // Reset to default lamp
    setPreviewPlant('plant'); // Reset to default plant
  };

  // Wait for images to load before showing content
  if (!imagesLoaded) {
    return null; // ImagePreloader will show loading overlay
  }

  return (
    <View style={styles.container}>
      {/* Room Preview - Exact CSS Layout */}
      <View style={styles.roomPreviewContainer}>
        {/* Header Text */}
        <Text style={styles.shopHeaderText}>
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })} 🐹 {buddyName}'s Shop
        </Text>

        
        {/* Blue Background */}
        <Image
          source={require('../../assets/backgrounds/bluebg.png')}
          style={styles.roomBlueBg}
          resizeMode="cover"
        />

        {/* Q-Coin Display - Match study session design */}
        <View style={styles.qCoinsContainer}>
          <Image
            source={require('../../assets/overall/qbies.png')}
            style={styles.qCoinIcon}
            resizeMode="contain"
          />
          <Text style={styles.qCoinText}>{Number(userData.qCoins) || 0}</Text>
        </View>
        
        {/* Walls */}
        <Image
          source={require('../../assets/rooms/walls.png')}
          style={styles.roomWalls}
          resizeMode="cover"
        />
        
        {/* Photo Frames */}
        <Image
          source={require('../../assets/hamsters/photo-frame2.png')}
          style={styles.roomPhotoFrame2}
          resizeMode="contain"
        />
        <Image
          source={require('../../assets/hamsters/casual/photo-frame.png')}
          style={styles.roomPhotoFrame1}
          resizeMode="contain"
        />
        
        {/* Floor */}
        <Image
          source={require('../../assets/rooms/floor.png')}
          style={styles.roomFloor}
          resizeMode="cover"
        />
        
        {/* Preview Plants */}
        <Image
          source={
            previewPlant === 'succulent-plant'
              ? require('../../assets/shop/decoration/plants/succulent-plant.png')
              : previewPlant === 'swiss-cheese-plant'
              ? require('../../assets/shop/decoration/plants/swiss-cheese-plant.png')
              : require('../../assets/rooms/plant.png')
          }
          style={styles.roomPlant1}
          resizeMode="contain"
        />
        <Image
          source={
            previewPlant === 'succulent-plant'
              ? require('../../assets/shop/decoration/plants/succulent-plant.png')
              : previewPlant === 'swiss-cheese-plant'
              ? require('../../assets/shop/decoration/plants/swiss-cheese-plant.png')
              : require('../../assets/rooms/plant.png')
          }
          style={styles.roomPlant2}
          resizeMode="contain"
        />
        
        {/* Hamster Character */}
        <Image
          source={require('../../assets/hamsters/casual/idle-sit.png')}
          style={styles.roomHamster}
          resizeMode="contain"
        />
        
        {/* Preview Lights - Show based on selection */}
        {/* Lamp */}
        <Image
          source={require('../../assets/rooms/lamp.png')}
          style={[
            styles.roomLamp,
            previewLight !== 'lamp' && { opacity: 0 }
          ]}
          resizeMode="contain"
        />
        
        {/* Default Fairy Lights */}
        <Image
          source={require('../../assets/rooms/fairy-lights.png')}
          style={[
            styles.roomFairyLights,
            previewLight !== 'fairy-lights' && { opacity: 0 }
          ]}
          resizeMode="contain"
        />
        
        {/* Colored Fairy Lights */}
        <Image
          source={require('../../assets/shop/decoration/fairy-lights/colored.png')}
          style={[
            styles.roomFairyLights,
            previewLight !== 'colored-fairy-lights' && { opacity: 0 }
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'light' && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory('light')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'light' && styles.categoryTextActive]}>
            ✨ Lights
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'plant' && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory('plant')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'plant' && styles.categoryTextActive]}>
            🌿 Plants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.categoryButton}
          onPress={() => {
            setInsufficientCoins(false);
            setShowPlusModal(true);
          }}
        >
          <Text style={styles.categoryTextPlus}>
            💎 Plus
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shop Items */}
      <ScrollView style={styles.shopScrollView} contentContainerStyle={styles.shopContent}>
        <View style={styles.shopGrid}>
          {/* Default Light Options - Simple PNG Display */}
          {selectedCategory === 'light' && (
            <>
              <TouchableOpacity
                style={[
                  styles.shopItemSimple,
                  previewLight === 'fairy-lights' && styles.shopItemSelected,
                  !userData.roomCustomization?.lightType && styles.shopItemEquipped
                ]}
                onPress={() => handlePurchaseAndEquip({ category: 'light', assetPath: 'fairy-lights', id: 'fairy-lights' })}
              >
                <Image
                  source={require('../../assets/rooms/fairy-lights.png')}
                  style={styles.itemImageDirect}
                  resizeMode="contain"
                />
                <Text style={styles.itemPriceFree}>Free</Text>
                {!userData.roomCustomization?.lightType && (
                  <Text style={styles.equippedIndicator}>✓</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.shopItemSimple,
                  previewLight === 'lamp' && styles.shopItemSelected,
                  userData.roomCustomization?.lightType === 'lamp' && styles.shopItemEquipped
                ]}
                onPress={() => handlePurchaseAndEquip({ category: 'light', assetPath: 'lamp', id: 'lamp' })}
              >
                <Image
                  source={require('../../assets/rooms/lamp.png')}
                  style={styles.itemImageDirect}
                  resizeMode="contain"
                />
                <Text style={styles.itemPriceFree}>Free</Text>
                {userData.roomCustomization?.lightType === 'lamp' && (
                  <Text style={styles.equippedIndicator}>✓</Text>
                )}
              </TouchableOpacity>
            </>
          )}
          
          {/* Default Plant Option - Simple PNG Display */}
          {selectedCategory === 'plant' && (
            <TouchableOpacity
              style={[
                styles.shopItemSimple,
                previewPlant === 'plant' && styles.shopItemSelected,
                !userData.roomCustomization?.plantType && styles.shopItemEquipped
              ]}
              onPress={() => handlePurchaseAndEquip({ category: 'plant', assetPath: 'plant', id: 'plant' })}
            >
              <Image
                source={require('../../assets/rooms/plant.png')}
                style={styles.itemImageDirect}
                resizeMode="contain"
              />
              <Text style={styles.itemPriceFree}>Free</Text>
              {!userData.roomCustomization?.plantType && (
                <Text style={styles.equippedIndicator}>✓</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Shop Items - Simple PNG Display */}
          {filteredItems.map((item) => {
            const isPurchased = userData.purchasedItems?.includes(item.id);
            const isEquipped = (item.category === 'light' && userData.roomCustomization?.lightType === item.assetPath) ||
                             (item.category === 'plant' && userData.roomCustomization?.plantType === item.assetPath);
            const isPreviewSelected = (item.category === 'light' && previewLight === item.assetPath) ||
                                    (item.category === 'plant' && previewPlant === item.assetPath);
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.shopItemSimple,
                  isPreviewSelected && styles.shopItemSelected,
                  isEquipped && styles.shopItemEquipped
                ]}
                onPress={() => handlePurchaseAndEquip(item)}
              >
                {/* Item Image */}
                <Image
                  source={
                    item.id === 'colored-fairy-lights'
                      ? require('../../assets/shop/decoration/fairy-lights/colored.png')
                      : item.id === 'succulent-plant'
                      ? require('../../assets/shop/decoration/plants/succulent-plant.png')
                      : item.id === 'swiss-cheese-plant'
                      ? require('../../assets/shop/decoration/plants/swiss-cheese-plant.png')
                      : require('../../assets/rooms/plant.png') // Fallback
                  }
                  style={styles.itemImageDirect}
                  resizeMode="contain"
                />
                
                {/* Price (only if not purchased) */}
                {!isPurchased && (
                  <Text style={styles.itemPriceBelow}>🪙 {item.price}</Text>
                )}
                
                {/* Equipped indicator */}
                {isEquipped && (
                  <Text style={styles.equippedIndicator}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* How to Earn */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💰 How to Earn Q-Coins</Text>
          <Text style={styles.infoText}>💧 Log water: +5 coins per glass</Text>
          <Text style={styles.infoText}>📚 Complete focus sessions: +10-50 coins</Text>
          <Text style={styles.infoText}>🍎 Log meals: +10 coins</Text>
          <Text style={styles.infoText}>😴 Good sleep: +20 coins</Text>
          <Text style={styles.infoText}>🔥 Daily streaks: Bonus coins!</Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Quillby Plus Modal */}
      <QuillbyPlusModal
        visible={showPlusModal}
        onClose={() => {
          setShowPlusModal(false);
          setInsufficientCoins(false);
        }}
        insufficientCoins={insufficientCoins}
        requiredCoins={requiredCoins}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  
  // Room Preview Container - Exact CSS Layout
  roomPreviewContainer: {
    position: 'relative',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 415) / 852, // About half screen for room preview
    backgroundColor: '#FFFFFF',
  },
  
  // Shop Header Text - "16:05 pm 🐹 Hammy's Shop"
  shopHeaderText: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 266) / 393,
    height: (SCREEN_HEIGHT * 66) / 852,
    left: (SCREEN_WIDTH * 16) / 393,
    top: (SCREEN_HEIGHT * 9) / 852, // Back to original position from CSS
    fontFamily: 'Chakra Petch',
    fontWeight: '400',
    fontSize: (SCREEN_WIDTH * 21) / 393,
    lineHeight: (SCREEN_HEIGHT * 33) / 852,
    color: '#000000',
    zIndex: 10, // Ensure it's above other elements
  },
  
  // Q-Coin Display - Match study session design
  qCoinsContainer: {
    position: 'absolute',
    right: 16,
    top: 3,
    alignItems: 'center',
    zIndex: 100,
  },
  qCoinIcon: {
    width: (SCREEN_WIDTH * 47) / 393,
    height: (SCREEN_HEIGHT * 47) / 852,
  },
  qCoinText: {
    fontFamily: 'Chakra Petch',
    fontWeight: '700',
    fontSize: (SCREEN_WIDTH * 21) / 393,
    lineHeight: (SCREEN_HEIGHT * 27) / 852,
    color: '#000000',
    opacity: 0.7,
    marginTop: 5,
    textAlign: 'center',
  },
  
  // Blue Background
  roomBlueBg: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 401) / 393,
    height: (SCREEN_HEIGHT * 260) / 852,
    left: (SCREEN_WIDTH * -8) / 393,
    top: (SCREEN_HEIGHT * -190) / 852,
    borderWidth: 1,
    borderColor: '#000000',
  },
  
  // Walls
  roomWalls: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 397) / 393,
    height: (SCREEN_HEIGHT * 345) / 852,
    left: (SCREEN_WIDTH * -2) / 393,
    top: (SCREEN_HEIGHT * 70) / 852,
  },
  
  // Photo Frame 2
  roomPhotoFrame2: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 68) / 393,
    height: (SCREEN_HEIGHT * 58) / 852,
    left: (SCREEN_WIDTH * 235) / 393,
    top: (SCREEN_HEIGHT * 76) / 852,
  },
  
  // Photo Frame 1
  roomPhotoFrame1: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 64) / 393,
    height: (SCREEN_HEIGHT * 104) / 852,
    left: (SCREEN_WIDTH * 319) / 393,
    top: (SCREEN_HEIGHT * 76) / 852,
  },
  
  // Floor
  roomFloor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 514) / 393,
    height: (SCREEN_HEIGHT * 176) / 852,
    left: (SCREEN_WIDTH * -86) / 393,
    top: (SCREEN_HEIGHT * 239) / 852,
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: 'rgba(21, 255, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Plant 1
  roomPlant1: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 31) / 393,
    height: (SCREEN_HEIGHT * 50) / 852,
    left: (SCREEN_WIDTH * 318) / 393,
    top: (SCREEN_HEIGHT * 201) / 852,
  },
  
  // Plant 2
  roomPlant2: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 31) / 393,
    height: (SCREEN_HEIGHT * 50) / 852,
    left: (SCREEN_WIDTH * 352) / 393,
    top: (SCREEN_HEIGHT * 201) / 852,
  },
  
  // Fairy Lights
  roomFairyLights: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 296) / 393,
    height: (SCREEN_HEIGHT * 81) / 852,
    left: (SCREEN_WIDTH * -61) / 393,
    top: (SCREEN_HEIGHT * 83) / 852,
  },
  
  // Lamp
  roomLamp: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 104) / 393,
    height: (SCREEN_HEIGHT * 136) / 852,
    left: (SCREEN_WIDTH * 11) / 393,
    top: (SCREEN_HEIGHT * 142) / 852,
  },
  
  // Hamster Character
  roomHamster: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 120) / 393,
    height: (SCREEN_HEIGHT * 90) / 852,
    left: (SCREEN_WIDTH * 140) / 393,
    top: (SCREEN_HEIGHT * 180) / 852,
  },

  
  // Category Filter
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryButton: {
    flex: 1,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  categoryButtonActive: {
    borderBottomColor: '#2196F3',
  },
  categoryText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#2196F3',
    fontWeight: '700',
  },
  categoryTextPlus: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '700',
    color: '#7E57C2',
  },
  
  // Shop Scroll View
  shopScrollView: {
    flex: 1,
  },
  shopContent: {
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  
  // Current Setup (removed - now using room preview)
  currentSetupCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.025,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentSetupTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  currentSetupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.008,
  },
  currentSetupLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  currentSetupValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  
  // Shop Grid
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: SCREEN_HEIGHT * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  
  // Simple Shop Item (just PNG + price)
  shopItemSimple: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
    marginHorizontal: SCREEN_WIDTH * 0.02,
    position: 'relative',
  },
  shopItemSelected: {
    transform: [{ scale: 1.1 }],
  },
  shopItemEquipped: {
    opacity: 0.8,
  },
  
  // Direct PNG Image
  itemImageDirect: {
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 0.2,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  
  // Price below image
  itemPriceBelow: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '700',
    color: '#FF9800',
    textAlign: 'center',
  },
  
  // Free price
  itemPriceFree: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
  
  // Equipped indicator
  equippedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.04,
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    borderRadius: SCREEN_WIDTH * 0.03,
    textAlign: 'center',
    lineHeight: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
  },
  
  // Legacy styles (keeping for compatibility)
  shopItem: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  // Item Preview Image
  itemPreviewImage: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.08,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  itemIcon: {
    fontSize: SCREEN_WIDTH * 0.08,
  },
  equippedBadge: {
    fontSize: SCREEN_WIDTH * 0.025,
    color: '#4CAF50',
    fontWeight: '600',
  },
  itemName: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  itemDescription: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.015,
    lineHeight: SCREEN_WIDTH * 0.04,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '700',
    color: '#FF9800',
  },
  itemPriceOwned: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '700',
    color: '#4CAF50',
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_HEIGHT * 0.008,
    borderRadius: 8,
  },
  purchaseButtonOwned: {
    backgroundColor: '#2196F3',
  },
  purchaseButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  purchaseButtonText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '600',
    color: '#FFF',
  },
  purchaseButtonTextOwned: {
    color: '#FFF',
  },
  purchaseButtonTextDisabled: {
    color: '#999',
  },
  
  // Info Cards
  infoCard: {
    backgroundColor: '#E8F5E9',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  infoTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  infoText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#2E7D32',
    marginVertical: SCREEN_HEIGHT * 0.005,
    lineHeight: SCREEN_WIDTH * 0.05,
  },
  
  // Coming Soon
  comingSoonCard: {
    backgroundColor: '#E3F2FD',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  comingSoonTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  featureText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#1976D2',
    marginVertical: SCREEN_HEIGHT * 0.005,
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: SCREEN_HEIGHT * 0.05,
  },
});
