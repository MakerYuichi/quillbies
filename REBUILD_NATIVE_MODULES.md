# Rebuild Native Modules for expo-av

The `expo-av` package requires native modules to be rebuilt. Follow these steps:

## For Android:

1. **Stop the current development server** (Ctrl+C)

2. **Clean the build**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **Rebuild the app**:
   ```bash
   npx expo run:android
   ```

   OR if using EAS:
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

## For iOS:

1. **Stop the current development server** (Ctrl+C)

2. **Install pods**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Rebuild the app**:
   ```bash
   npx expo run:ios
   ```

   OR if using EAS:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

## Quick Fix (Development Only):

If you just want to test without sounds for now:

The app will work without crashing - sounds are gracefully disabled until native modules are rebuilt. You'll see console logs like:
```
[Sound] Audio not available or disabled, skipping: hamster_eating
```

The eating animation will still show for 2 seconds (default duration).

## After Rebuilding:

Once native modules are rebuilt, sounds will automatically work when you:
1. Add sound files to `assets/sounds/character/`
2. Uncomment preload code in `lib/soundManager.ts`
3. Call `preloadSounds()` in `app/_layout.tsx`

## Troubleshooting:

If you still see errors after rebuilding:
1. Delete `node_modules` and reinstall: `npm install`
2. Clear Metro cache: `npx expo start -c`
3. Rebuild again with `--clean` flag
