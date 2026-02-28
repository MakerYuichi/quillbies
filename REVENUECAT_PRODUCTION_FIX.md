# RevenueCat Production Build Fix

## Problem
Packages are visible in `expo run:android` (development) but not in production builds from Google Play.

## Root Causes

### 1. **API Key Mismatch**
- Development uses Android API key
- Production needs to use the correct API key for the release build
- Check if you're using different API keys for debug vs release

### 2. **Google Play Console Configuration**
- Products must be published (not draft) in Google Play Console
- Products must be in "Active" state
- App must be published (at least to internal testing track)

### 3. **RevenueCat Dashboard Configuration**
- Products must be configured in RevenueCat dashboard
- Offerings must be created and set as "Current"
- Products must be linked to the correct Google Play app

### 4. **ProGuard/R8 Obfuscation**
- RevenueCat classes might be getting stripped in release builds
- Need to add ProGuard rules

## Solutions

### Step 1: Add ProGuard Rules

Create/update `android/app/proguard-rules.pro`:

```proguard
# RevenueCat
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }

# Billing Client
-keep class com.android.billingclient.** { *; }
```

### Step 2: Update build.gradle

Ensure ProGuard is configured in `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Environment Variables

Ensure `.env` has the correct production API key:

```env
EXPO_PUBLIC_REVENUE_CAT_API_KEY=goog_YOUR_PRODUCTION_KEY
```

### Step 4: Google Play Console Checklist

1. Go to Google Play Console → Your App → Monetize → Products
2. Verify all products are:
   - ✅ Published (not draft)
   - ✅ Active
   - ✅ Have correct product IDs matching your code
3. Ensure app is published to at least Internal Testing track

### Step 5: RevenueCat Dashboard Checklist

1. Go to RevenueCat Dashboard → Your Project
2. Verify:
   - ✅ Google Play app is connected
   - ✅ Products are imported from Google Play
   - ✅ Offerings are created with correct products
   - ✅ One offering is set as "Current"
   - ✅ Package identifiers match your code

### Step 6: Test with Internal Testing

1. Upload build to Google Play Internal Testing
2. Install from Play Store (not sideload)
3. Test purchases with a test account
4. Check RevenueCat logs

### Step 7: Add Better Error Handling

Update RevenueCat initialization to handle production issues:

```typescript
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    console.log('[RevenueCat] Fetching offerings...');
    const offerings = await Purchases.getOfferings();
    
    // Log all available offerings
    console.log('[RevenueCat] All offerings:', Object.keys(offerings.all));
    
    if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
      return offerings.current;
    }
    
    // Fallback to any available offering
    const allOfferingKeys = Object.keys(offerings.all);
    if (allOfferingKeys.length > 0) {
      const firstOffering = offerings.all[allOfferingKeys[0]];
      if (firstOffering.availablePackages.length > 0) {
        console.log('[RevenueCat] Using fallback offering:', allOfferingKeys[0]);
        return firstOffering;
      }
    }
    
    console.error('[RevenueCat] No offerings with packages found');
    return null;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    return null;
  }
};
```

## Debugging Steps

### 1. Check Logs in Production
Add this to your app to see logs:

```typescript
Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
```

### 2. Verify Customer Info
```typescript
const customerInfo = await Purchases.getCustomerInfo();
console.log('Customer ID:', customerInfo.originalAppUserId);
```

### 3. Check Offerings Response
```typescript
const offerings = await Purchases.getOfferings();
console.log('All offerings:', Object.keys(offerings.all));
console.log('Current offering:', offerings.current?.identifier);
console.log('Packages:', offerings.current?.availablePackages.length);
```

## Common Issues

### Issue: "No offerings available"
**Solution**: Check RevenueCat dashboard, ensure offering is set as "Current"

### Issue: "Products not found"
**Solution**: Verify product IDs match exactly between code, Google Play, and RevenueCat

### Issue: "Billing not available"
**Solution**: App must be installed from Play Store, not sideloaded

### Issue: "Products in draft state"
**Solution**: Publish products in Google Play Console

## Testing Checklist

- [ ] Products published in Google Play Console
- [ ] Products active (not draft)
- [ ] App published to Internal Testing
- [ ] RevenueCat offering set as "Current"
- [ ] Product IDs match everywhere
- [ ] ProGuard rules added
- [ ] Installed from Play Store (not sideloaded)
- [ ] Test with real Google account (not emulator)
- [ ] Check RevenueCat logs in production

## Additional Resources

- [RevenueCat Android Setup](https://www.revenuecat.com/docs/getting-started/installation/android)
- [Google Play Billing Setup](https://developer.android.com/google/play/billing/getting-ready)
- [RevenueCat Troubleshooting](https://www.revenuecat.com/docs/troubleshooting-the-sdks)
