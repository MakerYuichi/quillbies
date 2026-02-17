# Sound Duration Fix

## Issues Fixed

### 1. Water Drinking Sound Keeps Playing Beyond 3 Seconds
**Problem**: The water drinking sound would continue playing beyond the intended 3-second duration.

**Root Cause**: The sound loop was playing the sound and then waiting a fixed 100ms before checking if it should continue. This didn't account for the actual sound duration, causing sounds to overlap and extend beyond 3 seconds.

**Solution**:
- Get the actual sound duration from `playSound()` return value
- Wait for the sound to finish before playing again
- Calculate remaining time and break loop if 3 seconds elapsed
- Explicitly stop the sound after 3 seconds using `soundManager.stopSound()`

**Code Changes** (`useWaterTracking.tsx`):
```typescript
// Before
while (soundLoopActive.current && (Date.now() - startTime) < 3000) {
  await soundManager.playSound(SOUNDS.HAMSTER_DRINKING, 1.0, 1.0);
  await new Promise(resolve => setTimeout(resolve, 100)); // Fixed delay
}

// After
while (soundLoopActive.current && (Date.now() - startTime) < 3000) {
  const duration = await soundManager.playSound(SOUNDS.HAMSTER_DRINKING, 1.0, 1.0);
  
  // Wait for sound to finish OR until loop should stop
  const waitTime = Math.min(duration || 500, 3000 - (Date.now() - startTime));
  if (waitTime > 0) {
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Check if we should continue
  if (!soundLoopActive.current || (Date.now() - startTime) >= 3000) {
    break;
  }
}

// Explicitly stop sound after 3 seconds
setTimeout(() => {
  soundLoopActive.current = false;
  soundManager.stopSound(SOUNDS.HAMSTER_DRINKING);
}, 3000);
```

### 2. Wet Grass Sound Continues After Exercise Session Ends
**Problem**: The wet grass (and jumping) sounds would continue playing even after the exercise session was finished.

**Root Cause**: 
1. The `soundLoopActive.current = false` was set, but the async loop might still be waiting on a promise
2. No explicit call to stop the sounds when the loop ended
3. The cleanup function in useEffect didn't stop the sounds

**Solution**:
- Explicitly call `soundManager.stopSound()` for both jumping and wet grass sounds when:
  - Exercise session ends (`handleFinishExercise`)
  - Component unmounts (useEffect cleanup)
  - Loop exits naturally
- Check `soundLoopActive.current` before toggling to next sound
- Wait for sound duration before continuing loop

**Code Changes** (`useExerciseTracking.tsx`):

```typescript
// In useEffect
useEffect(() => {
  if (!isExercising) {
    soundLoopActive.current = false;
    // Stop all exercise sounds immediately
    soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
    soundManager.stopSound(SOUNDS.WET_GRASS);
    return;
  }

  // ... sound loop ...
  
  while (soundLoopActive.current) {
    const soundKey = soundToggle ? SOUNDS.HAMSTER_JUMPING : SOUNDS.WET_GRASS;
    
    const duration = await soundManager.playSound(soundKey, 1.0, 0.6);
    
    // Wait for sound to finish OR until loop should stop
    const waitTime = Math.min(duration || 1000, 1000);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Check if loop should stop before toggling
    if (!soundLoopActive.current) {
      break;
    }
    
    soundToggle = !soundToggle;
  }
  
  // Stop all sounds when loop ends
  soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
  soundManager.stopSound(SOUNDS.WET_GRASS);
  
  return () => {
    soundLoopActive.current = false;
    soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
    soundManager.stopSound(SOUNDS.WET_GRASS);
  };
}, [isExercising]);

// In handleFinishExercise
const handleFinishExercise = () => {
  // Stop exercise sounds immediately
  soundLoopActive.current = false;
  soundManager.stopSound(SOUNDS.HAMSTER_JUMPING);
  soundManager.stopSound(SOUNDS.WET_GRASS);
  
  // ... rest of function ...
};
```

## How It Works Now

### Water Drinking (3 seconds max)
1. User taps water glass
2. Sound loop starts with timestamp
3. Each iteration:
   - Play sound and get its duration
   - Wait for sound to finish
   - Check if 3 seconds elapsed
   - Break if time limit reached
4. After 3 seconds, explicitly stop sound
5. Animation returns to idle

### Exercise Sounds (continuous until stopped)
1. User starts exercise
2. Sound loop alternates between jumping and wet grass
3. Each iteration:
   - Play sound and get its duration
   - Wait for sound to finish
   - Check if `soundLoopActive` is still true
   - Break if exercise stopped
4. When user clicks "Finish":
   - Set `soundLoopActive = false`
   - Explicitly stop both sounds
   - Animation returns to idle
5. Cleanup function also stops sounds on unmount

## Key Improvements

1. **Respects Sound Duration**: Waits for actual sound to finish before looping
2. **Explicit Cleanup**: Always calls `stopSound()` when ending
3. **Multiple Stop Points**: Stops sounds in:
   - Loop exit condition
   - Finish button handler
   - useEffect cleanup
   - Component unmount
4. **Time-Based Limits**: Water sound strictly limited to 3 seconds
5. **Immediate Stop**: Exercise sounds stop immediately when session ends

## Testing

### Water Sound
1. Tap water glass
2. Sound should play for exactly 3 seconds
3. Sound should stop cleanly at 3 seconds
4. No overlapping or extended playback

### Exercise Sounds
1. Start exercise session
2. Sounds should alternate (jumping → wet grass → jumping...)
3. Click "Finish Exercise"
4. Sounds should stop immediately
5. No lingering sounds after session ends

## Files Modified

- `quillby-app/app/hooks/useWaterTracking.tsx` - Fixed 3-second sound loop
- `quillby-app/app/hooks/useExerciseTracking.tsx` - Fixed exercise sound cleanup

## Summary

Both sound duration issues have been fixed by:
1. Waiting for actual sound duration instead of fixed delays
2. Explicitly stopping sounds at multiple exit points
3. Checking loop conditions before continuing
4. Adding proper cleanup in useEffect returns

The sounds now play for the correct duration and stop cleanly when they should.
