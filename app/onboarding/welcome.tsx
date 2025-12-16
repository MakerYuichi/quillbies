import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { ChakraPetch_400Regular, ChakraPetch_600SemiBold } from '@expo-google-fonts/chakra-petch';

export default function WelcomeScreen() {
  const router = useRouter();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Load custom fonts (including Caviche from local file)
  const [fontsLoaded] = useFonts({
    'Caviche': require('../../assets/fonts/Caviche-Regular.ttf'),
    'CaveatBrush': require('../../assets/fonts/CaveatBrush-Regular.ttf'),
    ChakraPetch_400Regular,
    ChakraPetch_600SemiBold,
  });
  
  // Show loading while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ color: '#FFF', marginTop: 10 }}>Loading fonts...</Text>
      </View>
    );
  }

  const handleAllowNotifications = async () => {
    try {
      console.log('[Notifications] Starting permission request...');
      
      // 1. Check existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('[Notifications] Existing status:', existingStatus);
      let finalStatus = existingStatus;
      
      // 2. If not granted, request permission (triggers system dialog)
      if (existingStatus !== 'granted') {
        console.log('[Notifications] Requesting permission (should show system dialog)...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        console.log('[Notifications] Permission response:', status);
        finalStatus = status;
      } else {
        console.log('[Notifications] Permission already granted, skipping dialog');
      }
      
      // 3. Log result
      if (finalStatus === 'granted') {
        console.log('[Notifications] Final status: GRANTED');
        
        // Optional: Schedule a welcome notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Welcome to Quillby! 🐹',
            body: 'Your study buddy is ready to help you focus.',
          },
          trigger: null, // Immediate notification
        });
      } else {
        console.log('[Notifications] SYSTEM permission denied');
      }
      
      // 4. Navigate to next screen (no success alert)
      router.push('/onboarding/character-select');
      
    } catch (error) {
      console.error('[Notifications] Error:', error);
      // Navigate anyway on error
      router.push('/onboarding/character-select');
    }
  };

  const handleMaybeLater = () => {
    console.log('[Notifications] User skipped permission');
    router.push('/onboarding/character-select');
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/welcome-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Semi-transparent overlay for text readability */}
      <View style={styles.overlay}>
        {/* Content Container - Centered */}
        <View style={styles.contentContainer}>
          {/* Title and Description */}
          <View style={styles.textSection}>
            {/* Headline with Caveat font */}
            <Text style={styles.title}>Your Quillby Is Waiting...</Text>
            
            {/* Body Text with Chakra Petch font */}
            <Text style={styles.description}>
              Meet your personal accountability hamster. Quillby stays with you, studies with you, takes breaks with you, and helps you build unstoppable focus.
            </Text>
          </View>
          
          {/* Main Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.beginButton}
              onPress={() => setShowNotificationModal(true)}
            >
              <Text style={styles.beginButtonText}>Let's Begin</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Custom Notification Permission Modal */}
        {showNotificationModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Modal Header */}
              <Text style={styles.modalTitle}>Gentle Reminders 🐹</Text>
              
              {/* Modal Body */}
              <Text style={styles.modalText}>
                Stay on track with friendly reminders from Quillby
              </Text>
              
              {/* Modal Buttons */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={styles.modalDenyButton}
                  onPress={() => {
                    setShowNotificationModal(false);
                    Alert.alert(
                      "No Problem!",
                      "You can always enable notifications later in your device settings.",
                      [{ 
                        text: "OK", 
                        onPress: () => router.push('/onboarding/character-select') 
                      }]
                    );
                  }}
                >
                  <Text style={styles.modalDenyButtonText}>Not Now</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalAllowButton}
                  onPress={async () => {
                    setShowNotificationModal(false);
                    await handleAllowNotifications();
                  }}
                >
                  <Text style={styles.modalAllowButtonText}>Allow Notifications</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A237E',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent dark overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  contentContainer: {
    flex: 1, 
    width: '100%',
    maxWidth: 400,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  textSection: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Caviche', // Custom Caviche font
    fontSize: 70,
    color: '#63582A',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    
  },
  description: {
    fontFamily: 'ChakraPetch_400Regular', // Custom Chakra Petch font
    fontSize: 18,
    color: '#000000ff',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '90%',
  },
  beginButton: {
    backgroundColor: '#d4a257ff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  beginButtonText: {
    fontFamily: 'CaveatBrush',
    color: '#000000ff',
    fontSize: 48,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: 22,
    color: '#333',
    marginBottom: 15,
  },
  modalText: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  modalDenyButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  modalDenyButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#666',
    fontSize: 16,
  },
  modalAllowButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalAllowButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    color: '#FFF',
    fontSize: 16,
  },
});
