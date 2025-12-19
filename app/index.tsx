import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store';
import { QuillbyPet, EnergyBar, RoomBackground } from './components';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    userData, 
    updateEnergy,
    startFocusSession,
    logWater, 
    logBreakfast, 
    logSleep,
    skipTask,
    resetDay
  } = useQuillbyStore();
  
  // Get personalized data from onboarding
  const buddyName = userData.buddyName || 'Quillby';
  const userName = userData.userName || 'Friend';
  const selectedCharacter = userData.selectedCharacter || 'casual';
  const enabledHabits = userData.enabledHabits || ['study'];
  
  // Always redirect to onboarding for testing
  useEffect(() => {
    // Small delay to ensure layout is mounted
    const timer = setTimeout(() => {
      router.replace('/onboarding/welcome');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update energy periodically (just caps it, no drain)
  useEffect(() => {
    const interval = setInterval(() => {
      updateEnergy();
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);
  
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
    Alert.prompt(
      "Log Sleep",
      "How many hours did you sleep last night?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "OK", 
          onPress: (hours?: string) => {
            const h = parseInt(hours || '7');
            if (!isNaN(h) && h >= 0 && h <= 12) {
              logSleep(h);
              Alert.alert(
                "Sleep Logged",
                `${h} hours logged. ${h < 6 ? 'Max energy cap reduced by 30%!' : 'Good rest!'}`,
                [{ text: "OK" }]
              );
            }
          }
        }
      ],
      "plain-text",
      userData.sleepHours.toString()
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
                😴 Log Sleep ({userData.sleepHours}h)
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
