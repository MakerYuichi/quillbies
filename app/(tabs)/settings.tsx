import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground, Image, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store-modular';
import ChangeHamsterModal from '../components/modals/ChangeHamsterModal';
import ChangeNameModal from '../components/modals/ChangeNameModal';
import ManageHabitsModal from '../components/modals/ManageHabitsModal';
import EditGoalsModal from '../components/modals/EditGoalsModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import ThemedScreen from '../components/themed/ThemedScreen';
import { playTabSound, playUISubmitSound } from '../../lib/soundManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    userData, 
    setCharacter, 
    setBuddyName,
    setProfile,
    setHabits,
    setStudyGoal,
    setExerciseGoal,
    setHydrationGoal,
    setWeightGoal,
    setSleepGoal,
  } = useQuillbyStore();
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHamsterModal, setShowHamsterModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  
  // Quillby reaction states
  const [quillbyExpression, setQuillbyExpression] = useState<'happy' | 'curious' | 'excited' | 'sleeping'>('happy');
  const [quillbyMessage, setQuillbyMessage] = useState('');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const quillbyScale = useRef(new Animated.Value(1)).current;

  const buddyName = userData.buddyName || 'Quillby';
  const currentCharacter = userData.selectedCharacter || 'casual';
  const enabledHabits = userData.enabledHabits || ['study'];
  
  // Get character display name
  const getCharacterName = (char: string) => {
    const names: Record<string, string> = {
      'casual': 'Casual',
      'formal': 'Formal',
      'sporty': 'Sporty',
      'sleepy': 'Sleepy',
    };
    return names[char] || char;
  };
  
  // Quillby reactions
  const reactToTap = (section: string) => {
    playTabSound();
    const reactions: Record<string, { expression: typeof quillbyExpression; message: string }> = {
      profile: { expression: 'curious', message: "Let's see who we are! 🪞" },
      hamster: { expression: 'excited', message: "Ooh, makeover time! 🎨" },
      name: { expression: 'curious', message: "What should I be called? 🤔" },
      habits: { expression: 'happy', message: "Let's plan our day! 📋" },
      goals: { expression: 'excited', message: "Time to aim high! 🎯" },
      tutorial: { expression: 'happy', message: "Want to learn together? 📖" },
      reset: { expression: 'curious', message: "Starting fresh? 🔄" },
    };
    
    const reaction = reactions[section];
    if (reaction) {
      setQuillbyExpression(reaction.expression);
      setQuillbyMessage(reaction.message);
      
      // Bounce animation
      Animated.sequence([
        Animated.timing(quillbyScale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(quillbyScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      
      // Clear message after 3 seconds
      setTimeout(() => setQuillbyMessage(''), 3000);
    }
  };
  
  // Get Quillby image based on expression
  const getQuillbyImage = () => {
    switch (quillbyExpression) {
      case 'excited':
        return require('../../assets/hamsters/casual/idle-sit-happy.png');
      case 'curious':
        return require('../../assets/hamsters/casual/idle-sit.png');
      case 'sleeping':
        return require('../../assets/hamsters/casual/sleeping.png');
      default:
        return require('../../assets/hamsters/casual/idle-sit-happy.png');
    }
  };

  const handleChangeHamster = (character: string) => {
    playUISubmitSound();
    setCharacter(character);
    Alert.alert('Success', 'Hamster changed successfully!');
  };

  const handleChangeName = (name: string) => {
    playUISubmitSound();
    setBuddyName(name);
    Alert.alert('Success', 'Buddy name updated!');
  };

  const handleSaveProfile = (profile: {
    userName: string;
    buddyName: string;
    studentLevel: string;
    country: string;
    timezone: string;
  }) => {
    playUISubmitSound();
    setBuddyName(profile.buddyName);
    setProfile(profile.userName, profile.studentLevel, profile.country, profile.timezone);
    Alert.alert('Success', 'Profile updated!');
  };

  const handleSaveHabits = (habits: string[]) => {
    playUISubmitSound();
    setHabits(habits);
    Alert.alert('Success', 'Habits updated!');
  };

  const handleSaveGoals = (goals: {
    studyHours?: number;
    exerciseMinutes?: number;
    hydrationGlasses?: number;
    weightGoal?: 'lose' | 'maintain' | 'gain';
    sleepHours?: number;
  }) => {
    playUISubmitSound();
    if (goals.studyHours !== undefined) {
      setStudyGoal(goals.studyHours, userData.studyCheckpoints || ['12 PM', '6 PM', '9 PM']);
    }
    if (goals.exerciseMinutes !== undefined) {
      setExerciseGoal(goals.exerciseMinutes);
    }
    if (goals.hydrationGlasses !== undefined) {
      setHydrationGoal(goals.hydrationGlasses);
    }
    if (goals.weightGoal !== undefined) {
      setWeightGoal(goals.weightGoal);
    }
    if (goals.sleepHours !== undefined) {
      setSleepGoal(goals.sleepHours);
    }
    Alert.alert('Success', 'Goals updated!');
  };

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
    <ThemedScreen showBackground={false}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Quillby's Room Header */}
        <View style={styles.roomHeader}>
          <Animated.View style={[styles.quillbyContainer, { transform: [{ scale: quillbyScale }] }]}>
            <Image
              source={getQuillbyImage()}
              style={styles.quillbyImage}
              resizeMode="contain"
            />
          </Animated.View>
          {quillbyMessage ? (
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>{quillbyMessage}</Text>
              <View style={styles.bubbleTail} />
            </View>
          ) : null}
          <Text style={styles.roomTitle}>🏠 {buddyName}'s Room</Text>
          <Text style={styles.roomSubtitle}>Let's make it cozy together!</Text>
        </View>

        {/* Profile Card - Simple */}
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => {
            reactToTap('profile');
            setShowProfileModal(true);
          }}
          activeOpacity={0.9}
        >
          <View style={styles.profileAvatar}>
            <Image
              source={require('../../assets/hamsters/casual/idle-sit-happy.png')}
              style={styles.profileAvatarImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileCardName}>{userData.userName || 'Student'} & {buddyName} 🐹</Text>
            <Text style={styles.profileCardLabel}>Tap to edit profile</Text>
          </View>
          <Text style={styles.profileCardArrow}>�</Text>
        </TouchableOpacity>

        {/* 🧸 Quillby's Wardrobe */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧸 Quillby's Wardrobe</Text>
            <Text style={styles.pawPrint}>🐾</Text>
          </View>
          
          <View style={styles.wardrobeRow}>
            {/* Hamster Bed/House */}
            <TouchableOpacity 
              style={styles.bedCard}
              onPress={() => {
                reactToTap('hamster');
                setShowHamsterModal(true);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.bedTop}>
                <Image
                  source={require('../../assets/hamsters/casual/sleeping.png')}
                  style={styles.bedHamster}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.bedBottom}>
                <Text style={styles.bedLabel}>🛏️ Hamster Style</Text>
                <Text style={styles.bedValue}>{getCharacterName(currentCharacter)}</Text>
              </View>
              <View style={styles.stickyCorner} />
            </TouchableOpacity>

            {/* Nameplate */}
            <TouchableOpacity 
              style={styles.nameplateCard}
              onPress={() => {
                reactToTap('name');
                setShowNameModal(true);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.nameplateTop}>
                <Text style={styles.nameplateIcon}>✨</Text>
              </View>
              <View style={styles.nameplateBottom}>
                <Text style={styles.nameplateLabel}>📛 Name Tag</Text>
                <Text style={styles.nameplateValue}>{buddyName}</Text>
              </View>
              <View style={styles.stickyCorner} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 📋 Our Daily Routine */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Our Daily Routine</Text>
            <Text style={styles.pawPrint}>🐾</Text>
          </View>
          
          {/* Clipboard with sticky notes */}
          <View style={styles.clipboardContainer}>
            <TouchableOpacity 
              style={[styles.stickyNote, styles.stickyYellow]}
              onPress={() => {
                reactToTap('habits');
                setShowHabitsModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.stickyIcon}>📋</Text>
              <Text style={styles.stickyTitle}>Habits</Text>
              <Text style={styles.stickySubtitle}>{enabledHabits.length} active</Text>
              <View style={styles.stickyTape} />
              <View style={styles.stickyCurl} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.stickyNote, styles.stickyPink]}
              onPress={() => {
                reactToTap('goals');
                setShowGoalsModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.stickyIcon}>🎯</Text>
              <Text style={styles.stickyTitle}>Goals</Text>
              <Text style={styles.stickySubtitle}>Daily targets</Text>
              <View style={styles.stickyTape} />
              <View style={styles.stickyCurl} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ⚙️ Human Stuff */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚙️ Human Stuff</Text>
            <Text style={styles.pawPrint}>🐾</Text>
          </View>
          
          {/* Bookshelf */}
          <View style={styles.bookshelfContainer}>
            <TouchableOpacity 
              style={[styles.book, styles.bookBlue]}
              onPress={() => {
                reactToTap('tutorial');
                router.push('/onboarding/tutorial');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.bookSpine}>📖 Tutorial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.book, styles.bookRed]}
              onPress={() => {
                reactToTap('reset');
                handleResetOnboarding();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.bookSpine}>🔄 Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Quillby v1.0.0 </Text>
          <Text style={styles.footerText}>Made with ♡ by MakerYuichii</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
        currentProfile={{
          userName: userData.userName,
          buddyName: buddyName,
          studentLevel: userData.studentLevel,
          country: userData.country,
          timezone: userData.timezone,
        }}
      />
      
      <ChangeHamsterModal
        visible={showHamsterModal}
        onClose={() => setShowHamsterModal(false)}
        onSelect={handleChangeHamster}
        currentCharacter={currentCharacter}
      />
      
      <ChangeNameModal
        visible={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSave={handleChangeName}
        currentName={buddyName}
      />
      
      <ManageHabitsModal
        visible={showHabitsModal}
        onClose={() => setShowHabitsModal(false)}
        onSave={handleSaveHabits}
        currentHabits={enabledHabits}
      />
      
      <EditGoalsModal
        visible={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        onSave={handleSaveGoals}
        currentGoals={{
          studyHours: userData.studyGoalHours,
          exerciseMinutes: userData.exerciseGoalMinutes,
          hydrationGlasses: userData.hydrationGoalGlasses,
          weightGoal: userData.weightGoal || 'maintain',
          sleepHours: userData.sleepGoalHours,
        }}
        enabledHabits={enabledHabits}
      />
    </ThemedScreen>
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
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.12,
  },
  
  // Warm Overlay
  warmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 248, 230, 0.3)',
  },
  
  // Room Header with Quillby
  roomHeader: {
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  quillbyContainer: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_WIDTH * 0.35,
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  quillbyImage: {
    width: '100%',
    height: '100%',
  },
  speechBubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.012,
    borderRadius: 20,
    marginBottom: SCREEN_HEIGHT * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  speechText: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#333',
    fontWeight: '500',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
  roomTitle: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: '700',
    color: '#8D6E63',
    marginBottom: SCREEN_HEIGHT * 0.005,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  roomSubtitle: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: '#A1887F',
    fontWeight: '500',
  },
  
  // Profile Card - Simple
  profileCard: {
    marginHorizontal: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.025,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: SCREEN_WIDTH * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  profileAvatar: {
    width: SCREEN_WIDTH * 0.16,
    height: SCREEN_WIDTH * 0.16,
    borderRadius: SCREEN_WIDTH * 0.08,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.03,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileTextContainer: {
    flex: 1,
  },
  profileCardName: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.003,
  },
  profileCardLabel: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#999',
  },
  profileCardArrow: {
    fontSize: SCREEN_WIDTH * 0.05,
  },
  
  // Section Container
  sectionContainer: {
    marginHorizontal: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#8D6E63',
  },
  pawPrint: {
    fontSize: SCREEN_WIDTH * 0.05,
  },
  
  // Wardrobe Row
  wardrobeRow: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
  },
  
  // Bed Card
  bedCard: {
    flex: 1,
    backgroundColor: '#FFE4B5',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#DEB887',
  },
  bedTop: {
    backgroundColor: '#FFF8DC',
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#DEB887',
  },
  bedHamster: {
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 0.2,
  },
  bedBottom: {
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
  },
  bedLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#8D6E63',
    fontWeight: '600',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  bedValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#5D4037',
    fontWeight: '700',
  },
  stickyCorner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: '#DEB887',
    borderTopLeftRadius: 20,
  },
  
  // Nameplate Card
  nameplateCard: {
    flex: 1,
    backgroundColor: '#E8EAF6',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#9FA8DA',
  },
  nameplateTop: {
    backgroundColor: '#C5CAE9',
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#9FA8DA',
  },
  nameplateIcon: {
    fontSize: SCREEN_WIDTH * 0.12,
  },
  nameplateBottom: {
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
  },
  nameplateLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#5C6BC0',
    fontWeight: '600',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  nameplateValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#3F51B5',
    fontWeight: '700',
  },
  
  // Clipboard with Sticky Notes
  clipboardContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
  },
  stickyNote: {
    flex: 1,
    borderRadius: 4,
    padding: SCREEN_WIDTH * 0.04,
    minHeight: SCREEN_HEIGHT * 0.15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyYellow: {
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#FFF59D',
  },
  stickyPink: {
    backgroundColor: '#FCE4EC',
    borderWidth: 1,
    borderColor: '#F8BBD0',
  },
  stickyIcon: {
    fontSize: SCREEN_WIDTH * 0.1,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  stickyTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  stickySubtitle: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#666',
  },
  stickyTape: {
    position: 'absolute',
    top: -2,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  stickyCurl: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderTopLeftRadius: 20,
  },
  
  // Bookshelf
  bookshelfContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
    backgroundColor: '#8D6E63',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  book: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
  },
  bookBlue: {
    backgroundColor: '#BBDEFB',
    borderColor: '#90CAF9',
  },
  bookRed: {
    backgroundColor: '#FFCDD2',
    borderColor: '#EF9A9A',
  },
  bookSpine: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '700',
    color: '#333',
    transform: [{ rotate: '0deg' }],
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    marginHorizontal: SCREEN_WIDTH * 0.05,
    marginTop: SCREEN_HEIGHT * 0.02,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#999',
    textAlign: 'center',
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: SCREEN_HEIGHT * 0.05,
  },
});
