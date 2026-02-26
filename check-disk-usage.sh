#!/bin/bash

# Check Disk Usage for Quillby Project
# Shows size of build artifacts and helps identify what to clean

echo "📊 Quillby Project Disk Usage Report"
echo "====================================="
echo ""

# Function to show size or "Not found"
show_size() {
    if [ -d "$1" ] || [ -f "$1" ]; then
        du -sh "$1" 2>/dev/null
    else
        echo "  $1: Not found"
    fi
}

echo "🤖 Android Build Artifacts:"
show_size "android/app/build"
show_size "android/build"
show_size "android/.gradle"
show_size "android/app/.cxx"
show_size "android/.kotlin"
echo ""

echo "🍎 iOS Build Artifacts (if exists):"
show_size "ios/build"
show_size "ios/Pods"
echo ""

echo "⚛️  Expo Artifacts:"
show_size ".expo"
show_size ".expo-shared"
show_size "dist"
show_size "web-build"
echo ""

echo "📦 Dependencies:"
show_size "node_modules"
echo ""

echo "🎨 Assets:"
show_size "assets"
echo ""

echo "📊 Total Project Size:"
du -sh . 2>/dev/null | head -1
echo ""

# Calculate cleanable size
CLEANABLE=0
if [ -d "android/app/build" ]; then
    CLEANABLE=$((CLEANABLE + $(du -s android/app/build 2>/dev/null | cut -f1)))
fi
if [ -d "android/build" ]; then
    CLEANABLE=$((CLEANABLE + $(du -s android/build 2>/dev/null | cut -f1)))
fi
if [ -d "android/.gradle" ]; then
    CLEANABLE=$((CLEANABLE + $(du -s android/.gradle 2>/dev/null | cut -f1)))
fi
if [ -d "android/app/.cxx" ]; then
    CLEANABLE=$((CLEANABLE + $(du -s android/app/.cxx 2>/dev/null | cut -f1)))
fi
if [ -d ".expo" ]; then
    CLEANABLE=$((CLEANABLE + $(du -s .expo 2>/dev/null | cut -f1)))
fi

if [ $CLEANABLE -gt 0 ]; then
    CLEANABLE_MB=$((CLEANABLE / 1024))
    echo "🧹 Cleanable Artifacts: ~${CLEANABLE_MB}MB"
    echo ""
    echo "💡 Run './clean-for-eas.sh' to clean build artifacts"
else
    echo "✨ No build artifacts to clean!"
fi

echo ""
echo "📁 Largest Directories:"
du -h . 2>/dev/null | sort -rh | head -10
