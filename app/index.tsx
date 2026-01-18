import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store-modular';
import QuillbyPet from './components/character/QuillbyPet';
import EnergyBar from './components/progress/EnergyBar';
import RoomBackground from './components/room/RoomBackground';
import { formatSleepTime } from '../lib/timeUtils';
import { getTodaysSleepHours } from './core/engine';
import { isOnboardingCompleted } from '../lib/deviceOnboarding';

export default function HomeScreen() {
  const router = useRouter();
  const [deviceOnboardingCompleted, setDeviceOnboardingCompleted] = useState<boolean | null>(null);
  
  const { 
    userData, 
    updateEnergy,
    startFocusSession,
    logWater, 
    logBreakfast, 
    skipTask,
    resetDay
  } = useQuillbyStore();
  
  // Get personalized data from onboarding
  const buddyName = userData.buddyName || 'Quillby';
  const userName = userData.userName || 'Friend';
  const selectedCharacter = userData.selectedCharacter || 'casual';
  const enabledHabits = userData.enabledHabits || ['study'];
  
  // Calculate sleep hours with useMemo to ensure reactivity
  const todaysSleep = useMemo(() => {
    return getTodaysSleepHours(userData.sleepSessions || []);
  }, [userData.sleepSessions]);
  
  // Check device-level onboarding completion
  useEffect(() => {
    const checkDeviceOnboarding = async () => {
      try {
        const completed = await isOnboardingCompleted();
        setDeviceOnboardingCompleted(completed);
        
        if (!completed) {
          console.log('[HomeScreen] Device onboarding not completed, redirecting to welcome');
          const timer = setTimeout(() => {
            router.replace('/onboarding/welcome');
          }, 1000);
          
          return () => clearTimeout(timer);
        } else {
          console.log('[HomeScreen] Device onboarding completed, checking if returning user');
          // For returning users, show welcome back screen first
          if (userData.buddyName && userData.userName) {
            console.log('[HomeScreen] Returning user detected, showing welcome back');
            router.replace('/welcome-back');
          } else {
            console.log('[HomeScreen] New user with completed onboarding, staying on home');
          }
        }
      } catch (err) {
        console.error('[HomeScreen] Error checking device onboarding:', err);
        // On error, assume onboarding not completed
        setDeviceOnboardingCompleted(false);
        router.replace('/onboarding/welcome');
      }
    };
    
    checkDeviceOnboarding();
  }, []);
  
  // Update energy periodically (just caps it, no drain)
  useEffect(() => {
    const interval = setInterval(() => {
      updateEnergy();
    }, 30000); // Update every 30 seconds instead of every second for better performance
    
    return () => clearInterval(interval);
  }, []);
  
  // Show loading while checking onboarding status
  if (deviceOnboardingCompleted === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  const handleStartSession = () => {
    const success = startFocusSession();
    if (success) {
      router.push('/study-session');
    } else {
      Alert.alert(
        "Not Enough Energy",
        "Quillby needs at least 20 energy to focus. Try logging your habits or taking a break!",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleLogSleep = () => {
    const formattedSleep = formatSleepTime(todaysSleep);
    Alert.alert(
      "Sleep Tracking",
      `Today's sleep: ${formattedSleep}\n\nUse the sleep button in the main app to track sleep sessions.`,
      [{ text: "OK" }]
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Personalized Welcome Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome back, {userName}! 👋</Text>
        <Text style={styles.buddyText}>{buddyName} is ready to help you focus</Text>
      </View>
      
      {/* Header with Q-Coins and Max Cap */}
      <View style={styles.header}>
        <View style={styles.coinContainer}>
          <Text style={styles.coinText}>🪙 {userData.qCoins}</Text>
        </View>
      </View>
      
      {/* Energy Capacity Display */}
      <View style={styles.capContainer}>
        <Text style={styles.capTitle}>Energy Capacity</Text>
        <View style={styles.capBar}>
          <View style={[styles.capFill, { width: `${userData.maxEnergyCap}%` }]} />
        </View>
        <Text style={styles.capText}>
          {userData.maxEnergyCap}/100
          {userData.maxEnergyCap < 100 && ' ⚠️ Penalty Active'}
        </Text>
      </View>
      
      {/* Room Background */}
      <RoomBackground messPoints={userData.messPoints} />
      
      {/* Quillby Pet */}
      <QuillbyPet 
        energy={userData.energy} 
        maxEnergy={userData.maxEnergyCap}
        messPoints={userData.messPoints}
      />
      
      {/* Energy Bar */}
      <EnergyBar current={userData.energy} max={userData.maxEnergyCap} />
      
      {/* Main Action Button */}
      <TouchableOpacity 
        style={[styles.mainButton, userData.energy < 20 && styles.mainButtonDisabled]}
        onPress={handleStartSession}
      >
        <Text style={styles.mainButtonText}>
          {userData.energy >= 20 ? '📚 Start Focus Session' : '😴 Too Tired to Focus'}
        </Text>
      </TouchableOpacity>
      
      {/* Daily Habits Section - Only show enabled habits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Care for {buddyName}</Text>
        
        {/* Meals - Only show if enabled */}
        {enabledHabits.includes('meals') && (
          <View style={styles.habitRow}>
            <TouchableOpacity 
              style={[styles.habitButton, userData.ateBreakfast && styles.habitButtonDone]}
              onPress={logBreakfast}
              disabled={userData.ateBreakfast}
            >
              <Text style={styles.habitButtonText}>
                {userData.ateBreakfast ? '✅ Ate Breakfast' : '🍎 Log Breakfast'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Hydration - Only show if enabled */}
        {enabledHabits.includes('hydration') && (
          <View style={styles.habitRow}>
            <TouchableOpacity 
              style={styles.habitButton}
              onPress={logWater}
              disabled={userData.waterGlasses >= 8}
            >
              <Text style={styles.habitButtonText}>
                💧 Log Water ({userData.waterGlasses}/8)
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Sleep - Only show if enabled */}
        {enabledHabits.includes('sleep') && (
          <View style={styles.habitRow}>
            <TouchableOpacity 
              style={styles.habitButton}
              onPress={handleLogSleep}
            >
              <Text style={styles.habitButtonText}>
                😴 Sleep Tracker ({formatSleepTime(todaysSleep)})
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Exercise - Only show if enabled */}
        {enabledHabits.includes('exercise') && (
          <View style={styles.habitRow}>
            <TouchableOpacity 
              style={styles.habitButton}
              onPress={() => Alert.alert('Exercise', 'Exercise logging coming soon!')}
            >
              <Text style={styles.habitButtonText}>
                🏃 Log Exercise
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Show message if no habits enabled */}
        {enabledHabits.length === 1 && enabledHabits[0] === 'study' && (
          <Text style={styles.noHabitsText}>
            💡 Enable more habits in settings to track meals, water, sleep, and exercise!
          </Text>
        )}
      </View>
      
      {/* Testing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Controls</Text>
        
        <TouchableOpacity 
          style={[styles.testButton, styles.dangerButton]}
          onPress={skipTask}
        >
          <Text style={styles.testButtonText}>Skip Task (Add Mess)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.testButton}
          onPress={resetDay}
        >
          <Text style={styles.testButtonText}>Reset Daily Habits</Text>
        </TouchableOpacity>
      </View>
      
      {/* Stats Display */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Current Stats</Text>
        <Text style={styles.statsText}>
          Energy: {Math.round(userData.energy)} / {userData.maxEnergyCap}
          {userData.maxEnergyCap < 100 && ' ⚠️'}
        </Text>
        <Text style={styles.statsText}>
          Max Energy Cap: {userData.maxEnergyCap}
          {userData.maxEnergyCap < 100 && ' (Penalties Applied)'}
        </Text>
        <Text style={styles.statsText}>Mess Points: {userData.messPoints}</Text>
        <Text style={styles.statsText}>Streak: {userData.currentStreak} days</Text>
        <Text style={styles.statsText}>Q-Coins: {userData.qCoins}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  coinContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  coinText: {
    fontSize: 18,
    fontWeight: '700',
  },
  capContainer: {
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  capTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
    marginBottom: 5,
  },
  capBar: {
    height: 10,
    backgroundColor: '#FFECB3',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 5,
  },
  capFill: {
    height: '100%',
    backgroundColor: '#FFB300',
    borderRadius: 5,
  },
  capText: {
    fontSize: 12,
    color: '#FF6F00',
    fontWeight: '600',
  },
  mainButton: {
    backgroundColor: '#6200EA',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  mainButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  habitRow: {
    marginVertical: 5,
  },
  habitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  habitButtonDone: {
    backgroundColor: '#81C784',
  },
  habitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 5,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  welcomeHeader: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  buddyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  noHabitsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    padding: 15,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
  },
});
