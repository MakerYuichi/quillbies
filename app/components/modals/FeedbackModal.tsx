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
  ImageBackground,
} from 'react-native';
import { useFonts } from 'expo-font';
import { useQuillbyStore } from '../../state/store-modular';
import { submitFeedback } from '../../../lib/feedbackService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FEEDBACK_CATEGORIES = [
  { id: 'bug',         label: 'Bug',         emoji: '🐛', ink: '#1A4A0A' },
  { id: 'feature',     label: 'Idea',        emoji: '💡', ink: '#5C3A00' },
  { id: 'improvement', label: 'Improvement', emoji: '✨', ink: '#3A0A5C' },
  { id: 'praise',      label: 'Praise',      emoji: '❤️', ink: '#7A1A1A' },
  { id: 'other',       label: 'Other',       emoji: '💬', ink: '#0A2A4A' },
];

export default function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const userData = useQuillbyStore((state) => state.userData);
  const [category, setCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    'PlaywriteIE': require('../../../assets/fonts/PlaywriteIE-VariableFont_wght.ttf'),
    'CaveatBrush': require('../../../assets/fonts/CaveatBrush-Regular.ttf'),
  });

  const selectedCat = FEEDBACK_CATEGORIES.find(c => c.id === category);
  const inkColor = selectedCat?.ink ?? '#3E2410';

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Category Required', 'Please select a category for your entry.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title Required', 'Give your diary entry a title.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Description Required', 'Write something in your entry!');
      return;
    }

    setIsSubmitting(true);
    try {
      const { getDeviceUser } = await import('../../../lib/deviceAuth');
      const deviceUser = await getDeviceUser();
      const deviceId = deviceUser?.id || userData.deviceId || 'unknown';

      await submitFeedback({
        category,
        title: title.trim(),
        description: description.trim(),
        email: email.trim() || undefined,
        userName: userData.name || userData.buddyName || 'Anonymous',
        buddyName: userData.buddyName || 'Anonymous Buddy',
        country: userData.country || '',
        streak: userData.currentStreak ?? 0,
        selectedCharacter: userData.selectedCharacter || 'casual',
        deviceId,
        appVersion: '1.0.0',
        timestamp: new Date().toISOString(),
      });

      Alert.alert(
        '📖 Entry Saved!',
        'Your diary entry has been added to the Community Diary. Thank you!',
        [{
          text: 'Close',
          onPress: () => {
            setCategory('');
            setTitle('');
            setDescription('');
            setEmail('');
            onClose();
          },
        }]
      );
    } catch (error) {
      console.error('[Feedback] Submission error:', error);
      Alert.alert('Could not save entry', 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (title || description) {
      Alert.alert(
        'Discard Entry?',
        'You have an unsaved diary entry. Discard it?',
        [
          { text: 'Keep Writing', style: 'cancel' },
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

  const today = new Date();
  const dayNum = today.getDate();
  const suffix =
    dayNum % 10 === 1 && dayNum !== 11 ? 'st' :
    dayNum % 10 === 2 && dayNum !== 12 ? 'nd' :
    dayNum % 10 === 3 && dayNum !== 13 ? 'rd' : 'th';
  const dateStr = `${dayNum}${suffix} ${today.toLocaleDateString(undefined, { month: 'long' })}, ${today.getFullYear()}`;
  const buddyName = userData.buddyName || 'My Buddy';
  const streak = userData.currentStreak ?? 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <ImageBackground
          source={require('../../../assets/backgrounds/diary.png')}
          style={styles.sheet}
          imageStyle={styles.sheetBg}
          resizeMode="cover"
        >
          {/* Cream overlay */}
          <View style={styles.sheetOverlay}>

            {/* Leather header */}
            <View style={styles.leatherHeader}>
              <View style={styles.leatherSpine} />
              <View style={styles.leatherContent}>
                <Text style={[styles.leatherTitle, { fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                  Write in the Diary
                </Text>
                <Text style={[styles.leatherSub, { fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}>
                  {dateStr}  ·  {buddyName}{streak > 0 ? `  ·  Day ${streak}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* Category — ink stamp style */}
              <Text style={[styles.sectionLabel, { fontFamily: fontsLoaded ? 'CaveatBrush' : undefined, color: '#5C3A1E' }]}>
                What kind of entry is this?
              </Text>
              <View style={styles.categoryRow}>
                {FEEDBACK_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      category === cat.id && { backgroundColor: cat.ink, borderColor: cat.ink },
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    <Text style={[
                      styles.categoryLabel,
                      { fontFamily: fontsLoaded ? 'CaveatBrush' : undefined },
                      category === cat.id && { color: '#FFF' },
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Diary page — lined paper look */}
              <ImageBackground
                source={require('../../../assets/backgrounds/diary.png')}
                style={styles.diaryPage}
                imageStyle={styles.diaryPageBg}
                resizeMode="cover"
              >
                <View style={styles.diaryPageOverlay}>

                  {/* Margin line */}
                  <View style={styles.marginLine} />

                  {/* Title line */}
                  <Text style={[styles.fieldLabel, { color: inkColor, fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                    Title
                  </Text>
                  <TextInput
                    style={[styles.titleInput, { color: inkColor, fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Give your entry a title..."
                    placeholderTextColor={inkColor + '55'}
                    maxLength={100}
                  />
                  <View style={[styles.inputUnderline, { backgroundColor: inkColor + '30' }]} />

                  {/* Body */}
                  <Text style={[styles.fieldLabel, { color: inkColor, fontFamily: fontsLoaded ? 'CaveatBrush' : undefined, marginTop: 16 }]}>
                    Your thoughts
                  </Text>
                  <TextInput
                    style={[styles.bodyInput, { color: inkColor, fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Write your thoughts here..."
                    placeholderTextColor={inkColor + '55'}
                    multiline
                    numberOfLines={7}
                    textAlignVertical="top"
                    maxLength={1000}
                  />
                  <Text style={[styles.charCount, { color: inkColor + '77' }]}>
                    {description.length}/1000
                  </Text>

                  {/* Email */}
                  <Text style={[styles.fieldLabel, { color: inkColor, fontFamily: fontsLoaded ? 'CaveatBrush' : undefined, marginTop: 12 }]}>
                    Email (optional — for follow-up)
                  </Text>
                  <TextInput
                    style={[styles.emailInput, { color: inkColor, fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={inkColor + '55'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    maxLength={100}
                  />
                  <View style={[styles.inputUnderline, { backgroundColor: inkColor + '30' }]} />

                  {/* Signature line */}
                  <View style={styles.signatureRow}>
                    <Text style={[styles.signatureText, { color: inkColor + '88', fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                      — {buddyName}
                    </Text>
                    <Text style={[styles.signatureDate, { color: inkColor + '66', fontFamily: fontsLoaded ? 'PlaywriteIE' : undefined }]}>
                      {dateStr}
                    </Text>
                  </View>

                </View>
              </ImageBackground>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!category || !title.trim() || !description.trim() || isSubmitting) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!category || !title.trim() || !description.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#F5DEB3" />
                ) : (
                  <Text style={[styles.submitBtnText, { fontFamily: fontsLoaded ? 'CaveatBrush' : undefined }]}>
                    🪶  Seal & Submit Entry
                  </Text>
                )}
              </TouchableOpacity>

            </ScrollView>
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.93,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetBg: {
    opacity: 0.2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: '#F5EDD6EE',
  },

  // Leather header
  leatherHeader: {
    backgroundColor: '#4A2C0E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 14,
    paddingRight: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#2E1A08',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  leatherSpine: {
    width: 14,
    alignSelf: 'stretch',
    backgroundColor: '#2E1A08',
    marginRight: 14,
    borderTopLeftRadius: 24,
  },
  leatherContent: { flex: 1 },
  leatherTitle: {
    fontSize: SCREEN_WIDTH * 0.065,
    color: '#F5DEB3',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  leatherSub: {
    fontSize: SCREEN_WIDTH * 0.024,
    color: '#C4A882',
    marginTop: 3,
    fontStyle: 'italic',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    color: '#F5DEB3',
    fontWeight: '700',
  },

  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },

  sectionLabel: {
    fontSize: SCREEN_WIDTH * 0.042,
    marginBottom: 8,
  },

  // Category chips
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(92,58,30,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(92,58,30,0.25)',
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: {
    fontSize: SCREEN_WIDTH * 0.036,
    color: '#5C3A1E',
  },

  // Diary page
  diaryPage: {
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  diaryPageBg: {
    opacity: 0.85,
    borderRadius: 4,
  },
  diaryPageOverlay: {
    backgroundColor: 'rgba(253,246,227,0.78)',
    padding: 18,
    paddingLeft: 48, // space for margin line
  },
  marginLine: {
    position: 'absolute',
    left: 38,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(180,100,100,0.3)',
  },

  fieldLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    marginBottom: 4,
  },
  titleInput: {
    fontSize: SCREEN_WIDTH * 0.052,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  inputUnderline: {
    height: 1.5,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 1,
  },
  bodyInput: {
    fontSize: SCREEN_WIDTH * 0.028,
    lineHeight: SCREEN_WIDTH * 0.048,
    minHeight: 160,
    paddingVertical: 6,
    paddingHorizontal: 0,
    fontStyle: 'italic',
  },
  charCount: {
    fontSize: SCREEN_WIDTH * 0.026,
    textAlign: 'right',
    marginTop: 2,
  },
  emailInput: {
    fontSize: SCREEN_WIDTH * 0.028,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(92,58,30,0.15)',
  },
  signatureText: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontStyle: 'italic',
  },
  signatureDate: {
    fontSize: SCREEN_WIDTH * 0.024,
    fontStyle: 'italic',
  },

  // Submit
  submitBtn: {
    backgroundColor: '#4A2C0E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#2E1A08',
    shadowColor: '#2E1A08',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#A08060',
    borderColor: '#8B6A4A',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: SCREEN_WIDTH * 0.046,
    color: '#F5DEB3',
    letterSpacing: 0.5,
  },
});
