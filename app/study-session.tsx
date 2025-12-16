import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from './state/store';
import FocusMeter from './components/FocusMeter';
import QuillbyPet from './components/QuillbyPet';

export default function StudySessionScreen() {
  const router = useRouter();
  const { userData, session, updateFocusDuringSession, endFocusSession, handleDistraction } = useQuillbyStore();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  
  // Update focus score every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateFocusDuringSession();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Detect when user leaves the app (distraction)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log(`[AppState] ${appState} → ${nextAppState}`);
      
      if (appState === 'active' && (nextAppState === 'background' || nextAppState === 'inactive')) {
        // User left the app - start tracking distraction
        console.log('[Distraction] User left the app - starting grace period');
        handleDistraction();
      }
      
      if ((appState === 'background' || appState === 'inactive') && nextAppState === 'active') {
        // User returned to app - check grace period
        console.log('[Distraction] User returned to app - checking grace period');
        handleDistraction();
      }
      
      setAppState(nextAppState);
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [appState]);
  
  const handleEndSession = () => {
    endFocusSession();
    router.back();
  };
  
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No active session</Text>
      </View>
    );
  }
  
  const estimatedCoins = Math.round(session.focusScore * 0.5);
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Quillby studying */}
      <View style={styles.petSection}>
        <QuillbyPet 
          energy={userData.energy}
          maxEnergy={userData.maxEnergyCap}
          messPoints={userData.messPoints}
        />
        <Text style={styles.studyingText}>📖 Studying together...</Text>
      </View>
      
      {/* Focus Meter */}
      <FocusMeter score={session.focusScore} duration={session.duration} />
      
      {/* Rewards Preview */}
      <View style={styles.rewardsPreview}>
        <Text style={styles.rewardsTitle}>Estimated Rewards</Text>
        <Text style={styles.rewardsText}>🪙 {estimatedCoins} Q-Coins</Text>
        <Text style={styles.rewardsText}>✨ {Math.round(session.focusScore)} XP</Text>
      </View>
      
      {/* Grace Period Indicator */}
      {session.isInGracePeriod && (
        <View style={styles.gracePeriodIndicator}>
          <Text style={styles.gracePeriodText}>
            ⏱️ Grace Period Active
          </Text>
          <Text style={styles.gracePeriodSubtext}>
            Return within 30 seconds to avoid warning
          </Text>
        </View>
      )}
      
      {/* Warning System */}
      {session.distractionWarnings > 0 && !session.isInGracePeriod && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Warning {session.distractionWarnings}/3
          </Text>
          <Text style={styles.warningSubtext}>
            {session.distractionWarnings === 3 
              ? 'Next distraction will drain your focus!' 
              : `${3 - session.distractionWarnings} warnings left before penalty`}
          </Text>
        </View>
      )}
      
      {/* Distraction Counter (Penalties Applied) */}
      {session.distractionCount > 0 && (
        <View style={styles.penaltyWarning}>
          <Text style={styles.penaltyText}>
            🚨 Penalties Applied: {session.distractionCount}
          </Text>
          <Text style={styles.penaltySubtext}>
            Your focus score was drained due to long distractions
          </Text>
        </View>
      )}
      
      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsText}>💡 Tip: Keep the app open to maintain focus</Text>
        <Text style={styles.tipsText}>💡 Leaving the app will drain your focus meter</Text>
      </View>
      
      {/* Action Buttons - NOW SCROLLABLE */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.endButton}
          onPress={handleEndSession}
        >
          <Text style={styles.endButtonText}>✅ End Session & Collect Rewards</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>← Cancel (No Rewards)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#1A237E',
    minHeight: '100%',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 50,
    width: '100%',
  },
  petSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  studyingText: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
    fontStyle: 'italic',
  },
  rewardsPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  rewardsText: {
    fontSize: 18,
    color: '#FFD54F',
    marginVertical: 3,
    fontWeight: '600',
  },
  gracePeriodIndicator: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  gracePeriodText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  gracePeriodSubtext: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 5,
  },
  warningContainer: {
    backgroundColor: '#FFC107',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  warningSubtext: {
    fontSize: 12,
    color: '#000',
    marginTop: 5,
  },
  penaltyWarning: {
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  penaltyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  penaltySubtext: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 5,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
  },
  tipsText: {
    fontSize: 12,
    color: '#E1BEE7',
    marginVertical: 3,
  },

  endButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  endButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
  },
});
