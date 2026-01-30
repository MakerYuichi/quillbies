# Onboarding Screens Setup Guide

## ✅ What's Been Created

### Folder Structure
```
/quillby-app
  /app
    /onboarding
      welcome.tsx              ✅ Screen 1: Welcome & Permission
      character-select.tsx     ✅ Placeholder for Screen 2
      
  /assets
    /backgrounds               ✅ Folder for background images
    /onboarding                ✅ Folder for character images
    /hamsters                  ✅ Folder for hamster expressions
    /rooms                     ✅ Folder for room states
    ASSETS_GUIDE.md            ✅ Documentation
```

## 📋 Next Steps to Test Screen 1

### Step 1: Install expo-notifications
```bash
cd quillby-app
npx expo install expo-notifications
```

### Step 2: Add Your Background Image
1. Take your background image file
2. Rename it to `welcome-bg.png`
3. Place it in: `quillby-app/assets/backgrounds/welcome-bg.png`

### Step 3: Update Navigation (Optional)
If you want to test the welcome screen as the first screen, update `app/index.tsx`:

```tsx
// Add this at the top of your index.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Inside your component
const router = useRouter();

useEffect(() => {
  // Redirect to welcome screen on first load
  router.push('/onboarding/welcome');
}, []);
```

### Step 4: Run the App
```bash
npx expo start
```

## 🎨 Screen 1 Features

### What It Does
- ✅ Displays your full-screen background image
- ✅ Semi-transparent overlay (40% dark) for text readability
- ✅ "Ready for a Study Partner?" headline
- ✅ Description text explaining notification need
- ✅ "Allow Notifications" button (green, prominent)
- ✅ "Maybe Later" button (outlined, secondary)

### Button Behavior
- **Allow Notifications**: 
  - Triggers OS permission dialog for LOCAL notifications
  - Sends a test notification: "Welcome to Quillby! 🐹"
  - Shows success/failure alert
  - Navigates to character selection
- **Maybe Later**: Skips permission → navigates to character selection

### Notification Type (Important!)
- ✅ **Local Notifications**: Works in Expo Go (SDK 53+)
- ❌ **Remote Push Notifications**: Requires development build (future feature)
- Your onboarding uses LOCAL notifications, which work perfectly in Expo Go!

### Console Logs
Watch for these logs to debug:
```
[Notifications] Requesting LOCAL notification permission...
[Notifications] Permission granted!
[Notifications] User skipped permission
```

## 🖼️ Image Specifications

### Background Image (welcome-bg.png)
- **Size**: 1080x1920 or higher (portrait)
- **Format**: PNG or JPG
- **Aspect Ratio**: 9:16 (mobile portrait)
- **Location**: `assets/backgrounds/welcome-bg.png`

### Tips for Best Results
- Use high-resolution images (2x or 3x for retina displays)
- Ensure important content is centered (safe area)
- Test on different screen sizes
- The overlay helps with text readability on any background

## 🔧 Troubleshooting

### "Cannot find module '../../assets/backgrounds/welcome-bg.png'"
- Make sure the image file exists at the exact path
- Check the file name matches exactly (case-sensitive)
- Try restarting the Metro bundler

### "expo-notifications not found"
- Run: `npx expo install expo-notifications`
- Restart the development server

### Background not displaying
- Check image path is correct
- Verify image file is not corrupted
- Try using a different image format (PNG vs JPG)

## 📱 Testing Checklist

- [ ] Background image displays full screen
- [ ] Text is readable (overlay working)
- [ ] "Allow Notifications" button triggers permission dialog
- [ ] "Maybe Later" button navigates to next screen
- [ ] Both buttons lead to character selection screen
- [ ] Layout looks good on different screen sizes

## 🎯 Next Screens to Build

After Screen 1 is working:
1. **Screen 2**: Character Selection (3 hamster personalities)
2. **Screen 3**: Name Your Buddy
3. **Screen 4**: Profile Setup
4. **Screen 5**: Habit Setup

Each screen will follow the same pattern with your background images!
