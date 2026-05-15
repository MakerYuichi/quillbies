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
  equipItem: (itemId: string, category: string) => Promise<boolean>;
  unequipItem: (category: string) => Promise<boolean>;
  setPremiumStatus: (isPremium: boolean, expiresAt?: string | null) => void;
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
      icon: item.icon,
      requiresPremium: item.requiresPremium // Include premium requirement
    }));
  },

  purchaseItem: async (itemId: string, price: number, useGems: boolean = false) => {
    const { userData } = get();
    
    // Check if item requires premium
    const { SHOP_ITEMS } = await import('../../core/shopItems');
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    
    if (item?.requiresPremium && !userData.isPremium) {
      console.log(`[Shop] Item requires premium subscription`);
      return false;
    }
    
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
      console.log(`[Shop] Already purchased locally`);
      // Still try to save to database in case it's missing there
      try {
        const { getDeviceUser } = await import('../../../lib/deviceAuth');
        const { purchaseShopItem } = await import('../../../lib/userShopItems');
        const { SHOP_ITEMS } = await import('../../core/shopItems');
        
        const user = await getDeviceUser();
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        
        if (user && item) {
          await purchaseShopItem(user.id, itemId, item.category);
        }
      } catch (error) {
        console.warn('[Shop] Error syncing existing purchase to database:', error);
      }
      return true; // Already owned locally
    }
    
    // Deduct currency and add to purchased items
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
    
    console.log(`[Shop] Purchased ${itemId} for ${itemPrice} ${useGems ? 'gems' : 'coins'}`);
    
    // Sync to database (user_profiles for currency)
    syncToDatabase(updatedUserData);
    
    // Save to user_shop_items table (async, don't block UI)
    (async () => {
      try {
        const { getDeviceUser } = await import('../../../lib/deviceAuth');
        const { purchaseShopItem } = await import('../../../lib/userShopItems');
        const { SHOP_ITEMS } = await import('../../core/shopItems');
        
        const user = await getDeviceUser();
        const item = SHOP_ITEMS.find(i => i.id === itemId);
        
        if (user && item) {
          const result = await purchaseShopItem(user.id, itemId, item.category);
          if (result) {
            console.log(`[Shop] ✅ Saved purchase to user_shop_items: ${itemId}`);
          } else {
            console.warn(`[Shop] ⚠️ Failed to save purchase to user_shop_items: ${itemId}`);
          }
        }
      } catch (error) {
        console.error('[Shop] ❌ Error saving purchase to database:', error);
      }
    })();
    
    return true;
  },

  equipItem: async (itemId: string, category: string) => {
    const { userData } = get();
    
    console.log(`[ShopSlice] equipItem called:`, { itemId, category });
    console.log(`[ShopSlice] Current roomCustomization:`, userData.roomCustomization);
    
    // Check if user owns the item
    if (!userData.purchasedItems?.includes(itemId)) {
      console.log(`[ShopSlice] ❌ Cannot equip - item not owned: ${itemId}`);
      return false;
    }
    
    // Check if item requires premium
    const { SHOP_ITEMS } = await import('../../core/shopItems');
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    
    if (item?.requiresPremium && !userData.isPremium) {
      console.log(`[ShopSlice] ❌ Cannot equip - item requires premium subscription`);
      return false;
    }
    
    // Update room customization based on category
    const currentCustomization = userData.roomCustomization || {};
    let newCustomization = { ...currentCustomization };
    
    switch (category) {
      case 'light':
        newCustomization.lightType = itemId;
        break;
      case 'plant':
        newCustomization.plantType = itemId;
        console.log(`[ShopSlice] Setting plantType to:`, itemId);
        break;
      case 'furniture':
        newCustomization.furnitureType = itemId;
        break;
      case 'theme':
        newCustomization.themeType = itemId;
        break;
      default:
        console.log(`[ShopSlice] ❌ Unknown category: ${category}`);
        return false;
    }
    
    const updatedUserData = {
      ...userData,
      roomCustomization: newCustomization
    };
    
    console.log(`[ShopSlice] New roomCustomization:`, newCustomization);
    
    set({
      userData: updatedUserData
    });
    
    console.log(`[ShopSlice] ✅ Equipped ${itemId} in category ${category}`);
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    // Update user_shop_items table
    try {
      const { getDeviceUser } = await import('../../../lib/deviceAuth');
      const { equipShopItem } = await import('../../../lib/userShopItems');
      const user = await getDeviceUser();
      
      if (user) {
        await equipShopItem(user.id, itemId, category);
      }
    } catch (error) {
      console.warn('[Shop] Error updating equipped status in database:', error);
    }
    
    return true;
  },

  unequipItem: async (category: string) => {
    const { userData } = get();
    
    // Update room customization based on category
    const currentCustomization = userData.roomCustomization || {};
    let newCustomization = { ...currentCustomization };
    
    switch (category) {
      case 'light':
        delete newCustomization.lightType;
        break;
      case 'plant':
        delete newCustomization.plantType;
        break;
      case 'furniture':
        delete newCustomization.furnitureType;
        break;
      case 'theme':
        delete newCustomization.themeType;
        break;
      default:
        console.log(`[Shop] Unknown category: ${category}`);
        return false;
    }
    
    const updatedUserData = {
      ...userData,
      roomCustomization: Object.keys(newCustomization).length > 0 ? newCustomization : undefined
    };
    
    set({
      userData: updatedUserData
    });
    
    console.log(`[Shop] Unequipped item in category ${category}`);
    
    // Sync to database
    syncToDatabase(updatedUserData);
    
    // Update user_shop_items table
    try {
      const { getDeviceUser } = await import('../../../lib/deviceAuth');
      const { unequipShopItem } = await import('../../../lib/userShopItems');
      const user = await getDeviceUser();
      
      if (user) {
        await unequipShopItem(user.id, category);
      }
    } catch (error) {
      console.warn('[Shop] Error updating unequipped status in database:', error);
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
  },

  setPremiumStatus: (isPremium: boolean, expiresAt?: string | null) => {
    const { userData } = get();
    
    const updatedUserData = {
      ...userData,
      isPremium,
      premiumExpiresAt: expiresAt !== undefined ? expiresAt : userData.premiumExpiresAt,
    };
    
    set({ userData: updatedUserData });
    
    console.log('[Shop] Premium status updated:', isPremium, expiresAt ? `expires ${expiresAt}` : '(permanent)');
    
    // Write is_premium directly to DB — syncToDatabase intentionally skips this field
    // to prevent local cache from overwriting DB revocations
    (async () => {
      try {
        const { getDeviceUser } = await import('../../../lib/deviceAuth');
        const { supabase } = await import('../../../lib/supabase');
        const user = await getDeviceUser();
        if (user) {
          await supabase
            .from('user_profiles')
            .update({
              is_premium: isPremium,
              premium_expires_at: expiresAt ?? null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);
          console.log('[Shop] ✅ is_premium written directly to DB:', isPremium);
        }
      } catch (e) {
        console.warn('[Shop] Failed to write premium status to DB:', e);
      }
    })();

    // Sync other fields (coins, gems, etc.) — is_premium excluded from syncToDatabase
    syncToDatabase(updatedUserData);
  }
});
