import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChangeHamsterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (character: string) => void;
  currentCharacter?: string;
}

const HAMSTER_OPTIONS = [
  {
    id: 'casual',
    name: 'Casual Hammy',
    description: 'Relaxed and easygoing',
    image: require('../../../assets/onboarding/hamster-casual.png'),
  },
  {
    id: 'energetic',
    name: 'Energetic Hammy',
    description: 'Full of energy and enthusiasm',
    image: require('../../../assets/onboarding/hamster-energetic.png'),
  },
  {
    id: 'scholar',
    name: 'Scholar Hammy',
    description: 'Studious and focused',
    image: require('../../../assets/onboarding/hamster-scholar.png'),
  },
];

export default function ChangeHamsterModal({
  visible,
  onClose,
  onSelect,
  currentCharacter = 'casual',
}: ChangeHamsterModalProps) {
  const [selectedCharacter, setSelectedCharacter] = useState(currentCharacter);

  const handleConfirm = () => {
    onSelect(selectedCharacter);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choose Your Hamster</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Hamster Options */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {HAMSTER_OPTIONS.map((hamster) => (
              <TouchableOpacity
                key={hamster.id}
                style={[
                  styles.hamsterCard,
                  selectedCharacter === hamster.id && styles.hamsterCardSelected,
                ]}
                onPress={() => setSelectedCharacter(hamster.id)}
              >
                <Image source={hamster.image} style={styles.hamsterImage} resizeMode="contain" />
                <View style={styles.hamsterInfo}>
                  <Text style={styles.hamsterName}>{hamster.name}</Text>
                  <Text style={styles.hamsterDescription}>{hamster.description}</Text>
                </View>
                {selectedCharacter === hamster.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.7,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  hamsterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  hamsterCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  hamsterImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  hamsterInfo: {
    flex: 1,
  },
  hamsterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  hamsterDescription: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
