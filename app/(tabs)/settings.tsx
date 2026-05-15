import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store-modular';
import { useFocusEffect } from '@react-navigation/native';
import ChangeHamsterModal from '../components/modals/ChangeHamsterModal';
import ChangeNameModal from '../components/modals/ChangeNameModal';
import ManageHabitsModal from '../components/modals/ManageHabitsModal';
import EditGoalsModal from '../components/modals/EditGoalsModal';
import EditProfileModal from '../components/modals/EditProfileModal';
import PremiumPaywallModal from '../components/modals/PremiumPaywallModal';
import GemsPurchaseModal from '../components/modals/GemsPurchaseModal';
import AccountDeletionModal from '../components/modals/AccountDeletionModal';
import NotificationSettingsModal from '../components/modals/NotificationSettingsModal';
import PromoCodeModal from '../components/modals/PromoCodeModal';
import CommunityFeedModal from '../components/modals/CommunityFeedModal';
import ThemedScreen from '../components/themed/ThemedScreen';
import { playTabSound, playUISubmitSound } from '../../lib/soundManager';
import { getPendingDeletionRequest, cancelAccountDeletion, getDaysUntilDeletion } from '../../lib/accountDeletion';
import { 
  SCREEN_WIDTH, 
  SCREEN_HEIGHT, 
  responsiveFontSize, 
  getResponsivePadding, 
  getResponsiveMargins,
  responsiveSpacing,
  getContainerWidth 
} from '../utils/responsive';

export default function SettingsScreen() {
  const router = useRouter();
  const userData = useQuillbyStore((state) => state.userData);
  const setCharacter = useQuillbyStore((state) => state.setCharacter);
  const setBuddyName = useQuillbyStore((state) => state.setBuddyName);
  const setProfile = useQuillbyStore((state) => state.setProfile);
  const setHabits = useQuillbyStore((state) => state.setHabits);
  const setStudyGoal = useQuillbyStore((state) => state.setStudyGoal);
  const setExerciseGoal = useQuillbyStore((state) => state.setExerciseGoal);
  const setHydrationGoal = useQuillbyStore((state) => state.setHydrationGoal);
  const setWeightGoal = useQuillbyStore((state) => state.setWeightGoal);
  const setSleepGoal = useQuillbyStore((state) => state.setSleepGoal);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHamsterModal, setShowHamsterModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showGemsModal, setShowGemsModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showAccountDeletionModal, setShowAccountDeletionModal] = useState(false);
  const [showNotificationSettingsModal, setShowNotificationSettingsModal] = useState(false);
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false);
  
  // Scroll ref for auto-scroll to top when tab is focused
  const scrollRef = useRef<ScrollView>(null);
  
  // Scroll to top when tab is focused
  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );
  
  // Account deletion state
  const [pendingDeletion, setPendingDeletion] = useState<{ scheduledFor: string } | null>(null);
  
  // Quillby reaction states
  const [quillbyExpression, setQuillbyExpression] = useState<'happy' | 'curious' | 'excited' | 'sleeping'>('happy');
  const [quillbyMessage, setQuillbyMessage] = useState('');
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const quillbyScale = useRef(new Animated.Value(1)).current;

  const buddyName = userData.buddyName || 'Quillby';
  const currentCharacter = userData.selectedCharacter || 'casual';
  const enabledHabits = userData.enabledHabits || ['study'];
  
  // Check for pending deletion on mount
  React.useEffect(() => {
    const checkDeletion = async () => {
      const request = await getPendingDeletionRequest();
      if (request) {
        setPendingDeletion({ scheduledFor: request.scheduledFor });
      }
    };
    checkDeletion();
  }, []);
  
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

  const handleCancelDeletion = async () => {
    Alert.alert(
      'Cancel Account Deletion',
      'Are you sure you want to cancel the account deletion request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel Deletion',
          onPress: async () => {
            const result = await cancelAccountDeletion();
            if (result.success) {
              setPendingDeletion(null);
              Alert.alert('Success', 'Account deletion has been cancelled. Your account is safe!');
            } else {
              Alert.alert('Error', 'Failed to cancel deletion. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeletionRequested = (scheduledFor: string) => {
    setPendingDeletion({ scheduledFor });
  };

  return (
    <ThemedScreen showBackground={false}>
      <ScrollView 
        ref={scrollRef}
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

        {/* ✨ Premium & 💎 Gems Section - Side by Side */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💰 Shop & Premium</Text>
            <Text style={styles.pawPrint}>✨</Text>
          </View>
          
          <View style={styles.twoColumnGrid}>
            {/* Premium Card */}
            {!userData.isPremium ? (
              <TouchableOpacity 
                style={styles.halfWidthCard}
                onPress={() => {
                  playTabSound();
                  setShowPaywallModal(true);
                }}
                activeOpacity={0.9}
              >
                <View style={styles.premiumGradientCompact}>
                  <Text style={styles.compactIcon}>👑</Text>
                  <Text style={styles.compactTitle}>Premium</Text>
                  <Text style={styles.compactSubtitle}>Legendary themes</Text>
                  <View style={styles.compactButton}>
                    <Text style={styles.compactButtonText}>Upgrade</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.halfWidthCard}>
                <View style={styles.premiumActiveCompact}>
                  <Text style={styles.compactIcon}>👑</Text>
                  <Text style={styles.compactTitle}>Premium</Text>
                  <Text style={styles.compactActiveText}>Active ✓</Text>
                </View>
              </View>
            )}

            {/* Gems Card */}
            <TouchableOpacity 
              style={styles.halfWidthCard}
              onPress={() => {
                playTabSound();
                setShowGemsModal(true);
              }}
              activeOpacity={0.9}
            >
              <View style={styles.gemsGradientCompact}>
                <Text style={styles.compactIcon}>💎</Text>
                <Text style={styles.compactTitle}>Gems</Text>
                <Text style={styles.compactSubtitle}>{userData.gems || 0} gems</Text>
                <View style={styles.compactButtonGems}>
                  <Text style={styles.compactButtonText}>Buy More</Text>
                </View>
              </View>
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
              style={styles.communityBtn}
              onPress={() => {
                reactToTap('tutorial');
                router.push('/onboarding/tutorial');
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.communityBtnEmoji}>📖</Text>
              <Text style={styles.communityBtnText}>Tutorial</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.communityBtn}
              onPress={() => {
                playTabSound();
                setShowNotificationSettingsModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.communityBtnEmoji}>🔔</Text>
              <Text style={styles.communityBtnText}>Notifi-{'\n'}cations</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.communityBtn}
              onPress={() => {
                playTabSound();
                setShowCommunityModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.communityBtnEmoji}>🌍</Text>
              <Text style={styles.communityBtnText}>Community{'\n'}Diary</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.communityBtn}
              onPress={() => {
                reactToTap('reset');
                handleResetOnboarding();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.communityBtnEmoji}>🔄</Text>
              <Text style={styles.communityBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🎟️ Promo Code */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎟️ Promo Code</Text>
            <Text style={styles.pawPrint}>🎁</Text>
          </View>
          <TouchableOpacity
            style={styles.promoCodeCard}
            onPress={() => {
              playTabSound();
              setShowPromoCodeModal(true);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.promoCodeLeft}>
              <Text style={styles.promoCodeIcon}>🎟️</Text>
              <View>
                <Text style={styles.promoCodeTitle}>Redeem a Code</Text>
                <Text style={styles.promoCodeSubtitle}>Get free Gems, Q-Bies, or Premium</Text>
              </View>
            </View>
            <Text style={styles.promoCodeArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 🗑️ Account Settings */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🗑️ Account Settings</Text>
            <Text style={styles.pawPrint}>⚠️</Text>
          </View>
          
          {pendingDeletion ? (
            <View style={styles.deletionWarningCard}>
              <Text style={styles.deletionWarningIcon}>⚠️</Text>
              <Text style={styles.deletionWarningTitle}>Account Deletion Scheduled</Text>
              <Text style={styles.deletionWarningText}>
                Your account will be deleted in {getDaysUntilDeletion(pendingDeletion.scheduledFor)} days
              </Text>
              <Text style={styles.deletionWarningDate}>
                Scheduled for: {new Date(pendingDeletion.scheduledFor).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.cancelDeletionButton}
                onPress={handleCancelDeletion}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelDeletionButtonText}>Cancel Deletion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.deleteAccountCard}
              onPress={() => {
                playTabSound();
                setShowAccountDeletionModal(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.deleteAccountIcon}>🗑️</Text>
              <Text style={styles.deleteAccountTitle}>Delete Account</Text>
              <Text style={styles.deleteAccountSubtitle}>
                Permanently delete your account and all data
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Quillby v1.0.0 </Text>
          <Text style={styles.footerText}>Made with ♡ by MakerYuichii</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <NotificationSettingsModal
        visible={showNotificationSettingsModal}
        onClose={() => setShowNotificationSettingsModal(false)}
      />

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

      <PremiumPaywallModal
        visible={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onPurchaseSuccess={() => {
          console.log('[Settings] Premium purchased successfully!');
          setShowPaywallModal(false);
        }}
        onGoToShop={() => {
          setShowPaywallModal(false);
          router.push('/(tabs)/shop');
        }}
      />

      <GemsPurchaseModal
        visible={showGemsModal}
        onClose={() => setShowGemsModal(false)}
        onPurchaseSuccess={(gemsGranted) => {
          console.log('[Settings] Gems purchased successfully!', gemsGranted);
          setShowGemsModal(false);
        }}
      />

      <CommunityFeedModal
        visible={showCommunityModal}
        onClose={() => setShowCommunityModal(false)}
      />

      <PromoCodeModal
        visible={showPromoCodeModal}
        onClose={() => setShowPromoCodeModal(false)}
        onGoToShop={() => {
          setShowPromoCodeModal(false);
          router.push('/(tabs)/shop');
        }}
      />

      <AccountDeletionModal
        visible={showAccountDeletionModal}
        onClose={() => setShowAccountDeletionModal(false)}
        onDeletionRequested={handleDeletionRequested}
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
  bookPurple: {
    backgroundColor: '#E1BEE7',
    borderColor: '#CE93D8',
  },
  bookGreen: {
    backgroundColor: '#C8E6C9',
    borderColor: '#A5D6A7',
  },
  bookOrange: {
    backgroundColor: '#FFE0B2',
    borderColor: '#FFCC80',
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
  bookEmoji: {
    fontSize: SCREEN_WIDTH * 0.08,
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  bookText: {
    fontSize: SCREEN_WIDTH * 0.028,
    fontWeight: '700',
    color: '#333',
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
  
  // Premium Section Styles
  premiumCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumGradient: {
    padding: 24,
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  premiumIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumBenefits: {
    marginBottom: 20,
  },
  premiumBenefit: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 8,
  },
  premiumButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  premiumActiveCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  premiumActiveIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  premiumActiveTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  premiumActiveSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Two Column Grid for Premium & Gems
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidthCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumGradientCompact: {
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF9800',
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  premiumActiveCompact: {
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  gemsGradientCompact: {
    padding: 16,
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#7E57C2',
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  compactIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  compactSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  compactActiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
  compactButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  compactButtonGems: {
    backgroundColor: '#7E57C2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  compactButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  
  // Gems Section Styles
  gemsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  gemsGradient: {
    padding: 24,
    backgroundColor: '#F3E5F5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7E57C2',
  },
  gemsIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 12,
  },
  gemsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7E57C2',
    textAlign: 'center',
    marginBottom: 8,
  },
  gemsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  gemsInfo: {
    backgroundColor: 'rgba(126, 87, 194, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  gemsInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7E57C2',
    textAlign: 'center',
  },
  gemsButton: {
    backgroundColor: '#7E57C2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  gemsButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  
  // Account Deletion Styles
  deleteAccountCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EF5350',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteAccountIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  deleteAccountTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 8,
  },
  deleteAccountSubtitle: {
    fontSize: 14,
    color: '#C62828',
    textAlign: 'center',
  },
  deletionWarningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  deletionWarningIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  deletionWarningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 8,
  },
  deletionWarningText: {
    fontSize: 16,
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 8,
  },
  deletionWarningDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  cancelDeletionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  cancelDeletionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },

  // Community Diary button — looks like a leather-bound book
  communityBtn: {
    width: SCREEN_WIDTH * 0.18,
    height: SCREEN_WIDTH * 0.22,
    backgroundColor: '#5C3A1E',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3E2410',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3E2410',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    // Left spine
    borderLeftWidth: 6,
    borderLeftColor: '#3E2410',
  },
  communityBtnEmoji: {
    fontSize: SCREEN_WIDTH * 0.07,
    marginBottom: 4,
  },
  communityBtnText: {
    fontSize: SCREEN_WIDTH * 0.024,
    fontWeight: '700',
    color: '#F5DEB3',
    textAlign: 'center',
    lineHeight: SCREEN_WIDTH * 0.032,
  },

  // Promo Code Section
  promoCodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    borderWidth: 2,
    borderColor: '#FFB74D',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  promoCodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  promoCodeIcon: {
    fontSize: 32,
  },
  promoCodeTitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontFamily: 'ChakraPetch_700Bold',
    color: '#333',
    marginBottom: 2,
  },
  promoCodeSubtitle: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontFamily: 'ChakraPetch_400Regular',
    color: '#888',
  },
  promoCodeArrow: {
    fontSize: 28,
    color: '#FF9800',
    fontWeight: '700',
  },
});
