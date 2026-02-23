// Floating Volume Button - Shows on all screens
import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VolumeSettingsModal from '../modals/VolumeSettingsModal';

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

    // Otherwise use preset positions
    switch (position) {
      case 'top-left':
        return { top: 50, left: 16 };
      case 'top-right':
        return { top: 50, right: 16 };
      case 'bottom-left':
        return { bottom: 90, left: 16 };
      case 'bottom-right':
        return { bottom: 90, right: 16 };
      default:
        return { top: 50, right: 16 };
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
