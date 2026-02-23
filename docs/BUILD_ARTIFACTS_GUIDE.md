# Android Build Artifacts Guide

## What Are Build Artifacts?

Build artifacts are temporary files created during the Android build process. They're necessary for building but can be safely deleted between builds.

## Storage Breakdown

### Typical Sizes:
```
android/
├── .gradle/              # 500MB - 2GB
│   └── Gradle build cache, downloaded dependencies
├── app/build/            # 1GB - 3GB
│   ├── intermediates/    # Temporary compilation files
│   ├── outputs/          # APK/AAB files (50-150MB each)
│   └── generated/        # Auto-generated code
├── app/.cxx/             # 200MB - 800MB
│   └── Native C++ build files
└── build/                # 200MB - 500MB
    └── Project-level build cache
```

### Why So Large?

1. **Multiple CPU Architectures**
   - arm64-v8a (64-bit ARM)
   - armeabi-v7a (32-bit ARM)
   - x86 (32-bit Intel)
   - x86_64 (64-bit Intel)
   - Each architecture needs separate compiled binaries

2. **Debug vs Release Builds**
   - Debug builds include symbols, source maps, unoptimized code
   - Release builds are smaller but still need intermediate files

3. **Native Dependencies**
   - React Native core (~100MB)
   - Hermes JavaScript engine (~50MB)
   - Third-party native modules (varies)
   - Each compiled for all architectures

4. **Gradle Cache**
   - Downloaded dependencies
   - Build cache for faster rebuilds
   - Transformed artifacts

## What Can Be Safely Deleted?

### Always Safe to Delete:
```bash
android/app/build/          # Compiled app (rebuilds automatically)
android/app/.cxx/           # Native C++ build files
android/build/              # Project build cache
android/.gradle/            # Gradle cache (re-downloads if needed)
android/.kotlin/            # Kotlin compiler cache
.expo/                      # Expo build cache
dist/                       # Distribution files
web-build/                  # Web build output
```

### Keep These:
```bash
android/app/src/            # Your source code
android/gradle/             # Gradle wrapper (needed for builds)
android/app/build.gradle    # Build configuration
android/settings.gradle     # Project settings
node_modules/               # Dependencies (unless doing full clean)
```

## Cleanup Commands

### Quick Clean (Recommended)
```bash
# Use the provided script
./clean-for-eas.sh
```

### Manual Clean Commands

#### Clean Android Only:
```bash
cd android
./gradlew clean
cd ..
rm -rf android/app/build
rm -rf android/app/.cxx
rm -rf android/build
rm -rf android/.gradle
```

#### Clean Everything (Nuclear Option):
```bash
# Clean all build artifacts
rm -rf android/app/build android/app/.cxx android/build android/.gradle
rm -rf .expo dist web-build
rm -rf node_modules

# Reinstall dependencies
npm install
```

#### Clean Gradle Cache Globally:
```bash
# This cleans Gradle cache for ALL projects on your machine
rm -rf ~/.gradle/caches/
```

### Check Sizes:
```bash
# Check Android build size
du -sh android/app/build android/build android/.gradle

# Check total project size
du -sh .

# Find largest directories
du -h . | sort -rh | head -20
```

## When to Clean?

### Clean Before:
- ✅ Uploading to EAS Build (use `clean-for-eas.sh`)
- ✅ Committing to Git (artifacts shouldn't be in repo)
- ✅ Running out of disk space
- ✅ Switching between branches with different dependencies
- ✅ After major dependency updates

### Clean After:
- ✅ Build errors that seem cache-related
- ✅ "Duplicate class" or "Duplicate resource" errors
- ✅ Gradle sync failures

### Don't Need to Clean:
- ❌ Between normal development builds (slows down rebuilds)
- ❌ When just changing JavaScript/TypeScript code
- ❌ When only updating assets

## Optimizing Build Size

### 1. Enable APK Splitting (Already in your config)
```gradle
// android/app/build.gradle
splits {
    abi {
        enable true
        reset()
        include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        universalApk false
    }
}
```
This creates separate APKs per architecture (smaller downloads).

### 2. Enable ProGuard/R8 (Release builds)
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 3. Use App Bundle (AAB) Instead of APK
- Google Play automatically optimizes per device
- Users download only what they need
- 15-30% smaller downloads

### 4. Optimize Images
```bash
# Install image optimization tools
npm install -g imageoptim-cli

# Optimize all images
imageoptim --directory assets/
```

### 5. Remove Unused Dependencies
```bash
# Find unused dependencies
npx depcheck

# Remove them
npm uninstall <unused-package>
```

## .gitignore Configuration

Make sure these are in your `.gitignore`:

```gitignore
# Android build artifacts
android/app/build/
android/app/.cxx/
android/build/
android/.gradle/
android/.kotlin/
*.apk
*.aab

# Expo
.expo/
.expo-shared/
dist/
web-build/

# Build outputs
*.jks
*.keystore
```

## EAS Build Optimization

Your `eas.json` should exclude build artifacts:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Troubleshooting

### "Out of space" during build:
```bash
# Clean everything
./clean-for-eas.sh

# Clean Gradle cache globally
rm -rf ~/.gradle/caches/

# Clean npm cache
npm cache clean --force
```

### Build is very slow:
```bash
# Enable Gradle daemon (speeds up builds)
echo "org.gradle.daemon=true" >> android/gradle.properties
echo "org.gradle.parallel=true" >> android/gradle.properties
echo "org.gradle.configureondemand=true" >> android/gradle.properties

# Increase Gradle memory
echo "org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m" >> android/gradle.properties
```

### "Duplicate class" errors:
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug --refresh-dependencies
```

## Monitoring Disk Usage

### Create a monitoring script:
```bash
#!/bin/bash
# disk-usage.sh

echo "📊 Disk Usage Report"
echo "===================="
echo ""
echo "Android Build Artifacts:"
du -sh android/app/build 2>/dev/null || echo "  Not built yet"
du -sh android/build 2>/dev/null || echo "  Not built yet"
du -sh android/.gradle 2>/dev/null || echo "  No cache"
du -sh android/app/.cxx 2>/dev/null || echo "  No native builds"
echo ""
echo "Expo Artifacts:"
du -sh .expo 2>/dev/null || echo "  No cache"
echo ""
echo "Node Modules:"
du -sh node_modules 2>/dev/null || echo "  Not installed"
echo ""
echo "Total Project Size:"
du -sh .
```

## Best Practices

1. **Run cleanup before EAS builds** - Saves upload time and build time
2. **Don't commit build artifacts** - Keep them in .gitignore
3. **Clean after dependency updates** - Prevents cache conflicts
4. **Use Gradle daemon** - Speeds up subsequent builds
5. **Monitor disk usage** - Clean when artifacts exceed 5GB
6. **Use APK splitting** - Reduces per-device download size
7. **Enable ProGuard in release** - Shrinks final APK size

## Quick Reference

```bash
# Clean for EAS
./clean-for-eas.sh

# Check sizes
du -sh android/app/build android/build android/.gradle

# Full clean
rm -rf android/app/build android/build android/.gradle node_modules
npm install

# Gradle clean
cd android && ./gradlew clean && cd ..

# Check total size
du -sh .
```

## Summary

- **Build artifacts are temporary** - Safe to delete between builds
- **They're large** - 2-5GB is normal for Android
- **Clean regularly** - Especially before EAS builds
- **Use the cleanup script** - `./clean-for-eas.sh`
- **Don't commit them** - Keep in .gitignore
- **Optimize for production** - Use APK splitting, ProGuard, AAB format
