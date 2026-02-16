# Cleaning Sound Format Issues

## Problem
The cleaning sound files have format compatibility issues with React Native's ExoPlayer:

### File Analysis
```
broom.mp3:      IFF data, AIFF audio (NOT MP3!)
deep-clean.mp3: WAVE audio, 24-bit stereo 44100 Hz (24-bit not supported)
scrub.mp3:      WAVE audio, 16-bit mono 44100 Hz (WORKS!)
```

### Issues Found
1. **broom.mp3**: Actually an AIFF file disguised as MP3
   - Error: `UnrecognizedInputFormatException: None of the available extractors could read the stream`
   
2. **deep-clean.mp3**: 24-bit stereo WAV file
   - Error: `Player does not exist` (format not fully supported)
   - Loads successfully but fails during playback
   
3. **scrub.mp3**: 16-bit mono WAV file
   - ✅ Works perfectly!

## Current Workaround
Using `scrub.mp3` for all cleaning stages since it's the only working sound file.

## Permanent Fix
Convert the problematic sound files to proper MP3 format:

### Option 1: Using FFmpeg (Recommended)
```bash
cd quillby-app/assets/sounds/mess/

# Convert broom.mp3 (AIFF to MP3)
ffmpeg -i broom.mp3 -acodec libmp3lame -ab 128k -ar 44100 -ac 1 broom-fixed.mp3

# Convert deep-clean.mp3 (24-bit WAV to 16-bit MP3)
ffmpeg -i deep-clean.mp3 -acodec libmp3lame -ab 128k -ar 44100 -ac 1 deep-clean-fixed.mp3

# Replace original files
mv broom-fixed.mp3 broom.mp3
mv deep-clean-fixed.mp3 deep-clean.mp3
```

### Option 2: Using Online Converter
1. Go to https://cloudconvert.com/mp3-converter
2. Upload broom.mp3 and deep-clean.mp3
3. Convert to MP3 format with these settings:
   - Audio Codec: MP3
   - Bitrate: 128 kbps
   - Sample Rate: 44100 Hz
   - Channels: Mono
4. Download and replace the original files

### Option 3: Using Audacity
1. Open each file in Audacity
2. File → Export → Export as MP3
3. Settings:
   - Bit Rate Mode: Constant
   - Quality: 128 kbps
   - Channel Mode: Mono
   - Sample Rate: 44100 Hz
4. Save and replace original files

## After Conversion
Once files are converted, update the code to use different sounds per stage:

```typescript
// In handleCleaningTap function
if (cleaningStage <= 2) {
  await soundManager.playSound(SOUNDS.SCRUB, 1.0, 1.0);
} else {
  await soundManager.playSound(SOUNDS.DEEP_CLEAN, 1.0, 1.0);
}
```

## Testing
After conversion, test with the "🔊 TEST: Play Cleaning Sounds" button:
- Both SCRUB and DEEP_CLEAN should play without errors
- No "Player does not exist" warnings
- Both sounds should be audible

## Files Modified
- `quillby-app/app/(tabs)/index.tsx` - Using SCRUB for all stages temporarily
- `quillby-app/lib/soundManager.ts` - Improved error handling for corrupted players
