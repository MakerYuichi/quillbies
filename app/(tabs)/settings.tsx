import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { userData, resetDay } = useQuillbyStore();
  
  const buddyName = userData.buddyName || 'Quillby';
  const userName = userData.userName || 'Friend';
  const studentLevel = userData.studentLevel || 'Not set';
  const country = userData.country || 'Not set';
  const timezone = userData.timezone || 'Not set';

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will take you back to the welcome screen. Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => router.replace('/onboarding/welcome')
        }
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your Quillby experience</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Your Name:</Text>
            <Text style={styles.infoValue}>{userName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Buddy Name:</Text>
            <Text style={styles.infoValue}>{buddyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Character:</Text>
            <Text style={styles.infoValue}>{userData.selectedCharacter || 'Not set'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student Level:</Text>
            <Text style={styles.infoValue}>{studentLevel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Country:</Text>
            <Text style={styles.infoValue}>{country}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Timezone:</Text>
            <Text style={styles.infoValue}>{timezone}</Text>
          </View>
        </View>
      </View>

      {/* Habits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enabled Habits</Text>
        <View style={styles.infoCard}>
          {userData.enabledHabits && userData.enabledHabits.length > 0 ? (
            userData.enabledHabits.map((habit, index) => (
              <Text key={index} style={styles.habitText}>
                ✅ {habit.charAt(0).toUpperCase() + habit.slice(1)}
              </Text>
            ))
          ) : (
            <Text style={styles.habitText}>No habits enabled</Text>
          )}
        </View>
      </View>

      {/* Testing Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Controls</Text>
        <TouchableOpacity style={styles.button} onPress={resetDay}>
          <Text style={styles.buttonText}>Reset Daily Habits</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={handleResetOnboarding}
        >
          <Text style={styles.buttonText}>Reset Onboarding</Text>
        </TouchableOpacity>
      </View>

      {/* Coming Soon */}
      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonTitle}>⚙️ More Settings Coming Soon!</Text>
        <Text style={styles.comingSoonText}>• Edit profile information</Text>
        <Text style={styles.comingSoonText}>• Manage enabled habits</Text>
        <Text style={styles.comingSoonText}>• Notification preferences</Text>
        <Text style={styles.comingSoonText}>• Theme customization</Text>
        <Text style={styles.comingSoonText}>• Data export</Text>
      </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  header: {
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  section: {
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  infoValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  habitText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    paddingVertical: SCREEN_HEIGHT * 0.005,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.005,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  comingSoonCard: {
    backgroundColor: '#E3F2FD',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
  },
  comingSoonTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  comingSoonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#1976D2',
    marginVertical: SCREEN_HEIGHT * 0.005,
  },
});
