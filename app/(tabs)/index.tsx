import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store';
import QuillbyPet from '../components/QuillbyPet';
import EnergyBar from '../components/EnergyBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  
  // Get the correct hamster image based on selected character
  const getCharacterImage = () => {
    switch (selectedCharacter) {
      case 'casual':
        return require('../../assets/onboarding/hamster-casual.png');
      case 'energetic':
        return require('../../assets/onboarding/hamster-energetic.png');
      case 'scholar':
        return require('../../assets/onboarding/hamster-scholar.png');
      default:
        return require('../../assets/onboarding/hamster-casual.png');
    }
  };
  
  // Get room mess level for dynamic backgrounds
  const getRoomMessLevel = () => {
    if (userData.messPoints === 0) return 'clean';
    if (userData.messPoints < 5) return 'slightly_messy';
    if (userData.messPoints < 10) return 'messy';
    return 'very_messy';
  };
  
  const messLevel = getRoomMessLevel();
  
  // Note: Onboarding check is handled at app level
  // Users should only reach tabs after completing onboarding
  
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
    <View style={styles.container}>
      {/* LAYER 1: Wall Background */}
      <Image 
        source={require('../../assets/rooms/walls.png')}
        style={styles.wallLayer}
        resizeMode="cover"
      />
      
      {/* LAYER 2: Floor (with perspective) - TODO: Add floor.png asset when ready */}
      <View style={styles.floorLayer} />
      
      <Image 
        source={require('../../assets/rooms/floor.png')}
        style={styles.floorLayer}
        resizeMode="cover"
      />
      
      
      {/* LAYER 3: Blue decorative background (top) - TODO: Add bluebg.png asset when ready */}
      
      <Image 
        source={require('../../assets/backgrounds/bluebg.png')}
        style={styles.blueBgDecor}
        resizeMode="cover"
      />
      
      {/* LAYER 4: Room Decorations - Shelf */}
      <Image 
        source={require('../../assets/study-session/studyroom-shelf.png')}
        style={styles.shelfDecor}
        resizeMode="contain"
      />
      
      {/* LAYER 5: Clock decoration - TODO: Add clock.png asset when ready */}
      
      <Image 
        source={require('../../assets/rooms/clock.png')}
        style={styles.clockDecor}
        resizeMode="contain"
      />
      
      
      {/* LAYER 6: Selected Character Hamster (absolutely positioned in room) */}
      <View style={styles.petContainer} pointerEvents="none">
        <Image 
          source={getCharacterImage()}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>
      
      {/* LAYER 7: Energy Bar (floating above room) */}
      <View style={styles.energyBarContainer} pointerEvents="none">
        <EnergyBar current={userData.energy} max={userData.maxEnergyCap} />
      </View>
      
      {/* LAYER 8: Scrollable Content Overlay */}
      <ScrollView 
        style={styles.contentScroll} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Personalized Welcome Header */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeText}>Welcome back, {userName}! 👋</Text>
          <Text style={styles.buddyText}>{buddyName} is ready to help you focus</Text>
        </View>
        
        {/* Header with Q-Coins */}
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
        
        {/* Room Status Indicator */}
        <View style={styles.roomStatusCard}>
          <Text style={styles.roomStatusText}>
            {messLevel === 'clean' && '✨ Spotless Room'}
            {messLevel === 'slightly_messy' && '📚 A few things scattered'}
            {messLevel === 'messy' && '🗑️ Getting messy...'}
            {messLevel === 'very_messy' && '🕸️ Disaster zone!'}
          </Text>
          <Text style={styles.messPointsText}>Mess: {userData.messPoints} points</Text>
        </View>
        
        {/* Spacer for pet visibility */}
        <View style={styles.petSpacer} />
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Fallback color
  },
  // LAYER 1: Wall (Figma iPhone 15 Pro: 393x590, left 0, top -8)
  wallLayer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: (SCREEN_HEIGHT * 590) / 852, // 590px on 852px screen
    top: -8,
    left: 0,
  },
  // LAYER 2: Floor (Figma iPhone 15 Pro: 518x336, left -90, top 239)
  floorLayer: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 518) / 393, // 518px on 393px screen = 131.8%
    height: (SCREEN_HEIGHT * 336) / 852, // 336px on 852px screen = 39.4%
    left: (SCREEN_WIDTH * -90) / 393, // -90px on 393px screen = -22.9%
    top: (SCREEN_HEIGHT * 239) / 852, // 239px on 852px screen = 28%
    backgroundColor: '#D7CCC8',
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: 'rgba(21, 255, 0, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  // LAYER 3: Blue decorative background (Figma iPhone 15 Pro: 401x260, left -8, top -190)
  blueBgDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 401) / 393, // 401px on 393px screen = 102%
    height: (SCREEN_HEIGHT * 260) / 852, // 260px on 852px screen = 30.5%
    left: -8,
    top: (SCREEN_HEIGHT * -190) / 852, // -190px on 852px screen = -22.3%
    borderWidth: 1,
    borderColor: '#000000',
  },
  // LAYER 4: Shelf decoration (Figma iPhone 15 Pro: 133x93, left 242, top 70)
  shelfDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 133) / 393, // 133px on 393px screen = 33.8%
    height: (SCREEN_HEIGHT * 93) / 852, // 93px on 852px screen = 10.9%
    left: (SCREEN_WIDTH * 242) / 393, // 242px on 393px screen = 61.6%
    top: (SCREEN_HEIGHT * 70) / 852, // 70px on 852px screen = 8.2%
  },
  // LAYER 5: Clock decoration (Figma iPhone 15 Pro: 65x64, left 324, top 0)
  clockDecor: {
    position: 'absolute',
    width: (SCREEN_WIDTH * 65) / 393, // 65px on 393px screen = 16.5%
    height: (SCREEN_HEIGHT * 64) / 852, // 64px on 852px screen = 7.5%
    left: (SCREEN_WIDTH * 324) / 393, // 324px on 393px screen = 82.4%
    top: 0,
  },
  // LAYER 6: Character Hamster (Figma iPhone 15 Pro: 312x234, right 46, top calc(50% - 234px/2 - 139px))
  petContainer: {
    position: 'absolute',
    right: (SCREEN_WIDTH * 46) / 393, // 46px on 393px screen = 11.7%
    top: (SCREEN_HEIGHT * 192) / 852, // Calculated: 50% - 117px - 139px = 192px on 852px screen = 22.5%
    width: (SCREEN_WIDTH * 312) / 393, // 312px on 393px screen = 79.4%
    height: (SCREEN_HEIGHT * 234) / 852, // 234px on 852px screen = 27.5%
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  // LAYER 7: Energy bar (Figma iPhone 15 Pro: 251x25, left 67, top 473)
  energyBarContainer: {
    position: 'absolute',
    top: (SCREEN_HEIGHT * 473) / 852, // 473px on 852px screen = 55.5%
    left: (SCREEN_WIDTH * 67) / 393, // 67px on 393px screen = 17%
    width: (SCREEN_WIDTH * 251) / 393, // 251px on 393px screen = 63.9%
    height: (SCREEN_HEIGHT * 25) / 852, // 25px on 852px screen = 2.9%
    zIndex: 5,
  },
  // LAYER 8: Scrollable content
  contentScroll: {
    flex: 1,
    zIndex: 20,
  },
  content: {
    padding: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.15,
  },
  // Spacer to make room for pet
  petSpacer: {
    height: SCREEN_HEIGHT * 0.25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  coinContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD54F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
  },
  capContainer: {
    backgroundColor: 'rgba(255, 248, 225, 0.95)',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginVertical: SCREEN_HEIGHT * 0.01,
    borderWidth: 2,
    borderColor: '#FFB300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.02,
    shadowColor: '#6200EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mainButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
  },
  section: {
    marginVertical: SCREEN_HEIGHT * 0.015,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    marginBottom: SCREEN_HEIGHT * 0.01,
    color: '#333',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  habitRow: {
    marginVertical: SCREEN_HEIGHT * 0.005,
  },
  habitButton: {
    backgroundColor: '#4CAF50',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  habitButtonDone: {
    backgroundColor: '#81C784',
  },
  habitButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.005,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginTop: SCREEN_HEIGHT * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '700',
    marginBottom: SCREEN_HEIGHT * 0.01,
    color: '#333',
  },
  statsText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    marginVertical: 2,
  },
  welcomeHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  buddyText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    fontStyle: 'italic',
  },
  roomStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    marginVertical: SCREEN_HEIGHT * 0.01,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roomStatusText: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  messPointsText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
  },
  noHabitsText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SCREEN_HEIGHT * 0.01,
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: 'rgba(255, 248, 225, 0.9)',
    borderRadius: 8,
  },
});
