# Notification Permission Debug Guide

## 🐛 Issue: System Permission Dialog Not Appearing

### Possible Causes & Solutions

#### 1. Permission Already Granted/Denied
**Problem**: If you've already allowed or denied notifications in Expo Go, the system won't show the dialog again.

**Solution**: Reset Expo Go permissions
- **iOS**: Settings → Expo Go → Notifications → Reset to "Ask"
- **Android**: Settings → Apps → Expo Go → Permissions → Notifications → Reset

#### 2. Testing in Expo Go
**Problem**: Expo Go has limitations with notifications in SDK 53+

**Solution**: Check console logs
```
[Notifications] Starting permission request...
[Notifications] Existing status: granted/denied/undetermined
[Notifications] Requesting permission (should show system dialog)...
[Notifications] Permission response: granted/denied
```

If you see "Existing status: granted" - the permission was already given!

#### 3. App Configuration Missing
**Problem**: expo-notifications plugin not configured

**Solution**: ✅ Already added to app.json
```json
"plugins": [
  "expo-font",
  ["expo-notifications", {
    "icon": "./assets/icon.png",
    "color": "#ffffff"
  }]
]
```

After adding, restart: `npx expo start --clear`

#### 4. Platform-Specific Issues

**iOS Simulator**:
- Notifications work but may not show banner
- Permission dialog should still appear
- Check console for logs

**Android Emulator**:
- Notifications should work fully
- Permission dialog appears normally

**Physical Device**:
- Works best on real devices
- Make sure Expo Go has notification permission

### 🔍 Debugging Steps

1. **Check Console Logs**
   - Open your terminal/console
   - Look for `[Notifications]` logs
   - See what status is returned

2. **Reset Permissions**
   - Delete Expo Go app
   - Reinstall Expo Go
   - Try again (fresh permissions)

3. **Test Permission Status**
   Add this temporary button to see current status:
   ```tsx
   <TouchableOpacity onPress={async () => {
     const { status } = await Notifications.getPermissionsAsync();
     Alert.alert('Current Status', status);
   }}>
     <Text>Check Permission Status</Text>
   </TouchableOpacity>
   ```

4. **Force Permission Request**
   If status is "undetermined", the dialog should appear.
   If status is "granted" or "denied", it won't appear again.

### ✅ Expected Behavior

**First Time (undetermined)**:
1. Tap "Allow Notifications"
2. System dialog appears: "Expo Go Would Like to Send You Notifications"
3. User taps Allow/Don't Allow
4. App navigates to next screen

**Already Granted**:
1. Tap "Allow Notifications"
2. No dialog (already allowed)
3. Console: "Permission already granted, skipping dialog"
4. App navigates to next screen

**Already Denied**:
1. Tap "Allow Notifications"
2. No dialog (already denied)
3. Console: "Permission response: denied"
4. App navigates to next screen

### 🚀 Quick Fix

If the dialog never appears, it's likely because:
1. You already granted permission (check Expo Go settings)
2. You already denied permission (reset in device settings)

**To test fresh**: Uninstall and reinstall Expo Go app.

### 📱 Console Logs to Watch

```
✅ Good flow:
[Notifications] Starting permission request...
[Notifications] Existing status: undetermined
[Notifications] Requesting permission (should show system dialog)...
[User sees dialog and chooses]
[Notifications] Permission response: granted
[Notifications] Final status: GRANTED

❌ Already granted:
[Notifications] Starting permission request...
[Notifications] Existing status: granted
[Notifications] Permission already granted, skipping dialog
[Notifications] Final status: GRANTED

❌ Already denied:
[Notifications] Starting permission request...
[Notifications] Existing status: denied
[Notifications] Requesting permission (should show system dialog)...
[Notifications] Permission response: denied
[Notifications] Final status: DENIED
```

### 🎯 Next Steps

1. Check your console logs - what status do you see?
2. If "granted" or "denied" - reset Expo Go permissions
3. If "undetermined" but no dialog - try reinstalling Expo Go
4. Test on a physical device for best results
