# Sound Integration Guide

## Current Implementation

The meal logging feature now includes sound support with the following features:

### Features Implemented:
1. **Sound Manager** (`lib/soundManager.ts`)
   - Centralized sound management system
   - Supports playback rate adjustment (for faster/slower sounds)
   - Returns sound duration for animation timing
   - Handles loading, playing, stopping, and unloading sounds

2. **Meal Tracking with Sound** (`app/hooks/useMealTracking.tsx`)
   - Plays hamster eating sound at 1.5x speed when logging meals
   - Shows eating animation for the duration of the sound
   - Automatically returns to idle after sound completes
   - Falls back to 2-second animation if sound not available

### How It Works:
1. User taps meal button
2. Sound plays at 1.5x speed (faster playback)
3. Eating animation shows for the duration of the sound
4. Animation automatically stops when sound finishes
5. Returns to idle state

## Adding Sound Files

### Step 1: Add Sound File
Place your `hamster_eating.mp3` file in:
```
quillby-app/assets/sounds/character/hamster_eating.mp3
```

### Step 2: Enable Sound Loading
In `lib/soundManager.ts`, uncomment the preload code:

```typescript
export async function preloadSounds(): Promise<void> {
  console.log('[Sound] Preloading sounds...');
  
  // Uncomment this:
  await soundManager.loadSound(
    SOUNDS.HAMSTER_EATING,
    require('../assets/sounds/character/hamster_eating.mp3')
  );
  
  console.log('[Sound] Preloading complete');
}
```

### Step 3: Call Preload on App Start
In `app/_layout.tsx`, add to the initialization:

```typescript
import { preloadSounds } from '../lib/soundManager';

// In your useEffect or initialization:
useEffect(() => {
  preloadSounds();
}, []);
```

## Sound Specifications

For best results, your sound files should meet these specs:

- **Format**: MP3
- **Duration**: 1-3 seconds (will be played at 1.5x speed)
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192 kbps
- **Volume**: Normalized to -14 LUFS
- **Channels**: Mono or Stereo

## Testing

1. Add the sound file
2. Enable preloading
3. Restart the app
4. Tap the meal button
5. You should hear the sound and see the animation

## Future Enhancements

Ready to add:
- Water drinking sound (`hamster_drinking.mp3`)
- Happy sound when goals completed (`hamster_happy.mp3`)
- Sad sound when missing goals (`hamster_sad.mp3`)
- Sleeping sound (`hamster_sleeping.mp3`)

All follow the same pattern as the meal sound implementation.
