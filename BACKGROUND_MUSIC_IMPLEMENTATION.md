# Background Music Implementation

## Overview
Added background music support to enhance the user experience during onboarding and in the main app.

## Changes Made

### 1. Sound Manager Updates (`lib/soundManager.ts`)
- Added background music instance management (separate from sound effects)
- Added new methods:
  - `playBackgroundMusic(key, source, volume, loop)` - Start background music
  - `stopBackgroundMusic()` - Stop current background music
  - `setBackgroundMusicVolume(volume)` - Adjust volume
  - `pauseBackgroundMusic()` - Pause music
  - `resumeBackgroundMusic()` - Resume music
- Added new sound keys:
  - `ONBOARDING_MUSIC` - For onboarding flow
  - `GAME_MUSIC` - For main app

### 2. Onboarding Music (`app/onboarding/welcome.tsx`)
- Starts background music when welcome screen loads
- Uses `gamemusic.mp3` at 20% volume
- Loops continuously throughout onboarding
- Stops when user completes onboarding (in `goal-setup.tsx`)

### 3. Main App Music (`app/(tabs)/index.tsx`)
- Starts background music when entering main app
- Uses `gamemusic.mp3` at 15% volume (lower than onboarding)
- Loops continuously while in main app
- Stops when leaving the app

## Music Files Used
- **Onboarding**: `assets/sounds/background_music/gamemusic.mp3`
- **Main App**: `assets/sounds/background_music/gamemusic.mp3`

## Volume Levels
- **Onboarding**: 0.2 (20%) - Slightly higher for welcoming feel
- **Main App**: 0.15 (15%) - Lower to not interfere with focus sessions

## Technical Details

### Background Music vs Sound Effects
- Background music uses a single instance (not multiple like sound effects)
- Background music is looped by default
- Background music volume is lower to not interfere with UI sounds
- Background music is automatically stopped when switching contexts

### Cleanup
- Music is properly cleaned up when:
  - User completes onboarding
  - User leaves the main app
  - Component unmounts
- Uses React useEffect cleanup functions for proper memory management

## Future Enhancements
- Add user preference to enable/disable background music
- Add different music tracks for different times of day
- Add fade in/out transitions between tracks
- Add music for focus sessions (separate from main app)
