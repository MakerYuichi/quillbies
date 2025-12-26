#!/bin/bash

# Quillby Build Script - Android & iOS
# Made by MakerYuichii

echo "🐹 Quillby App Builder"
echo "======================"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null
then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed!"
    echo ""
fi

# Check if logged in
echo "🔐 Checking Expo login status..."
if ! eas whoami &> /dev/null
then
    echo "❌ Not logged in to Expo"
    echo "Please login with your Expo account:"
    eas login
else
    echo "✅ Logged in as: $(eas whoami)"
fi

echo ""
echo "📦 Building Quillby App..."
echo ""
echo "Choose platform:"
echo "1) Android (APK)"
echo "2) iOS (IPA)"
echo "3) Both Android & iOS"
echo ""
read -p "Enter choice (1, 2, or 3): " platform_choice

echo ""
echo "Choose build type:"
echo "1) Production (Recommended - Optimized for release)"
echo "2) Preview (For testing)"
echo ""
read -p "Enter choice (1 or 2): " build_choice

case $build_choice in
    1)
        PROFILE="production"
        ;;
    2)
        PROFILE="preview"
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

case $platform_choice in
    1)
        echo ""
        echo "🤖 Building Android APK ($PROFILE)..."
        eas build --platform android --profile $PROFILE
        ;;
    2)
        echo ""
        echo "🍎 Building iOS IPA ($PROFILE)..."
        echo ""
        echo "⚠️  Note: iOS builds require an Apple Developer account ($99/year)"
        echo "    You'll be prompted to provide credentials during the build."
        echo ""
        read -p "Continue? (y/n): " continue_ios
        if [ "$continue_ios" = "y" ] || [ "$continue_ios" = "Y" ]; then
            eas build --platform ios --profile $PROFILE
        else
            echo "❌ iOS build cancelled."
            exit 0
        fi
        ;;
    3)
        echo ""
        echo "🤖🍎 Building for Both Platforms ($PROFILE)..."
        echo ""
        echo "⚠️  Note: iOS builds require an Apple Developer account ($99/year)"
        echo ""
        read -p "Continue with both platforms? (y/n): " continue_both
        if [ "$continue_both" = "y" ] || [ "$continue_both" = "Y" ]; then
            eas build --platform all --profile $PROFILE
        else
            echo "❌ Build cancelled."
            exit 0
        fi
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Build(s) submitted!"
echo ""
echo "📱 Next steps:"
echo "1. Wait for build to complete (~10-20 minutes)"
echo "2. Download files from the link provided"
echo "   - Android: .apk file"
echo "   - iOS: .ipa file (requires TestFlight or direct install)"
echo "3. Check build status at: https://expo.dev"
echo ""
echo "Made with 💚 by MakerYuichii"
