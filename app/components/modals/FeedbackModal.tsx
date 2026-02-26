import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import { useQuillbyStore } from '../../state/store-modular';
import { submitFeedback } from '../../../lib/feedbackService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FEEDBACK_CATEGORIES = [
  { id: 'bug', label: '🐛 Bug Report', emoji: '🐛' },
  { id: 'feature', label: '💡 Feature Request', emoji: '💡' },
  { id: 'improvement', label: '✨ Improvement', emoji: '✨' },
  { id: 'praise', label: '❤️ Praise', emoji: '❤️' },
  { id: 'other', label: '💬 Other', emoji: '💬' },
];

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const userData = useQuillbyStore((state) => state.userData);
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleSubmit = async () => {
    // Validation
    if (!category) {
      Alert.alert('Category Required', 'Please select a feedback category.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Title Required', 'Please provide a title for your feedback.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Description Required', 'Please describe your feedback in detail.');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        category,
        title: title.trim(),
        description: description.trim(),
        email: email.trim() || undefined,
        userName: userData.name || 'Anonymous',
        deviceId: userData.deviceId,
        appVersion: '1.0.0', // You can get this from app.json or package.json
        timestamp: new Date().toISOString(),
      };

      await submitFeedback(feedbackData);

      Alert.alert(
        'Thank You! 🎉',
        'Your feedback has been submitted successfully. We appreciate your input!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setCategory('');
              setTitle('');
              setDescription('');
              setEmail('');
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Feedback] Submission error:', error);
      Alert.alert(
        'Submission Failed',
        'Could not submit your feedback. Please try again later or contact support directly.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (title || description) {
      Alert.alert(
        'Discard Feedback?',
        'You have unsaved feedback. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setCategory('');
              setTitle('');
              setDescription('');
              setEmail('');
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📝 Send Feedback</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Selection */}
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {FEEDBACK_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.label.replace(cat.emoji + ' ', '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title Input */}
            <Text style={styles.sectionLabel}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Brief summary of your feedback"
              placeholderTextColor="#999"
              maxLength={100}
            />

            {/* Description Input */}
            <Text style={styles.sectionLabel}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Provide details about your feedback. For bugs, include steps to reproduce."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>
              {description.length}/1000 characters
            </Text>

            {/* Email Input (Optional) */}
            <Text style={styles.sectionLabel}>
              Email (Optional - for follow-up)
            </Text>
            <TextInput
              style={styles.emailInput}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
            />

            {/* Info Text */}
            <Text style={styles.infoText}>
              💡 Your feedback helps us improve Quillby for everyone. Thank you
              for taking the time to share your thoughts!
            </Text>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!category || !title.trim() || !description.trim() || isSubmitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!category || !title.trim() || !description.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT * 0.9,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 20,
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  categoryButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 13,
    color: '#666',
  },
  categoryTextSelected: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#2E7D32',
  },
  titleInput: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
  },
  descriptionInput: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 14,
    color: '#333',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
  },
  charCount: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  emailInput: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
  },
  infoText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});
