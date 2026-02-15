import { Audio } from 'expo-av';

// Sound manager for playing app sounds
class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isAvailable: boolean = false;

  constructor() {
    // Check if Audio is available
    try {
      if (Audio) {
        this.isAvailable = true;
        console.log('[Sound] expo-av is available');
      }
    } catch (error) {
      console.warn('[Sound] expo-av not available, sounds disabled:', error);
      this.isAvailable = false;
    }
  }

  async loadSound(key: string, source: any): Promise<void> {
    if (!this.isAvailable) {
      console.log('[Sound] Audio not available, skipping load:', key);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(source);
      this.sounds.set(key, sound);
      console.log(`[Sound] Loaded: ${key}`);
    } catch (error) {
      console.warn(`[Sound] Failed to load ${key}:`, error);
    }
  }

  async playSound(key: string, rate: number = 1.0, volume: number = 1.0): Promise<number> {
    if (!this.isAvailable || !this.isEnabled) {
      console.log(`[Sound] Audio not available or disabled, skipping: ${key}`);
      return 0;
    }

    try {
      const sound = this.sounds.get(key);
      if (!sound) {
        console.warn(`[Sound] Sound not loaded: ${key}`);
        return 0;
      }

      // Stop if already playing
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      
      // Set volume (0.0 to 1.0)
      await sound.setVolumeAsync(volume);
      
      // Set playback rate for speed adjustment
      await sound.setRateAsync(rate, true);
      
      // Get duration before playing
      const status = await sound.getStatusAsync();
      const duration = status.isLoaded ? (status.durationMillis || 0) / rate : 0;
      
      await sound.playAsync();
      console.log(`[Sound] Playing: ${key} at ${rate}x speed, volume: ${volume} (${duration}ms)`);
      
      return duration;
    } catch (error) {
      console.warn(`[Sound] Failed to play ${key}:`, error);
      return 0;
    }
  }

  async stopSound(key: string): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const sound = this.sounds.get(key);
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }
    } catch (error) {
      console.warn(`[Sound] Failed to stop ${key}:`, error);
    }
  }

  async unloadSound(key: string): Promise<void> {
    if (!this.isAvailable) return;

    try {
      const sound = this.sounds.get(key);
      if (sound) {
        await sound.unloadAsync();
        this.sounds.delete(key);
        console.log(`[Sound] Unloaded: ${key}`);
      }
    } catch (error) {
      console.warn(`[Sound] Failed to unload ${key}:`, error);
    }
  }

  async unloadAll(): Promise<void> {
    if (!this.isAvailable) return;

    for (const [key, sound] of this.sounds.entries()) {
      try {
        await sound.unloadAsync();
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
}

// Export singleton instance
export const soundManager = new SoundManager();

// Sound keys
export const SOUNDS = {
  HAMSTER_EATING: 'hamster_eating',
  HAMSTER_DRINKING: 'hamster_drinking',
  HAMSTER_HAPPY: 'hamster_happy',
  HAMSTER_SAD: 'hamster_sad',
  HAMSTER_SLEEPING: 'hamster_sleeping',
  WATER_LOG: 'water_log',
  MEAL_LOG: 'meal_log',
  EXERCISE_LOG: 'exercise_log',
  COIN_EARNED: 'coin_earned',
  BUTTON_CLICK: 'button_click',
};

// Preload essential sounds
export async function preloadSounds(): Promise<void> {
  console.log('[Sound] Preloading sounds...');
  
  try {
    await soundManager.loadSound(
      SOUNDS.HAMSTER_EATING,
      require('../assets/sounds/character/hamster_eating.mp3')
    );
    console.log('[Sound] Hamster eating sound loaded');
  } catch (error) {
    console.warn('[Sound] Failed to load hamster eating sound:', error);
  }
  
  // Add more sounds here as needed:
  // await soundManager.loadSound(
  //   SOUNDS.HAMSTER_DRINKING,
  //   require('../assets/sounds/character/hamster_drinking.mp3')
  // );
  
  console.log('[Sound] Preloading complete');
}
