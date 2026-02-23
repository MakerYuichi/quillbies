# RevenueCat Implementation Guide

## Overview
This document outlines the implementation of Google Play billing through RevenueCat for Quillby's in-app purchases and premium subscriptions.

## Implementation Steps

### ✅ Step 1: Install RevenueCat
```bash
npx expo install react-native-purchases react-native-purchases-ui
```

### ✅ Step 2: Add Billing Permission
Added `com.android.vending.BILLING` to `app.json` permissions array.

### ✅ Step 3: Initialize RevenueCat
RevenueCat is initialized in `app/_layout.tsx` during app startup using the API key from environment variables.

**Environment Variable:**
Add to `.env` file:
```env
REVENUE_CAT_API_KEY=your_api_key_here
```

**Current Setup:**
- Test Key: `test_RFPdNVWNVjRFSHkPdPGdzYBKLwy`
- **⚠️ IMPORTANT**: Replace with production key before release!

The same API key works for both iOS and Android in test mode. In production, you may get separate keys from RevenueCat.

### ✅ Step 4: Database Setup
Created Supabase migration: `docs/database/migrations/add_premium_and_gem_purchases.sql`

**Tables:**
1. `user_profiles` - Added `is_premium` boolean field
2. `gem_purchases` - New table for tracking all gem purchases

**Run migration:**
```sql
-- Execute the SQL file in Supabase SQL Editor
-- Or use Supabase CLI:
supabase db push
```

### ✅ Step 5: Create Paywall Component
Created `app/components/modals/PremiumPaywallModal.tsx` with:
- Beautiful premium benefits display
- Subscription plan selection (monthly/yearly)
- Purchase and restore functionality
- Loading states and error handling
- Integration with Zustand store

### 🔄 Step 6: Build and Upload AAB
```bash
eas build --platform android --profile production
```
Upload the AAB to Google Play Console (Internal Testing track).

### 🔄 Step 6: Create Products in Google Play Console
After AAB is uploaded, create these products:

**Gem Packages (Consumable):**
- `gems_100` - 100 Gems - $0.99
- `gems_500` - 500 Gems - $4.99
- `gems_1000` - 1000 Gems - $9.99
- `gems_2500` - 2500 Gems - $19.99

**Premium Subscription:**
- `premium_monthly` - Premium Monthly - $6.99/month
- `premium_yearly` - Premium Yearly - $59.99/year

### 🔄 Step 7: Connect Products in RevenueCat
1. Go to RevenueCat Dashboard
2. Add your app (iOS and Android)
3. Connect Google Play Store
4. Create Offerings:
   - **Gems Offering**: Add all gem packages
   - **Premium Offering**: Add subscription packages
5. Create Entitlement: `premium` (for subscription access)

## Code Structure

### Files Created/Modified

**New Files:**
- `lib/revenueCat.ts` - RevenueCat service with all purchase logic
- `docs/database/migrations/add_premium_and_gem_purchases.sql` - Database schema
- `docs/REVENUECAT_IMPLEMENTATION.md` - This documentation

**Modified Files:**
- `app/_layout.tsx` - Added RevenueCat initialization
- `app.json` - Added billing permission
- `app/core/types.ts` - Already has `isPremium` field

### Usage Examples

**1. Get Available Products:**
```typescript
import { getOfferings } from '../lib/revenueCat';

const offerings = await getOfferings();
if (offerings) {
  const gemPackages = offerings.availablePackages;
  // Display packages in UI
}
```

**2. Purchase Gems:**
```typescript
import { purchaseGemPackage } from '../lib/revenueCat';

const result = await purchaseGemPackage(selectedPackage, userId);
if (result.success) {
  // Update user's gem count
  addGems(result.gems);
}
```

**3. Purchase Premium:**
```typescript
import { purchasePremium } from '../lib/revenueCat';

const result = await purchasePremium(premiumPackage, userId);
if (result.success) {
  // Update user's premium status
  setPremium(true);
}
```

**4. Restore Purchases:**
```typescript
import { restorePurchases } from '../lib/revenueCat';

const result = await restorePurchases(userId);
if (result.success && result.isPremium) {
  // User has premium
  setPremium(true);
}
```

**5. Check Premium Status:**
```typescript
import { checkPremiumStatus } from '../lib/revenueCat';

const isPremium = await checkPremiumStatus();
```

## Product Configuration

### Premium Subscription
| Product ID | Duration | Price (INR) | Type |
|-----------|----------|-------------|------|
| premium_monthly | 1 month | ₹599/month | Subscription |
| premium_yearly | 1 year | ₹4999/year | Subscription |

**Yearly Savings:** ₹2189 (Save ~30% compared to monthly)

### Gem Packages (One-time purchases)
| Product ID | Gems | Price (INR) | Type |
|-----------|------|-------------|------|
| gems_100 | 100 | ₹99 | Consumable |
| gems_500 | 500 | ₹449 | Consumable |
| gems_1000 | 1000 | ₹849 | Consumable |
| gems_2500 | 2500 | ₹1699 | Consumable |

**Premium Benefits:**
- Legendary themes (Galaxy, Japanese Zen, Ocean)
- Exclusive shop items
- Extended focus sessions (up to 120 minutes)
- No ads (future)
- Priority support (future)

## Testing

### Test Mode
Currently using test API keys. Test purchases:
1. Won't charge real money
2. Will show in RevenueCat dashboard
3. Can be tested on any device

### Production Mode
Before release:
1. Replace test keys with production keys in `app/_layout.tsx`
2. Update `lib/revenueCat.ts` with production keys
3. Test with real Google Play account
4. Verify purchases appear in Google Play Console

## Security Notes

1. **API Keys**: Never commit production keys to git
2. **Server-Side Validation**: RevenueCat handles receipt validation
3. **Database**: Use Supabase RLS policies (already configured)
4. **User ID**: Always verify user owns the purchase

## Troubleshooting

### Purchase Not Working
1. Check RevenueCat logs (set to VERBOSE)
2. Verify product IDs match Google Play Console
3. Ensure AAB is uploaded and approved
4. Check user has payment method in Google Play

### Premium Not Activating
1. Verify entitlement name is `premium` in RevenueCat
2. Check `user_profiles.is_premium` in Supabase
3. Call `restorePurchases()` to sync status

### Gems Not Granted
1. Check `gem_purchases` table in Supabase
2. Verify `GEM_AMOUNTS` mapping in `revenueCat.ts`
3. Check for duplicate transaction IDs

## Next Steps

1. ✅ Install packages
2. ✅ Add billing permission
3. ✅ Initialize RevenueCat
4. ✅ Create database tables
5. 🔄 Build and upload AAB
6. 🔄 Create products in Google Play Console
7. 🔄 Connect products in RevenueCat
8. 🔄 Implement purchase UI in app
9. 🔄 Test purchases
10. 🔄 Replace with production keys

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [Expo In-App Purchases](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)
