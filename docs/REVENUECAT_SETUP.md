# RevenueCat Setup Guide

## Problem: "No plans available. Please try again."

This error occurs when RevenueCat doesn't have any products configured or can't fetch them.

## Solution Steps

### 1. Create a RevenueCat Account
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Sign up or log in
3. Create a new project for Quillby

### 2. Get Your API Keys
1. In RevenueCat dashboard, go to **Project Settings** → **API Keys**
2. Copy your **Public API Key** (starts with `goog_` for Android or `appl_` for iOS)
3. For testing, you can use the test key, but it won't have real products

### 3. Configure Products in RevenueCat

#### Step 1: Create Products in Google Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Go to **Monetize** → **Subscriptions**
4. Create two subscription products:
   - **Product ID**: `premium_monthly`
     - Price: ₹599/month
     - Billing period: 1 month
   - **Product ID**: `premium_yearly`
     - Price: ₹4999/year
     - Billing period: 1 year

#### Step 2: Add Products to RevenueCat
1. In RevenueCat dashboard, go to your project
2. Click **Products** in the left sidebar
3. Click **+ New** to add a product
4. For each product:
   - Enter the **Product ID** (must match Google Play exactly)
   - Select **Subscription** as type
   - Click **Save**

#### Step 3: Create an Offering
1. In RevenueCat dashboard, go to **Offerings**
2. Click **+ New Offering**
3. Name it "Premium" (or any name)
4. Add both products to the offering:
   - premium_monthly
   - premium_yearly
5. Set this offering as **Current**
6. Click **Save**

#### Step 4: Create Entitlement
1. Go to **Entitlements** in RevenueCat
2. Click **+ New Entitlement**
3. Name it "premium" (must be lowercase)
4. Attach both products to this entitlement
5. Click **Save**

### 4. Update Environment Variables

Update your `.env` file:

```env
# Use your actual RevenueCat public API key
EXPO_PUBLIC_REVENUE_CAT_API_KEY=goog_YOUR_ACTUAL_KEY_HERE
```

### 5. Test the Integration

#### Option A: Test with Real Products (Recommended)
1. Set up products in Google Play Console (as above)
2. Configure them in RevenueCat
3. Use a real API key
4. Test on a real device with Google Play

#### Option B: Test Mode (Limited)
1. Use the test API key: `test_RFPdNVWNVjRFSHkPdPGdzYBKLwy`
2. This won't show real products but you can test the flow
3. RevenueCat test mode has limited functionality

### 6. Verify Setup

Run these checks:

1. **Check API Key**
   ```bash
   # In your .env file
   echo $EXPO_PUBLIC_REVENUE_CAT_API_KEY
   ```

2. **Check RevenueCat Dashboard**
   - Products are created
   - Offering is set as "Current"
   - Entitlement "premium" exists
   - Products are attached to entitlement

3. **Check App Logs**
   ```
   [RevenueCat] Initialized successfully
   [RevenueCat] Available offerings: 2
   [Paywall] Found 2 packages
   ```

## Common Issues

### Issue 1: "No plans available"
**Cause**: No products configured in RevenueCat or offering not set as current

**Fix**:
1. Create products in RevenueCat dashboard
2. Create an offering with those products
3. Set the offering as "Current"

### Issue 2: "Failed to load premium options"
**Cause**: Invalid API key or network issue

**Fix**:
1. Check your API key in `.env`
2. Make sure it starts with `goog_` (Android) or `appl_` (iOS)
3. Check internet connection
4. Restart the app after changing `.env`

### Issue 3: Products show but purchase fails
**Cause**: Products not properly configured in Google Play Console

**Fix**:
1. Verify product IDs match exactly between Google Play and RevenueCat
2. Make sure products are active in Google Play Console
3. Test with a real device (not emulator)
4. Add test users in Google Play Console

### Issue 4: "EXPO_PUBLIC_REVENUE_CAT_API_KEY not found"
**Cause**: Environment variable not loaded

**Fix**:
1. Make sure `.env` file exists in `quillby-app/` directory
2. Restart Expo dev server: `npx expo start --clear`
3. Check the variable name has `EXPO_PUBLIC_` prefix

## Testing Checklist

- [ ] RevenueCat account created
- [ ] Products created in Google Play Console
- [ ] Products added to RevenueCat
- [ ] Offering created and set as current
- [ ] Entitlement "premium" created
- [ ] API key added to `.env` file
- [ ] App restarted after `.env` changes
- [ ] Premium modal shows subscription plans
- [ ] Can select monthly/yearly plan
- [ ] Purchase flow works (test with test account)

## Development vs Production

### Development (Current)
- Using test API key
- No real products configured
- Can't complete real purchases
- Good for UI testing only

### Production (Before Launch)
1. Create real products in Google Play Console
2. Get production API key from RevenueCat
3. Configure products in RevenueCat
4. Test with real Google Play test accounts
5. Update `.env` with production key
6. Build production APK/AAB

## Support

If you're still having issues:

1. Check RevenueCat logs in dashboard
2. Check app console logs for errors
3. Verify all product IDs match exactly
4. Contact RevenueCat support: support@revenuecat.com

## Related Files
- `lib/revenueCat.ts` - RevenueCat integration
- `app/components/modals/PremiumPaywallModal.tsx` - Premium purchase UI
- `.env` - Environment variables
- `docs/PRICING_STRUCTURE.md` - Pricing details
