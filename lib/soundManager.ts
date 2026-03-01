import { Audio } from 'expo-av';

// Sound manager for playing app sounds
class SoundManager {
  private sounds: Map<string, Audio.Sound[]> = new Map(); // Store multiple instances
  private backgroundMusic: Audio.Sound | null = null; // Single instance for background music
  private currentBackgroundMusicKey: string | null = null;
  private isEnabled: boolean = true;
  private isAvailable: boolean = false;
  private isInitialized: boolean = false;
  private isActivated: boolean = false; // Track if audio system is activated
  private soundInstances: number = 1; // Use single instance for reliability
  private backgroundVolume: number = 0.15; // Default 15%
  private sfxVolume: number = 1.0; // Default 100%

  constructor() {
    // Check if Audio is available
    try {
      if (Audio) {
        this.isAvailable = true;
        console.log('[Sound] expo-av is available');
        this.initializeAudio();
      }
    } catch (error) {
      console.warn('[Sound] expo-av not available, sounds disabled:', error);
      this.isAvailable = false;
    }
  }

  async initializeAudio(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Set audio mode for better performance and audibility
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false, // Don't duck - play at full volume
        interruptionModeIOS: 2, // Mix with others
        interruptionModeAndroid: 2, // Mix with others
        playThroughEarpieceAndroid: false, // Use speaker, not earpiece
      });
      this.isInitialized = true;
      console.log('[Sound] Audio mode initialized');
    } catch (error) {
      console.warn('[Sound] Failed to initialize audio mode:', error);
    }
  }

  // Activate audio system on first user interaction
  async activate(): Promise<void> {
    if (this.isActivated || !this.isAvailable) return;
    
    try {
      console.log('[Sound] Unlocking audio system...');
      
      // Play a silent sound to activate the audio system
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=' },
        { shouldPlay: true, volume: 0 }
      );
      
      // Let it play for a moment to ensure audio context is unlocked
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await sound.unloadAsync();
      this.isActivated = true;
      console.log('[Sound] Audio system unlocked and ready');
    } catch (error) {
      console.warn('[Sound] Failed to activate audio system:', error);
    }
  }

  async loadSound(key: string, source: any): Promise<void> {
    if (!this.isAvailable) {
      console.log('[Sound] Audio not available, skipping load:', key);
      return;
    }

    try {
      const instances: Audio.Sound[] = [];
      
      // Load multiple instances for instant playback
      for (let i = 0; i < this.soundInstances; i++) {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          volume: 1.0,
        });
        
        // Force the sound to load into memory by preparing it
        await sound.setStatusAsync({ 
          shouldPlay: false, 
          positionMillis: 0,
          progressUpdateIntervalMillis: 500,
        });
        
        // Get status to ensure it's loaded
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) {
          console.warn(`[Sound] Instance ${i} of ${key} failed to load`);
          continue;
        }
        
        instances.push(sound);
      }
      
      if (instances.length === 0) {
        console.error(`[Sound] Failed to load any instances of ${key}`);
        return;
      }
      
      this.sounds.set(key, instances);
      console.log(`[Sound] ✓ Loaded and ready: ${key} (${instances.length} instances)`);
    } catch (error) {
      console.warn(`[Sound] Failed to load ${key}:`, error);
    }
  }

  async playSound(key: string, rate: number = 1.0, volume: number = 1.0): Promise<number> {
    if (!this.isAvailable || !this.isEnabled) {
      return 0;
    }

    // Apply SFX volume multiplier
    const finalVolume = volume * this.sfxVolume;

    try {
      // Ensure audio is activated before playing
      if (!this.isActivated) {
        console.log('[Sound] First sound - activating audio system...');
        await this.activate();
        // CRITICAL: Wait for audio system to fully initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[Sound] Audio system ready');
      }

      const instances = this.sounds.get(key);
      if (!instances || instances.length === 0) {
        console.warn(`[Sound] Sound not loaded: ${key}`);
        return 0;
      }

      // Get the best available instance (not currently playing)
      let soundToPlay = null;
      const corruptedIndices: number[] = [];
      
      for (let i = 0; i < instances.length; i++) {
        const instance = instances[i];
        try {
          const status = await instance.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            soundToPlay = instance;
            break;
          }
        } catch (e) {
          // Instance might be corrupted, mark for removal
          console.warn(`[Sound] Skipping corrupted instance for ${key}`);
          corruptedIndices.push(i);
          continue;
        }
      }
      
      // Remove corrupted instances
      if (corruptedIndices.length > 0) {
        console.log(`[Sound] Removing ${corruptedIndices.length} corrupted instances for ${key}`);
        // Remove from end to start to maintain indices
        for (let i = corruptedIndices.length - 1; i >= 0; i--) {
          const idx = corruptedIndices[i];
          try {
            await instances[idx].unloadAsync();
          } catch (e) {
            // Ignore unload errors for corrupted instances
          }
          instances.splice(idx, 1);
        }
        
        // If all instances were corrupted, log error and return
        if (instances.length === 0) {
          console.error(`[Sound] All instances corrupted for ${key}, cannot play`);
          return 0;
        }
      }

      // If no available instance found, return early
      if (!soundToPlay) {
        console.error(`[Sound] No valid instance available for ${key}`);
        return 0;
      }

      // Verify the sound is still loaded before playing
      const status = await soundToPlay.getStatusAsync();
      if (!status.isLoaded) {
        console.error(`[Sound] Sound ${key} is not loaded, cannot play`);
        return 0;
      }

      // Only stop if it's currently playing
      if (status.isPlaying) {
        await soundToPlay.stopAsync();
      }
      
      // Reset position
      await soundToPlay.setPositionAsync(0);
      await soundToPlay.setVolumeAsync(finalVolume);
      await soundToPlay.setRateAsync(rate, true);
      
      // Play
      await soundToPlay.playAsync();
      console.log(`[Sound] ✓ Played ${key}`);
      
      return 0;
    } catch (error) {
      console.warn(`[Sound] Play error for ${key}:`, error);
      return 0;
    }
  }

  async stopSound(key: string): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const instances = this.sounds.get(key);
      if (instances) {
        for (const sound of instances) {
          await sound.stopAsync();
          await sound.setPositionAsync(0);
        }
      }
    } catch (error) {
      console.warn(`[Sound] Failed to stop ${key}:`, error);
    }
  }

  // Background music methods
  async playBackgroundMusic(key: string, source: any, volume: number = 0.3, loop: boolean = true): Promise<void> {
    if (!this.isAvailable || !this.isEnabled) {
      console.log('[Sound] Background music disabled or unavailable');
      return;
    }

    // Apply background volume multiplier
    const finalVolume = volume * this.backgroundVolume;

    try {
      // If same music is already playing, don't restart
      if (this.currentBackgroundMusicKey === key && this.backgroundMusic) {
        const status = await this.backgroundMusic.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          console.log(`[Sound] Background music ${key} already playing`);
          return;
        }
      }

      // Stop current background music if any
      await this.stopBackgroundMusic();

      console.log(`[Sound] Loading background music: ${key}`);
      
      // Load and play new background music
      const { sound } = await Audio.Sound.createAsync(
        source,
        {
          shouldPlay: true,
          volume: finalVolume,
          isLooping: loop,
        }
      );

      this.backgroundMusic = sound;
      this.currentBackgroundMusicKey = key;
      
      console.log(`[Sound] ✓ Background music ${key} started (volume: ${volume}, loop: ${loop})`);
    } catch (error) {
      console.warn(`[Sound] Failed to play background music ${key}:`, error);
    }
  }

  async stopBackgroundMusic(): Promise<void> {
    if (!this.isAvailable) return;

    try {
      if (this.backgroundMusic) {
        console.log(`[Sound] Stopping background music: ${this.currentBackgroundMusicKey}`);
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
        this.currentBackgroundMusicKey = null;
      }
    } catch (error) {
      console.warn('[Sound] Failed to stop background music:', error);
    }
  }

  async setBackgroundMusicVolume(volume: number): Promise<void> {
    if (!this.isAvailable || !this.backgroundMusic) return;

    try {
      await this.backgroundMusic.setVolumeAsync(volume);
      console.log(`[Sound] Background music volume set to ${volume}`);
    } catch (error) {
      console.warn('[Sound] Failed to set background music volume:', error);
    }
  }

  async pauseBackgroundMusic(): Promise<void> {
    if (!this.isAvailable || !this.backgroundMusic) return;

    try {
      await this.backgroundMusic.pauseAsync();
      console.log('[Sound] Background music paused');
    } catch (error) {
      console.warn('[Sound] Failed to pause background music:', error);
    }
  }

  async resumeBackgroundMusic(): Promise<void> {
    if (!this.isAvailable || !this.backgroundMusic) return;

    try {
      await this.backgroundMusic.playAsync();
      console.log('[Sound] Background music resumed');
    } catch (error) {
      console.warn('[Sound] Failed to resume background music:', error);
    }
  }

  async unloadSound(key: string): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const instances = this.sounds.get(key);
      if (instances) {
        for (const sound of instances) {
          await sound.unloadAsync();
        }
        this.sounds.delete(key);
        console.log(`[Sound] Unloaded: ${key}`);
      }
    } catch (error) {
      console.warn(`[Sound] Failed to unload ${key}:`, error);
    }
  }

  async unloadAll(): Promise<void> {
    if (!this.isAvailable) return;

    // Stop background music first
    await this.stopBackgroundMusic();

    for (const [key, instances] of this.sounds.entries()) {
      try {
        for (const sound of instances) {
          await sound.unloadAsync();
        }
        console.log(`[Sound] Unloaded: ${key}`);
      } catch (error) {
        console.warn(`[Sound] Failed to unload ${key}:`, error);
      }
    }
    this.sounds.clear();
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`[Sound] Sounds ${enabled ? 'enabled' : 'disabled'}`);
  }

  isLoaded(key: string): boolean {
    return this.sounds.has(key);
  }

  // Volume control methods
  setBackgroundVolume(volume: number): void {
    this.backgroundVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    if (this.backgroundMusic) {
      this.setBackgroundMusicVolume(this.backgroundVolume);
    }
    console.log(`[Sound] Background volume set to ${this.backgroundVolume}`);
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    console.log(`[Sound] SFX volume set to ${this.sfxVolume}`);
  }

  getBackgroundVolume(): number {
    return this.backgroundVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Sound keys
export const SOUNDS = {
  HAMSTER_EATING: 'hamster_eating',
  HAMSTER_DRINKING: 'hamster_drinking',
  HAMSTER_YAWN: 'hamster_yawn',
  HAMSTER_JUMPING: 'hamster_jumping',
  HAMSTER_HAPPY: 'hamster_happy',
  HAMSTER_SAD: 'hamster_sad',
  HAMSTER_SLEEPING: 'hamster_sleeping',
  WET_GRASS: 'wet_grass',
  BIRDS_CHIRPING: 'birds_chirping',
  WATER_LOG: 'water_log',
  MEAL_LOG: 'meal_log',
  EXERCISE_LOG: 'exercise_log',
  COIN_EARNED: 'coin_earned',
  BUTTON_CLICK: 'button_click',
  // UI Sounds
  TOGGLE: 'toggle',
  TAB: 'tab',
  END_SESSION: 'end_session',
  EQUIP: 'equip',
  UI_SUBMIT: 'ui_submit',
  // Study Actions
  COFFEE_SLURP: 'coffee_slurp',
  EATING_APPLE: 'eating_apple',
  // Cleaning Sounds
  BROOM: 'broom',
  SCRUB: 'scrub',
  DEEP_CLEAN: 'deep_clean',
  // Achievement Sound
  ACHIEVEMENT: 'achievement',
  // Background Music
  ONBOARDING_MUSIC: 'onboarding_music',
  GAME_MUSIC: 'game_music',
};

// Preload essential sounds
export async function preloadSounds(): Promise<void> {
  console.log('[Sound] Preloading sounds in parallel...');
  
  try {
    // Load all sounds in parallel for faster startup
    await Promise.all([
      soundManager.loadSound(
        SOUNDS.HAMSTER_EATING,
        require('../assets/sounds/character/hamster_eating.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.HAMSTER_DRINKING,
        require('../assets/sounds/character/drinking-water.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.HAMSTER_YAWN,
        require('../assets/sounds/character/yawn.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.HAMSTER_JUMPING,
        require('../assets/sounds/character/jumping.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.WET_GRASS,
        require('../assets/sounds/background_music/wet-grass.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.BIRDS_CHIRPING,
        require('../assets/sounds/background_music/birds-chirping.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.TOGGLE,
        require('../assets/sounds/ui_buttons/toggle.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.TAB,
        require('../assets/sounds/ui_buttons/tab.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.END_SESSION,
        require('../assets/sounds/ui_buttons/end-session.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.EQUIP,
        require('../assets/sounds/ui_buttons/equip.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.UI_SUBMIT,
        require('../assets/sounds/ui_buttons/ui-submit.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.ACHIEVEMENT,
        require('../assets/sounds/background_music/achievement.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.COFFEE_SLURP,
        require('../assets/sounds/study_actions/coffee-slurp.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.EATING_APPLE,
        require('../assets/sounds/study_actions/eating-an-apple.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.BROOM,
        require('../assets/sounds/mess/broom.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.SCRUB,
        require('../assets/sounds/mess/scrub.mp3')
      ),
      soundManager.loadSound(
        SOUNDS.DEEP_CLEAN,
        require('../assets/sounds/mess/deep-clean.mp3')
      ),
    ]);
    
    console.log('[Sound] ✅ All sounds preloaded successfully');
  } catch (error) {
    console.warn('[Sound] Failed to load some sounds:', error);
  }
  
  console.log('[Sound] Preloading complete');
}

// Helper functions for playing specific sounds - now properly async
export async function playToggleSound(): Promise<void> {
  await soundManager.playSound(SOUNDS.TOGGLE, 1.0, 1.0);
}

export async function playTabSound(): Promise<void> {
  await soundManager.playSound(SOUNDS.TAB, 1.0, 1.0);
}

export async function playEndSessionSound(): Promise<void> {
  await soundManager.playSound(SOUNDS.END_SESSION, 1.3, 1.0); // Increased speed to 1.3x
}

export async function playEquipSound(): Promise<void> {
  await soundManager.playSound(SOUNDS.EQUIP, 1.0, 0.3); // Reduced volume to 0.4
}

export async function playUISubmitSound(): Promise<void> {
  await soundManager.playSound(SOUNDS.UI_SUBMIT, 1.0, 0.1);
}

// Test cleaning sounds
export async function testCleaningSounds(): Promise<void> {
  console.log('[Sound] 🧪 Testing all cleaning sounds...');
  
  // Check if sounds are loaded
  const broomLoaded = soundManager.isLoaded(SOUNDS.BROOM);
  const scrubLoaded = soundManager.isLoaded(SOUNDS.SCRUB);
  const deepCleanLoaded = soundManager.isLoaded(SOUNDS.DEEP_CLEAN);
  
  console.log('[Sound] BROOM loaded:', broomLoaded);
  console.log('[Sound] SCRUB loaded:', scrubLoaded);
  console.log('[Sound] DEEP_CLEAN loaded:', deepCleanLoaded);
  
  // Test BROOM
  if (broomLoaded) {
    console.log('[Sound] 🔊 Playing BROOM test...');
    try {
      await soundManager.playSound(SOUNDS.BROOM, 1.0, 1.0);
      console.log('[Sound] ✅ BROOM test complete');
    } catch (err) {
      console.error('[Sound] ❌ BROOM test failed:', err);
    }
  } else {
    console.error('[Sound] ❌ BROOM not loaded!');
  }
  
  // Wait between sounds
  console.log('[Sound] ⏳ Waiting 1.5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Test SCRUB
  if (scrubLoaded) {
    console.log('[Sound] 🔊 Playing SCRUB test...');
    try {
      await soundManager.playSound(SOUNDS.SCRUB, 1.0, 1.0);
      console.log('[Sound] ✅ SCRUB test complete');
    } catch (err) {
      console.error('[Sound] ❌ SCRUB test failed:', err);
    }
  } else {
    console.error('[Sound] ❌ SCRUB not loaded!');
  }
  
  // Wait between sounds
  console.log('[Sound] ⏳ Waiting 1.5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Test DEEP_CLEAN
  if (deepCleanLoaded) {
    console.log('[Sound] 🔊 Playing DEEP_CLEAN test...');
    try {
      await soundManager.playSound(SOUNDS.DEEP_CLEAN, 1.0, 1.0);
      console.log('[Sound] ✅ DEEP_CLEAN test complete');
    } catch (err) {
      console.error('[Sound] ❌ DEEP_CLEAN test failed:', err);
    }
  } else {
    console.error('[Sound] ❌ DEEP_CLEAN not loaded!');
  }
  
  console.log('[Sound] 🏁 All tests complete');
}

// Reload cleaning sounds (use after converting sound files)
export async function reloadCleaningSounds(): Promise<void> {
  console.log('[Sound] 🔄 Reloading cleaning sounds...');
  
  try {
    // Unload old instances
    console.log('[Sound] Unloading old BROOM...');
    await soundManager.unloadSound(SOUNDS.BROOM);
    
    console.log('[Sound] Unloading old DEEP_CLEAN...');
    await soundManager.unloadSound(SOUNDS.DEEP_CLEAN);
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reload with new files
    console.log('[Sound] Loading new BROOM...');
    await soundManager.loadSound(
      SOUNDS.BROOM,
      require('../assets/sounds/mess/broom.mp3')
    );
    
    console.log('[Sound] Loading new DEEP_CLEAN...');
    await soundManager.loadSound(
      SOUNDS.DEEP_CLEAN,
      require('../assets/sounds/mess/deep-clean.mp3')
    );
    
    console.log('[Sound] ✅ Cleaning sounds reloaded successfully!');
    console.log('[Sound] 💡 Now test the sounds again');
  } catch (error) {
    console.error('[Sound] ❌ Failed to reload cleaning sounds:', error);
  }
}
