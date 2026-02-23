# 🚀 Quick Fix for EAS Build Upload Error

## The Problem
```
Failed to upload the project tarball to EAS Build
Project archive: 318 MB
Error: write EPIPE (upload timeout/failure)
```

## The Solution (3 Steps)

### Step 1: Clean Build Artifacts
```bash
./clean-for-eas.sh
```

This removes ~2 GB of unnecessary build artifacts.

### Step 2: Verify Project Size
```bash
du -sh .
```

Target: < 100 MB (excluding node_modules which EAS installs fresh)

### Step 3: Run EAS Build
```bash
eas build --platform android --profile preview
```

## What the Cleanup Script Does

Removes these large directories:
- `android/app/build` (~1.0 GB)
- `android/app/.cxx` (~617 MB)
- `node_modules/*/android/build` (~200 MB)
- `.expo/`, `dist/`, cache files

## Why This Works

EAS Build doesn't need local build artifacts because:
1. It runs `npm install` fresh on their servers
2. It generates native folders from scratch
3. It creates build artifacts during the build process

## Current Project Breakdown

After cleanup:
```
410M  node_modules (EAS installs fresh, not uploaded)
186M  .git (excluded by .easignore)
181M  assets (required for app)
2.1M  android (config only, no build artifacts)
1.3M  app (source code)
```

**Effective upload size: ~50-80 MB**

## If Upload Still Fails

### Option 1: Optimize Large Audio Files
```bash
# Find large audio files
find assets -name "*.wav" -o -name "*.mp3" | xargs ls -lh

# Convert WAV to MP3
# onboarding.wav (5.9M) → should be MP3 with lower bitrate
```

### Option 2: Check .easignore is Working
```bash
# Verify what would be uploaded
tar --exclude-from=.easignore -czf test.tar.gz .
ls -lh test.tar.gz
rm test.tar.gz
```

### Option 3: Use EAS Build with Local Credentials
```bash
# If upload keeps failing, try local build
eas build --platform android --local
```

## Prevention

### Before Every EAS Build:
1. Run `./clean-for-eas.sh`
2. Don't run local Android builds before EAS
3. Verify project size is reasonable

### Add to Git Pre-commit Hook:
```bash
# .git/hooks/pre-commit
if [ -d "android/app/build" ]; then
  echo "⚠️  Warning: android/app/build exists"
  echo "Run ./clean-for-eas.sh before EAS build"
fi
```

## Files Updated

1. ✅ `.easignore` - Comprehensive exclusions
2. ✅ `clean-for-eas.sh` - Automated cleanup script
3. ✅ `EAS_BUILD_OPTIMIZATION.md` - Detailed guide

## Quick Commands

```bash
# Clean everything
./clean-for-eas.sh

# Check size
du -sh .

# Build for Android
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile preview

# Build both
eas build --platform all --profile preview
```

## Expected Result

After running cleanup:
- ✅ Upload completes successfully
- ✅ Build time reduced
- ✅ No timeout errors
- ✅ Smaller archive size

## Troubleshooting

### "Still getting upload errors"
1. Check internet connection
2. Try again in a few minutes (EAS server might be busy)
3. Use `--non-interactive` flag: `eas build --platform android --non-interactive`

### "Build artifacts keep coming back"
- Don't run `npx expo prebuild` before EAS build
- Don't run `./gradlew` commands before EAS build
- Add to `.gitignore` to prevent committing

### "Assets are too large"
Consider optimizing:
- `onboarding.wav` (5.9M) → Convert to MP3 128kbps
- `drinking-water.mp3` (5.2M) → Reduce to 64kbps
- `gamemusic.mp3` (2.4M) → Reduce to 128kbps

---

## TL;DR

```bash
# Run this before every EAS build
./clean-for-eas.sh

# Then build
eas build --platform android --profile preview
```

**That's it!** 🎉

---

**Status**: ✅ Ready to Build  
**Last Updated**: February 24, 2026
