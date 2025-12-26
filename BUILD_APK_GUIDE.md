# 📱 Quillby APK Build Guide

## Prerequisites

Before building, make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ npm or yarn installed
- ✅ Expo account (free) - Sign up at https://expo.dev
- ✅ EAS CLI installed globally

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## Step 2: Login to Expo

```bash
cd quillby-app
eas login
```

Enter your Expo credentials (or create a free account).

## Step 3: Configure the Project

```bash
eas build:configure
```

This will set up your project for EAS Build.

## Step 4: Build the APK

### Option A: Production APK (Recommended)
```bash
eas build --platform android --profile production
```

### Option B: Preview APK (For Testing)
```bash
eas build --platform android --profile preview
```

## Step 5: Wait for Build

- The build will be uploaded to Expo's servers
- Build time: ~10-20 minutes
- You'll get a link to download the APK when done
- You can also check status at: https://expo.dev/accounts/[your-account]/projects/quillby-app/builds

## Step 6: Download APK

Once the build completes:
1. Click the download link in the terminal
2. Or visit https://expo.dev and go to your project builds
3. Download the `.apk` file

## Step 7: Install on Android Device

### Method 1: Direct Install
1. Transfer the APK to your Android device
2. Open the APK file
3. Allow "Install from Unknown Sources" if prompted
4. Install the app

### Method 2: Share via Link
- Expo provides a shareable link
- Send to testers via email/WhatsApp
- They can download and install directly

## Alternative: Local Build (Advanced)

If you want to build locally without Expo servers:

```bash
# Install Android Studio and Android SDK first
# Then run:
npx expo run:android --variant release
```

This requires:
- Android Studio installed
- Android SDK configured
- Java JDK 11 or higher
- More complex setup

## Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### Build fails
- Check your `.env` file has all required variables
- Ensure all dependencies are installed: `npm install`
- Check build logs at expo.dev

### APK won't install
- Enable "Install from Unknown Sources" in Android settings
- Make sure you downloaded the correct APK file
- Try uninstalling any previous version first

## Build Profiles Explained

### Production
- Optimized for release
- Smaller file size
- Better performance
- Use for final distribution

### Preview
- Quick builds for testing
- Slightly larger file size
- Good for internal testing

### Development
- For development with Expo Go
- Not suitable for APK distribution

## File Locations

After build completes, you'll get:
- **APK file**: `quillby-[version].apk` (download from Expo)
- **Build logs**: Available at expo.dev
- **Build artifacts**: Stored on Expo servers for 30 days

## Next Steps

1. Test the APK on multiple Android devices
2. Share with beta testers
3. Collect feedback
4. When ready, publish to Google Play Store

## Publishing to Google Play Store

To publish on Play Store:
1. Create a Google Play Developer account ($25 one-time fee)
2. Build an AAB instead of APK:
   ```bash
   eas build --platform android --profile production
   ```
   (AAB is the default for production)
3. Upload to Google Play Console
4. Fill in store listing details
5. Submit for review

## Support

- Expo Docs: https://docs.expo.dev/build/setup/
- EAS Build: https://docs.expo.dev/build/introduction/
- Issues: Contact makeryuichii@gmail.com

---

**Made by MakerYuichii**
**Quillby v1.0.0**
