import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useQuillbyStore } from '../state/store-modular';
import RoomLayers from '../components/room/RoomLayers';
import PremiumUpgradeModal from '../components/modals/PremiumUpgradeModal';
import ShopItemCard from '../components/shop/ShopItemCard';
import PurchaseConfirmModal from '../components/shop/PurchaseConfirmModal';
import PurchaseSuccessModal from '../components/shop/PurchaseSuccessModal';
import { playEquipSound, playTabSound } from '../../lib/soundManager';
import { getThemeColors } from '../utils/themeColors';
import RealTimeClock from '../components/ui/RealTimeClock';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ShopScreen() {
  const { userData, getShopItems, purchaseItem, equipItem, unequipItem } = useQuillbyStore();
  
  // Get theme type to determine default category
  const themeType = userData.roomCustomization?.themeType;
  
  // Always default to 'owned' category (both themed and unthemed)
  const [selectedCategory, setSelectedCategory] = useState<'light' | 'plant' | 'furniture' | 'theme' | 'owned'>('owned');
  
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [insufficientCoins, setInsufficientCoins] = useState(false);
  const [requiredCoins, setRequiredCoins] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [useGemsForPurchase, setUseGemsForPurchase] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState<any>(null);
  
  const buddyName = userData.buddyName || 'Quillby';
  const shopItems = getShopItems();
  
  // Get theme colors
  const themeColors = getThemeColors(themeType);
  
  // Helper to check if furniture is a redecor item
  const isRedecorFurniture = (itemId: string) => {
    return itemId.includes('redecor');
  };
  
  // Filter items by category
  const filteredItems = selectedCategory === 'owned' 
    ? shopItems
        .filter(item => {
          // First check if item is purchased
          if (!userData.purchasedItems?.includes(item.id)) return false;
          
          // When themed, only show themes and redecor furniture
          if (themeType) {
            return item.category === 'theme' || 
                   (item.category === 'furniture' && isRedecorFurniture(item.id));
          }
          
          return true;
        })
        .sort((a, b) => {
          // Sort by category first, then by name
          if (a.category !== b.category) {
            const categoryOrder = ['light', 'plant', 'furniture', 'theme'];
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
          }
          return a.name.localeCompare(b.name);
        })
    : shopItems.filter(item => {
        // Filter by selected category
        if (item.category !== selectedCategory) return false;
        
        // When themed, only show themes and redecor furniture
        if (themeType) {
          return item.category === 'theme' || 
                 (item.category === 'furniture' && isRedecorFurniture(item.id));
        }
        
        return true;
      });
  
  // Group owned items by category for better display
  const ownedItemsByCategory = selectedCategory === 'owned' 
    ? {
        light: themeType ? [] : filteredItems.filter(item => item.category === 'light'),
        plant: themeType ? [] : filteredItems.filter(item => item.category === 'plant'),
        furniture: filteredItems.filter(item => item.category === 'furniture' && (!themeType || isRedecorFurniture(item.id))),
        theme: filteredItems.filter(item => item.category === 'theme'),
      }
    : null;
  
  // Helper function to check if an item is equipped
  const getIsEquipped = (item: any) => {
    const customization = userData.roomCustomization;
    if (!customization) return false;
    
    switch (item.category) {
      case 'light':
        return customization.lightType === item.id;
      case 'plant':
        return customization.plantType === item.id;
      case 'furniture':
        return customization.furnitureType === item.id;
      case 'theme':
        return customization.themeType === item.id;
      default:
        return false;
    }
  };
  
  const handleItemPress = async (item: any) => {
    console.log(`[Shop] Item pressed:`, item);
    console.log(`[Shop] User purchased items:`, userData.purchasedItems);
    console.log(`[Shop] Is item purchased?`, userData.purchasedItems?.includes(item.id));
    console.log(`[Shop] Current roomCustomization:`, userData.roomCustomization);
    
    // Check if item requires premium and user is not premium
    if (item.requiresPremium && !userData.isPremium) {
      console.log(`[Shop] Item requires premium - showing Premium Upgrade modal`);
      setShowPremiumModal(true);
      return;
    }
    
    // If already purchased, check if equipped
    if (userData.purchasedItems?.includes(item.id)) {
      const isEquipped = getIsEquipped(item);
      console.log(`[Shop] Is item equipped?`, isEquipped);
      
      if (isEquipped) {
        // Unequip the item
        playEquipSound();
        const success = await unequipItem(item.category);
        if (success) {
          console.log(`[Shop] ✅ Unequipped ${item.id}`);
          console.log(`[Shop] New roomCustomization:`, userData.roomCustomization);
        }
      } else {
        // Equip the item
        playEquipSound();
        const success = await equipItem(item.id, item.category);
        if (success) {
          console.log(`[Shop] ✅ Equipped ${item.id}`);
          console.log(`[Shop] New roomCustomization:`, userData.roomCustomization);
        }
      }
      return; // Exit early - don't show any modals
    }
    
    // For free items (price = 0 and no gem price), claim directly
    const isFreeItem = (item.price === 0 || !item.price) && (!item.gemPrice || item.gemPrice === 0);
    
    if (isFreeItem) {
      console.log(`[Shop] Free item - claiming directly`);
      const success = await purchaseItem(item.id, 0, false);
      if (success) {
        playEquipSound();
        // Auto-equip after claiming
        await equipItem(item.id, item.category);
        setPurchasedItem(item);
        setShowSuccessModal(true);
      }
      return;
    }
    
    // Check if user can afford (prefer coins if available)
    const canAffordCoins = item.price > 0 && userData.qCoins >= item.price;
    const canAffordGems = item.gemPrice && userData.gems >= item.gemPrice;
    
    console.log(`[Shop] Can afford coins:`, canAffordCoins, `(has ${userData.qCoins}, needs ${item.price})`);
    console.log(`[Shop] Can afford gems:`, canAffordGems, `(has ${userData.gems}, needs ${item.gemPrice})`);
    
    if (!canAffordCoins && !canAffordGems) {
      // Not enough currency - show premium upgrade modal
      console.log(`[Shop] Insufficient funds - showing Premium Upgrade modal`);
      setRequiredCoins(item.price || item.gemPrice || 0);
      setInsufficientCoins(true);
      setShowPremiumModal(true);
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

  const handleConfirmPurchase = async (useGems: boolean) => {
    if (!selectedItem) return;
    
    const price = useGems ? selectedItem.gemPrice : selectedItem.price;
    const currencyName = useGems ? 'gems' : 'QBies';
    
    console.log(`[Shop] Purchasing ${selectedItem.id} with ${currencyName}...`);
    
    const success = await purchaseItem(selectedItem.id, price, useGems);
    if (success) {
      playEquipSound();
      console.log(`[Shop] ✅ Purchased ${selectedItem.id} with ${currencyName}`);
      
      // Auto-equip after purchase
      await equipItem(selectedItem.id, selectedItem.category);
      
      // Close purchase modal IMMEDIATELY
      setShowPurchaseModal(false);
      setSelectedItem(null);
      
      // Show success modal after a brief delay for smooth transition
      setTimeout(() => {
        setPurchasedItem(selectedItem);
        setShowSuccessModal(true);
      }, 150);
    } else {
      // Purchase failed - close modal
      setShowPurchaseModal(false);
      setSelectedItem(null);
    }
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
          hideItems={false}
        />
        
        {/* Clock - Same as home tab */}
        <RealTimeClock customLabel="Shop" />
      </View>

      {/* Scrollable Content - Starts below floor like home tab */}
      <View style={styles.scrollableContentArea}>
        {/* Category Tabs */}
        <View style={[
          styles.categoryContainer,
          themeType && { 
            backgroundColor: themeColors.isDark ? 'rgba(0, 0, 0, 0.3)' : '#FFF',
            borderBottomColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0'
          }
        ]}>
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
        {!themeType && (
          <>
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
          </>
        )}
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
          // Owned items grouped by category
          <>
            {ownedItemsByCategory && Object.entries(ownedItemsByCategory).map(([cat, items]) => {
              if (items.length === 0) return null;
              
              const categoryConfig = {
                light: { emoji: '💡', name: 'Lights', color: '#FFC107' },
                plant: { emoji: '🌿', name: 'Plants', color: '#4CAF50' },
                furniture: { emoji: '🛋️', name: 'Furniture', color: '#795548' },
                theme: { emoji: '🎨', name: 'Themes', color: '#9C27B0' },
              };
              
              const config = categoryConfig[cat as keyof typeof categoryConfig];
              
              return (
                <View key={cat} style={styles.ownedCategorySection}>
                  <View style={styles.ownedCategoryHeader}>
                    <View style={[styles.categoryIconBadge, { backgroundColor: config.color }]}>
                      <Text style={styles.categoryIconText}>{config.emoji}</Text>
                    </View>
                    <Text style={[
                      styles.ownedCategoryTitle,
                      themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' }
                    ]}>{config.name}</Text>
                    <View style={[
                      styles.categoryCountBadge,
                      themeType && { 
                        backgroundColor: themeColors.isDark ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0'
                      }
                    ]}>
                      <Text style={[
                        styles.categoryCountText,
                        themeType && { color: themeColors.isDark ? '#FFFFFF' : '#666' }
                      ]}>{items.length}</Text>
                    </View>
                  </View>
                  <View style={cat === 'theme' ? styles.shopGridThemes : styles.shopGrid}>
                    {items.map((item) => (
                      <ShopItemCard
                        key={item.id}
                        item={item}
                        isPurchased={true}
                        isEquipped={getIsEquipped(item)}
                        onPress={() => handleItemPress(item)}
                        isTheme={cat === 'theme'}
                        themeColors={themeColors}
                        hasTheme={!!themeType}
                        isPremium={userData.isPremium === true}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
            {filteredItems.length === 0 && (
              <View style={styles.emptyOwnedContainer}>
                <Text style={styles.emptyOwnedText}>🎒</Text>
                <Text style={[
                  styles.emptyOwnedTitle,
                  themeType && { color: themeColors.isDark ? '#FFFFFF' : '#333' }
                ]}>No Items Yet</Text>
                <Text style={[
                  styles.emptyOwnedSubtitle,
                  themeType && { color: themeColors.isDark ? 'rgba(255, 255, 255, 0.7)' : '#666' }
                ]}>Claim free items or purchase items to see them here!</Text>
              </View>
            )}
          </>
        ) : (
          // Regular shop grid
          <View style={selectedCategory === 'theme' ? styles.shopGridThemes : styles.shopGrid}>
            {filteredItems.map((item) => {
              const isPurchased = userData.purchasedItems?.includes(item.id) || false;
              const isEquipped = getIsEquipped(item);
              
              return (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isPurchased={isPurchased}
                  isEquipped={isEquipped}
                  onPress={() => handleItemPress(item)}
                  isTheme={selectedCategory === 'theme'}
                  themeColors={themeColors}
                  hasTheme={!!themeType}
                  isPremium={userData.isPremium === true}
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
        userQCoins={userData.qCoins}
        userGems={userData.gems || 0}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />

      {/* Purchase Success Modal */}
      <PurchaseSuccessModal
        visible={showSuccessModal}
        item={purchasedItem}
        onClose={() => {
          setShowSuccessModal(false);
          setPurchasedItem(null);
        }}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        visible={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false);
          setInsufficientCoins(false);
        }}
        onUpgrade={() => {
          console.log('[Shop] Premium upgrade requested');
          // TODO: Implement premium upgrade flow
          setShowPremiumModal(false);
        }}
        featureName="Shop items"
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
    fontSize: 25,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#000',
  },
  
  // Scrollable Content Area - Starts below asset
  scrollableContentArea: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 415) / 852, // Start right after asset (490px + small gap)
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: '#FFFFFF', // White background for scrollable area
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
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  
  // Shop Grid - 2x2 for themes
  shopGridThemes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 12,
    gap: 10,
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
  
  // Owned Category Section
  ownedCategorySection: {
    marginBottom: 16,
  },
  ownedCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 4,
  },
  categoryIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryIconText: {
    fontSize: 18,
  },
  ownedCategoryTitle: {
    fontSize: 16,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    flex: 1,
  },
  categoryCountBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCountText: {
    fontSize: 12,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#666',
  },
  
  // Empty Owned State
  emptyOwnedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyOwnedText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyOwnedTitle: {
    fontSize: 18,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyOwnedSubtitle: {
    fontSize: 14,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
