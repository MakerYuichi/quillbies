import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import * as Localization from 'expo-localization';
import * as Location from 'expo-location';
import { useQuillbyStore } from '../state/store-modular';

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Country to Timezone mapping
const COUNTRY_TIMEZONES: Record<string, string[]> = {
  'US': [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
  ],
  'UK': ['Europe/London'],
  'CA': [
    'America/Toronto',
    'America/Winnipeg',
    'America/Edmonton',
    'America/Vancouver',
  ],
  'AU': [
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Brisbane',
    'Australia/Adelaide',
    'Australia/Perth',
  ],
  'IN': ['Asia/Kolkata'],
  'DE': ['Europe/Berlin'],
  'FR': ['Europe/Paris'],
  'JP': ['Asia/Tokyo'],
  'KR': ['Asia/Seoul'],
  'BR': [
    'America/Sao_Paulo',
    'America/Manaus',
    'America/Fortaleza',
  ],
  'MX': [
    'America/Mexico_City',
    'America/Cancun',
    'America/Tijuana',
  ],
  'ES': ['Europe/Madrid'],
  'IT': ['Europe/Rome'],
  'NL': ['Europe/Amsterdam'],
  'SE': ['Europe/Stockholm'],
  'OTHER': ['UTC'],
};

// Timezone display names
const TIMEZONE_NAMES: Record<string, string> = {
  'America/New_York': 'Eastern Time (EST/EDT)',
  'America/Chicago': 'Central Time (CST/CDT)',
  'America/Denver': 'Mountain Time (MST/MDT)',
  'America/Los_Angeles': 'Pacific Time (PST/PDT)',
  'America/Anchorage': 'Alaska Time (AKST/AKDT)',
  'Pacific/Honolulu': 'Hawaii Time (HST)',
  'Europe/London': 'Greenwich Mean Time (GMT/BST)',
  'America/Toronto': 'Eastern Time (EST/EDT)',
  'America/Winnipeg': 'Central Time (CST/CDT)',
  'America/Edmonton': 'Mountain Time (MST/MDT)',
  'America/Vancouver': 'Pacific Time (PST/PDT)',
  'Australia/Sydney': 'Australian Eastern Time (AEST/AEDT)',
  'Australia/Melbourne': 'Australian Eastern Time (AEST/AEDT)',
  'Australia/Brisbane': 'Australian Eastern Time (AEST)',
  'Australia/Adelaide': 'Australian Central Time (ACST/ACDT)',
  'Australia/Perth': 'Australian Western Time (AWST)',
  'Asia/Kolkata': 'India Standard Time (IST)',
  'Europe/Berlin': 'Central European Time (CET/CEST)',
  'Europe/Paris': 'Central European Time (CET/CEST)',
  'Asia/Tokyo': 'Japan Standard Time (JST)',
  'Asia/Seoul': 'Korea Standard Time (KST)',
  'America/Sao_Paulo': 'Brasília Time (BRT/BRST)',
  'America/Manaus': 'Amazon Time (AMT)',
  'America/Fortaleza': 'Brasília Time (BRT)',
  'America/Mexico_City': 'Central Time (CST/CDT)',
  'America/Cancun': 'Eastern Time (EST)',
  'America/Tijuana': 'Pacific Time (PST/PDT)',
  'Europe/Madrid': 'Central European Time (CET/CEST)',
  'Europe/Rome': 'Central European Time (CET/CEST)',
  'Europe/Amsterdam': 'Central European Time (CET/CEST)',
  'Europe/Stockholm': 'Central European Time (CET/CEST)',
  'UTC': 'Coordinated Universal Time (UTC)',
};

// Picker data arrays
const STUDENT_LEVELS = [
  { label: '👨‍🎓 High School Student', value: 'highschool' },
  { label: '👩‍🎓 University Student', value: 'university' },
  { label: '👨‍🎓 Graduate Student', value: 'graduate' },
  { label: '📚 Lifelong Learner', value: 'learner' },
];

const COUNTRIES = [
  { label: '🇺🇸 United States', value: 'US' },
  { label: '🇬🇧 United Kingdom', value: 'UK' },
  { label: '🇨🇦 Canada', value: 'CA' },
  { label: '🇦🇺 Australia', value: 'AU' },
  { label: '🇮🇳 India', value: 'IN' },
  { label: '🇩🇪 Germany', value: 'DE' },
  { label: '🇫🇷 France', value: 'FR' },
  { label: '🇯🇵 Japan', value: 'JP' },
  { label: '🇰🇷 South Korea', value: 'KR' },
  { label: '🇧🇷 Brazil', value: 'BR' },
  { label: '🇲🇽 Mexico', value: 'MX' },
  { label: '🇪🇸 Spain', value: 'ES' },
  { label: '🇮🇹 Italy', value: 'IT' },
  { label: '🇳🇱 Netherlands', value: 'NL' },
  { label: '🇸🇪 Sweden', value: 'SE' },
  { label: '🌍 Other', value: 'OTHER' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const setProfile = useQuillbyStore((state) => state.setProfile);
  
  const [userName, setUserName] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');

  // Custom picker modal states
  const [showStudentLevelPicker, setShowStudentLevelPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Caviche': require('../../assets/fonts/Caviche-Regular.ttf'),
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });

  // Show loading while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  // Auto-fill timezone when country changes
  useEffect(() => {
    if (country && COUNTRY_TIMEZONES[country]) {
      const timezones = COUNTRY_TIMEZONES[country];
      if (timezones.length > 0) {
        setTimezone(timezones[0]); // Auto-select first timezone
        console.log(`[Profile] Auto-selected timezone: ${timezones[0]} for ${country}`);
      }
    }
  }, [country]);

  const detectLocation = async () => {
    try {
      console.log('[Profile] User clicked detect location button');
      
      // 1. Show explanation and ask for user confirmation first
      const userConfirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          '📍 Detect Your Location',
          'Quillby needs access to your location to automatically detect your country and timezone. This helps set up your study schedule correctly.\n\nYour location is only used once for setup and is not stored or tracked.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Allow Access',
              onPress: () => resolve(true)
            }
          ]
        );
      });
      
      if (!userConfirmed) {
        console.log('[Profile] User canceled location permission');
        return;
      }
      
      console.log('[Profile] User agreed, requesting system permission...');
      
      // 2. Request system location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('[Profile] Location permission denied by system');
        Alert.alert(
          'Permission Denied',
          'Location access is needed to detect your country. Please select it manually from the list.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('[Profile] Location permission granted, getting location...');
      
      // 3. Get current location (low accuracy = faster, less battery)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest, // Fastest, most battery-friendly
      });
      
      console.log('[Profile] Got coordinates:', location.coords.latitude, location.coords.longitude);
      
      // 4. Convert coordinates to country
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (geocode.length === 0) {
        throw new Error('No geocode results');
      }
      
      const countryCode = geocode[0].isoCountryCode;
      const countryName = geocode[0].country;
      const region = geocode[0].region;
      
      console.log('[Profile] Geocode result:', { countryCode, countryName, region });
      
      // 5. Map ISO country code to our country codes
      const countryCodeMap: Record<string, string> = {
        'US': 'US',
        'GB': 'UK', // ISO code GB maps to our UK
        'CA': 'CA',
        'AU': 'AU',
        'IN': 'IN',
        'DE': 'DE',
        'FR': 'FR',
        'JP': 'JP',
        'KR': 'KR',
        'BR': 'BR',
        'MX': 'MX',
        'ES': 'ES',
        'IT': 'IT',
        'NL': 'NL',
        'SE': 'SE',
      };
      
      // 6. Check if country is in our list
      if (countryCode && countryCodeMap[countryCode]) {
        const mappedCountryCode = countryCodeMap[countryCode];
        setCountry(mappedCountryCode);
        
        // Try to match timezone
        const timezones = COUNTRY_TIMEZONES[mappedCountryCode];
        if (timezones && timezones.length > 0) {
          // Try to get device timezone and match it
          const calendars = Localization.getCalendars();
          const deviceTimezone = calendars[0]?.timeZone;
          
          if (deviceTimezone && timezones.includes(deviceTimezone)) {
            setTimezone(deviceTimezone);
            console.log('[Profile] Matched device timezone:', deviceTimezone);
          } else {
            setTimezone(timezones[0]); // Use first timezone as default
            console.log('[Profile] Using default timezone:', timezones[0]);
          }
        }
        
        Alert.alert(
          '✅ Location Detected!',
          `Detected: ${countryName}${region ? `, ${region}` : ''}\n\nYou can adjust the timezone if needed.`,
          [{ text: 'Great!' }]
        );
        
      } else {
        console.log('[Profile] Country not in our list:', countryCode, countryName);
        Alert.alert(
          'Country Not in List',
          `Detected: ${countryName || 'Unknown'}. Please select your country manually from the list.`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('[Profile] Location detection failed:', error);
      
      Alert.alert(
        'Detection Failed',
        'Could not detect your location. Please select country and timezone manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNext = () => {
    if (isFormValid) {
      // Save to store
      setProfile(userName, studentLevel, country, timezone);
      // Navigate to habit setup screen
      router.push('/onboarding/habit-setup');
    }
  };

  const isFormValid = studentLevel && country && timezone; // All three required

  // Custom Picker Component
  const CustomPicker = ({ 
    visible, 
    onClose, 
    title, 
    options, 
    selectedValue, 
    onSelect 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: { label: string; value: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.pickerModalCloseButton}>
              <Text style={styles.pickerModalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerModalScrollView}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.pickerModalOption,
                  selectedValue === option.value && styles.pickerModalOptionSelected
                ]}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.pickerModalOptionText,
                  selectedValue === option.value && styles.pickerModalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Text style={styles.pickerModalCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  // Get timezone options based on selected country
  const getTimezoneOptions = () => {
    if (!country || !COUNTRY_TIMEZONES[country]) {
      return [];
    }
    return COUNTRY_TIMEZONES[country].map(tz => ({
      label: TIMEZONE_NAMES[tz] || tz,
      value: tz,
    }));
  };

  // Helper functions to get display labels
  const getStudentLevelLabel = () => {
    const level = STUDENT_LEVELS.find(l => l.value === studentLevel);
    return level ? level.label : 'Select your level...';
  };

  const getCountryLabel = () => {
    const countryData = COUNTRIES.find(c => c.value === country);
    return countryData ? countryData.label : 'Select your country...';
  };

  const getTimezoneLabel = () => {
    const timezoneOptions = getTimezoneOptions();
    const timezoneData = timezoneOptions.find(t => t.value === timezone);
    return timezoneData ? timezoneData.label : (country ? 'Select timezone...' : 'Select country first');
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Tell Us About{'\n'}Yourself</Text>
        <Text style={styles.subtitle}>Help Quillby understand your world</Text>

        {/* Form Container */}
        <View style={styles.formContainer}>
          
          {/* 1. Name Input (Optional) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>What should we call you?</Text>
            <Text style={styles.inputHint}>(Optional - for personalized messages)</Text>
            <TextInput
              style={styles.textInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="e.g., Alex, Sam, Taylor"
              placeholderTextColor="#999"
              maxLength={30}
            />
          </View>

          {/* 2. Student Level Picker */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>You are a...</Text>
            <TouchableOpacity 
              style={styles.customPickerButton}
              onPress={() => setShowStudentLevelPicker(true)}
            >
              <Text style={[
                styles.customPickerButtonText,
                !studentLevel && styles.customPickerButtonTextPlaceholder
              ]}>
                {getStudentLevelLabel()}
              </Text>
              <Text style={styles.customPickerButtonArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* 3. Country Picker (Simplified) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your country</Text>
            <Text style={styles.inputHint}>(For academic calendars & holidays)</Text>
            <TouchableOpacity 
              style={styles.customPickerButton}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={[
                styles.customPickerButtonText,
                !country && styles.customPickerButtonTextPlaceholder
              ]}>
                {getCountryLabel()}
              </Text>
              <Text style={styles.customPickerButtonArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* 4. Timezone Picker (Auto-filled based on country) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your timezone</Text>
            <Text style={styles.inputHint}>
              {country 
                ? '(Auto-selected, but you can change it)' 
                : '(Select country first)'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.customPickerButton,
                !country && styles.customPickerButtonDisabled
              ]}
              onPress={() => country && setShowTimezonePicker(true)}
              disabled={!country}
            >
              <Text style={[
                styles.customPickerButtonText,
                !timezone && styles.customPickerButtonTextPlaceholder,
                !country && styles.customPickerButtonTextDisabled
              ]}>
                {getTimezoneLabel()}
              </Text>
              <Text style={[
                styles.customPickerButtonArrow,
                !country && styles.customPickerButtonArrowDisabled
              ]}>▼</Text>
            </TouchableOpacity>
            
            {/* Auto-detect button (only show if no country selected) */}
            {!country && (
              <TouchableOpacity
                style={styles.detectButton}
                onPress={detectLocation}
              >
                <Text style={styles.detectButtonText}>
                  📍 Detect my location automatically
                </Text>
              </TouchableOpacity>
            )}
          </View>



        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
          disabled={!isFormValid}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {isFormValid ? 'Complete Setup →' : 'Fill all required fields'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Custom Picker Modals */}
      <CustomPicker
        visible={showStudentLevelPicker}
        onClose={() => setShowStudentLevelPicker(false)}
        title="Select Your Level"
        options={STUDENT_LEVELS}
        selectedValue={studentLevel}
        onSelect={setStudentLevel}
      />

      <CustomPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        title="Select Your Country"
        options={COUNTRIES}
        selectedValue={country}
        onSelect={setCountry}
      />

      <CustomPicker
        visible={showTimezonePicker}
        onClose={() => setShowTimezonePicker(false)}
        title="Select Your Timezone"
        options={getTimezoneOptions()}
        selectedValue={timezone}
        onSelect={setTimezone}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.08,
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  // RESPONSIVE: Title
  title: {
    fontFamily: 'Caviche',
    fontSize: SCREEN_WIDTH * 0.12,
    lineHeight: SCREEN_WIDTH * 0.13,
    color: '#63582A',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  subtitle: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  // Form Container
  formContainer: {
    gap: SCREEN_HEIGHT * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  // Input Cards
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: SCREEN_WIDTH * 0.05,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  inputHint: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  textInput: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.03,
    backgroundColor: '#FFF',
  },
  // Custom Picker Button Styles
  customPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_HEIGHT * 0.018,
    minHeight: 55,
  },
  customPickerButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCC',
  },
  customPickerButtonText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    flex: 1,
  },
  customPickerButtonTextPlaceholder: {
    color: '#999',
  },
  customPickerButtonTextDisabled: {
    color: '#CCC',
  },
  customPickerButtonArrow: {
    fontSize: SCREEN_WIDTH * 0.05,
    color: '#666',
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  customPickerButtonArrowDisabled: {
    color: '#CCC',
  },
  // Custom Picker Modal Styles
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  pickerModalTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#333',
    flex: 1,
  },
  pickerModalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModalCloseText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    fontWeight: '600',
  },
  pickerModalScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  pickerModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerModalOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  pickerModalOptionText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    flex: 1,
  },
  pickerModalOptionTextSelected: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#2E7D32',
  },
  pickerModalCheckmark: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  // Next Button
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.045,
  },
  // Detect Button
  detectButton: {
    marginTop: SCREEN_HEIGHT * 0.015,
    backgroundColor: '#FF9800',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: 10,
    alignItems: 'center',
  },
  detectButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  // Weight Goal Styles
  weightGoalContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
  },
  goalButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    position: 'relative',
  },
  goalButtonContent: {
    alignItems: 'center',
  },
  goalButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  goalButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalButtonTextSelected: {
    color: '#2E7D32',
  },
  goalSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.025,
    color: '#999',
    textAlign: 'center',
  },
  goalSubtextSelected: {
    color: '#4CAF50',
  },
  checkmark: {
    position: 'absolute',
    top: SCREEN_WIDTH * 0.01,
    right: SCREEN_WIDTH * 0.01,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
