// Floating Volume Button - Shows on all screens
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VolumeSettingsModal from '../modals/VolumeSettingsModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VolumeButtonProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export default function VolumeButton({
  position = 'top-right',
  top,
  right,
  bottom,
  left,
}: VolumeButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const getPositionStyle = () => {
    // Use custom positions if provided
    if (top !== undefined || right !== undefined || bottom !== undefined || left !== undefined) {
      return { top, right, bottom, left };
    }

    // Otherwise use preset positions with responsive values
    switch (position) {
      case 'top-left':
        return { 
          top: SCREEN_HEIGHT * 0.070,  // 60/852 = 0.070
          left: SCREEN_WIDTH * 0.041   // 16/393 = 0.041
        };
      case 'top-right':
        return { 
          top: SCREEN_HEIGHT * 0.070,  // 60/852 = 0.070
          right: SCREEN_WIDTH * 0.041  // 16/393 = 0.041
        };
      case 'bottom-left':
        return { 
          bottom: SCREEN_HEIGHT * 0.106,  // 90/852 = 0.106
          left: SCREEN_WIDTH * 0.041      // 16/393 = 0.041
        };
      case 'bottom-right':
        return { 
          bottom: SCREEN_HEIGHT * 0.106,  // 90/852 = 0.106
          right: SCREEN_WIDTH * 0.041     // 16/393 = 0.041
        };
      default:
        return { 
          top: SCREEN_HEIGHT * 0.070,  // 60/852 = 0.070
          right: SCREEN_WIDTH * 0.041  // 16/393 = 0.041
        };
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, getPositionStyle()]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="volume-medium" size={22} color="#FFF" />
      </TouchableOpacity>

      <VolumeSettingsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
});
