// screens/TestConnectionScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { signUp, signIn, getCurrentUser, signOut } from '../lib/auth';
import { createUserProfile, getUserProfile } from '../lib/userProfile';
import { getTodayData, updateDailyData } from '../lib/dailyData';

export default function TestConnectionScreen() {
  const [status, setStatus] = useState<string>('Testing...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      addLog('🔌 Starting connection test...');

      // Test 1: Sign Up
      addLog('📝 Test 1: Sign Up');
      const signUpResult = await signUp(
        `test${Date.now()}@example.com`,
        'TestPassword123!'
      );
      
      if (!signUpResult.success || !signUpResult.user) {
        addLog('❌ Sign up failed');
        return;
      }

      const userId = signUpResult.user.id;
      addLog(`✅ Sign up successful: ${userId}`);

      // Test 2: Create Profile
      addLog('👤 Test 2: Create Profile');
      const profileResult = await createUserProfile(userId, {
        email: signUpResult.user.email,
        buddy_name: 'TestHammy',
        selected_character: 'casual',
        student_level: 'university',
      });

      if (!profileResult) {
        addLog('❌ Create profile failed');
        return;
      }

      addLog('✅ Profile created');

      // Test 3: Get Profile
      addLog('📖 Test 3: Get Profile');
      const getProfileResult = await getUserProfile(userId);
      addLog(`✅ Profile fetched: ${getProfileResult?.buddy_name}`);

      // Test 4: Get Today's Data
      addLog('📅 Test 4: Get Today\'s Data');
      const todayData = await getTodayData(userId);
      addLog(`✅ Today's data: ${todayData?.apple_taps_today} apple taps`);

      // Test 5: Update Daily Data
      addLog('🔄 Test 5: Update Daily Data');
      await updateDailyData(userId, {
        water_glasses: 5,
        ate_breakfast: true,
      });
      addLog('✅ Daily data updated');

      // Test 6: Current User
      addLog('👤 Test 6: Get Current User');
      const currentUser = await getCurrentUser();
      addLog(`✅ Current user: ${currentUser?.email}`);

      // Test 7: Sign Out
      addLog('🚪 Test 7: Sign Out');
      await signOut();
      addLog('✅ Signed out');

      setStatus('✅ All tests passed!');
    } catch (err) {
      addLog(`❌ Error: ${String(err)}`);
      setStatus('❌ Test failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      <Text style={styles.status}>{status}</Text>

      <ScrollView style={styles.logsContainer}>
        {logs.map((log, idx) => (
          <Text key={idx} style={styles.log}>
            {log}
          </Text>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={testConnection}>
        <Text style={styles.buttonText}>Run Test Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  log: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});