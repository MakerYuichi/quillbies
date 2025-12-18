import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  TextInput, 
  Alert,
  Modal,
  StatusBar,
  ImageBackground
} from 'react-native';
import { DeadlineFormData, Deadline } from '../core/types';
import CustomDatePicker from './CustomDatePicker';
import CustomTimePicker from './CustomTimePicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helper function to get today's date
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

interface CreateDeadlineModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: DeadlineFormData, deadlineId?: string) => void;
  mode?: 'create' | 'edit';
  initialData?: Deadline | null;
  deadlineId?: string;
}

export default function CreateDeadlineModal({ 
  visible, 
  onClose, 
  onSubmit,
  mode = 'create',
  initialData,
  deadlineId
}: CreateDeadlineModalProps) {
  const [formData, setFormData] = useState<DeadlineFormData>({
    title: '',
    dueDate: getTodayDate(), // Default to today
    dueTime: '',
    priority: 'medium',
    estimatedHours: '',
    category: 'study'
  });

  // When opening in edit mode, prefill form with existing deadline data
  useEffect(() => {
    if (visible && mode === 'edit' && initialData) {
      // Normalize stored ISO date (e.g. "2025-01-01T00:00:00.000Z") to "2025-01-01"
      const normalizedDate = initialData.dueDate.includes('T')
        ? initialData.dueDate.split('T')[0]
        : initialData.dueDate;

      setFormData({
        title: initialData.title,
        dueDate: normalizedDate,
        dueTime: initialData.dueTime || '',
        priority: initialData.priority,
        estimatedHours: initialData.estimatedHours.toString(),
        category: initialData.category || 'study'
      });
    }
    if (visible && mode === 'create' && !initialData) {
      setFormData({
        title: '',
        dueDate: getTodayDate(),
        dueTime: '',
        priority: 'medium',
        estimatedHours: '',
        category: 'study'
      });
    }
  }, [visible, mode, initialData]);

  // Custom picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = () => {
    // Validate form
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }
    if (!formData.dueDate) {
      Alert.alert('Error', 'Please select a due date');
      return;
    }
    if (!formData.estimatedHours || parseFloat(formData.estimatedHours) <= 0) {
      Alert.alert('Error', 'Please enter valid estimated hours');
      return;
    }

    // Validate date format and not in past
    if (!validateDate(formData.dueDate)) {
      Alert.alert('Error', 'Due date cannot be in the past');
      return;
    }
    
    // Validate time format if provided
    if (formData.dueTime && !validateTime(formData.dueTime)) {
      Alert.alert('Error', 'Please enter time in HH:MM format (e.g., 14:30)');
      return;
    }

    // Submit form (create or edit)
    onSubmit(formData, deadlineId);
    
    // Reset form
    setFormData({
      title: '',
      dueDate: '',
      dueTime: '',
      priority: 'medium',
      estimatedHours: '',
      category: 'study'
    });
    setFormData({
      title: '',
      dueDate: getTodayDate(),
      dueTime: '',
      priority: 'medium',
      estimatedHours: '',
      category: 'study'
    });
  };

  const handleClose = () => {
    // Reset form on close so next open in create mode is clean
    setFormData({
      title: '',
      dueDate: getTodayDate(),
      dueTime: '',
      priority: 'medium',
      estimatedHours: '',
      category: 'study'
    });
    onClose();
  };

  // Custom picker handlers
  const handleDateSelect = (date: string) => {
    setFormData({...formData, dueDate: date});
  };

  const handleTimeSelect = (time: string) => {
    setFormData({...formData, dueTime: time});
  };

  // Simple date/time validation
  const validateDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const validateTime = (timeString: string) => {
    if (!timeString) return true; // Optional field
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  };

  // Helper functions removed - using direct text input now

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <ImageBackground
        source={require('../../assets/backgrounds/theme.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'edit' ? 'Edit Deadline' : 'Create New Deadline'}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>
              {mode === 'edit' ? '✓ Save' : '✓ Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Task Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Task Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Math Final Exam"
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              autoFocus
            />
          </View>

          {/* Date and Time Row */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Due Date & Time</Text>
            <View style={styles.dateTimeRow}>
              {/* Date Input */}
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeSubLabel}>Date *</Text>
                <View style={styles.dateTimeInputContainer}>
                  <TouchableOpacity 
                    style={styles.emojiButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateTimeEmoji}>📅</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.dateTimeInput}
                    placeholder="2024-12-28"
                    value={formData.dueDate}
                    onChangeText={(text) => setFormData({...formData, dueDate: text})}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.inputHint}>Tap 📅 for calendar or type date</Text>
              </View>

              {/* Time Input */}
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeSubLabel}>Time (Optional)</Text>
                <View style={styles.dateTimeInputContainer}>
                  <TouchableOpacity 
                    style={styles.emojiButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.dateTimeEmoji}>⏰</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={styles.dateTimeInput}
                    placeholder="14:30"
                    value={formData.dueTime}
                    onChangeText={(text) => setFormData({...formData, dueTime: text})}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.inputHint}>Tap ⏰ for time picker or type time</Text>
              </View>
            </View>
          </View>

          {/* Priority Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Priority Level</Text>
            <View style={styles.priorityRow}>
              <TouchableOpacity 
                style={[
                  styles.priorityButton, 
                  styles.priorityHigh,
                  formData.priority === 'high' && styles.prioritySelected
                ]}
                onPress={() => setFormData({...formData, priority: 'high'})}
              >
                <Text style={formData.priority === 'high' ? styles.priorityTextSelected : styles.priorityText}>🔴 High</Text>
                <Text style={formData.priority === 'high' ? styles.prioritySubtextSelected : styles.prioritySubtext}>Urgent</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.priorityButton, 
                  styles.priorityMedium,
                  formData.priority === 'medium' && styles.prioritySelected
                ]}
                onPress={() => setFormData({...formData, priority: 'medium'})}
              >
                <Text style={formData.priority === 'medium' ? styles.priorityTextSelected : styles.priorityText}>🟡 Medium</Text>
                <Text style={formData.priority === 'medium' ? styles.prioritySubtextSelected : styles.prioritySubtext}>Important</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.priorityButton, 
                  styles.priorityLow,
                  formData.priority === 'low' && styles.prioritySelected
                ]}
                onPress={() => setFormData({...formData, priority: 'low'})}
              >
                <Text style={formData.priority === 'low' ? styles.priorityTextSelected : styles.priorityText}>🟢 Low</Text>
                <Text style={formData.priority === 'low' ? styles.prioritySubtextSelected : styles.prioritySubtext}>Nice to have</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Estimated Work Hours */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Work Hours *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 8"
              keyboardType="numeric"
              value={formData.estimatedHours}
              onChangeText={(text) => setFormData({...formData, estimatedHours: text})}
            />
            <Text style={styles.inputHint}>How many hours do you think this will take?</Text>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  formData.category === 'study' && styles.categorySelected
                ]}
                onPress={() => setFormData({...formData, category: 'study'})}
              >
                <Text style={styles.categoryEmoji}>📚</Text>
                <Text style={styles.categoryText}>Study</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  formData.category === 'work' && styles.categorySelected
                ]}
                onPress={() => setFormData({...formData, category: 'work'})}
              >
                <Text style={styles.categoryEmoji}>💼</Text>
                <Text style={styles.categoryText}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  formData.category === 'project' && styles.categorySelected
                ]}
                onPress={() => setFormData({...formData, category: 'project'})}
              >
                <Text style={styles.categoryEmoji}>📊</Text>
                <Text style={styles.categoryText}>Project</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  formData.category === 'other' && styles.categorySelected
                ]}
                onPress={() => setFormData({...formData, category: 'other'})}
              >
                <Text style={styles.categoryEmoji}>🎯</Text>
                <Text style={styles.categoryText}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Tips for Better Planning</Text>
            <Text style={styles.tipText}>• Break large tasks into smaller chunks</Text>
            <Text style={styles.tipText}>• Add buffer time for unexpected delays</Text>
            <Text style={styles.tipText}>• Set realistic deadlines you can actually meet</Text>
            <Text style={styles.tipText}>• Use high priority sparingly for truly urgent tasks</Text>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Custom Date Picker */}
        <CustomDatePicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onDateSelect={handleDateSelect}
          initialDate={formData.dueDate}
        />

        {/* Custom Time Picker */}
        <CustomTimePicker
          visible={showTimePicker}
          onClose={() => setShowTimePicker(false)}
          onTimeSelect={handleTimeSelect}
          initialTime={formData.dueTime}
        />
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    padding: SCREEN_WIDTH * 0.02,
  },
  cancelButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'ChakraPetch_700Bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#FFF',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  inputGroup: {
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: '#F9F9F9',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    fontFamily: 'ChakraPetch_400Regular',
  },
  inputHint: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    marginTop: SCREEN_HEIGHT * 0.005,
    fontStyle: 'italic',
    fontFamily: 'ChakraPetch_400Regular',
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SCREEN_WIDTH * 0.015,
  },
  priorityButton: {
    width: (SCREEN_WIDTH - (SCREEN_WIDTH * 0.1) - (SCREEN_WIDTH * 0.03)) / 3, // Equal width for 3 buttons
    paddingHorizontal: SCREEN_WIDTH * 0.015,
    paddingVertical: SCREEN_WIDTH * 0.025,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SCREEN_HEIGHT * 0.08,
  },
  priorityHigh: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  priorityMedium: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FF9800',
  },
  priorityLow: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  prioritySelected: {
    borderWidth: 4,
    transform: [{ scale: 1.02 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
    backgroundColor: '#FFFFFF',
  },
  priorityText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '400',
    marginBottom: SCREEN_HEIGHT * 0.002,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#666',
  },
  priorityTextSelected: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontWeight: '700',
    marginBottom: SCREEN_HEIGHT * 0.002,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#000',
  },
  prioritySubtext: {
    fontSize: SCREEN_WIDTH * 0.022,
    color: '#888',
    fontFamily: 'ChakraPetch_400Regular',
    textAlign: 'center',
  },
  prioritySubtextSelected: {
    fontSize: SCREEN_WIDTH * 0.024,
    color: '#000',
    fontFamily: 'ChakraPetch_600SemiBold',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH * 0.03,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  categorySelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 3,
  },
  categoryEmoji: {
    fontSize: SCREEN_WIDTH * 0.08,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  categoryText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  tipsSection: {
    backgroundColor: '#F0F8FF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  tipsTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  tipText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#1976D2',
    marginVertical: SCREEN_HEIGHT * 0.003,
    fontFamily: 'ChakraPetch_400Regular',
  },
  bottomSpacing: {
    height: SCREEN_HEIGHT * 0.05,
  },
  // Date and Time Input Styles
  dateTimeRow: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateTimeSubLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.008,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  dateTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    minHeight: SCREEN_HEIGHT * 0.06,
  },
  emojiButton: {
    padding: SCREEN_WIDTH * 0.01,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  dateTimeEmoji: {
    fontSize: SCREEN_WIDTH * 0.05,
  },
  dateTimeInput: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#333',
    fontWeight: '500',
    paddingVertical: SCREEN_WIDTH * 0.02,
    fontFamily: 'ChakraPetch_500Medium',
  },
});