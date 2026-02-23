// Mini Volume Settings Modal
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { soundManager } from '../../../lib/soundManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VolumeSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const VOLUME_STORAGE_KEY = 'quillby-volume-settings';

export default function VolumeSettingsModal({
  visible,
  onClose,
}: VolumeSettingsModalProps) {
  const [musicVolume, setMusicVolume] = useState(0.15); // 15% default
  const [sfxVolume, setSfxVolume] = useState(1.0); // 100% default

  // Load saved volumes on mount
  useEffect(() => {
    loadVolumes();
  }, []);

  const loadVolumes = async () => {
    try {
      const saved = await AsyncStorage.getItem(VOLUME_STORAGE_KEY);
      if (saved) {
        const { music, sfx } = JSON.parse(saved);
        setMusicVolume(music);
        setSfxVolume(sfx);
        
        // Apply to sound manager
        soundManager.setBackgroundVolume(music);
        soundManager.setSFXVolume(sfx);
      }
    } catch (error) {
      console.error('[VolumeSettings] Failed to load volumes:', error);
    }
  };

  const saveVolumes = async (music: number, sfx: number) => {
    try {
      await AsyncStorage.setItem(
        VOLUME_STORAGE_KEY,
        JSON.stringify({ music, sfx })
      );
    } catch (error) {
      console.error('[VolumeSettings] Failed to save volumes:', error);
    }
  };

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    soundManager.setBackgroundVolume(value);
    saveVolumes(value, sfxVolume);
  };

  const handleSFXVolumeChange = (value: number) => {
    setSfxVolume(value);
    soundManager.setSFXVolume(value);
    saveVolumes(musicVolume, value);
    
    // Play a test sound
    soundManager.playSound('TAB_SWITCH', 1.0, value);
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header with Quillby */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/hamsters/casual/idle-sit-happy.png')}
              style={styles.quillbyImage}
              resizeMode="contain"
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>🔊 Volume Settings</Text>
              <Text style={styles.subtitle}>Adjust your audio preferences</Text>
            </View>
          </View>

          {/* Music Volume */}
          <View style={styles.volumeSection}>
            <View style={styles.volumeHeader}>
              <Text style={styles.volumeLabel}>🎵 Background Music</Text>
              <Text style={styles.volumeValue}>{formatPercentage(musicVolume)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={musicVolume}
              onValueChange={handleMusicVolumeChange}
              minimumTrackTintColor="#FF9800"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#FF9800"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Mute</Text>
              <Text style={styles.sliderLabel}>Max</Text>
            </View>
          </View>

          {/* SFX Volume */}
          <View style={styles.volumeSection}>
            <View style={styles.volumeHeader}>
              <Text style={styles.volumeLabel}>🔔 Button Sounds</Text>
              <Text style={styles.volumeValue}>{formatPercentage(sfxVolume)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={sfxVolume}
              onValueChange={handleSFXVolumeChange}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#4CAF50"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Mute</Text>
              <Text style={styles.sliderLabel}>Max</Text>
            </View>
          </View>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Tip: Slide to adjust volume. Changes are saved automatically!
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quillbyImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  volumeSection: {
    marginBottom: 24,
  },
  volumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  volumeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 11,
    color: '#999',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
  },
  closeButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
