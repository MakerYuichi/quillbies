import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store-modular';
import ChangeHamsterModal from '../components/modals/ChangeHamsterModal';
import ChangeNameModal from '../components/modals/ChangeNameModal';
import ManageHabitsModal from '../components/modals/ManageHabitsModal';
import EditGoalsModal from '../components/modals/EditGoalsModal';
import EditProfileModal from '../components/modals/EditProfileModal';

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
    loadFromDatabase,
    logWater, // For testing database sync
  } = useQuillbyStore();
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHamsterModal, setShowHamsterModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const buddyName = userData.buddyName || 'Quillby';
  const currentCharacter = userData.selectedCharacter || 'casual';
  const enabledHabits = userData.enabledHabits || ['study'];

  const handleChangeHamster = (character: string) => {
    setCharacter(character);
    Alert.alert('Success', 'Hamster changed successfully!');
  };

  const handleChangeName = (name: string) => {
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
    setBuddyName(profile.buddyName);
    setProfile(profile.userName, profile.studentLevel, profile.country, profile.timezone);
    Alert.alert('Success', 'Profile updated!');
  };

  const handleSaveHabits = (habits: string[]) => {
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

  const handleTestDatabaseSync = () => {
    const currentCoins = userData.qCoins;
    logWater(); // This will add +5 coins and sync to database
    Alert.alert(
      'Database Sync Test',
      `Added +5 coins (${currentCoins} → ${currentCoins + 5}) and synced to database.\n\nCheck your database to verify the sync worked!`,
      [{ text: 'OK' }]
    );
  };

  const handleLoadFromDatabase = async () => {
    try {
      await loadFromDatabase();
      Alert.alert(
        'Load from Database',
        'Data refreshed from database successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Load Failed',
        'Failed to load data from database. Check your connection.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ Settings</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeValue}>{userData.qCoins}</Text>
              <Text style={styles.statBadgeLabel}>Coins</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeValue}>{userData.currentStreak}</Text>
              <Text style={styles.statBadgeLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Profile</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowProfileModal(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.profileCard}>
            {/* User Avatar and Name */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(userData.userName || 'Student').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.buddyBadge}>
                  <Text style={styles.buddyBadgeText}>🐹</Text>
                </View>
              </View>
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.profileHeaderName}>{userData.userName || 'Student'}</Text>
                <Text style={styles.profileHeaderSubtitle}>
                  🐹 Buddy: <Text style={styles.buddyNameText}>{buddyName}</Text>
                </Text>
              </View>
            </View>

            {/* Profile Details */}
            <View style={styles.profileDetails}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>🎓</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Student Level</Text>
                  <Text style={styles.detailValue}>{userData.studentLevel || 'University'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>🌍</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Country</Text>
                  <Text style={styles.detailValue}>{userData.country || 'Global'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>🕐</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Timezone</Text>
                  <Text style={styles.detailValue}>{userData.timezone || 'Not set'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Customization Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Customization</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowHamsterModal(true)}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>🐹</Text>
              <View>
                <Text style={styles.settingTitle}>Change Hamster</Text>
                <Text style={styles.settingSubtitle}>Current: {currentCharacter}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowNameModal(true)}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>✏️</Text>
              <View>
                <Text style={styles.settingTitle}>Change Name</Text>
                <Text style={styles.settingSubtitle}>{buddyName}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Habits & Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Habits & Goals</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowHabitsModal(true)}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>📋</Text>
              <View>
                <Text style={styles.settingTitle}>Manage Habits</Text>
                <Text style={styles.settingSubtitle}>
                  {enabledHabits.length} habits enabled
                </Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => setShowGoalsModal(true)}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>🎯</Text>
              <View>
                <Text style={styles.settingTitle}>Edit Goals</Text>
                <Text style={styles.settingSubtitle}>Study, exercise, sleep targets</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={() => router.push('/onboarding/tutorial')}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>📖</Text>
              <View>
                <Text style={styles.settingTitle}>View Tutorial</Text>
                <Text style={styles.settingSubtitle}>Learn how to use Quillby</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleResetOnboarding}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>🔄</Text>
              <View>
                <Text style={styles.settingTitle}>Reset Onboarding</Text>
                <Text style={styles.settingSubtitle}>Start fresh setup</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Database Sync Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗄️ Database Sync</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleTestDatabaseSync}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>🧪</Text>
              <View>
                <Text style={styles.settingTitle}>Test Database Sync</Text>
                <Text style={styles.settingSubtitle}>Add +5 coins and sync to database</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingButton}
            onPress={handleLoadFromDatabase}
          >
            <View style={styles.settingButtonLeft}>
              <Text style={styles.settingIcon}>📥</Text>
              <View>
                <Text style={styles.settingTitle}>Load from Database</Text>
                <Text style={styles.settingSubtitle}>Refresh data from server</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Quillby v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with 💚 for students</Text>
          <Text style={styles.appInfoCreator}>Made by MakerYuichii</Text>
        </View>
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
    </ImageBackground>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadgeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statBadgeLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  buddyBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  buddyBadgeText: {
    fontSize: 14,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileHeaderName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  profileHeaderSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  buddyNameText: {
    fontWeight: '600',
    color: '#4CAF50',
  },
  profileDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingArrow: {
    fontSize: 24,
    color: '#CCC',
    fontWeight: '300',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  appInfoText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  appInfoCreator: {
    fontSize: 13,
    color: '#7E57C2',
    fontWeight: '600',
    marginTop: 4,
  },
});
