import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { getModalWidth, responsiveFontSize, getResponsivePadding, SCREEN_HEIGHT } from '../../utils/responsive';

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function TermsModal({ visible, onAccept, onDecline }: TermsModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);
  
  const padding = getResponsivePadding();
  const modalWidth = getModalWidth();

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <>
      {/* Main Modal with Checkbox */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDecline}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.compactModalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>📋 Welcome to Quillby</Text>
              <Text style={styles.headerSubtitle}>Please accept our terms to continue</Text>
            </View>

            {/* Checkbox with clickable terms link */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkboxRow}
                onPress={() => setAgreed(!agreed)}
              >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                  {agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I agree to the{' '}
                  <Text 
                    style={styles.linkText}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowFullTerms(true);
                    }}
                  >
                    Terms & Conditions
                  </Text>
                  {' '}and{' '}
                  <Text 
                    style={styles.linkText}
                    onPress={(e) => {
                      e.stopPropagation();
                      setShowFullTerms(true);
                    }}
                  >
                    Privacy Policy
                  </Text>
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
                style={[styles.acceptButton, !agreed && styles.acceptButtonDisabled]}
                onPress={handleAccept}
                disabled={!agreed}
              >
                <Text style={[styles.acceptButtonText, !agreed && styles.acceptButtonTextDisabled]}>
                  Accept & Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Terms Modal */}
      <Modal
        visible={showFullTerms}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFullTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullTermsContainer}>
            {/* Header */}
            <View style={styles.fullTermsHeader}>
              <Text style={styles.fullTermsTitle}>Terms & Conditions</Text>
              <TouchableOpacity 
                onPress={() => setShowFullTerms(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Terms Content */}
            <ScrollView 
              style={styles.termsScroll} 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={styles.termsText}>
                <Text style={styles.bold}>Privacy Policy of Quillby{'\n\n'}</Text>
                
                This Privacy Policy describes how Quillby ("we", "our", "us"), developed by MakerYuichii, collects, uses, stores, and protects your personal data when you use our mobile application.{'\n\n'}
                
                <Text style={styles.bold}>Contact email:</Text> support@quillby.app{'\n\n'}
                
                This policy is governed by Indian law including the Digital Personal Data Protection Act 2023 (DPDPA), the Information Technology Act 2000, and the Consumer Protection Act 2019.{'\n\n'}
                
                <Text style={styles.sectionTitle}>What you should know at a glance{'\n\n'}</Text>
                • We do not collect your email address or require you to create an account{'\n'}
                • Your app data is stored securely on Supabase cloud infrastructure{'\n'}
                • We do not sell, rent, or share your personal data with advertisers{'\n'}
                • You can request deletion of your data at any time by contacting us{'\n\n'}
                
                <Text style={styles.sectionTitle}>1. Who We Are{'\n\n'}</Text>
                Quillby is a gamified productivity mobile application designed to help users build better study habits. The application is developed and maintained by MakerYuichii, an independent developer based in India.{'\n\n'}
                Contact: support@quillby.app{'\n\n'}
                
                <Text style={styles.sectionTitle}>2. Information We Collect{'\n\n'}</Text>
                
                <Text style={styles.bold}>2.1 Information You Provide Directly{'\n'}</Text>
                • Display name — optional, used to personalize your in-app experience{'\n'}
                • Study data — subjects, deadlines, focus session durations you enter manually{'\n'}
                • Habit data — water intake, meals, exercise, sleep, and cleaning logs you record voluntarily{'\n'}
                • In-app preferences — room themes, pet customizations, notification settings{'\n\n'}
                
                <Text style={styles.bold}>2.2 Information Collected Automatically{'\n'}</Text>
                • Device identifier — a unique identifier assigned to your device{'\n'}
                • Device model and operating system version{'\n'}
                • App usage data — which features you use, session duration, and frequency{'\n'}
                • Focus session analytics — session length, completion rates{'\n'}
                • Notification interaction data{'\n'}
                • Crash logs and performance data{'\n\n'}
                
                <Text style={styles.bold}>2.3 Location Data{'\n'}</Text>
                • Location is accessed once during initial app setup only{'\n'}
                • Used solely to detect your country and timezone{'\n'}
                • Your precise location is never stored on our servers{'\n'}
                • Location is never tracked continuously{'\n'}
                • You may deny location permission; timezone can be set manually{'\n\n'}
                
                <Text style={styles.bold}>2.4 Information We Do Not Collect{'\n'}</Text>
                • We do not collect your email address{'\n'}
                • We do not collect passwords or authentication credentials{'\n'}
                • We do not collect payment information directly{'\n'}
                • We do not access your contacts, camera, microphone, or photo library{'\n'}
                • We do not collect data from children under 13 years of age{'\n'}
                • We do not use advertising identifiers or tracking SDKs{'\n\n'}
                
                <Text style={styles.sectionTitle}>3. How We Use Your Information{'\n\n'}</Text>
                We use the information we collect for the following purposes:{'\n\n'}
                • Providing the service — to operate the app, save your progress, and deliver features{'\n'}
                • Personalisation — to remember your preferences, themes, and settings{'\n'}
                • Push notifications — to send you habit reminders and study session alerts{'\n'}
                • App improvement — to analyse usage patterns, fix bugs, and improve performance{'\n'}
                • Legal compliance — to comply with applicable Indian laws and regulations{'\n\n'}
                
                We do not use your data for advertising, profiling, or any purpose beyond what is described above.{'\n\n'}
                
                <Text style={styles.sectionTitle}>4. Legal Basis for Processing{'\n\n'}</Text>
                Under the Digital Personal Data Protection Act 2023, we process your personal data on the following bases:{'\n\n'}
                • Consent — for location access, push notifications, and analytics data collection{'\n'}
                • Legitimate interest — for crash logs and performance data necessary to maintain a functional application{'\n'}
                • Legal obligation — where processing is required under applicable Indian law{'\n\n'}
                
                <Text style={styles.sectionTitle}>5. Data Storage and Security{'\n\n'}</Text>
                All user data is stored on Supabase cloud infrastructure, which provides enterprise-grade security standards.{'\n\n'}
                • Data is encrypted in transit using TLS/SSL protocols{'\n'}
                • Data is encrypted at rest using AES-256 encryption{'\n'}
                • Access to user data is restricted to authorised personnel only{'\n'}
                • We conduct regular reviews of our security practices{'\n'}
                • In the event of a data breach, we will notify you within 72 hours{'\n\n'}
                
                <Text style={styles.sectionTitle}>6. Data Sharing and Third Parties{'\n\n'}</Text>
                We do not sell, rent, or trade your personal data to any third party. We share data only in the following limited circumstances:{'\n\n'}
                
                <Text style={styles.bold}>6.1 Service Providers{'\n'}</Text>
                • Supabase — our cloud database and backend infrastructure provider{'\n'}
                • Expo (Notifications) — used to deliver push notifications to your device{'\n'}
                • Google Play — handles all in-app purchases and billing independently{'\n\n'}
                
                <Text style={styles.bold}>6.2 Legal Requirements{'\n'}</Text>
                We may disclose your personal data if required to do so by Indian law, court order, or a competent government authority.{'\n\n'}
                
                <Text style={styles.bold}>6.3 Business Transfer{'\n'}</Text>
                In the event that Quillby is acquired, merged, or its assets transferred to another entity, your data may be transferred as part of that transaction. We will notify you via an in-app notice at least 30 days before such a transfer takes effect.{'\n\n'}
                
                <Text style={styles.sectionTitle}>7. Data Retention{'\n\n'}</Text>
                • App data (habits, study sessions, progress): Until you request deletion{'\n'}
                • Device identifier: Until you request deletion{'\n'}
                • Usage analytics: 12 months on a rolling basis{'\n'}
                • Crash logs and performance data: 90 days{'\n'}
                • Data after deletion request: Permanently deleted within 30 days{'\n\n'}
                
                <Text style={styles.sectionTitle}>8. Your Rights Under DPDPA 2023{'\n\n'}</Text>
                As a user in India, you have the following rights regarding your personal data:{'\n\n'}
                • Right to Access — You may request a copy of all personal data we hold about you{'\n'}
                • Right to Correction — You may request correction of any inaccurate or incomplete personal data{'\n'}
                • Right to Erasure — You may request permanent deletion of all your personal data{'\n'}
                • Right to Data Portability — You may request your data in a structured, machine-readable format{'\n'}
                • Right to Withdraw Consent — You may withdraw consent for data collection at any time{'\n'}
                • Right to Grievance Redressal — You may file a complaint if you believe your data rights have been violated{'\n'}
                • Right to Nominate — You may nominate another individual to exercise your data rights on your behalf{'\n\n'}
                
                To exercise any of these rights, please contact us at support@quillby.app with the subject line "Data Rights Request". We will acknowledge your request within 7 days and resolve it within 30 days.{'\n\n'}
                
                <Text style={styles.sectionTitle}>9. Children's Privacy{'\n\n'}</Text>
                Quillby is intended for users aged 13 years and older.{'\n\n'}
                • Users aged 13 to 18 must have verifiable parental or guardian consent{'\n'}
                • We do not knowingly collect personal data from children under 13{'\n'}
                • If we become aware that personal data has been collected from a child under 13 without parental consent, we will delete that data immediately{'\n'}
                • Parents or guardians who believe their child has provided personal data without consent may contact us at support@quillby.app{'\n\n'}
                
                <Text style={styles.sectionTitle}>10. Push Notifications{'\n\n'}</Text>
                • Push notifications are sent only for features you explicitly enable{'\n'}
                • You may disable notifications at any time from your device settings{'\n'}
                • We do not send marketing or promotional push notifications without your explicit opt-in{'\n\n'}
                
                <Text style={styles.sectionTitle}>11. In-App Purchases and Premium Features{'\n\n'}</Text>
                • The core Quillby app is free to download and use{'\n'}
                • Optional premium features may be offered through Google Play Billing{'\n'}
                • All payment processing is handled entirely by Google{'\n'}
                • Refund requests for premium purchases are subject to a 7-day refund window{'\n'}
                • Refunds are processed within 10 business days of an approved request{'\n'}
                • To request a refund, contact support@quillby.app{'\n\n'}
                
                <Text style={styles.sectionTitle}>12. Cookies and Tracking Technologies{'\n\n'}</Text>
                • The Quillby mobile application does not use cookies{'\n'}
                • We do not use cross-app tracking, advertising identifiers, or fingerprinting technologies{'\n'}
                • We do not integrate any advertising SDKs{'\n\n'}
                
                <Text style={styles.sectionTitle}>13. Changes to This Privacy Policy{'\n\n'}</Text>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or applicable law.{'\n\n'}
                When we make changes, we will update the "Last Updated" date. For significant changes that materially affect your rights, we will provide notice via an in-app notification at least 14 days before the changes take effect.{'\n\n'}
                
                <Text style={styles.sectionTitle}>14. Grievance Redressal{'\n\n'}</Text>
                In accordance with the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023:{'\n\n'}
                • Grievance Officer: MakerYuichii{'\n'}
                • Contact Email: support@quillby.app{'\n'}
                • Acknowledgement: Within 7 days of receiving your complaint{'\n'}
                • Resolution: Within 30 days of acknowledgement{'\n\n'}
                
                If you are not satisfied with our resolution, you may contact the National Consumer Helpline at 1800-11-4000.{'\n\n'}
                
                <Text style={styles.sectionTitle}>15. Governing Law and Jurisdiction{'\n\n'}</Text>
                This Privacy Policy is governed by and construed in accordance with the laws of India, without regard to conflict of law principles.{'\n\n'}
                Any disputes arising out of or in connection with this Privacy Policy shall be subject to the exclusive jurisdiction of the courts of Delhi, India.{'\n\n'}
                
                <Text style={styles.sectionTitle}>16. Contact Information{'\n\n'}</Text>
                For any privacy-related questions, requests, or concerns, please contact us:{'\n\n'}
                • Developer: MakerYuichii{'\n'}
                • Email: support@quillby.app{'\n'}
                • App: Quillby v1.0.0{'\n'}
                • Effective Date: February 24, 2026{'\n\n'}
                
                <Text style={styles.bold}>Made with 🐹 by MakerYuichii</Text>
              </Text>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity 
              style={styles.fullTermsCloseButton}
              onPress={() => setShowFullTerms(false)}
            >
              <Text style={styles.fullTermsCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactModalContainer: {
    width: getModalWidth(),
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: getResponsivePadding().large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(14),
    color: '#666',
    textAlign: 'center',
  },
  checkboxContainer: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#999',
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
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
    fontSize: responsiveFontSize(15),
    color: '#333',
    flex: 1,
    lineHeight: 22,
  },
  linkText: {
    color: '#1976D2',
    textDecorationLine: 'underline',
    fontWeight: '600',
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
  // Full Terms Modal Styles
  fullTermsContainer: {
    width: getModalWidth(),
    height: SCREEN_HEIGHT * 0.95,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: getResponsivePadding().large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fullTermsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  fullTermsTitle: {
    fontSize: responsiveFontSize(24),
    fontWeight: '800',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  termsScroll: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },
  termsText: {
    fontSize: responsiveFontSize(14),
    color: '#333',
    lineHeight: 22,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: '700',
    color: '#1976D2',
  },
  bold: {
    fontWeight: '700',
  },
  fullTermsCloseButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  fullTermsCloseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
