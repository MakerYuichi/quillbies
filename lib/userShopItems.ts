// lib/userShopItems.ts
// Manage user's purchased and equipped shop items

import { supabase } from './supabase';

// Purchase an item (add to user_shop_items)
export const purchaseShopItem = async (userId: string, itemId: string, category: string) => {
  try {
    // Check if already purchased (use maybeSingle to avoid error when not found)
    const { data: existing, error: checkError } = await supabase
      .from('user_shop_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();
    
    if (checkError) {
      console.error('[UserShopItems] Error checking existing item:', checkError);
      return false;
    }
    
    if (existing) {
      console.log('[UserShopItems] Item already purchased:', itemId);
      return true; // Already owned
    }
    
    // Insert new purchase
    const { data, error } = await supabase
      .from('user_shop_items')
      .insert([
        {
          user_id: userId,
          item_id: itemId,
          category: category,
          is_equipped: false,
          purchased_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();
    
    if (error) {
      // If duplicate key error (23505), item already exists - treat as success
      if (error.code === '23505') {
        console.log('[UserShopItems] Item already exists in database (duplicate key):', itemId);
        return true;
      }
      console.error('[UserShopItems] Purchase error:', error);
      return false;
    }
    
    console.log('[UserShopItems] ✅ Item purchased:', itemId);
    return true;
  } catch (err) {
    console.error('[UserShopItems] Purchase exception:', err);
    return false;
  }
};

// Equip an item (set is_equipped = true, unequip others in same category)
export const equipShopItem = async (userId: string, itemId: string, category: string) => {
  try {
    // First, check if the item exists in user_shop_items
    const { data: itemExists, error: checkError } = await supabase
      .from('user_shop_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();
    
    if (checkError) {
      console.error('[UserShopItems] Error checking item existence:', checkError);
      return false;
    }
    
    if (!itemExists) {
      console.warn('[UserShopItems] Cannot equip - item not in user_shop_items:', itemId);
      // Try to add it first (this handles race condition where purchase hasn't saved yet)
      const purchaseResult = await purchaseShopItem(userId, itemId, category);
      if (!purchaseResult) {
        return false;
      }
    }
    
    // Unequip all items in this category
    const { error: unequipError } = await supabase
      .from('user_shop_items')
      .update({ 
        is_equipped: false,
        equipped_at: null 
      })
      .eq('user_id', userId)
      .eq('category', category);
    
    if (unequipError) {
      console.error('[UserShopItems] Unequip error:', unequipError);
    }
    
    // Then equip the selected item
    const { data, error } = await supabase
      .from('user_shop_items')
      .update({ 
        is_equipped: true,
        equipped_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('[UserShopItems] Equip error:', error);
      return false;
    }
    
    if (!data) {
      console.error('[UserShopItems] No item found to equip:', itemId);
      return false;
    }
    
    console.log('[UserShopItems] Item equipped:', itemId);
    return true;
  } catch (err) {
    console.error('[UserShopItems] Equip exception:', err);
    return false;
  }
};

// Unequip an item (set is_equipped = false)
export const unequipShopItem = async (userId: string, category: string) => {
  try {
    const { error } = await supabase
      .from('user_shop_items')
      .update({ 
        is_equipped: false,
        equipped_at: null 
      })
      .eq('user_id', userId)
      .eq('category', category)
      .eq('is_equipped', true);
    
    if (error) {
      console.error('[UserShopItems] Unequip error:', error);
      return false;
    }
    
    console.log('[UserShopItems] Category unequipped:', category);
    return true;
  } catch (err) {
    console.error('[UserShopItems] Unequip exception:', err);
    return false;
  }
};

// Get all purchased items for a user
export const getUserShopItems = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_shop_items')
      .select('item_id, category, is_equipped, purchased_at, equipped_at')
      .eq('user_id', userId);
    
    if (error) {
      console.error('[UserShopItems] Get items error:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('[UserShopItems] Get items exception:', err);
    return [];
  }
};

// Get equipped items for a user
export const getEquippedItems = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_shop_items')
      .select('item_id, category')
      .eq('user_id', userId)
      .eq('is_equipped', true);
    
    if (error) {
      console.error('[UserShopItems] Get equipped error:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('[UserShopItems] Get equipped exception:', err);
    return [];
  }
};
