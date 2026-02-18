import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useQuillbyStore } from '../state/store-modular';
import RoomLayers from '../components/room/RoomLayers';
import QuillbyPlusModal from '../components/shop/QuillbyPlusSection';
import ShopItemCard from '../components/shop/ShopItemCard';
import PurchaseConfirmModal from '../components/shop/PurchaseConfirmModal';
import { playEquipSound, playTabSound } from '../../lib/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ShopScreen() {
  const { userData, getShopItems, purchaseItem } = useQuillbyStore();
  const [selectedCategory, setSelectedCategory] = useState<'light' | 'plant' | 'furniture' | 'theme' | 'owned'>('plant');
  const [showPlusModal, setShowPlusModal] = useState(false);
  const [insufficientCoins, setInsufficientCoins] = useState(false);
  const [requiredCoins, setRequiredCoins] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [useGemsForPurchase, setUseGemsForPurchase] = useState(false);
  
  const buddyName = userData.buddyName || 'Quillby';
  const shopItems = getShopItems();
  
  // Filter items by category
  const filteredItems = selectedCategory === 'owned' 
    ? shopItems
        .filter(item => userData.purchasedItems?.includes(item.id))
        .sort((a, b) => {
          // Sort by most recently purchased (for now, just by category then name)
          // TODO: Add purchase timestamp to sort properly
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          return a.name.localeCompare(b.name);
        })
    : shopItems.filter(item => item.category === selectedCategory);
  
  const handleItemPress = async (item: any) => {
    console.log(`[Shop] Item pressed:`, item);
    console.log(`[Shop] User purchased items:`, userData.purchasedItems);
    console.log(`[Shop] Is item purchased?`, userData.purchasedItems?.includes(item.id));
    
    // If already purchased, just equip it
    if (userData.purchasedItems?.includes(item.id)) {
      playEquipSound();
      // TODO: Implement equip logic for different categories
      console.log(`[Shop] Equipping ${item.id}`);
      return; // Exit early - don't show any modals
    }
    
    // For free items (price = 0 and no gem price), show claim modal
    const isFreeItem = (item.price === 0 || !item.price) && (!item.gemPrice || item.gemPrice === 0);
    
    if (isFreeItem) {
      console.log(`[Shop] Free item - showing claim modal`);
      setSelectedItem(item);
      setUseGemsForPurchase(false);
      setShowPurchaseModal(true);
      return;
    }
    
    // Check if user can afford (prefer coins if available)
    const canAffordCoins = item.price > 0 && userData.qCoins >= item.price;
    const canAffordGems = item.gemPrice && userData.gems >= item.gemPrice;
    
    console.log(`[Shop] Can afford coins:`, canAffordCoins, `(has ${userData.qCoins}, needs ${item.price})`);
    console.log(`[Shop] Can afford gems:`, canAffordGems, `(has ${userData.gems}, needs ${item.gemPrice})`);
    
    if (!canAffordCoins && !canAffordGems) {
      // Not enough currency - show premium modal
      console.log(`[Shop] Insufficient funds - showing QuillPlus modal`);
      setRequiredCoins(item.price || item.gemPrice || 0);
      setInsufficientCoins(true);
      setShowPlusModal(true);
      return;
    }
    
    // Determine which currency to use
    const useGems = !canAffordCoins && canAffordGems;
    
    console.log(`[Shop] Showing purchase modal - using ${useGems ? 'gems' : 'QBies'}`);
    // Show custom purchase modal
    setSelectedItem(item);
    setUseGemsForPurchase(useGems);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return;
    
    const price = useGemsForPurchase ? selectedItem.gemPrice : selectedItem.price;
    const currencyName = useGemsForPurchase ? 'gems' : 'QBies';
    
    const success = await purchaseItem(selectedItem.id, price, useGemsForPurchase);
    if (success) {
      playEquipSound();
      console.log(`[Shop] Purchased ${selectedItem.id} with ${currencyName}`);
      // TODO: Auto-equip after purchase
    }
    
    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  const handleCancelPurchase = () => {
    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  return (
    <View style={styles.container}>
      {/* Room Preview - Same as home tab but without Quillby */}
      <View style={styles.roomPreviewContainer}>
        <RoomLayers 
          pointerEvents="none" 
          messPoints={userData.messPoints} 
          isSleeping={false}
          sleepAnimation="idle"
          qCoins={userData.qCoins}
          gems={userData.gems || 0}
          hideItems={true}
        />
        
        {/* Shop Title Overlay */}
        <View style={styles.shopTitleOverlay}>
          <Text style={styles.shopTitle}>🛍️ {buddyName}'s Shop</Text>
        </View>
      </View>

      {/* Scrollable Content - Starts below floor like home tab */}
      <View style={styles.scrollableContentArea}>
        {/* Category Tabs */}
        <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'owned' && styles.categoryButtonActive]}
          onPress={() => {
            playTabSound();
            setSelectedCategory('owned');
          }}
        >
          <Text style={[styles.categoryText, selectedCategory === 'owned' && styles.categoryTextActive]}>
            🎒
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'light' && styles.categoryButtonActive]}
          onPress={() => {
            playTabSound();
            setSelectedCategory('light');
          }}
        >
          <Text style={[styles.categoryText, selectedCategory === 'light' && styles.categoryTextActive]}>
            ✨
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'plant' && styles.categoryButtonActive]}
          onPress={() => {
            playTabSound();
            setSelectedCategory('plant');
          }}
        >
          <Text style={[styles.categoryText, selectedCategory === 'plant' && styles.categoryTextActive]}>
            🌿
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'furniture' && styles.categoryButtonActive]}
          onPress={() => {
            playTabSound();
            setSelectedCategory('furniture');
          }}
        >
          <Text style={[styles.categoryText, selectedCategory === 'furniture' && styles.categoryTextActive]}>
            🪑
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'theme' && styles.categoryButtonActive]}
          onPress={() => {
            playTabSound();
            setSelectedCategory('theme');
          }}
        >
          <Text style={[styles.categoryText, selectedCategory === 'theme' && styles.categoryTextActive]}>
            🎨
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shop Items Grid - 3x3 for plants/furniture/lights, 2x2 for themes */}
      <ScrollView style={styles.shopScrollView} contentContainerStyle={styles.shopContent}>
        {selectedCategory === 'owned' ? (
          // Owned items grouped by subcategory
          <>
            {['light', 'plant', 'furniture', 'theme'].map(cat => {
              const categoryItems = filteredItems.filter(item => item.category === cat);
              if (categoryItems.length === 0) return null;
              
              const categoryEmoji = cat === 'light' ? '✨' : cat === 'plant' ? '🌿' : cat === 'furniture' ? '🪑' : '🎨';
              const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1) + 's';
              
              return (
                <View key={cat} style={styles.ownedCategorySection}>
                  <Text style={styles.ownedCategoryTitle}>{categoryEmoji} {categoryName}</Text>
                  <View style={cat === 'theme' ? styles.shopGridThemes : styles.shopGrid}>
                    {categoryItems.map((item) => (
                      <ShopItemCard
                        key={item.id}
                        item={item}
                        isPurchased={true}
                        isEquipped={false} // TODO: Implement equip tracking
                        onPress={() => handleItemPress(item)}
                        isTheme={cat === 'theme'}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
            {filteredItems.length === 0 && (
              <View style={styles.emptyOwnedContainer}>
                <Text style={styles.emptyOwnedText}>🎒</Text>
                <Text style={styles.emptyOwnedTitle}>No Items Yet</Text>
                <Text style={styles.emptyOwnedSubtitle}>Claim free items or purchase items to see them here!</Text>
              </View>
            )}
          </>
        ) : (
          // Regular shop grid
          <View style={selectedCategory === 'theme' ? styles.shopGridThemes : styles.shopGrid}>
            {filteredItems.map((item) => {
              const isPurchased = userData.purchasedItems?.includes(item.id) || false;
              const isEquipped = false; // TODO: Implement equip tracking
              
              return (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isPurchased={isPurchased}
                  isEquipped={isEquipped}
                  onPress={() => handleItemPress(item)}
                  isTheme={selectedCategory === 'theme'}
                />
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      </View>

      {/* Purchase Confirmation Modal */}
      <PurchaseConfirmModal
        visible={showPurchaseModal}
        item={selectedItem}
        useGems={useGemsForPurchase}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />

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
    backgroundColor: '#F5F5F5',
  },
  
  // Room Preview - Full screen like home tab
  roomPreviewContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
  },
  shopTitleOverlay: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 100,
  },
  shopTitle: {
    fontSize: 20,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#000',
  },
  
  // Scrollable Content Area - Starts below floor like home tab
  scrollableContentArea: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 510) / 852, // Start below floor (reduced by 70px total from 580)
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  
  // Category Tabs
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  categoryButtonActive: {
    borderBottomColor: '#2196F3',
  },
  categoryText: {
    fontSize: 24,
  },
  categoryTextActive: {
    transform: [{ scale: 1.2 }],
  },
  
  // Shop Scroll View
  shopScrollView: {
    flex: 1,
  },
  shopContent: {
    padding: 10, // Reduced from 12
    paddingBottom: 80,
  },
  
  // Shop Grid - 3x3 for plants/furniture/lights
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12, // Reduced from 16
  },
  
  // Shop Grid - 2x2 for themes
  shopGridThemes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 12, // Reduced from 16
    gap: 10, // Reduced from 12
  },
  
  // Info Cards
  infoCard: {
    backgroundColor: '#E8F5E9',
    padding: 10, // Reduced from 12
    borderRadius: 12,
    marginBottom: 10, // Reduced from 12
  },
  infoTitle: {
    fontSize: 13, // Reduced from 14
    fontFamily: 'ChakraPetch_700Bold',
    color: '#2E7D32',
    marginBottom: 6, // Reduced from 8
  },
  infoText: {
    fontSize: 11, // Reduced from 12
    fontFamily: 'ChakraPetch_400Regular',
    color: '#2E7D32',
    marginVertical: 2,
  },
  
  // Gems Info Card
  gemsInfoCard: {
    backgroundColor: '#F3E5F5',
    padding: 10, // Reduced from 12
    borderRadius: 12,
    marginBottom: 10, // Reduced from 12
    borderWidth: 2,
    borderColor: '#7E57C2',
  },
  gemsInfoTitle: {
    fontSize: 13, // Reduced from 14
    fontFamily: 'ChakraPetch_700Bold',
    color: '#7E57C2',
    marginBottom: 6, // Reduced from 8
  },
  gemsInfoText: {
    fontSize: 11, // Reduced from 12
    fontFamily: 'ChakraPetch_400Regular',
    color: '#7E57C2',
    marginVertical: 2,
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: 40,
  },
});
