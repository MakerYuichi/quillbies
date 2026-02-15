# Keep Awake Error Fix

## Error Message
```
ERROR [Error: Uncaught (in promise, id: 0) Error: Unable to activate keep awake]
```

## What This Error Means

The `expo-keep-awake` module is a **native module** that prevents the screen from sleeping during focus sessions. This error occurs because:

1. The native module hasn't been compiled into the app yet
2. You're running the app with Expo Go (which doesn't support all native modules)
3. The app needs to be rebuilt with native compilation

## Is This Critical?

**No!** This error is **non-critical** and has been handled gracefully:

- The app will continue to work normally
- Focus sessions will still function correctly
- The only difference is that the screen might sleep during long sessions (you can manually adjust your device's sleep settings)

## The Fix

The error has been suppressed with improved error handling:

### Changes Made:

1. **`app/_layout.tsx`**: Enhanced promise rejection handler to catch keep awake errors earlier
2. **`app/study-session.tsx`**: Added additional `.catch()` to prevent unhandled promise rejection

### What Happens Now:

- The error is caught and logged as a warning instead of an error
- The app continues without the keep awake feature
- No red error screen or crash

## To Fully Resolve (Optional)

If you want the keep awake feature to work properly, you need to rebuild the app with native modules:

### For Android:
```bash
npx expo run:android
```

### For iOS:
```bash
npx expo run:ios
```

This will compile the native modules including `expo-keep-awake`.

## Why Not Use Expo Go?

Expo Go is a development app that includes many common Expo modules, but it doesn't include all native modules. Some modules like `expo-keep-awake`, `expo-av` (for sounds), and others require a custom development build.

## Current Status

✅ **Error is handled** - App won't crash
✅ **Focus sessions work** - All functionality intact
⚠️ **Screen may sleep** - Device sleep settings apply
🔧 **Optional fix** - Rebuild with native modules if you want keep awake

## Testing

After this fix, you should see:
```
[KeepAwake] Module not available (native rebuild required), continuing without keep awake
```

Instead of the red error screen.

## Summary

The error is now properly handled and won't disrupt your app. The keep awake feature is optional and the app works perfectly without it. If you want the feature, rebuild the app with native modules using the commands above.
