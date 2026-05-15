// lib/promoCodes.ts
// Promo code redemption — supports gems, coins (Q-Bies), and premium rewards

import { supabase } from './supabase';

export type PromoRewardType = 'coins' | 'gems' | 'premium';

export interface RedeemResult {
  success: boolean;
  rewardType?: PromoRewardType;
  rewardAmount?: number; // gems or coins amount; 0 for premium
  premiumExpiresAt?: string; // ISO string — only set for 'premium' reward type
  message?: string;
  error?: string;
}

/**
 * Redeem a promo code for a given device/user identifier.
 * Uses device_user_id so it works for both guest and authenticated users.
 */
export async function redeemPromoCode(
  rawCode: string,
  deviceUserId: string
): Promise<RedeemResult> {
  const code = rawCode.trim().toUpperCase();

  if (!code) {
    return { success: false, error: 'Please enter a code.' };
  }

  try {
    // 1. Look up the promo code
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('id, reward_type, reward_amount, max_uses, total_redeemed, expires_at, is_active')
      .eq('code', code)
      .single();

    if (promoError || !promo) {
      return { success: false, error: 'Invalid promo code.' };
    }

    // 2. Validate
    if (!promo.is_active) {
      return { success: false, error: 'This code is no longer active.' };
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return { success: false, error: 'This code has expired.' };
    }

    if (promo.total_redeemed >= promo.max_uses) {
      return { success: false, error: 'This code has already been fully redeemed.' };
    }

    // 3. Check if this device already redeemed it
    const { data: existing, error: existingError } = await supabase
      .from('promo_redemptions')
      .select('id')
      .eq('promo_code_id', promo.id)
      .eq('device_user_id', deviceUserId)
      .maybeSingle();

    if (existingError) {
      console.warn('[Promo] Error checking existing redemption:', existingError);
      return { success: false, error: 'Could not verify redemption. Try again.' };
    }

    if (existing) {
      return { success: false, error: 'You have already redeemed this code.' };
    }

    // 4. Record the redemption
    const { error: insertError } = await supabase
      .from('promo_redemptions')
      .insert({ promo_code_id: promo.id, device_user_id: deviceUserId });

    if (insertError) {
      console.warn('[Promo] Failed to record redemption:', insertError);
      return { success: false, error: 'Redemption failed. Please try again.' };
    }

    // 5. Increment total_redeemed
    await supabase
      .from('promo_codes')
      .update({ total_redeemed: promo.total_redeemed + 1 })
      .eq('id', promo.id);

    // 6. Return reward info
    const rewardType = promo.reward_type as PromoRewardType;

    // For premium codes, calculate 1-month expiry from now
    const premiumExpiresAt = rewardType === 'premium'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const rewardMessages: Record<PromoRewardType, string> = {
      gems: `🎉 You got ${promo.reward_amount} free Gems!`,
      coins: `🎉 You got ${promo.reward_amount} free Q-Bies!`,
      premium: `🌟 Premium unlocked for 1 month! Enjoy all premium features.`,
    };

    return {
      success: true,
      rewardType,
      rewardAmount: promo.reward_amount ?? 0,
      premiumExpiresAt,
      message: rewardMessages[rewardType] ?? '🎉 Code redeemed!',
    };
  } catch (err: any) {
    console.error('[Promo] Unexpected error:', err);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
