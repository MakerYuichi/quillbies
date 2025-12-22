import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StudySessionTutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function StudySessionTutorialModal({ visible, onClose }: StudySessionTutorialModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>📚 Study Session Guide</Text>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>☕ Coffee Boost</Text>
              <Text style={styles.sectionText}>
                • +6 focus for 3 minutes{'\n'}
                • 3 free uses per day{'\n'}
                • Costs 3 coins per use{'\n'}
                • Premium: +15 focus for 5min (15 coins)
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍎 Apple Snack</Text>
              <Text style={styles.sectionText}>
                • +3 focus instantly{'\n'}
                • 5 free uses per day{'\n'}
                • Costs 2 coins per use{'\n'}
                • Premium: +10 focus (10 coins)
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Focus Score</Text>
              <Text style={styles.sectionText}>
                • Stay in the app to maintain focus{'\n'}
                • Leaving reduces your focus score{'\n'}
                • Higher focus = more rewards{'\n'}
                • Use boosts to recover focus
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⏸️ Breaks</Text>
              <Text style={styles.sectionText}>
                • Take breaks to restore energy{'\n'}
                • 5-minute breaks recommended{'\n'}
                • Return to continue studying{'\n'}
                • Track your total study time
              </Text>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Pro Tip</Text>
              <Text style={styles.tipText}>
                Use coffee early in your session for maximum benefit. Save apples for when your focus drops!
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got it! 🚀</Text>
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
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 18,
    color: '#1976D2',
    marginBottom: 8,
  },
  sectionText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  tipBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  tipTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#F57C00',
    marginBottom: 8,
  },
  tipText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});
