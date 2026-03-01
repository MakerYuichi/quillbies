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
import { DeadlineFormData, Deadline } from '../../core/types';
import CustomDatePicker from '../ui/CustomDatePicker';
import CustomTimePicker from '../ui/CustomTimePicker';
import ScrollablePicker from '../ui/ScrollablePicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helper function to get today's date in local timezone
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone
};

// Helper function to get current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
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
    dueDate: '', // Start empty to show placeholder style
    dueTime: '', // Start empty to show placeholder style
    priority: 'medium',
    estimatedHours: '',
    category: 'study'
  });
  
  const [selectedHundreds, setSelectedHundreds] = useState(0);
  const [selectedTens, setSelectedTens] = useState(0);
  const [selectedOnes, setSelectedOnes] = useState(0);
  const [selectedMinTens, setSelectedMinTens] = useState(0);
  const [selectedMinOnes, setSelectedMinOnes] = useState(0);
  const [showPicker, setShowPicker] = useState<{ type: 'hundreds' | 'tens' | 'ones' | 'minTens' | 'minOnes' | null }>({ type: null });

  // Debug log for form data changes
  React.useEffect(() => {
    console.log('[CreateDeadlineModal] Form data updated:', formData);
  }, [formData]);

  // When opening in edit mode, prefill form with existing deadline data
  useEffect(() => {
    if (visible && mode === 'edit' && initialData) {
      // Normalize stored ISO date (e.g. "2025-01-01T00:00:00.000Z") to "2025-01-01"
      const normalizedDate = initialData.dueDate.includes('T')
        ? initialData.dueDate.split('T')[0]
        : initialData.dueDate;
      
      const estimatedHours = initialData.estimatedHours.toString();
      const totalHours = Math.floor(initialData.estimatedHours);
      const totalMinutes = Math.round((initialData.estimatedHours - totalHours) * 60);
      
      const hundreds = Math.floor(totalHours / 100);
      const tens = Math.floor((totalHours % 100) / 10);
      const ones = totalHours % 10;
      const minTens = Math.floor(totalMinutes / 10);
      const minOnes = totalMinutes % 10;

      setFormData({
        title: initialData.title,
        dueDate: normalizedDate,
        dueTime: initialData.dueTime || getCurrentTime(),
        priority: initialData.priority,
        estimatedHours: estimatedHours,
        category: initialData.category || 'study'
      });
      
      setSelectedHundreds(hundreds);
      setSelectedTens(tens);
      setSelectedOnes(ones);
      setSelectedMinTens(minTens);
      setSelectedMinOnes(minOnes);
    }
    if (visible && mode === 'create' && !initialData) {
      setFormData({
        title: '',
        dueDate: '',
        dueTime: '',
        priority: 'medium',
        estimatedHours: '',
        category: 'study'
      });
      setSelectedHundreds(0);
      setSelectedTens(0);
      setSelectedOnes(0);
      setSelectedMinTens(0);
      setSelectedMinOnes(0);
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
    
    // Calculate total hours from digit pickers
    const totalHours = (selectedHundreds * 100) + (selectedTens * 10) + selectedOnes;
    const totalMinutes = (selectedMinTens * 10) + selectedMinOnes;
    const totalHoursDecimal = totalHours + (totalMinutes / 60);
    
    if (totalHoursDecimal <= 0) {
      Alert.alert('Error', 'Please select estimated work time (at least 1 minute)');
      return;
    }
    
    // Update formData with calculated hours before submitting
    const updatedFormData = {
      ...formData,
      estimatedHours: totalHoursDecimal.toString()
    };

    // Validate date format and not in past
    if (!validateDate(updatedFormData.dueDate)) {
      Alert.alert('Error', 'Due date cannot be in the past');
      return;
    }
    
    // Validate time format if provided
    if (updatedFormData.dueTime && !validateTime(updatedFormData.dueTime)) {
      Alert.alert('Error', 'Please enter time in HH:MM format (e.g., 14:30)');
      return;
    }

    // Submit form (create or edit)
    onSubmit(updatedFormData, deadlineId);
    
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
    console.log('[CreateDeadlineModal] Date selected:', date);
    setFormData(prev => ({...prev, dueDate: date}));
    setShowDatePicker(false);
  };

  const handleTimeSelect = (time: string) => {
    console.log('[CreateDeadlineModal] Time selected:', time);
    setFormData(prev => ({...prev, dueTime: time}));
    setShowTimePicker(false);
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
        source={require('../../../assets/backgrounds/theme.png')}
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
              placeholderTextColor="#BBB"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({...prev, title: text}))}
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
                    onPress={() => {
                      // If date is empty, set today's date as initial value for picker
                      const dateToShow = formData.dueDate || getTodayDate();
                      console.log('[CreateDeadlineModal] Opening date picker with current date:', dateToShow);
                      if (!formData.dueDate) {
                        setFormData(prev => ({...prev, dueDate: getTodayDate()}));
                      }
                      setShowDatePicker(true);
                    }}
                  >
                    <Text style={styles.dateTimeEmoji}>📅</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.dateTimeInput,
                      !formData.dueDate && styles.dateTimeInputBlurred
                    ]}
                    placeholder="2024-12-28"
                    placeholderTextColor="#BBB"
                    value={formData.dueDate}
                    onChangeText={(text) => setFormData(prev => ({...prev, dueDate: text}))}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.inputHint}>Tap 📅 for calendar or type date (Current: {formData.dueDate || 'None'})</Text>
              </View>

              {/* Time Input */}
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeSubLabel}>Time (Optional)</Text>
                <View style={styles.dateTimeInputContainer}>
                  <TouchableOpacity 
                    style={styles.emojiButton}
                    onPress={() => {
                      // If time is empty, set current time as initial value for picker
                      if (!formData.dueTime) {
                        setFormData(prev => ({...prev, dueTime: getCurrentTime()}));
                      }
                      setShowTimePicker(true);
                    }}
                  >
                    <Text style={styles.dateTimeEmoji}>⏰</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.dateTimeInput,
                      !formData.dueTime && styles.dateTimeInputBlurred
                    ]}
                    placeholder="14:30"
                    placeholderTextColor="#BBB"
                    value={formData.dueTime}
                    onChangeText={(text) => setFormData(prev => ({...prev, dueTime: text}))}
                    keyboardType="numeric"
                  />
                  {formData.dueTime && (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => setFormData(prev => ({...prev, dueTime: ''}))}
                    >
                      <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                  )}
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
                onPress={() => setFormData(prev => ({...prev, priority: 'high'}))}
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
                onPress={() => setFormData(prev => ({...prev, priority: 'medium'}))}
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
                onPress={() => setFormData(prev => ({...prev, priority: 'low'}))}
              >
                <Text style={formData.priority === 'low' ? styles.priorityTextSelected : styles.priorityText}>🟢 Low</Text>
                <Text style={formData.priority === 'low' ? styles.prioritySubtextSelected : styles.prioritySubtext}>Nice to have</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Estimated Work Hours */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estimated Work Time *</Text>
            <View style={styles.digitPickerRow}>
              <TouchableOpacity
                style={styles.digitBox}
                onPress={() => setShowPicker({ type: 'hundreds' })}
              >
                {selectedHundreds === 0 && selectedTens === 0 && selectedOnes === 0 && selectedMinTens === 0 && selectedMinOnes === 0 ? (
                  <Text style={styles.digitPlaceholder}>H</Text>
                ) : (
                  <Text style={styles.digitValue}>{selectedHundreds}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.digitBox}
                onPress={() => setShowPicker({ type: 'tens' })}
              >
                {selectedHundreds === 0 && selectedTens === 0 && selectedOnes === 0 && selectedMinTens === 0 && selectedMinOnes === 0 ? (
                  <Text style={styles.digitPlaceholder}>H</Text>
                ) : (
                  <Text style={styles.digitValue}>{selectedTens}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.digitBox}
                onPress={() => setShowPicker({ type: 'ones' })}
              >
                {selectedHundreds === 0 && selectedTens === 0 && selectedOnes === 0 && selectedMinTens === 0 && selectedMinOnes === 0 ? (
                  <Text style={styles.digitPlaceholder}>H</Text>
                ) : (
                  <Text style={styles.digitValue}>{selectedOnes}</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.timeSeparator}>:</Text>
              <TouchableOpacity
                style={styles.digitBox}
                onPress={() => setShowPicker({ type: 'minTens' })}
              >
                {selectedHundreds === 0 && selectedTens === 0 && selectedOnes === 0 && selectedMinTens === 0 && selectedMinOnes === 0 ? (
                  <Text style={styles.digitPlaceholder}>M</Text>
                ) : (
                  <Text style={styles.digitValue}>{selectedMinTens}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.digitBox}
                onPress={() => setShowPicker({ type: 'minOnes' })}
              >
                {selectedHundreds === 0 && selectedTens === 0 && selectedOnes === 0 && selectedMinTens === 0 && selectedMinOnes === 0 ? (
                  <Text style={styles.digitPlaceholder}>M</Text>
                ) : (
                  <Text style={styles.digitValue}>{selectedMinOnes}</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              Format: HHH:MM • Total: {(selectedHundreds * 100) + (selectedTens * 10) + selectedOnes}H {(selectedMinTens * 10) + selectedMinOnes}M
            </Text>
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
                onPress={() => setFormData(prev => ({...prev, category: 'study'}))}
              >
                <Text style={styles.categoryEmoji}>📚</Text>
                <Text style={styles.categoryText}>Study</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  formData.category === 'work' && styles.categorySelected
                ]}
                onPress={() => setFormData(prev => ({...prev, category: 'work'}))}
              >
                <Text style={styles.categoryEmoji}>💼</Text>
                <Text style={styles.categoryText}>Work</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  formData.category === 'project' && styles.categorySelected
                ]}
                onPress={() => setFormData(prev => ({...prev, category: 'project'}))}
              >
                <Text style={styles.categoryEmoji}>📊</Text>
                <Text style={styles.categoryText}>Project</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.categoryButton,
                  formData.category === 'other' && styles.categorySelected
                ]}
                onPress={() => setFormData(prev => ({...prev, category: 'other'}))}
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
        
        {/* Hundreds Picker */}
        {showPicker.type === 'hundreds' && (
          <ScrollablePicker
            visible={true}
            onClose={() => setShowPicker({ type: null })}
            onSelect={(value) => {
              setSelectedHundreds(value);
              const totalHours = (value * 100) + (selectedTens * 10) + selectedOnes + ((selectedMinTens * 10 + selectedMinOnes) / 60);
              setFormData(prev => ({...prev, estimatedHours: totalHours.toString()}));
              setShowPicker({ type: null });
            }}
            selectedValue={selectedHundreds}
            minValue={0}
            maxValue={9}
            label="Hundreds"
          />
        )}
        
        {/* Tens Picker */}
        {showPicker.type === 'tens' && (
          <ScrollablePicker
            visible={true}
            onClose={() => setShowPicker({ type: null })}
            onSelect={(value) => {
              setSelectedTens(value);
              const totalHours = (selectedHundreds * 100) + (value * 10) + selectedOnes + ((selectedMinTens * 10 + selectedMinOnes) / 60);
              setFormData(prev => ({...prev, estimatedHours: totalHours.toString()}));
              setShowPicker({ type: null });
            }}
            selectedValue={selectedTens}
            minValue={0}
            maxValue={9}
            label="Tens"
          />
        )}
        
        {/* Ones Picker */}
        {showPicker.type === 'ones' && (
          <ScrollablePicker
            visible={true}
            onClose={() => setShowPicker({ type: null })}
            onSelect={(value) => {
              setSelectedOnes(value);
              const totalHours = (selectedHundreds * 100) + (selectedTens * 10) + value + ((selectedMinTens * 10 + selectedMinOnes) / 60);
              setFormData(prev => ({...prev, estimatedHours: totalHours.toString()}));
              setShowPicker({ type: null });
            }}
            selectedValue={selectedOnes}
            minValue={0}
            maxValue={9}
            label="Ones"
          />
        )}
        
        {/* Minutes Tens Picker */}
        {showPicker.type === 'minTens' && (
          <ScrollablePicker
            visible={true}
            onClose={() => setShowPicker({ type: null })}
            onSelect={(value) => {
              setSelectedMinTens(value);
              const totalHours = (selectedHundreds * 100) + (selectedTens * 10) + selectedOnes + ((value * 10 + selectedMinOnes) / 60);
              setFormData(prev => ({...prev, estimatedHours: totalHours.toString()}));
              setShowPicker({ type: null });
            }}
            selectedValue={selectedMinTens}
            minValue={0}
            maxValue={5}
            label="Minutes (Tens)"
          />
        )}
        
        {/* Minutes Ones Picker */}
        {showPicker.type === 'minOnes' && (
          <ScrollablePicker
            visible={true}
            onClose={() => setShowPicker({ type: null })}
            onSelect={(value) => {
              setSelectedMinOnes(value);
              const totalHours = (selectedHundreds * 100) + (selectedTens * 10) + selectedOnes + ((selectedMinTens * 10 + value) / 60);
              setFormData(prev => ({...prev, estimatedHours: totalHours.toString()}));
              setShowPicker({ type: null });
            }}
            selectedValue={selectedMinOnes}
            minValue={0}
            maxValue={9}
            label="Minutes (Ones)"
          />
        )}
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
  digitPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SCREEN_WIDTH * 0.02,
  },
  digitBox: {
    backgroundColor: '#fcfc00ff',
    borderRadius: 12,
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_WIDTH * 0.15,
    borderWidth: 3,
    borderColor: '#e94343ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  digitValue: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: '900',
    color: '#333',
  },
  digitPlaceholder: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: '600',
    color: '#BBB',
  },
  timeSeparator: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  // Blur styles for optional time field - make text look like placeholder
  dateTimeSubLabelBlurred: {
    color: '#BBB',
    fontWeight: '400',
  },
  dateTimeInputContainerBlurred: {
    borderColor: '#E0E0E0',
  },
  dateTimeEmojiBlurred: {
    // Emoji stays normal, no blur
  },
  dateTimeInputBlurred: {
    color: '#BBB',
    fontWeight: '400',
  },
  inputHintBlurred: {
    color: '#CCC',
  },
  clearButton: {
    padding: SCREEN_WIDTH * 0.02,
    marginLeft: SCREEN_WIDTH * 0.01,
  },
  clearButtonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#FF5252',
    fontWeight: '600',
  },
});
