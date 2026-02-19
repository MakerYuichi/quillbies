#!/bin/bash

# Quillby FREE Publishing Script
# Works on both Android & iPhone without Apple Developer account!
# Made by MakerYuichii

echo "🐹 Quillby FREE Publisher"
echo "========================="
echo ""
echo "✨ Share Quillby on Android & iPhone for FREE!"
echo "✨ No Apple Developer account needed!"
echo ""

# Check if Expo CLI is available
if ! command -v npx &> /dev/null
then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

echo "Choose publishing method:"
echo ""
echo "1) 🌐 Publish Online (Worldwide - Recommended)"
echo "   - Creates permanent URL"
echo "   - Share QR code anywhere"
echo "   - Works on both platforms"
echo "   - 100% FREE"
echo ""
echo "2) 📡 Start Local Server (Same WiFi)"
echo "   - Quick testing"
echo "   - Same network only"
echo "   - Instant updates"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Publishing Quillby online..."
        echo ""
        echo "📝 Note: You'll need a free Expo account"
        echo "   Sign up at: https://expo.dev"
        echo ""
        
        # Check if logged in
        if ! npx expo whoami &> /dev/null 2>&1
        then
            echo "🔐 Please login to Expo:"
            npx expo login
        else
            echo "✅ Logged in as: $(npx expo whoami)"
        fi
        
        echo ""
        echo "📤 Publishing..."
        npx expo publish
        
        echo ""
        echo "✅ Published successfully!"
        echo ""
        echo "📱 Share with users:"
        echo "1. Users install Expo Go (free):"
        echo "   Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
        echo "   iPhone: https://apps.apple.com/app/expo-go/id982107779"
        echo ""
        echo "2. Share the QR code above (take screenshot)"
        echo "3. Users scan QR code in Expo Go"
        echo "4. Quillby opens instantly! 🎉"
        echo ""
        ;;
    2)
        echo ""
        echo "📡 Starting local development server..."
        echo ""
        echo "📱 To use Quillby:"
        echo "1. Install Expo Go on your device (free)"
        echo "2. Connect to same WiFi network"
        echo "3. Scan QR code below"
        echo ""
        npm start
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "💚 Made by MakerYuichii"
echo "🐹 Quillby v1.0.0"
