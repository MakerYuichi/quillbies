import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QbiesInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const EARN_METHODS = [
  { icon: '📚', label: 'Focus Sessions', description: 'Complete study sessions to earn Q-Bies' },
  { icon: '🏆', label: 'Achievements', description: 'Unlock achievements for big Q-Bies rewards' },
  { icon: '🧹', label: 'Clean Your Room', description: 'Tidy up your virtual room for bonus Q-Bies' },
  { icon: '💧', label: 'Daily Habits', description: 'Log water, meals & exercise every day' },
  { icon: '🎟️', label: 'Promo Codes', description: 'Redeem promo codes for free Q-Bies' },
];

export default function QbiesInfoModal({ visible, onClose }: QbiesInfoModalProps) {
  const userData = useQuillbyStore((state) => state.userData);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Image
                source={require('../../../assets/overall/qbies.png')}
                style={styles.titleIcon}
                resizeMode="contain"
              />
              <Text style={styles.title}>Q-Bies</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <View style={styles.balanceRow}>
              <Image
                source={require('../../../assets/overall/qbies.png')}
                style={styles.balanceIcon}
                resizeMode="contain"
              />
              <Text style={styles.balanceValue}>{userData.qCoins ?? 0}</Text>
            </View>
          </View>

          {/* Info */}
          <Text style={styles.sectionTitle}>How to Earn Q-Bies</Text>
          <Text style={styles.subtitle}>
            Q-Bies are earned by building good habits — you can't buy them!
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {EARN_METHODS.map((method, index) => (
              <View key={index} style={styles.methodRow}>
                <Text style={styles.methodIcon}>{method.icon}</Text>
                <View style={styles.methodText}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: SCREEN_WIDTH * 0.88,
    maxHeight: '75%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    width: 26,
    height: 26,
  },
  title: {
    fontSize: 20,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FF9800',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  balanceContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF9800',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#E65100',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceIcon: {
    width: 28,
    height: 28,
  },
  balanceValue: {
    fontSize: 28,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#E65100',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#888',
    marginBottom: 12,
  },
  list: {
    maxHeight: 220,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 12,
  },
  methodIcon: {
    fontSize: 26,
    width: 36,
    textAlign: 'center',
  },
  methodText: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 13,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 11,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#888',
  },
  doneButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  doneButtonText: {
    fontSize: 15,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#FFF',
  },
});
