# Play Store Packages Not Visible - FIXED

## Problem
✅ Packages visible in `npx expo run:android` (development)  
❌ Packages NOT visible after downloading from Google Play Store (production)

## Root Causes

### 1. ✅ ProGuard/R8 Stripping Classes (FIXED)
ProGuard/R8 code minification strips out RevenueCat and Billing Client classes in production builds.

### 2. ⚠️ Environment Variables Not in EAS Builds (NEEDS FIX)
The `.env` file is excluded in `.easignore`, so `EXPO_PUBLIC_REVENUE_CAT_API_KEY` is not available in production builds. This causes RevenueCat to initialize with no API key → no offerings.

## Solutions

### 1. ✅ Added ProGuard Rules
Updated `android/app/proguard-rules.pro` with:

```proguard
# RevenueCat - CRITICAL for production builds
-keep class com.revenuecat.purchases.** { *; }
-keep interface com.revenuecat.purchases.** { *; }
-keepclassmembers class com.revenuecat.purchases.** { *; }
-dontwarn com.revenuecat.purchases.**

# Google Play Billing - Required for in-app purchases
-keep class com.android.billingclient.** { *; }
-keep interface com.android.billingclient.** { *; }
-keepclassmembers class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**
```

### 2. ⚠️ Add RevenueCat API Key as EAS Secret (REQUIRED)

Since `.env` is excluded from EAS builds (see `.easignore`), you must add the API key as an EAS secret:

```bash
# Add the secret to your EAS project
eas secret:create --scope project --name EXPO_PUBLIC_REVENUE_CAT_API_KEY --value "goog_osnAvyJsOPXYqOJipkOjQhKgiIZ"
```

Verify it's set:
```bash
eas secret:list
```

### Why .env is Excluded
From `.easignore`:
```
# ============================================
# ENVIRONMENT FILES (USE EAS SECRETS)
# ============================================
.env
.env.local
.env.development
```

This is a security best practice to prevent accidentally committing sensitive data. Environment variables must be provided through EAS secrets instead.

## Build & Deploy

### 1. Add EAS Secret (if not done)
```bash
eas secret:create --scope project --name EXPO_PUBLIC_REVENUE_CAT_API_KEY --value "goog_osnAvyJsOPXYqOJipkOjQhKgiIZ"
```

### 2. Build New Production Version
```bash
# Build with EAS (recommended)
eas build --platform android --profile production
```

### 3. Upload to Play Store
1. Upload the new AAB to Google Play Console
2. Publish to Internal Testing first
3. Install from Play Store (NOT sideload)
4. Test purchases

## Verify Fix

After installing from Play Store, check logs:
```
[RevenueCat] Initializing with API key: goog_osnAvyJsOP...
[RevenueCat] Initialized successfully
[RevenueCat] Available packages: 4
```

If showing 0 packages, check:
1. ✅ EAS secret is set: `eas secret:list`
2. ✅ Products published in Google Play Console (not draft)
3. ✅ App published to at least Internal Testing track
4. ✅ RevenueCat offering set as "Current"
5. ✅ Installed from Play Store (not sideloaded)

## Why This Happens

| Environment | .env File | ProGuard | Result |
|-------------|-----------|----------|--------|
| `expo run:android` | ✅ Used | ❌ Disabled | Packages visible |
| EAS Build (no secret) | ❌ Excluded | ✅ Enabled | No API key → No packages |
| EAS Build (with secret) | ✅ From secret | ✅ Enabled | Packages visible ✅ |

## Testing Checklist

- [ ] Add EAS secret for RevenueCat API key
- [ ] Build new production version
- [ ] Upload to Play Store Internal Testing
- [ ] Install from Play Store (not sideload)
- [ ] Check logs show API key is loaded
- [ ] Verify packages are visible
- [ ] Test a purchase flow

## If Still Not Working

1. Verify EAS secret is set:
   ```bash
   eas secret:list
   ```

2. Check logs for API key initialization:
   ```
   [RevenueCat] Initializing with API key: goog_...
   ```

3. Verify products are published in Google Play Console

4. Check RevenueCat dashboard has offering set as "Current"

5. Enable verbose logging:
   ```typescript
   Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
   ```

## Documentation
- EAS Secrets: https://docs.expo.dev/build-reference/variables/
- RevenueCat Android: https://www.revenuecat.com/docs/android
- ProGuard Config: https://www.revenuecat.com/docs/android#proguard
