import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useQuillbyStore } from '../../state/store-modular';
import { useNotifications } from '../../hooks/useNotifications';
import { sendImmediateNotification } from '../../../lib/notifications';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HomeDebugSectionProps {
  userData: any;
}

export default function HomeDebugSection({ userData }: HomeDebugSectionProps) {
  const { resetDay, skipTask } = useQuillbyStore();
  const { addTestNotification } = useNotifications();
  
  const [timeAccelerationActive, setTimeAccelerationActive] = React.useState(false);
  const [timeAccelerationProgress, setTimeAccelerationProgress] = React.useState(0);
  const [accelerationInterval, setAccelerationInterval] = React.useState<NodeJS.Timeout | null>(null);
  const [simulatedTime, setSimulatedTime] = React.useState<string>('00:00');
  const [useSimulatedTime, setUseSimulatedTime] = React.useState(false);
  const [isStartingSimulation, setIsStartingSimulation] = React.useState(false);

  // Test notification function
  const testNotification = () => {
    console.log('[Notifications] Testing notification system...');
    
    // Add in-app notification banner
    addTestNotification();
    
    // Also send system notification
    sendImmediateNotification(
      '🔔 Test Notification',
      'This is a test to verify notifications are working!'
    ).catch(error => {
      console.error('[Notifications] Error sending test notification:', error);
    });
  };

  // Force daily reset function
  const handleForceDailyReset = () => {
    Alert.alert(
      'Force Daily Reset',
      'This will reset daily progress and apply energy drain. This affects REAL DATA and syncs to Supabase. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            try {
              resetDay();
              Alert.alert('Success', 'Daily reset completed');
            } catch (error) {
              console.error('[Debug] Force daily reset error:', error);
              Alert.alert('Error', 'Failed to reset daily progress');
            }
          }
        }
      ]
    );
  };

  // Add mess points function
  const handleAddMessPoints = () => {
    Alert.alert(
      'Add Mess Points',
      'This will add 5 mess points for testing. This affects REAL DATA and syncs to Supabase. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add Mess', 
          style: 'destructive',
          onPress: () => {
            try {
              // Add 5 mess points by calling skipTask 5 times
              for (let i = 0; i < 5; i++) {
                skipTask();
              }
              Alert.alert('Success', 'Added 5 mess points');
              console.log('[TEST] Added 5 mess points - check room visuals and energy drain');
            } catch (error) {
              console.error('[Debug] Add mess points error:', error);
              Alert.alert('Error', 'Failed to add mess points');
            }
          }
        }
      ]
    );
  };

  // Force cleanup function
  const handleForceCleanup = () => {
    try {
      // Clear any running intervals
      if (accelerationInterval) {
        clearInterval(accelerationInterval);
        setAccelerationInterval(null);
      }
      setTimeAccelerationActive(false);
      setUseSimulatedTime(false);
      setIsStartingSimulation(false);
      setTimeAccelerationProgress(0);
      
      Alert.alert('Success', 'Cleared all intervals and timers');
      console.log('[TEST] 🧹 MANUAL FORCE CLEANUP - All intervals cleared by user');
    } catch (error) {
      console.error('[Debug] Force cleanup error:', error);
      Alert.alert('Error', 'Failed to cleanup intervals');
    }
  };

  // Full day cycle simulation
  const handleFullDayCycle = () => {
    if (timeAccelerationActive) {
      Alert.alert('Already Running', 'Time acceleration is already active. Check the timer above.');
      return;
    }

    if (isStartingSimulation) {
      Alert.alert('Starting...', 'Simulation is already starting. Please wait.');
      return;
    }

    Alert.alert(
      'Full Day Cycle Simulation',
      'This will simulate a full 24-hour day in 1 hour (LOCAL SIMULATION ONLY - Real data preserved). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Simulation', 
          onPress: () => {
            setIsStartingSimulation(true);
            setTimeAccelerationActive(true);
            setTimeAccelerationProgress(0);
            setUseSimulatedTime(true);
            
            // Start simulation timer
            const startTime = Date.now();
            const simulationDuration = 60 * 60 * 1000; // 1 hour in milliseconds
            
            const interval = setInterval(() => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / simulationDuration, 1);
              
              setTimeAccelerationProgress(progress);
              
              // Calculate simulated time (24 hours compressed into 1 hour)
              const simulatedHours = Math.floor(progress * 24);
              const simulatedMinutes = Math.floor((progress * 24 * 60) % 60);
              setSimulatedTime(`${simulatedHours.toString().padStart(2, '0')}:${simulatedMinutes.toString().padStart(2, '0')}`);
              
              if (progress >= 1) {
                clearInterval(interval);
                setTimeAccelerationActive(false);
                setUseSimulatedTime(false);
                setIsStartingSimulation(false);
                setAccelerationInterval(null);
                Alert.alert('Simulation Complete', 'Full day cycle simulation finished!');
              }
            }, 1000);
            
            setAccelerationInterval(interval);
            setIsStartingSimulation(false);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.testButtonSection}>
      <Text style={styles.testButtonTitle}>🧪 Debug Tools</Text>
      
      {/* Time acceleration status */}
      {timeAccelerationActive && (
        <View style={styles.accelerationStatus}>
          <Text style={styles.accelerationText}>
            ⏳ Time Acceleration: {Math.round(timeAccelerationProgress * 100)}%
          </Text>
          <Text style={styles.accelerationTime}>
            Simulated Time: {simulatedTime}
          </Text>
        </View>
      )}
      
      <View style={styles.testButtonRow}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleForceDailyReset}
        >
          <Text style={styles.testButtonText}>⏰ Force Daily Reset</Text>
          <Text style={styles.testButtonSubtext}>Test energy drain (REAL DATA)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleAddMessPoints}
        >
          <Text style={styles.testButtonText}>🗑️ Add 5 Mess</Text>
          <Text style={styles.testButtonSubtext}>Test mess system (REAL DATA)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleForceCleanup}
        >
          <Text style={styles.testButtonText}>🧹 Force Cleanup</Text>
          <Text style={styles.testButtonSubtext}>Clear ALL intervals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={testNotification}
        >
          <Text style={styles.testButtonText}>🔔 Test Notification</Text>
          <Text style={styles.testButtonSubtext}>Send test notification</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.testButton, styles.testButtonWide, timeAccelerationActive && styles.testButtonDisabled]}
        onPress={handleFullDayCycle}
        disabled={timeAccelerationActive}
      >
        <Text style={styles.testButtonText}>
          {timeAccelerationActive ? '⏳ Running...' : '🌅 Full Day Cycle (1hr)'}
        </Text>
        <Text style={styles.testButtonSubtext}>
          {timeAccelerationActive ? 'Check timer above' : 'LOCAL SIMULATION ONLY - Real data preserved'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Test Button Section
  testButtonSection: {
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: (SCREEN_WIDTH * 20) / 393,
    paddingVertical: (SCREEN_WIDTH * 15) / 393,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: (SCREEN_WIDTH * 15) / 393,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  testButtonTitle: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: (SCREEN_WIDTH * 10) / 393,
  },
  
  accelerationStatus: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    padding: (SCREEN_WIDTH * 10) / 393,
    borderRadius: (SCREEN_WIDTH * 8) / 393,
    marginBottom: (SCREEN_WIDTH * 10) / 393,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  
  accelerationText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 12) / 393,
    color: '#FF8F00',
    textAlign: 'center',
  },
  
  accelerationTime: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: '#FF8F00',
    textAlign: 'center',
    marginTop: 2,
  },
  
  testButtonRow: {
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 8) / 393,
    marginBottom: (SCREEN_WIDTH * 10) / 393,
    flexWrap: 'wrap',
  },
  
  testButton: {
    flex: 1,
    minWidth: (SCREEN_WIDTH * 80) / 393,
    backgroundColor: '#FFF8E1',
    paddingVertical: (SCREEN_WIDTH * 8) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 6) / 393,
    borderRadius: (SCREEN_WIDTH * 8) / 393,
    borderWidth: 1,
    borderColor: '#FFE082',
    alignItems: 'center',
  },
  
  testButtonWide: {
    width: '100%',
    flex: 0,
  },
  
  testButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
  },
  
  testButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 11) / 393,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 2,
  },
  
  testButtonSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 9) / 393,
    color: '#A0522D',
    textAlign: 'center',
  },
});