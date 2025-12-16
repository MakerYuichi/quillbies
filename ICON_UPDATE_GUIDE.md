# How to Update App Icon on Android

## Problem
Changed the icon file but Android still shows the old icon.

## Cause
Android caches the app icon. Simply replacing the file doesn't update it immediately.

## Solution

### Method 1: Clear Cache and Rebuild (Recommended)
```bash
# Stop the running app
# Press Ctrl+C in the terminal running expo

# Clear Expo cache
npx expo start -c

# Or use:
expo start --clear
```

### Method 2: Uninstall and Reinstall
1. **Uninstall the app** from your Android device
2. **Restart Expo**:
   ```bash
   npx expo start
   ```
3. **Reinstall** by scanning QR code or pressing 'a'

### Method 3: Full Clean (If above doesn't work)
```bash
# Stop expo
# Delete cache folders
rm -rf node_modules/.cache
rm -rf .expo

# Restart with clear cache
npx expo start -c
```

### Method 4: Build New APK (For production)
```bash
# For development build
eas build --platform android --profile development

# For production build
eas build --platform android --profile production
```

## Icon File Locations

### Current Icon Files
- `assets/icon.png` - Main app icon (1024x1024)
- `assets/adaptive-icon.png` - Android adaptive icon (1024x1024)

### Icon Requirements

#### Standard Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Used for**: iOS, Android (fallback)

#### Adaptive Icon (`adaptive-icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Safe Zone**: Keep important content in center 66% (660x660)
- **Used for**: Android 8.0+ (various shapes)

## Verification Steps

### 1. Check Icon Files
```bash
# Verify icon files exist
ls -la assets/icon.png
ls -la assets/adaptive-icon.png

# Check file sizes (should be 1024x1024)
file assets/icon.png
file assets/adaptive-icon.png
```

### 2. Check app.json Configuration
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### 3. Clear and Restart
```bash
# Clear cache
npx expo start -c

# Wait for bundling to complete
# Reinstall on device
```

### 4. Verify on Device
- Uninstall old app
- Install new version
- Check home screen icon
- Check app switcher icon

## Common Issues

### Issue 1: Icon Still Old After Clear Cache
**Solution**: Uninstall app completely from device, then reinstall

### Issue 2: Icon Looks Cropped on Android
**Solution**: Use adaptive icon with safe zone. Keep logo in center 66%

### Issue 3: Icon Has White Background
**Solution**: 
- Ensure PNG has transparency
- Check `backgroundColor` in app.json adaptive icon config

### Issue 4: Different Icon Shapes on Different Devices
**Solution**: This is normal! Android adaptive icons change shape based on device manufacturer (circle, square, rounded square, etc.)

## Quick Fix Command
```bash
# One-liner to clear everything and restart
rm -rf node_modules/.cache && rm -rf .expo && npx expo start -c
```

## Testing on Multiple Devices

### Test Icon Shapes
Android adaptive icons appear in different shapes:
- **Samsung**: Rounded square
- **Google Pixel**: Circle
- **OnePlus**: Rounded square
- **Xiaomi**: Rounded square with border

### Preview Adaptive Icon
Use this tool to preview how your icon looks in different shapes:
https://adapticon.tooo.io/

## Production Build

### For Production APK/AAB
```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android
```

## Icon Design Tips

### Do's
✅ Use simple, recognizable design
✅ Keep important elements in center 66%
✅ Use high contrast colors
✅ Test on multiple device shapes
✅ Use PNG with transparency

### Don'ts
❌ Don't put text near edges
❌ Don't use gradients that might look bad when cropped
❌ Don't rely on corners (they get cut off)
❌ Don't use very thin lines (hard to see when small)

## After Updating Icon

1. ✅ Clear Expo cache: `npx expo start -c`
2. ✅ Uninstall old app from device
3. ✅ Reinstall app
4. ✅ Check icon on home screen
5. ✅ Check icon in app switcher
6. ✅ Test on multiple Android devices if possible

## Result
Your new icon should now appear on Android! 🎨
