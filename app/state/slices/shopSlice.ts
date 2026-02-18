// Shop-related state and actions
import { StateCreator } from 'zustand';
import { ShopItem } from '../../core/types';
import { UserSlice } from './userSlice';
import { syncToDatabase } from '../utils/syncUtils';
import { SHOP_ITEMS } from '../../core/shopItems';

export interface ShopSlice {
  // Shop actions
  purchaseItem: (itemId: string, price: number, useGems?: boolean) => Promise<boolean>;
  getShopItems: () => ShopItem[];
  updateRoomCustomization: (lightType?: string, plantType?: string) => void;
}

export const createShopSlice: StateCreator<
  ShopSlice & UserSlice,
  [],
  [],
  ShopSlice
> = (set, get) => ({
  getShopItems: () => {
    // Return all items from the catalog, converting to the expected format
    return SHOP_ITEMS.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price, // Coin price
      gemPrice: item.gemPrice, // Optional gem price
      category: item.category as 'light' | 'plant' | 'furniture' | 'theme',
      rarity: item.rarity,
      assetPath: item.assetPath,
      icon: item.icon
    }));
  },

  purchaseItem: async (itemId: string, price: number, useGems: boolean = false) => {
    const { userData } = get();
    
    const currentCoins = Number(userData.qCoins) || 0;
    const currentGems = Number(userData.gems) || 0;
    const itemPrice = Number(price) || 0;
    
    // Check if user has enough currency
    if (useGems) {
      if (currentGems < itemPrice) {
        console.log(`[Shop] Insufficient gems`);
        return false;
      }
    } else {
      if (currentCoins < itemPrice) {
        console.log(`[Shop] Insufficient coins`);
        return false;
      }
    }
    
    if (userData.purchasedItems?.includes(itemId)) {
      console.log(`[Shop] Already purchased`);
      return false;
    }
    
    // Deduct currency
    const updatedUserData = useGems ? {
      ...userData,
      gems: Math.max(0, currentGems - itemPrice),
      purchasedItems: [...(userData.purchasedItems || []), itemId]
    } : {
      ...userData,
      qCoins: Math.max(0, currentCoins - itemPrice),
      purchasedItems: [...(userData.purchasedItems || []), itemId]
    };
    
    set({
      userData: updatedUserData
    });
    
    console.log(`[Shop] Purchased ${itemId} for ${itemPrice} coins`);
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    // Also save to purchased_items table (optional - don't fail if shop_items table doesn't have the item)
    try {
      const { getDeviceUser } = await import('../../../lib/deviceAuth');
      const { purchaseItem: savePurchase } = await import('../../../lib/shop');
      const user = await getDeviceUser();
      if (user) {
        const result = await savePurchase(user.id, itemId);
        if (result) {
          console.log(`[Shop] Saved purchase to database: ${itemId}`);
        } else {
          console.log(`[Shop] Could not save purchase to database (item may not exist in shop_items table): ${itemId}`);
        }
      }
    } catch (error) {
      console.warn('[Shop] Error saving purchase to database (continuing with local state):', error);
      // Don't fail the purchase - local state is already updated
    }
    
    return true;
  },

  updateRoomCustomization: (lightType?: string, plantType?: string) => {
    const { userData } = get();
    
    const newCustomization: any = {};
    
    if (lightType !== undefined) {
      if (lightType !== '') {
        newCustomization.lightType = lightType as 'lamp' | 'colored-fairy-lights';
      }
    } else if (userData.roomCustomization?.lightType) {
      newCustomization.lightType = userData.roomCustomization.lightType;
    }
    
    if (plantType !== undefined) {
      if (plantType !== '') {
        newCustomization.plantType = plantType as 'plant' | 'succulent-plant' | 'swiss-cheese-plant';
      }
    } else if (userData.roomCustomization?.plantType) {
      newCustomization.plantType = userData.roomCustomization.plantType;
    }
    
    const updatedUserData = {
      ...userData,
      roomCustomization: Object.keys(newCustomization).length > 0 ? newCustomization : undefined
    };
    
    set({
      userData: updatedUserData
    });
    
    // Sync to database
    syncToDatabase(updatedUserData);
  }
});