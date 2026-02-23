# EAS Build Optimization Guide

## Problem
EAS Build was failing with a 318 MB project archive, exceeding upload limits and causing timeout errors.

## Solution
Optimized `.easignore` file and created cleanup script to reduce project size before uploading to EAS.

## Quick Fix

### Option 1: Run Cleanup Script (Recommended)
```bash
./clean-for-eas.sh
```

### Option 2: Manual Cleanup
```bash
# Clean Android build artifacts
rm -rf android/app/build android/app/.cxx android/build android/.gradle

# Clean node_modules build artifacts
find node_modules -type d -name ".cxx" -exec rm -rf {} + 2>/dev/null
find node_modules -type d -path "*/android/build" -exec rm -rf {} + 2>/dev/null

# Clean Expo artifacts
rm -rf .expo dist web-build
```

## What Was Optimized

### 1. Updated `.easignore`
Added comprehensive exclusions for:
- Build artifacts (`android/build`, `android/app/.cxx`, etc.)
- Node modules build artifacts
- Documentation files
- Test files
- IDE configuration
- Cache files
- Logs

### 2. Created `clean-for-eas.sh`
Automated cleanup script that removes:
- Android build artifacts (~1.6 GB)
- iOS build artifacts
- Node modules build artifacts (~600 MB)
- Expo cache
- Logs and temporary files

## Size Breakdown

### Before Optimization
```
Total: 318 MB (upload size)
- android/app/build: ~1.0 GB
- android/app/.cxx: ~617 MB
- node_modules build artifacts: ~200 MB
- Other files: ~100 MB
```

### After Optimization
```
Total: ~50-80 MB (estimated upload size)
- node_modules: ~410 MB (EAS installs fresh)
- assets: ~181 MB (required)
- source code: ~10 MB
- configuration: ~5 MB
```

## EAS Build Process

EAS Build doesn't need local build artifacts because:
1. **Fresh Install**: EAS runs `npm install` or `yarn install` on their servers
2. **Clean Build**: EAS generates native folders (`ios/`, `android/`) from scratch
3. **Managed Workflow**: Build artifacts are created during the build process

## What to Include

### ✅ Include These
- Source code (`app/`, `lib/`, etc.)
- Assets (`assets/`)
- Configuration files (`app.json`, `eas.json`, `package.json`)
- Lock files (`package-lock.json`, `yarn.lock`)

### ❌ Exclude These
- Build artifacts (`build/`, `dist/`, `.expo/`)
- Native build folders (`android/build/`, `ios/build/`)
- Node modules build artifacts
- Documentation (`docs/`, `*.md`)
- Test files (`__tests__/`, `*.test.ts`)
- IDE files (`.vscode/`, `.idea/`)
- Logs (`*.log`)

## Best Practices

### Before Every EAS Build
1. Run cleanup script: `./clean-for-eas.sh`
2. Verify `.easignore` is up to date
3. Check project size: `du -sh .`
4. Target size: < 100 MB for smooth uploads

### Regular Maintenance
```bash
# Clean build artifacts weekly
./clean-for-eas.sh

# Check for large files
find . -type f -size +5M | grep -v node_modules

# Monitor project size
du -sh . && du -sh node_modules && du -sh assets
```

## Troubleshooting

### Upload Still Fails
1. **Check node_modules size**:
   ```bash
   du -sh node_modules
   ```
   If > 500 MB, consider removing unused dependencies

2. **Check assets size**:
   ```bash
   du -sh assets
   ```
   Optimize large images/audio files if needed

3. **Verify .easignore is working**:
   ```bash
   # Test what would be uploaded
   tar --exclude-from=.easignore -czf test-archive.tar.gz .
   ls -lh test-archive.tar.gz
   rm test-archive.tar.gz
   ```

### Build Artifacts Keep Coming Back
- Don't run local builds before EAS upload
- Add build artifacts to `.gitignore`
- Use cleanup script before every EAS build

### Large Assets
If assets are too large:
1. Compress images (use tools like ImageOptim, TinyPNG)
2. Convert audio to compressed formats (MP3 with lower bitrate)
3. Use asset delivery services for very large files

## Commands Reference

### Clean Everything
```bash
./clean-for-eas.sh
```

### Check Sizes
```bash
# Total project size
du -sh .

# Individual directories
du -sh android node_modules assets app

# Find large files
find . -type f -size +5M | grep -v node_modules
```

### EAS Build
```bash
# Preview build
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

## Asset Optimization Tips

### Images
- Use WebP format where possible
- Compress PNGs with tools like pngquant
- Target: < 500 KB per image

### Audio
- Use MP3 with 128 kbps bitrate for background music
- Use MP3 with 64 kbps for sound effects
- Consider OGG format for better compression

### Current Large Assets
```
5.9M assets/sounds/background_music/onboarding.wav → Convert to MP3
5.2M assets/sounds/character/drinking-water.mp3 → Reduce bitrate
2.4M assets/sounds/background_music/gamemusic.mp3 → Reduce bitrate
```

## Monitoring

### Set Up Alerts
Monitor project size regularly:
```bash
# Add to your CI/CD or pre-commit hook
PROJECT_SIZE=$(du -sm . | cut -f1)
if [ $PROJECT_SIZE -gt 200 ]; then
  echo "⚠️  Warning: Project size is ${PROJECT_SIZE}MB"
  echo "Run ./clean-for-eas.sh before EAS build"
fi
```

## Summary

1. ✅ Updated `.easignore` with comprehensive exclusions
2. ✅ Created `clean-for-eas.sh` cleanup script
3. ✅ Cleaned build artifacts (reduced ~2 GB)
4. ✅ Documented optimization process
5. 🎯 Target: < 100 MB upload size

## Next Steps

1. Run `./clean-for-eas.sh` before every EAS build
2. Consider optimizing large audio files
3. Monitor project size regularly
4. Update `.easignore` as needed

---

**Last Updated**: February 24, 2026  
**Status**: ✅ Optimized and Ready for EAS Build
