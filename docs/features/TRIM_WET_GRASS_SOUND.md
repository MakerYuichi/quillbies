# Trim Wet Grass Sound File

## Problem
The wet grass sound file is 7.6MB, which is too large and causes slow loading and performance issues.

## Solution
Trim the file to 3-5 seconds and loop it during exercise.

## Option 1: Using Online Tool (Easiest)

1. Go to https://mp3cut.net/ or https://audiotrimmer.com/
2. Upload `quillby-app/assets/sounds/background_music/wet-grass.mp3`
3. Select the first 3-5 seconds of the audio
4. Export as MP3 with these settings:
   - Format: MP3
   - Bitrate: 128 kbps (or lower for smaller size)
   - Sample Rate: 44100 Hz
5. Download and replace the original file

## Option 2: Using ffmpeg (Command Line)

If you have ffmpeg installed:

```bash
# Navigate to the sounds directory
cd quillby-app/assets/sounds/background_music/

# Backup original file
cp wet-grass.mp3 wet-grass-original.mp3

# Trim to first 3 seconds
ffmpeg -i wet-grass-original.mp3 -t 3 -acodec libmp3lame -b:a 128k wet-grass.mp3

# Or trim to first 5 seconds
ffmpeg -i wet-grass-original.mp3 -t 5 -acodec libmp3lame -b:a 128k wet-grass.mp3
```

## Option 3: Install ffmpeg (if not installed)

### On macOS:
```bash
brew install ffmpeg
```

### On Windows:
Download from https://ffmpeg.org/download.html

### On Linux:
```bash
sudo apt-get install ffmpeg
```

## Recommended Settings

For the wet grass background sound:
- **Duration**: 3-5 seconds (will loop during exercise)
- **Bitrate**: 96-128 kbps (good quality, smaller size)
- **Sample Rate**: 44100 Hz
- **Format**: MP3
- **Expected Size**: 50-100 KB (much smaller than 7.6MB!)

## After Trimming

1. Replace the file in `quillby-app/assets/sounds/background_music/wet-grass.mp3`
2. The app will automatically loop this shorter sound every 3 seconds during exercise
3. Much faster loading and better performance!

## Alternative: Use a Different Sound

If trimming is difficult, you can:
1. Find a shorter wet grass/nature ambience sound (3-5 seconds)
2. Download from free sound libraries like:
   - https://freesound.org/
   - https://www.zapsplat.com/
   - https://mixkit.co/free-sound-effects/
3. Replace the current file

## Current Implementation

The app is already set up to loop the sound every 3 seconds:
```typescript
// In useExerciseTracking.tsx
await soundManager.playSound(SOUNDS.WET_GRASS, 1.0, 0.5);
await new Promise(resolve => setTimeout(resolve, 3000)); // Loop every 3 seconds
```

So a 3-5 second sound file is perfect!
