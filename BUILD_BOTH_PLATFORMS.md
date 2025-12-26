# 📱 Build Quillby for Android & iOS

## Quick Commands

### Build for Both Platforms
```bash
cd quillby-app
eas build --platform all --profile production
```

### Build Android Only
```bash
eas build --platform android --profile production
```

### Build iOS Only
```bash
eas build --platform ios --profile production
```

### Or Use the Interactive Script
```bash
./build-apk.sh
```

---

## 🤖 Android Build (APK)

### Requirements
- ✅ Expo account (free)
- ✅ No additional requirements

### Steps
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `eas build --platform android --profile production`
4. Wait ~10-20 minutes
5. Download `.apk` file
6. Install on any Android device

### Installation
- Transfer APK to Android device
- Open file and install
- Enable "Install from Unknown Sources" if needed

---

## 🍎 iOS Build (IPA)

### Requirements
- ✅ Expo account (free)
- ✅ **Apple Developer Account ($99/year)** - Required!
- ✅ Apple ID credentials

### Steps
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build: `eas build --platform ios --profile production`
4. **Provide Apple credentials when prompted**
5. Wait ~15-25 minutes
6. Download `.ipa` file

### Installation Options

#### Option 1: TestFlight (Recommended)
1. Upload IPA to App Store Connect
2. Add testers via TestFlight
3. Testers install via TestFlight app
4. Best for beta testing

#### Option 2: Direct Install (Development)
1. Register device UDID with Apple
2. Build with device UDID included
3. Install via Xcode or third-party tools
4. Limited to 100 devices per year

#### Option 3: Ad Hoc Distribution
1. Register tester devices
2. Create ad hoc provisioning profile
3. Build and distribute IPA
4. Install via iTunes or configuration profiles

---

## 🚀 Build Both Platforms at Once

```bash
eas build --platform all --profile production
```

This will:
- Build Android APK
- Build iOS IPA
- Run both builds in parallel
- Save time if you need both

---

## 📋 Build Profiles

### Production (Recommended)
```bash
eas build --platform all --profile production
```
- Optimized for release
- Smaller file size
- Best performance
- Use for distribution

### Preview (Testing)
```bash
eas build --platform all --profile preview
```
- Quick builds
- Good for internal testing
- Slightly larger files

---

## 💰 Cost Breakdown

### Android
- **Free** ✅
- No developer account needed
- Can distribute APK directly
- Google Play Store: $25 one-time fee (optional)

### iOS
- **$99/year** for Apple Developer Account
- Required for any iOS distribution
- Includes TestFlight access
- App Store publishing included

---

## 📦 What You Get

### Android Build
- File: `quillby-1.0.0.apk`
- Size: ~50-80 MB
- Install: Direct APK installation
- Distribution: Share file directly

### iOS Build
- File: `quillby-1.0.0.ipa`
- Size: ~60-90 MB
- Install: TestFlight or direct install
- Distribution: TestFlight or enterprise

---

## 🔧 Troubleshooting

### iOS Build Fails - "No Apple Developer Account"
**Solution:** You need to enroll in Apple Developer Program
1. Go to https://developer.apple.com
2. Enroll ($99/year)
3. Wait for approval (1-2 days)
4. Try building again

### iOS Build Fails - "Invalid Credentials"
**Solution:** 
1. Use App-Specific Password (not regular password)
2. Generate at https://appleid.apple.com
3. Use 2FA if enabled

### Android Build Works, iOS Doesn't
**This is normal!** iOS requires paid developer account.
- Continue with Android for now
- Get Apple Developer account when ready

### "eas: command not found"
```bash
npm install -g eas-cli
```

### Build Takes Too Long
- Normal: 10-25 minutes per platform
- Check status: https://expo.dev
- You can close terminal and check later

---

## 📱 Distribution Methods

### Android
1. **Direct APK** - Share file, users install
2. **Google Play Store** - $25 one-time, official distribution
3. **Third-party stores** - Amazon, Samsung, etc.

### iOS
1. **TestFlight** - Beta testing (100 internal, 10,000 external)
2. **App Store** - Official distribution (included in $99/year)
3. **Enterprise** - Internal company distribution ($299/year)
4. **Ad Hoc** - Direct install (max 100 devices)

---

## 🎯 Recommended Workflow

### For Testing
```bash
# Build both platforms for testing
eas build --platform all --profile preview
```

### For Release
```bash
# Build production versions
eas build --platform all --profile production
```

### Android Only (No iOS Developer Account)
```bash
# Just build Android
eas build --platform android --profile production
```

---

## 📞 Support

- **Expo Docs:** https://docs.expo.dev/build/introduction/
- **Apple Developer:** https://developer.apple.com
- **Google Play:** https://play.google.com/console
- **Email:** makeryuichii@gmail.com

---

## ✅ Checklist Before Building

### Android
- [ ] Expo account created
- [ ] EAS CLI installed
- [ ] Logged in to Expo
- [ ] App tested on Android emulator/device

### iOS
- [ ] Expo account created
- [ ] EAS CLI installed
- [ ] Logged in to Expo
- [ ] **Apple Developer account ($99/year)**
- [ ] Apple ID credentials ready
- [ ] App tested on iOS simulator/device

---

**Made by MakerYuichii** 💚
**Quillby v1.0.0**
