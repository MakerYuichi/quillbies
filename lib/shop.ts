// lib/shop.ts
import { supabase } from './supabase';

// Get all shop items
export const getShopItems = async () => {
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      console.error('GetShopItems Error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('GetShopItems Exception:', err);
    return [];
  }
};

// Get user's purchased items
export const getUserPurchasedItems = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('purchased_items')
      .select('item_id')
      .eq('user_id', userId);

    if (error) {
      console.error('GetPurchasedItems Error:', error);
      return [];
    }

    return data?.map(item => item.item_id) || [];
  } catch (err) {
    console.error('GetPurchasedItems Exception:', err);
    return [];
  }
};

// Purchase an item
export const purchaseItem = async (userId: string, itemId: string) => {
  try {
    const { data, error } = await supabase
      .from('purchased_items')
      .insert([
        {
          user_id: userId,
          item_id: itemId,
        }
      ])
      .select()
      .single();

    if (error) {
      // Don't fail loudly if item doesn't exist in shop_items table
      // This allows local-only shop functionality
      console.warn('[Shop] Could not save purchase to database (item may not exist in shop_items table):', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('[Shop] Purchase database save failed (continuing with local state):', err);
    return null;
  }
};

// Check if user owns an item
export const userOwnsItem = async (userId: string, itemId: string) => {
  try {
    const { data, error } = await supabase
      .from('purchased_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('UserOwnsItem Error:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('UserOwnsItem Exception:', err);
    return false;
  }
};