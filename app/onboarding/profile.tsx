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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';
import RNPickerSelect from 'react-native-picker-select';
import * as Localization from 'expo-localization';
import { useQuillbyStore } from '../state/store';

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

export default function ProfileScreen() {
  const router = useRouter();
  const setProfile = useQuillbyStore((state) => state.setProfile);
  
  const [userName, setUserName] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');

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

  const detectTimezone = async () => {
    try {
      const deviceTimezone = Localization.getCalendars()[0]?.timeZone || Localization.timezone;
      console.log(`[Profile] Detected device timezone: ${deviceTimezone}`);
      
      // Find country that has this timezone
      for (const [countryCode, timezones] of Object.entries(COUNTRY_TIMEZONES)) {
        if (timezones.includes(deviceTimezone)) {
          setCountry(countryCode);
          setTimezone(deviceTimezone);
          console.log(`[Profile] Auto-detected: ${countryCode}, ${deviceTimezone}`);
          return;
        }
      }
      
      // If not found, just set the timezone
      setTimezone(deviceTimezone);
      console.log(`[Profile] Timezone detected but country not in list: ${deviceTimezone}`);
    } catch (error) {
      console.error('[Profile] Could not detect timezone:', error);
    }
  };

  const handleNext = () => {
    if (isFormValid) {
      // Save to store
      setProfile(userName, studentLevel, country, timezone);
      // Navigate to next screen (habit setup or home)
      router.push('/'); // For now, go to home screen
    }
  };

  const isFormValid = studentLevel && country && timezone; // All three required
  
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
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={setStudentLevel}
                items={[
                  { label: '👨‍🎓 High School Student', value: 'highschool' },
                  { label: '👩‍🎓 University Student', value: 'university' },
                  { label: '👨‍🎓 Graduate Student', value: 'graduate' },
                  { label: '📚 Lifelong Learner', value: 'learner' },
                ]}
                placeholder={{ label: 'Select your level...', value: null }}
                style={pickerSelectStyles}
                value={studentLevel}
              />
            </View>
          </View>

          {/* 3. Country Picker (Simplified) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your country</Text>
            <Text style={styles.inputHint}>(For academic calendars & holidays)</Text>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={setCountry}
                items={[
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
                ]}
                placeholder={{ label: 'Select your country...', value: null }}
                style={pickerSelectStyles}
                value={country}
              />
            </View>
          </View>

          {/* 4. Timezone Picker (Auto-filled based on country) */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Your timezone</Text>
            <Text style={styles.inputHint}>
              {country 
                ? '(Auto-selected, but you can change it)' 
                : '(Select country first)'}
            </Text>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={setTimezone}
                items={getTimezoneOptions()}
                placeholder={{ 
                  label: country ? 'Select timezone...' : 'Select country first', 
                  value: null 
                }}
                style={pickerSelectStyles}
                value={timezone}
                disabled={!country}
              />
            </View>
            
            {/* Auto-detect button (only show if no country selected) */}
            {!country && (
              <TouchableOpacity
                style={styles.detectButton}
                onPress={detectTimezone}
              >
                <Text style={styles.detectButtonText}>
                  📍 Detect my timezone automatically
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: SCREEN_WIDTH * 0.02,
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
});

const pickerSelectStyles = {
  inputIOS: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  inputAndroid: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  placeholder: {
    color: '#999',
  },
};
