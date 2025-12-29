# 🚀 Quick Start: Share Quillby App (FREE)

## The Fastest Way to Share Your App

Since EAS builds are failing with Hermes compiler errors, use the **Development Server** method instead. This is completely FREE and works immediately.

## Step 1: Start the Development Server

```bash
cd quillby-app
npm start
```

This will:
- Start Metro bundler
- Show a QR code in terminal
- Open Expo DevTools in browser

## Step 2: Share with Users

### For Local Network (Same WiFi):
1. Users install **Expo Go** app (free):
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Users scan the QR code shown in your terminal
3. App loads instantly!

### For Remote Users (Different Location):
```bash
npm start -- --tunnel
```

This creates a public URL that works anywhere. Share the QR code or link.

## Step 3: Keep Server Running

- Keep your terminal open while users are testing
- Press `r` to reload app for all users
- Press `m` to toggle menu

## Advantages:
✅ FREE - No EAS subscription needed
✅ INSTANT - No 20-minute build wait
✅ LIVE UPDATES - Changes reflect immediately
✅ WORKS ON BOTH - iOS and Android
✅ NO BUILD ERRORS - Bypasses Gradle/Hermes issues

## Limitations:
⚠️ Requires Expo Go app installed
⚠️ Your computer must stay on while sharing
⚠️ Users need internet connection

---

## Alternative: Fix Hermes Build Error

If you still want standalone APK/IPA files, try disabling Hermes:

### In `app.json`, add:
```json
{
  "expo": {
    "android": {
      "jsEngine": "jsc"
    },
    "ios": {
      "jsEngine": "jsc"
    }
  }
}
```

Then run: `eas build --platform all --profile production`

This uses JavaScriptCore instead of Hermes, which may fix the build error.

---

**Made by MakerYuichii**
