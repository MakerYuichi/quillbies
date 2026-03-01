# RevenueCat Production Fix - Quick Guide

## The Issue
Packages work in development but not in production builds from Play Store.

## The Root Cause
Your `.env` file is excluded in `.easignore`, so the RevenueCat API key never makes it to production builds.

## The Fix (3 Steps)

### Step 1: Add EAS Secret
```bash
eas secret:create --scope project --name EXPO_PUBLIC_REVENUE_CAT_API_KEY --value "goog_osnAvyJsOPXYqOJipkOjQhKgiIZ"
```

### Step 2: Verify Secret
```bash
eas secret:list
```

You should see:
```
EXPO_PUBLIC_REVENUE_CAT_API_KEY
```

### Step 3: Build & Deploy
```bash
# Build new production version
eas build --platform android --profile production

# Upload to Play Store
# Install from Play Store and test
```

## Verify It Works

After installing from Play Store, check logs:
```
✅ [RevenueCat] Initializing with API key: goog_osnAvyJsOP...
✅ [RevenueCat] Initialized successfully
✅ [RevenueCat] Available packages: 4
```

## Why This Happened

1. `.easignore` excludes `.env` files (security best practice)
2. EAS builds don't get the API key from `.env`
3. RevenueCat initializes with no key → no offerings
4. Development works because it uses local `.env` file

## Files Changed
- ✅ `android/app/proguard-rules.pro` - ProGuard rules (already done)
- ✅ `lib/revenueCat.ts` - Enhanced logging (already done)
- ⚠️ EAS secrets - Need to add API key

## That's It!
Once you add the EAS secret and rebuild, packages will load in production.
