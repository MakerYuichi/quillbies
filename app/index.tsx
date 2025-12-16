import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store';
import QuillbyPet from './components/QuillbyPet';
import EnergyBar from './components/EnergyBar';
import RoomBackground from './components/RoomBackground';

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
  
  // Redirect to welcome screen on first launch
  // TODO: Add proper onboarding completion flag to store
  useEffect(() => {
    // For now, always redirect to welcome (remove this later when you add completion flag)
    router.replace('/onboarding/welcome');
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
      
      {/* Daily Habits Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Care</Text>
        
        <View style={styles.habitRow}>
          <TouchableOpacity 
            style={[styles.habitButton, userData.ateBreakfast && styles.habitButtonDone]}
            onPress={logBreakfast}
            disabled={userData.ateBreakfast}
          >
            <Text style={styles.habitButtonText}>
              {userData.ateBreakfast ? '✅ Ate Breakfast' : '🍳 Log Breakfast'}
            </Text>
          </TouchableOpacity>
        </View>
        
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
});
