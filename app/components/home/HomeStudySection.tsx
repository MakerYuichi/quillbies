import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { calculateFocusEnergyCost } from '../../core/engine';
import StudyProgress from '../progress/StudyProgress';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HomeStudySectionProps {
  userData: any;
  onStartFocusSession: () => void;
}

export default function HomeStudySection({
  userData,
  onStartFocusSession
}: HomeStudySectionProps) {
  
  console.log('[HomeStudySection] Rendering with userData.enabledHabits:', userData.enabledHabits);
  console.log('[HomeStudySection] Study enabled?', userData.enabledHabits?.includes('study'));
  
  if (!userData.enabledHabits?.includes('study')) {
    console.log('[Focus] Study habit not enabled, not showing focus button');
    return null;
  }

  const energyNeeded = calculateFocusEnergyCost(userData);
  const hasEnoughEnergy = userData.energy >= energyNeeded;
  
  console.log('[Focus] HomeStudySection render:', {
    energy: userData.energy,
    energyNeeded,
    hasEnoughEnergy,
    studyEnabled: userData.enabledHabits?.includes('study')
  });

  return (
    <View style={styles.studySection}>
      {/* DEBUG: Visible indicator */}
      <View style={{ position: 'absolute', top: -20, left: 0, right: 0, backgroundColor: 'yellow', padding: 5 }}>
        <Text style={{ color: 'red', fontSize: 10, fontWeight: 'bold' }}>
          FOCUS BUTTON VISIBLE - Energy: {userData.energy}/{energyNeeded}
        </Text>
      </View>
      
      {/* Focus Button */}
      <TouchableOpacity
        style={[
          styles.focusSessionButton,
          !hasEnoughEnergy && styles.focusSessionButtonDisabled
        ]}
        onPress={() => {
          console.log('[Focus] TouchableOpacity onPress triggered!');
          console.log('[Focus] hasEnoughEnergy:', hasEnoughEnergy);
          console.log('[Focus] userData.energy:', userData.energy);
          console.log('[Focus] energyNeeded:', energyNeeded);
          onStartFocusSession();
        }}
        disabled={!hasEnoughEnergy}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.focusSessionButtonText,
          !hasEnoughEnergy && styles.focusSessionButtonTextDisabled
        ]}>
          {hasEnoughEnergy ? '📚 Focus' : '😴 Tired'}
        </Text>
        <Text style={styles.focusSessionButtonSubtext}>
          {hasEnoughEnergy 
            ? `${energyNeeded} energy` 
            : `Need ${energyNeeded - userData.energy} more`}
        </Text>
      </TouchableOpacity>
      
      {/* Study Progress */}
      <View style={styles.studyProgressContainer}>
        <StudyProgress />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  studySection: {
    position: 'absolute',
    bottom: (SCREEN_HEIGHT * 100) / 852,
    left: (SCREEN_WIDTH * 17) / 393,
    right: (SCREEN_WIDTH * 17) / 393,
    flexDirection: 'row',
    gap: (SCREEN_WIDTH * 8) / 393,
    zIndex: 16,
  },
  focusSessionButton: {
    backgroundColor: '#1976D2',
    paddingVertical: (SCREEN_WIDTH * 12) / 393,
    paddingHorizontal: (SCREEN_WIDTH * 16) / 393,
    borderRadius: (SCREEN_WIDTH * 12) / 393,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D47A1',
    flex: 0.5,
  },
  focusSessionButtonDisabled: {
    backgroundColor: '#BDBDBD',
    borderColor: '#9E9E9E',
  },
  focusSessionButtonText: {
    fontFamily: 'ChakraPetch_600SemiBold',
    fontSize: (SCREEN_WIDTH * 14) / 393,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  focusSessionButtonTextDisabled: {
    color: '#757575',
  },
  focusSessionButtonSubtext: {
    fontFamily: 'ChakraPetch_400Regular',
    fontSize: (SCREEN_WIDTH * 10) / 393,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  studyProgressContainer: {
    flex: 1,
  },
});