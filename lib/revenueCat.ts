// RevenueCat integration for in-app purchases
import Purchases, { 
  PurchasesPackage, 
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL 
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Product IDs (must match Google Play Console and RevenueCat)
export const PRODUCT_IDS = {
  // Gem packages
  GEMS_SMALL: 'gems_100',      // 100 gems - ₹99
  GEMS_MEDIUM: 'gems_500',     // 500 gems - ₹449
  GEMS_LARGE: 'gems_1000',     // 1000 gems - ₹849
  GEMS_MEGA: 'gems_2500',      // 2500 gems - ₹1699
  
  // Premium subscription
  PREMIUM_MONTHLY: 'premium_monthly',  // ₹599/month
  PREMIUM_YEARLY: 'premium_yearly',    // ₹4999/year
} as const;

// Gem amounts for each package
export const GEM_AMOUNTS: Record<string, number> = {
  [PRODUCT_IDS.GEMS_SMALL]: 100,
  [PRODUCT_IDS.GEMS_MEDIUM]: 500,
  [PRODUCT_IDS.GEMS_LARGE]: 1000,
  [PRODUCT_IDS.GEMS_MEGA]: 2500,
};

/**
 * Initialize RevenueCat SDK
 * Call this once at app startup
 */
export const initializeRevenueCat = async (): Promise<void> => {
  try {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    
    // In Expo, use EXPO_PUBLIC_ prefix for client-side access
    const apiKey = process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY;
    
    if (!apiKey) {
      console.error('[RevenueCat] API key not found. Please set EXPO_PUBLIC_REVENUE_CAT_API_KEY in .env');
      throw new Error('EXPO_PUBLIC_REVENUE_CAT_API_KEY not found in environment variables');
    }
    
    console.log('[RevenueCat] Initializing with API key:', apiKey.substring(0, 10) + '...');
    Purchases.configure({ apiKey });
    console.log('[RevenueCat] Initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
    throw error;
  }
};

/**
 * Get available offerings (products) from RevenueCat
 */
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current !== null) {
      console.log('[RevenueCat] Available offerings:', offerings.current.availablePackages.length);
      return offerings.current;
    }
    
    console.warn('[RevenueCat] No offerings available');
    return null;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    return null;
  }
};

/**
 * Purchase a gem package
 */
export const purchaseGemPackage = async (
  packageToPurchase: PurchasesPackage,
  userId: string
): Promise<{ success: boolean; gems?: number; error?: string }> => {
  try {
    console.log('[RevenueCat] Purchasing package:', packageToPurchase.identifier);
    
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Check if purchase was successful
    const productId = packageToPurchase.product.identifier;
    const gemsGranted = GEM_AMOUNTS[productId] || 0;
    
    if (gemsGranted > 0) {
      // Record purchase in Supabase
      await recordGemPurchase(
        userId,
        productId,
        gemsGranted,
        customerInfo.originalAppUserId,
        Platform.OS === 'ios' ? 'app_store' : 'play_store'
      );
      
      console.log('[RevenueCat] Purchase successful, granted', gemsGranted, 'gems');
      return { success: true, gems: gemsGranted };
    }
    
    return { success: false, error: 'Invalid product' };
  } catch (error: any) {
    console.error('[RevenueCat] Purchase failed:', error);
    
    // Handle user cancellation
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }
    
    return { success: false, error: error.message || 'Purchase failed' };
  }
};

/**
 * Purchase premium subscription
 */
export const purchasePremium = async (
  packageToPurchase: PurchasesPackage,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('[RevenueCat] Purchasing premium:', packageToPurchase.identifier);
    
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    
    // Check if user now has premium entitlement
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    if (isPremium) {
      // Update premium status in Supabase
      await updatePremiumStatus(userId, true);
      
      console.log('[RevenueCat] Premium subscription activated');
      return { success: true };
    }
    
    return { success: false, error: 'Premium not activated' };
  } catch (error: any) {
    console.error('[RevenueCat] Premium purchase failed:', error);
    
    if (error.userCancelled) {
      return { success: false, error: 'Purchase cancelled' };
    }
    
    return { success: false, error: error.message || 'Purchase failed' };
  }
};

/**
 * Restore purchases (for users who reinstalled the app)
 */
export const restorePurchases = async (
  userId: string
): Promise<{ success: boolean; isPremium: boolean; error?: string }> => {
  try {
    console.log('[RevenueCat] Restoring purchases...');
    
    const customerInfo = await Purchases.restorePurchases();
    
    // Check premium status
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    // Update premium status in Supabase
    await updatePremiumStatus(userId, isPremium);
    
    console.log('[RevenueCat] Purchases restored, premium:', isPremium);
    return { success: true, isPremium };
  } catch (error: any) {
    console.error('[RevenueCat] Restore failed:', error);
    return { success: false, isPremium: false, error: error.message };
  }
};

/**
 * Check current premium status
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    console.log('[RevenueCat] Premium status:', isPremium);
    return isPremium;
  } catch (error) {
    console.error('[RevenueCat] Failed to check premium status:', error);
    return false;
  }
};

/**
 * Record gem purchase in Supabase
 */
const recordGemPurchase = async (
  userId: string,
  productId: string,
  gemsGranted: number,
  transactionId: string,
  store: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('gem_purchases')
      .insert({
        user_id: userId,
        product_id: productId,
        gems_granted: gemsGranted,
        revenue_cat_transaction_id: transactionId,
        revenue_cat_product_identifier: productId,
        revenue_cat_store: store,
      });
    
    if (error) {
      console.error('[Supabase] Failed to record gem purchase:', error);
    } else {
      console.log('[Supabase] Gem purchase recorded');
    }
  } catch (error) {
    console.error('[Supabase] Error recording gem purchase:', error);
  }
};

/**
 * Update premium status in Supabase
 */
const updatePremiumStatus = async (
  userId: string,
  isPremium: boolean
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_premium: isPremium })
      .eq('id', userId);
    
    if (error) {
      console.error('[Supabase] Failed to update premium status:', error);
    } else {
      console.log('[Supabase] Premium status updated:', isPremium);
    }
  } catch (error) {
    console.error('[Supabase] Error updating premium status:', error);
  }
};

/**
 * Get customer info (for debugging)
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('[RevenueCat] Customer info:', {
      originalAppUserId: customerInfo.originalAppUserId,
      activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
      entitlements: Object.keys(customerInfo.entitlements.active),
    });
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    return null;
  }
};
