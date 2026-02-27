# Android API Level 35 (Android 15) Upgrade

## Summary
Updated the app to target Android API level 35 (Android 15) to meet Google Play's requirements for apps submitted after August 31, 2025.

## Changes Made

### 1. Updated `android/build.gradle`
- Changed `targetSdkVersion` from 34 to 35
- Kept `compileSdkVersion` at 35
- Kept `buildToolsVersion` at 35.0.0

### 2. Updated `app.json`
- Added explicit SDK version configuration to `expo-build-properties` plugin:
  - `compileSdkVersion`: 35
  - `targetSdkVersion`: 35
  - `buildToolsVersion`: "35.0.0"

## Google Play Requirements

Starting August 31, 2025:
- New apps and app updates must target Android 15 (API level 35) or higher
- Existing apps must target Android 14 (API level 34) or higher to remain available to new users

## Testing Checklist

### Core Functionality
- [ ] App compiles without errors or warnings
- [ ] App launches successfully
- [ ] All core features work as expected

### Permissions
- [ ] Location permission (for timezone detection during onboarding)
- [ ] Notification permission
- [ ] Exact alarm permission (for study reminders)
- [ ] Test permission denial scenarios - app should handle gracefully

### Background Services & Notifications
- [ ] Study session reminders work correctly
- [ ] Notifications appear as expected
- [ ] Background tasks complete successfully

### File Sharing (if applicable)
- [ ] Test any file sharing functionality
- [ ] Verify content is visible in other apps

### RevenueCat / In-App Purchases
- [ ] Test premium subscription flow
- [ ] Verify purchase restoration works
- [ ] Check billing permission is working

## Android 15 Behavior Changes to Be Aware Of

### Security & Privacy
1. **Partial screen sharing**: Users can share specific app windows instead of entire screen
2. **Private space**: Users can create a separate space for sensitive apps
3. **Enhanced notification permissions**: More granular control over notifications

### Performance
1. **Foreground service restrictions**: Stricter rules for starting foreground services
2. **Battery optimization**: More aggressive battery management

### User Experience
1. **Edge-to-edge enforcement**: Apps should handle edge-to-edge display properly
2. **Predictive back gesture**: Support for predictive back animations

## Next Steps

1. **Test the app thoroughly** using the checklist above
2. **Run EAS build** to generate a new AAB with API level 35:
   ```bash
   cd quillby-app
   eas build --platform android --profile production
   ```
3. **Test on Android 15 devices** (or emulator) if possible
4. **Submit to Google Play** once testing is complete

## Rollback Plan

If issues are discovered, you can temporarily rollback by:
1. Changing `targetSdkVersion` back to 34 in `android/build.gradle`
2. Updating `app.json` to use `targetSdkVersion: 34`
3. Rebuilding the app

However, note that Google Play will require API level 35 after August 31, 2025.

## Resources

- [Android 15 Behavior Changes](https://developer.android.com/about/versions/15/behavior-changes-15)
- [Google Play Target API Requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Expo Build Properties](https://docs.expo.dev/versions/latest/sdk/build-properties/)
