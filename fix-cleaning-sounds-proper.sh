#!/bin/bash

# Script to properly convert cleaning sounds to React Native compatible MP3 format
# This fixes "Player does not exist" errors

echo "🔧 Converting cleaning sounds to React Native compatible format..."

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg not found. Installing via Homebrew..."
    brew install ffmpeg
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install ffmpeg. Please install manually:"
        echo "   brew install ffmpeg"
        exit 1
    fi
fi

# Navigate to sounds directory
cd "$(dirname "$0")/assets/sounds/mess"

echo "📁 Working directory: $(pwd)"
echo ""

# Backup original files
if [ ! -d "originals" ]; then
    echo "📦 Creating backup directory..."
    mkdir originals
    cp *.mp3 originals/
    echo "✅ Originals backed up to originals/"
    echo ""
fi

# Convert each file to clean MP3 format
# Settings optimized for React Native:
# - Remove ID3 tags
# - Constant bitrate (CBR) instead of variable
# - Mono audio (smaller file size)
# - 44100 Hz sample rate (standard)
# - 128 kbps bitrate (good quality)

echo "🔄 Converting broom.mp3..."
ffmpeg -i originals/broom.mp3 -acodec libmp3lame -b:a 128k -ar 44100 -ac 1 -write_id3v1 0 -id3v2_version 0 -y broom.mp3 2>&1 | grep -E "Duration|Output"

echo ""
echo "🔄 Converting scrub.mp3 (WAV to MP3)..."
ffmpeg -i originals/scrub.mp3 -acodec libmp3lame -b:a 128k -ar 44100 -ac 1 -write_id3v1 0 -id3v2_version 0 -y scrub.mp3 2>&1 | grep -E "Duration|Output"

echo ""
echo "🔄 Converting deep-clean.mp3..."
ffmpeg -i originals/deep-clean.mp3 -acodec libmp3lame -b:a 128k -ar 44100 -ac 1 -write_id3v1 0 -id3v2_version 0 -y deep-clean.mp3 2>&1 | grep -E "Duration|Output"

echo ""
echo "✅ Conversion complete!"
echo ""
echo "📊 File sizes:"
ls -lh *.mp3 | awk '{print $9, $5}'

echo ""
echo "🔍 File formats:"
file *.mp3

echo ""
echo "✨ All files converted to React Native compatible MP3 format!"
echo "   - No ID3 tags"
echo "   - Mono audio"
echo "   - 44100 Hz sample rate"
echo "   - 128 kbps constant bitrate"
echo ""
echo "🔄 Please restart your app to reload the sounds."
