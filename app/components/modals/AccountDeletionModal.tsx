import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { requestAccountDeletion } from '../../../lib/accountDeletion';
import { getModalWidth, responsiveFontSize, getResponsivePadding, SCREEN_HEIGHT } from '../../utils/responsive';

interface AccountDeletionModalProps {
  visible: boolean;
  onClose: () => void;
  onDeletionRequested: (scheduledFor: string) => void;
}

export default function AccountDeletionModal({
  visible,
  onClose,
  onDeletionRequested,
}: AccountDeletionModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      Alert.alert('Confirmation Required', 'Please type "DELETE" to confirm account deletion.');
      return;
    }

    setIsDeleting(true);

    try {
      const result = await requestAccountDeletion();

      if (result.success && result.scheduledFor) {
        Alert.alert(
          'Account Deletion Scheduled',
          `Your account will be permanently deleted on ${new Date(result.scheduledFor).toLocaleDateString()}.\n\nYou can cancel this by logging back in before that date.`,
          [
            {
              text: 'OK',
              onPress: () => {
                onDeletionRequested(result.scheduledFor!);
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to schedule account deletion. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('[AccountDeletionModal] Error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerIcon}>⚠️</Text>
              <Text style={styles.headerTitle}>Delete Account</Text>
            </View>

            {/* Warning */}
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>⚠️ This action cannot be undone</Text>
              <Text style={styles.warningText}>
                Your account will be scheduled for deletion after 30 days.
              </Text>
            </View>

            {/* What will be deleted */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What will be deleted:</Text>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>All achievements and progress</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Study session history</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Deadlines and goals</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Customizations and settings</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Unique device identifier</Text>
              </View>
            </View>

            {/* Grace period info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>30-Day Grace Period:</Text>
              <Text style={styles.infoText}>
                • You can still access your account during this period
              </Text>
              <Text style={styles.infoText}>
                • Logging in will automatically cancel the deletion request
              </Text>
              <Text style={styles.infoText}>
                • After 30 days, your account will be permanently deleted
              </Text>
            </View>

            {/* Confirmation input */}
            <View style={styles.section}>
              <Text style={styles.confirmLabel}>
                Type "DELETE" to confirm:
              </Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputText}>{confirmText || 'Type here...'}</Text>
              </View>
              <View style={styles.keyboardRow}>
                {['D', 'E', 'L', 'E', 'T', 'E'].map((letter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.keyButton}
                    onPress={() => setConfirmText(prev => prev + letter)}
                  >
                    <Text style={styles.keyText}>{letter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setConfirmText('')}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.deleteButton,
                  (isDeleting || confirmText.toLowerCase() !== 'delete') && styles.deleteButtonDisabled,
                ]}
                onPress={handleDeleteAccount}
                disabled={isDeleting || confirmText.toLowerCase() !== 'delete'}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Support contact */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Need help?</Text>
              <Text style={styles.footerEmail}>Contact: support@quillby.app</Text>
            </View>
          </ScrollView>
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
    width: getModalWidth(),
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: getResponsivePadding().large,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: '700',
    color: '#D32F2F',
  },
  warningBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#EF5350',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  listText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  keyButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  keyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  deleteButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  footerEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
