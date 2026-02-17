# Background Music Implementation

## Overview
Added background music support to enhance the user experience during onboarding and in the main app. Music automatically stops during focus sessions and sleep to avoid distractions.

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
- Automatically restarts when returning from focus session or sleep
- Stops when leaving the app

### 4. Focus Session Silence (`app/study-session.tsx`)
- Stops background music when focus session starts
- Allows user to concentrate without distractions
- Music automatically restarts when returning to home screen

### 5. Sleep Silence (`app/hooks/useSleepTracking.tsx`)
- Stops background music when sleep session starts
- Provides quiet environment for rest
- Music automatically restarts after waking up (3 seconds after wake-up animation)

## Music Files Used
- **Onboarding**: `assets/sounds/background_music/gamemusic.mp3`
- **Main App**: `assets/sounds/background_music/gamemusic.mp3`

## Volume Levels
- **Onboarding**: 0.2 (20%) - Slightly higher for welcoming feel
- **Main App**: 0.15 (15%) - Lower to not interfere with focus sessions

## Music Behavior

### When Music Plays:
- ✅ Onboarding flow (welcome → character select → name → profile → habits → goals)
- ✅ Main app home screen
- ✅ Stats screen
- ✅ Focus screen (mission control)
- ✅ Shop screen
- ✅ Settings screen

### When Music Stops:
- ❌ During focus sessions (study time)
- ❌ During sleep sessions
- ❌ When completing onboarding (transitions to main app music)

### Automatic Restart:
- Music automatically restarts when:
  - Returning from focus session to home screen
  - Waking up from sleep (after 3-second wake-up animation)
  - Navigating back to any main app tab

## Technical Details

### Background Music vs Sound Effects
- Background music uses a single instance (not multiple like sound effects)
- Background music is looped by default
- Background music volume is lower to not interfere with UI sounds
- Background music is automatically stopped when switching contexts

### Cleanup
- Music is properly cleaned up when:
  - User completes onboarding
  - User starts a focus session
  - User starts sleeping
  - User leaves the main app
  - Component unmounts
- Uses React useEffect cleanup functions for proper memory management

## Future Enhancements
- Add user preference to enable/disable background music
- Add different music tracks for different times of day
- Add fade in/out transitions between tracks
- Add separate ambient sounds for focus sessions (optional)
- Add volume control in settings

