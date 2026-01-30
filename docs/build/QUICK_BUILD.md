# 🚀 Quick Build - Android & iOS

## One Command for Both Platforms

```bash
cd quillby-app
eas build --platform all --profile production
```

## Or Choose Platform

### Android Only (Free)
```bash
eas build --platform android --profile production
```

### iOS Only (Requires Apple Developer Account - $99/year)
```bash
eas build --platform ios --profile production
```

## Interactive Script
```bash
./build-apk.sh
```
Choose your platform and build type interactively!

---

## First Time Setup (One-time)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo (free account)
cd quillby-app
eas login

# 3. Build!
eas build --platform all --profile production
```

---

## What You Get

### 🤖 Android
- **File:** `quillby-1.0.0.apk`
- **Cost:** FREE ✅
- **Install:** Direct APK installation
- **Time:** ~10-20 minutes

### 🍎 iOS
- **File:** `quillby-1.0.0.ipa`
- **Cost:** $99/year (Apple Developer Account)
- **Install:** TestFlight or direct install
- **Time:** ~15-25 minutes

---

## Download Your Builds

After build completes:
1. Click the link in terminal, OR
2. Visit https://expo.dev → Projects → Quillby → Builds
3. Download files:
   - Android: `.apk` file
   - iOS: `.ipa` file

---

## Installation

### Android
1. Transfer APK to device
2. Open and install
3. Enable "Unknown Sources" if needed

### iOS
1. Upload to TestFlight (recommended), OR
2. Install via Xcode/iTunes
3. Requires Apple Developer account

---

## Important Notes

### iOS Requires Apple Developer Account
- **Cost:** $99/year
- **Sign up:** https://developer.apple.com
- **Why:** Apple requires it for all iOS apps
- **Alternative:** Build Android only (free)

### Both Platforms
- Builds run on Expo servers (cloud)
- No need for Xcode or Android Studio
- Download links valid for 30 days
- Can rebuild anytime for free

---

**Need detailed help?** Check `BUILD_BOTH_PLATFORMS.md`

**Made by MakerYuichii** 💚
