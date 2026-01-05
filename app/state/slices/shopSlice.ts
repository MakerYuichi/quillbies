// Shop-related state and actions
import { StateCreator } from 'zustand';
import { ShopItem } from '../../core/types';
import { UserSlice } from './userSlice';

export interface ShopSlice {
  // Shop actions
  purchaseItem: (itemId: string, price: number) => boolean;
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
    return [
      // Lights
      {
        id: 'colored-fairy-lights',
        name: 'Colored Fairy Lights',
        description: 'Magical colorful twinkling lights to brighten your room',
        price: 50,
        category: 'light' as const,
        assetPath: 'colored-fairy-lights',
        icon: '✨'
      },
      // Plants
      {
        id: 'succulent-plant',
        name: 'Succulent Plant',
        description: 'A cute succulent to freshen up your space',
        price: 30,
        category: 'plant' as const,
        assetPath: 'succulent-plant',
        icon: '🌵'
      },
      {
        id: 'swiss-cheese-plant',
        name: 'Swiss Cheese Plant',
        description: 'Beautiful monstera plant with unique leaves',
        price: 40,
        category: 'plant' as const,
        assetPath: 'swiss-cheese-plant',
        icon: '🌿'
      }
    ];
  },

  purchaseItem: (itemId: string, price: number) => {
    const { userData } = get();
    
    const currentCoins = Number(userData.qCoins) || 0;
    const itemPrice = Number(price) || 0;
    
    if (currentCoins < itemPrice) {
      console.log(`[Shop] Insufficient coins`);
      return false;
    }
    
    if (userData.purchasedItems?.includes(itemId)) {
      console.log(`[Shop] Already purchased`);
      return false;
    }
    
    const newCoins = Math.max(0, currentCoins - itemPrice);
    
    const updatedUserData = {
      ...userData,
      qCoins: newCoins,
      purchasedItems: [...(userData.purchasedItems || []), itemId]
    };
    
    set({
      userData: updatedUserData
    });
    
    console.log(`[Shop] Purchased ${itemId} for ${itemPrice} coins`);
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
    
    set({
      userData: {
        ...userData,
        roomCustomization: Object.keys(newCustomization).length > 0 ? newCustomization : undefined
      }
    });
  }
});