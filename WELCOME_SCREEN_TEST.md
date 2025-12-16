# Welcome Screen - Testing Guide

## ✅ What's Been Fixed

### Navigation Setup
- ✅ Updated `app/_layout.tsx` to include onboarding routes
- ✅ Welcome screen is now registered in the navigation stack
- ✅ Added redirect from `index.tsx` to welcome screen on first load
- ✅ All screens have proper header configuration

### Changes Made

1. **app/_layout.tsx**:
   - Added `onboarding/welcome` route
   - Added `onboarding/character-select` route
   - Set `headerShown: false` for onboarding screens (full-screen experience)
   - Kept headers for main app screens

2. **app/index.tsx**:
   - Added redirect to welcome screen on mount
   - Uses `router.replace()` to prevent back navigation

3. **app/onboarding/welcome.tsx**:
   - Fixed to use LOCAL notifications (works in Expo Go)
   - Added test notification on permission grant
   - Added user-friendly alerts

## 🚀 How to Test

### Step 1: Install Dependencies
```bash
cd quillby-app
npx expo install expo-notifications
```

### Step 2: Add Your Images
1. **Background image**: `assets/backgrounds/welcome-bg.png`
   - Size: 1080x1920 (portrait)
   - Format: PNG or JPG
   
2. **Hamster image**: `assets/onboarding/welcome-hamster.png`
   - Size: 400x400px (square, transparent background)
   - Format: PNG
   - Style: Cute, friendly hamster

### Step 3: Clear Cache and Restart
```bash
npx expo start --clear
```

The `--clear` flag is important! It clears the Metro bundler cache.

### Step 4: Open the App
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code for physical device

## 📱 Expected Behavior

### On App Launch
1. App opens to `index.tsx`
2. Immediately redirects to `/onboarding/welcome`
3. Fonts load (brief loading spinner)
4. You see your full-screen background image
5. Semi-transparent overlay makes text readable
6. **Title** appears in Caveat font: "Ready for a Study Partner?"
7. **Description** appears in Chakra Petch font
8. **Cute hamster** appears centered below the text
9. Two buttons at bottom: "Allow Notifications" and "Maybe Later"

### When Tapping "Allow Notifications"
1. OS permission dialog appears
2. If granted: Test notification appears ("Welcome to Quillby! 🐹")
3. Success alert shows
4. Navigates to character selection screen (placeholder)

### When Tapping "Maybe Later"
1. No permission dialog
2. Directly navigates to character selection screen

## 🐛 Troubleshooting

### Welcome Screen Not Showing
- ✅ Run `npx expo start --clear` to clear cache
- ✅ Check that `assets/backgrounds/welcome-bg.png` exists
- ✅ Check terminal for error messages

### "Cannot find module" Error
- ✅ Run `npx expo install expo-notifications`
- ✅ Restart the development server

### Background Image Not Displaying
- ✅ Verify file path: `assets/backgrounds/welcome-bg.png`
- ✅ Check file name is exactly `welcome-bg.png` (case-sensitive)
- ✅ Try a different image to rule out corruption

### Navigation Not Working
- ✅ Check console logs for navigation errors
- ✅ Verify `_layout.tsx` includes onboarding routes
- ✅ Restart with `--clear` flag

## 📝 Console Logs to Watch

When testing, you should see:
```
[Notifications] Requesting LOCAL notification permission...
[Notifications] Permission granted!
```

Or if user skips:
```
[Notifications] User skipped permission
```

## 🎯 Next Steps

After the welcome screen works:

1. **Add Onboarding Completion Flag**:
   - Add `hasCompletedOnboarding: boolean` to `UserData` in `types.ts`
   - Store it in Zustand state
   - Update redirect logic in `index.tsx` to check this flag

2. **Build Screen 2**: Character Selection
   - 3 hamster personality options
   - Visual selection UI
   - Navigate to name screen

3. **Persist Onboarding State**:
   - Use AsyncStorage to remember completion
   - Don't show onboarding again after completion

## 🔧 Temporary Redirect

Currently, `index.tsx` ALWAYS redirects to welcome screen. This is for testing.

To disable the redirect (after testing):
```tsx
// In app/index.tsx, comment out this useEffect:
/*
useEffect(() => {
  router.replace('/onboarding/welcome');
}, []);
*/
```

Later, you'll replace this with proper onboarding completion logic.
