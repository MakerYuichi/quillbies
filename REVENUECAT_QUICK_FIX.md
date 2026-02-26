# Quick Fix: "No plans available" Error

## The Problem
You're seeing "No plans available. Please try again." because:
1. Using a test API key (`test_RFPdNVWNVjRFSHkPdPGdzYBKLwy`)
2. No products configured in RevenueCat dashboard
3. The code was looking for wrong environment variable

## ✅ BILLING Permission Status
The BILLING permission is already configured in your app:
- ✅ `app.json` has `com.android.vending.BILLING`
- ✅ `AndroidManifest.xml` has the permission
- ✅ `react-native-purchases` package is installed

No action needed for permissions!

## What I Fixed

### 1. Fixed Environment Variable (✅ Done)
Changed `revenueCat.ts` to use correct Expo variable:
```typescript
// Before
const apiKey = process.env.REVENUE_CAT_API_KEY;

// After
const apiKey = process.env.EXPO_PUBLIC_REVENUE_CAT_API_KEY;
```

### 2. Better Error Messages (✅ Done)
Updated `PremiumPaywallModal.tsx` to show:
- Clear error message
- Helpful troubleshooting steps
- Retry button

### 3. Added Logging (✅ Done)
More detailed console logs to debug issues

## What You Need To Do

### Option 1: Quick Test (No Real Purchases)
Keep using test mode - the UI will work but purchases won't:
```env
EXPO_PUBLIC_REVENUE_CAT_API_KEY=test_RFPdNVWNVjRFSHkPdPGdzYBKLwy
```

**Note**: Test mode won't show real products, so you'll still see "No plans available"

### Option 2: Full Setup (Real Purchases)
Follow these steps to enable real purchases:

#### Step 1: Create Products in Google Play Console
1. Go to Google Play Console → Your App → Monetize → Subscriptions
2. Create two products:
   - `premium_monthly` - ₹599/month
   - `premium_yearly` - ₹4999/year

#### Step 2: Configure RevenueCat
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Add the products you created
3. Create an "Offering" with both products
4. Set it as "Current"
5. Create entitlement called "premium"

#### Step 3: Update API Key
1. Get your public API key from RevenueCat
2. Update `.env`:
```env
EXPO_PUBLIC_REVENUE_CAT_API_KEY=goog_YOUR_ACTUAL_KEY
```

#### Step 4: Rebuild APK
```bash
# Clear cache and rebuild
npx expo prebuild --clean
eas build --platform android --profile production
```

## Verifying BILLING Permission

To confirm the permission is in your APK:

### Method 1: Check app.json
```json
{
  "android": {
    "permissions": [
      "com.android.vending.BILLING"  // ✅ Present
    ]
  }
}
```

### Method 2: Check AndroidManifest.xml
```bash
cat android/app/src/main/AndroidManifest.xml | grep BILLING
```
Should output:
```xml
<uses-permission android:name="com.android.vending.BILLING"/>
```

### Method 3: Inspect Built APK
```bash
# Extract APK
unzip app-release.apk -d extracted/

# Check manifest
cat extracted/AndroidManifest.xml | grep BILLING
```

## Testing

After setup, you should see:
```
[RevenueCat] Initialized successfully
[RevenueCat] Available offerings: 2
[Paywall] Found 2 packages
```

And the premium modal will show:
- Monthly plan: ₹599/month
- Yearly plan: ₹4999/year (Save 30%)

## Current Status

✅ BILLING permission configured
✅ Code fixed to use correct environment variable
✅ Better error handling added
✅ Helpful error messages shown
⚠️ Still need to configure products in RevenueCat dashboard

## Troubleshooting

### "BILLING permission missing" error
**Solution**: Already fixed! The permission is in both `app.json` and `AndroidManifest.xml`

### "No plans available" persists
**Cause**: Using test API key without products
**Solution**: Follow "Full Setup" steps above

### Permission not in built APK
**Solution**: Rebuild the app:
```bash
npx expo prebuild --clean
eas build --platform android
```

## Next Steps

1. **For Development**: Keep test mode, accept that purchases won't work
2. **For Production**: Follow "Full Setup" above before launching

## Documentation

See `docs/REVENUECAT_SETUP.md` for complete setup guide.

## Quick Commands

```bash
# Verify permission in manifest
cat android/app/src/main/AndroidManifest.xml | grep BILLING

# Restart with cleared cache
npx expo start --clear

# Rebuild native code
npx expo prebuild --clean

# Build production APK
eas build --platform android --profile production

# Check environment variables
cat .env | grep REVENUE_CAT
```
