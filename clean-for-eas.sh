#!/bin/bash

# Clean for EAS Build
# This script removes unnecessary build artifacts before uploading to EAS

echo "🧹 Cleaning project for EAS Build..."

# Clean Android build artifacts
echo "📱 Cleaning Android build artifacts..."
rm -rf android/app/build
rm -rf android/app/.cxx
rm -rf android/build
rm -rf android/.gradle
rm -rf android/.kotlin

# Clean iOS build artifacts (if exists)
echo "🍎 Cleaning iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods

# Clean Expo artifacts
echo "⚛️  Cleaning Expo artifacts..."
rm -rf .expo
rm -rf .expo-shared
rm -rf dist
rm -rf web-build

# Clean node_modules build artifacts
echo "📦 Cleaning node_modules build artifacts..."
find node_modules -type d -name ".cxx" -exec rm -rf {} + 2>/dev/null
find node_modules -type d -path "*/android/build" -exec rm -rf {} + 2>/dev/null
find node_modules -type d -path "*/ios/build" -exec rm -rf {} + 2>/dev/null

# Clean cache files
echo "🗑️  Cleaning cache files..."
rm -rf .cache
rm -rf .parcel-cache
rm -rf .metro-health-check*
rm -rf *.tsbuildinfo

# Clean logs
echo "📝 Cleaning logs..."
rm -f *.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

# Clean macOS files
echo "🍎 Cleaning macOS files..."
find . -name ".DS_Store" -delete 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "📊 Current project size:"
du -sh . 2>/dev/null | head -1
echo ""
echo "🚀 Ready for EAS Build!"
