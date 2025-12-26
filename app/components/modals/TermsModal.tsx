import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsModal({ visible, onAccept, onDecline }: TermsModalProps) {
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkbox3, setCheckbox3] = useState(false);
  const [checkbox4, setCheckbox4] = useState(false);

  const allChecked = checkbox1 && checkbox2 && checkbox3 && checkbox4;

  const handleAccept = () => {
    if (allChecked) {
      onAccept();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📋 Terms & Conditions</Text>
            <Text style={styles.headerSubtitle}>Please read and accept to continue</Text>
          </View>

          {/* Scrollable Terms Content */}
          <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={true}>
            <Text style={styles.termsText}>
              <Text style={styles.bold}>Last Updated:</Text> December 2025{'\n'}
              <Text style={styles.bold}>Effective Date:</Text> Upon user acceptance{'\n'}
              <Text style={styles.bold}>App Version:</Text> 1.0{'\n'}
              <Text style={styles.bold}>Jurisdiction:</Text> India{'\n\n'}

              <Text style={styles.sectionTitle}>1. INTRODUCTION & ACCEPTANCE{'\n'}</Text>
              By using Quillby, you agree to these Terms and Conditions. These are governed by Indian laws including IT Act 2000, Consumer Protection Act 2019, and Digital Personal Data Protection Act 2023.{'\n\n'}

              <Text style={styles.sectionTitle}>2. ELIGIBILITY{'\n'}</Text>
              • Minimum age: 13 years{'\n'}
              • Users 13-18 need parental consent{'\n'}
              • You must provide accurate information{'\n\n'}

              <Text style={styles.sectionTitle}>3. YOUR ACCOUNT{'\n'}</Text>
              • You're responsible for account security{'\n'}
              • Keep your password confidential{'\n'}
              • Notify us of unauthorized access{'\n'}
              • Don't share login credentials{'\n\n'}

              <Text style={styles.sectionTitle}>4. PROHIBITED ACTIVITIES{'\n'}</Text>
              You agree NOT to:{'\n'}
              • Use the app for illegal purposes{'\n'}
              • Upload malware or harmful code{'\n'}
              • Harass or abuse other users{'\n'}
              • Reverse engineer the app{'\n'}
              • Collect others' personal information{'\n\n'}

              <Text style={styles.sectionTitle}>5. DATA PRIVACY{'\n'}</Text>
              <Text style={styles.bold}>We Collect:</Text> Name, email, study data, device info, usage analytics{'\n'}
              <Text style={styles.bold}>We Use It For:</Text> Providing services, personalization, improvements{'\n'}
              <Text style={styles.bold}>We DON'T:</Text> Sell your data or share with marketers{'\n'}
              <Text style={styles.bold}>Your Rights:</Text> Access, correct, delete, or port your data anytime{'\n\n'}

              <Text style={styles.sectionTitle}>6. DATA SECURITY{'\n'}</Text>
              • Data encrypted in transit and at rest{'\n'}
              • Stored securely in Supabase cloud{'\n'}
              • You can request deletion anytime{'\n'}
              • Deleted within 30 days of request{'\n\n'}

              <Text style={styles.sectionTitle}>7. INTELLECTUAL PROPERTY{'\n'}</Text>
              • Quillby owns all app code and design{'\n'}
              • You own your user-generated content{'\n'}
              • Limited license for personal use only{'\n\n'}

              <Text style={styles.sectionTitle}>8. LIMITATION OF LIABILITY{'\n'}</Text>
              • App provided "AS IS" without warranties{'\n'}
              • We're not liable for indirect damages{'\n'}
              • Not responsible for study outcomes{'\n'}
              • No guarantee of uninterrupted service{'\n\n'}

              <Text style={styles.sectionTitle}>9. PAYMENT & REFUNDS{'\n'}</Text>
              • Basic app is completely free{'\n'}
              • Premium features (if offered): 7-day refund window{'\n'}
              • Refunds processed within 10 business days{'\n\n'}

              <Text style={styles.sectionTitle}>10. ACCOUNT TERMINATION{'\n'}</Text>
              • You can delete anytime via support@quillby.app{'\n'}
              • We may terminate for violations{'\n'}
              • Data deleted within 30 days{'\n\n'}

              <Text style={styles.sectionTitle}>11. GRIEVANCE REDRESSAL{'\n'}</Text>
              <Text style={styles.bold}>Contact:</Text> support@quillby.app{'\n'}
              <Text style={styles.bold}>Response:</Text> Within 7 days{'\n'}
              <Text style={styles.bold}>Resolution:</Text> Within 30 days{'\n'}
              <Text style={styles.bold}>Consumer Helpline:</Text> 1800-11-4000{'\n\n'}

              <Text style={styles.sectionTitle}>12. GOVERNING LAW{'\n'}</Text>
              • Governed by laws of India{'\n'}
              • Jurisdiction: Courts of Delhi, India{'\n'}
              • Disputes resolved through arbitration{'\n\n'}

              <Text style={styles.sectionTitle}>13. YOUR RIGHTS (DPDPA 2023){'\n'}</Text>
              • Right to access your data{'\n'}
              • Right to correct inaccurate data{'\n'}
              • Right to erasure (be forgotten){'\n'}
              • Right to data portability{'\n'}
              • Right to withdraw consent{'\n\n'}

              <Text style={styles.sectionTitle}>14. CONTACT INFORMATION{'\n'}</Text>
              <Text style={styles.bold}>Creator/Support:</Text> makeryuichii@gmail.com{'\n\n'}

              <Text style={styles.bold}>Made by MakerYuichii</Text>{'\n'}
              <Text style={styles.bold}>Version 1.0 • December 2025</Text>{'\n\n'}

              For complete terms, visit our website or email legal@quillby.app
            </Text>
          </ScrollView>

          {/* Checkboxes */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setCheckbox1(!checkbox1)}
            >
              <View style={[styles.checkbox, checkbox1 && styles.checkboxChecked]}>
                {checkbox1 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I have read and agree to the Terms & Conditions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setCheckbox2(!checkbox2)}
            >
              <View style={[styles.checkbox, checkbox2 && styles.checkboxChecked]}>
                {checkbox2 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I am at least 13 years old
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setCheckbox3(!checkbox3)}
            >
              <View style={[styles.checkbox, checkbox3 && styles.checkboxChecked]}>
                {checkbox3 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I understand my data will be stored securely in Supabase
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setCheckbox4(!checkbox4)}
            >
              <View style={[styles.checkbox, checkbox4 && styles.checkboxChecked]}>
                {checkbox4 && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the grievance redressal process
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.acceptButton, !allChecked && styles.acceptButtonDisabled]}
              onPress={handleAccept}
              disabled={!allChecked}
            >
              <Text style={[styles.acceptButtonText, !allChecked && styles.acceptButtonTextDisabled]}>
                Accept & Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  termsScroll: {
    maxHeight: SCREEN_HEIGHT * 0.4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  termsText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
  },
  bold: {
    fontWeight: '700',
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#999',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  acceptButtonTextDisabled: {
    color: '#999',
  },
});
