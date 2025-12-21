import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: {
    userName: string;
    buddyName: string;
    studentLevel: string;
    country: string;
    timezone: string;
  }) => void;
  currentProfile: {
    userName?: string;
    buddyName?: string;
    studentLevel?: string;
    country?: string;
    timezone?: string;
  };
}

const STUDENT_LEVELS = [
  { id: 'highschool', label: 'High School' },
  { id: 'university', label: 'University' },
  { id: 'graduate', label: 'Graduate' },
  { id: 'learner', label: 'Lifelong Learner' },
];

// Country to timezone mapping
const COUNTRY_TIMEZONES: { [key: string]: string } = {
  // Americas
  'usa': 'UTC-05:00',
  'united states': 'UTC-05:00',
  'canada': 'UTC-05:00',
  'mexico': 'UTC-06:00',
  'brazil': 'UTC-03:00',
  'argentina': 'UTC-03:00',
  'chile': 'UTC-03:00',
  'colombia': 'UTC-05:00',
  'peru': 'UTC-05:00',
  
  // Europe
  'uk': 'UTC+00:00',
  'united kingdom': 'UTC+00:00',
  'england': 'UTC+00:00',
  'ireland': 'UTC+00:00',
  'france': 'UTC+01:00',
  'germany': 'UTC+01:00',
  'spain': 'UTC+01:00',
  'italy': 'UTC+01:00',
  'netherlands': 'UTC+01:00',
  'belgium': 'UTC+01:00',
  'switzerland': 'UTC+01:00',
  'austria': 'UTC+01:00',
  'poland': 'UTC+01:00',
  'sweden': 'UTC+01:00',
  'norway': 'UTC+01:00',
  'denmark': 'UTC+01:00',
  'finland': 'UTC+02:00',
  'greece': 'UTC+02:00',
  'turkey': 'UTC+03:00',
  'russia': 'UTC+03:00',
  
  // Asia
  'india': 'UTC+05:30',
  'pakistan': 'UTC+05:00',
  'bangladesh': 'UTC+06:00',
  'sri lanka': 'UTC+05:30',
  'nepal': 'UTC+05:45',
  'china': 'UTC+08:00',
  'japan': 'UTC+09:00',
  'south korea': 'UTC+09:00',
  'korea': 'UTC+09:00',
  'thailand': 'UTC+07:00',
  'vietnam': 'UTC+07:00',
  'singapore': 'UTC+08:00',
  'malaysia': 'UTC+08:00',
  'indonesia': 'UTC+07:00',
  'philippines': 'UTC+08:00',
  'hong kong': 'UTC+08:00',
  'taiwan': 'UTC+08:00',
  
  // Middle East
  'uae': 'UTC+04:00',
  'dubai': 'UTC+04:00',
  'saudi arabia': 'UTC+03:00',
  'israel': 'UTC+02:00',
  'iran': 'UTC+03:30',
  'iraq': 'UTC+03:00',
  'egypt': 'UTC+02:00',
  
  // Africa
  'south africa': 'UTC+02:00',
  'nigeria': 'UTC+01:00',
  'kenya': 'UTC+03:00',
  'ethiopia': 'UTC+03:00',
  'morocco': 'UTC+00:00',
  
  // Oceania
  'australia': 'UTC+10:00',
  'new zealand': 'UTC+12:00',
};

export default function EditProfileModal({
  visible,
  onClose,
  onSave,
  currentProfile,
}: EditProfileModalProps) {
  const [userName, setUserName] = useState(currentProfile.userName || '');
  const [buddyName, setBuddyName] = useState(currentProfile.buddyName || '');
  const [studentLevel, setStudentLevel] = useState(currentProfile.studentLevel || 'university');
  const [country, setCountry] = useState(currentProfile.country || '');
  const [timezone, setTimezone] = useState(currentProfile.timezone || '');

  // Auto-update timezone when country changes
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    
    // Try to find matching timezone for country
    const countryLower = newCountry.toLowerCase().trim();
    const matchedTimezone = COUNTRY_TIMEZONES[countryLower];
    
    if (matchedTimezone) {
      setTimezone(matchedTimezone);
    } else if (!timezone) {
      // If no match and no timezone set, auto-detect
      const offset = -new Date().getTimezoneOffset() / 60;
      const sign = offset >= 0 ? '+' : '';
      const hours = Math.floor(Math.abs(offset));
      const minutes = Math.round((Math.abs(offset) % 1) * 60);
      const autoTimezone = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setTimezone(autoTimezone);
    }
  };

  // Reset form values when modal opens
  React.useEffect(() => {
    if (visible) {
      setUserName(currentProfile.userName || '');
      setBuddyName(currentProfile.buddyName || '');
      setStudentLevel(currentProfile.studentLevel || 'university');
      setCountry(currentProfile.country || '');
      
      // Auto-detect timezone if not set
      if (!currentProfile.timezone) {
        const offset = -new Date().getTimezoneOffset() / 60;
        const sign = offset >= 0 ? '+' : '';
        const hours = Math.floor(Math.abs(offset));
        const minutes = Math.round((Math.abs(offset) % 1) * 60);
        const autoTimezone = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        setTimezone(autoTimezone);
      } else {
        setTimezone(currentProfile.timezone);
      }
    }
  }, [visible, currentProfile]);

  const handleSave = () => {
    if (userName.trim().length === 0 || buddyName.trim().length === 0) {
      return; // Don't save if names are empty
    }
    
    onSave({
      userName: userName.trim(),
      buddyName: buddyName.trim(),
      studentLevel,
      country: country.trim(),
      timezone: timezone.trim(),
    });
    onClose();
  };

  const isValid = userName.trim().length > 0 && buddyName.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Your Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name *</Text>
              <TextInput
                style={styles.input}
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                maxLength={30}
              />
            </View>

            {/* Buddy Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Buddy Name *</Text>
              <TextInput
                style={styles.input}
                value={buddyName}
                onChangeText={setBuddyName}
                placeholder="Enter buddy name"
                placeholderTextColor="#999"
                maxLength={20}
              />
            </View>

            {/* Student Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student Level</Text>
              <View style={styles.optionsGrid}>
                {STUDENT_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.optionButton,
                      studentLevel === level.id && styles.optionButtonSelected,
                    ]}
                    onPress={() => setStudentLevel(level.id)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        studentLevel === level.id && styles.optionButtonTextSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={handleCountryChange}
                placeholder="Enter your country"
                placeholderTextColor="#999"
                maxLength={50}
              />
            </View>

            {/* Timezone - Auto-filled based on country */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Timezone {timezone && '✓'}</Text>
              <View style={styles.timezoneDisplay}>
                <Text style={styles.timezoneDisplayText}>
                  {timezone || 'Will auto-detect based on country'}
                </Text>
              </View>
              <Text style={styles.timezoneHint}>
                {country ? `Auto-set for ${country}` : 'Enter country to auto-detect timezone'}
              </Text>
            </View>

            <Text style={styles.hint}>* Required fields • Timezone auto-updates based on country</Text>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={!isValid}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    maxHeight: SCREEN_HEIGHT * 0.8,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  timezoneDisplay: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  timezoneDisplayText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  timezoneHint: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
