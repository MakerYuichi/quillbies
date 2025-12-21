import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuillbyStore } from '../state/store';
import ChangeHamsterModal from '../components/modals/ChangeHamsterModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { 
    userData, 
    resetDay, 
    setBuddyName, 
    setProfile, 
    setCharacter, 
    setHabits, 
    setStudyGoal, 
    setWeightGoal 
  } = useQuillbyStore();

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHabitsModal, setShowHabitsModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  // Form states
  const [tempUserName, setTempUserName] = useState(userData.userName || '');
  const [tempBuddyName, setTempBuddyName] = useState(userData.buddyName || '');
  const [tempStudentLevel, setTempStudentLevel] = useState(userData.studentLevel || 'university');
  const [tempCountry, setTempCountry] = useState(userData.country || '');
  const [tempTimezone, setTempTimezone] = useState(userData.timezone || '');
  const [tempStudyHours, setTempStudyHours] = useState(userData.studyGoalHours?.toString() || '2');
  const [tempHabits, setTempHabits] = useState(userData.enabledHabits || []);
  const [tempCheckpoints, setTempCheckpoints] = useState(userData.studyCheckpoints || []);
  
  const buddyName = userData.buddyName || 'Quillby';
  const userName = userData.userName || 'Friend';
  const studentLevel = userData.studentLevel || 'Not set';
  const country = userData.country || 'Not set';
  const timezone = userData.timezone || 'Not set';

  const availableHabits = [
    { id: 'study', name: 'Study Sessions', icon: '📚' },
    { id: 'hydration', name: 'Water Tracking', icon: '💧' },
    { id: 'meals', name: 'Meal Logging', icon: '🍽️' },
    { id: 'sleep', name: 'Sleep Tracking', icon: '😴' },
    { id: 'exercise', name: 'Exercise', icon: '🏃' },
  ];

  const availableCheckpoints = ['9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
  const studentLevels = ['highschool', 'university', 'graduate', 'learner'];
  const characters = ['casual', 'energetic', 'scholar'];

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

  const handleSaveProfile = () => {
    setBuddyName(tempBuddyName);
    setProfile(tempUserName, tempStudentLevel, tempCountry, tempTimezone);
    setShowProfileModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleSaveHabits = () => {
    setHabits(tempHabits);
    setShowHabitsModal(false);
    Alert.alert('Success', 'Habits updated successfully!');
  };

  const handleSaveStudyGoal = () => {
    const hours = parseInt(tempStudyHours);
    if (hours >= 1 && hours <= 8) {
      setStudyGoal(hours, tempCheckpoints);
      setShowStudyModal(false);
      Alert.alert('Success', 'Study goal updated successfully!');
    } else {
      Alert.alert('Error', 'Study hours must be between 1 and 8.');
    }
  };

  const toggleHabit = (habitId: string) => {
    if (tempHabits.includes(habitId)) {
      setTempHabits(tempHabits.filter(h => h !== habitId));
    } else {
      setTempHabits([...tempHabits, habitId]);
    }
  };

  const toggleCheckpoint = (checkpoint: string) => {
    if (tempCheckpoints.includes(checkpoint)) {
      setTempCheckpoints(tempCheckpoints.filter(c => c !== checkpoint));
    } else {
      setTempCheckpoints([...tempCheckpoints, checkpoint]);
    }
  };

  const handleCharacterSelect = (character: string) => {
    setCharacter(character);
    setShowCharacterModal(false);
    Alert.alert('Success', `Character changed to ${character}!`);
  };

  const handleDataReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your progress, habits, and settings. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'DELETE ALL', 
          style: 'destructive',
          onPress: () => {
            // Reset to initial state
            const { initializeUser } = useQuillbyStore.getState();
            initializeUser();
            Alert.alert('Reset Complete', 'All data has been reset to defaults.');
          }
        }
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/backgrounds/theme.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>Customize your Quillby experience</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Profile</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setTempUserName(userData.userName || '');
                setTempBuddyName(userData.buddyName || '');
                setTempStudentLevel(userData.studentLevel || 'university');
                setTempCountry(userData.country || '');
                setTempTimezone(userData.timezone || '');
                setShowProfileModal(true);
              }}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Your Name:</Text>
              <Text style={styles.infoValue}>{userName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Buddy Name:</Text>
              <Text style={styles.infoValue}>{buddyName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Student Level:</Text>
              <Text style={styles.infoValue}>{studentLevel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Country:</Text>
              <Text style={styles.infoValue}>{country}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timezone:</Text>
              <Text style={styles.infoValue}>{timezone}</Text>
            </View>
          </View>
        </View>

        {/* Character Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🐹 Character</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowCharacterModal(true)}
            >
              <Text style={styles.editButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.characterDisplay}>
              <Text style={styles.characterName}>
                {userData.selectedCharacter || 'casual'} hamster
              </Text>
              <Text style={styles.characterDescription}>
                {userData.selectedCharacter === 'energetic' ? '⚡ High-energy and enthusiastic' :
                 userData.selectedCharacter === 'scholar' ? '📚 Studious and focused' :
                 '😊 Friendly and balanced'}
              </Text>
            </View>
          </View>
        </View>

        {/* Habits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ Habits</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setTempHabits(userData.enabledHabits || []);
                setShowHabitsModal(true);
              }}
            >
              <Text style={styles.editButtonText}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            {userData.enabledHabits && userData.enabledHabits.length > 0 ? (
              userData.enabledHabits.map((habit, index) => {
                const habitInfo = availableHabits.find(h => h.id === habit);
                return (
                  <View key={index} style={styles.habitRow}>
                    <Text style={styles.habitIcon}>{habitInfo?.icon || '✅'}</Text>
                    <Text style={styles.habitText}>
                      {habitInfo?.name || habit.charAt(0).toUpperCase() + habit.slice(1)}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.habitText}>No habits enabled</Text>
            )}
          </View>
        </View>

        {/* Study Goals Section */}
        {userData.enabledHabits?.includes('study') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 Study Goals</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  setTempStudyHours(userData.studyGoalHours?.toString() || '2');
                  setTempCheckpoints(userData.studyCheckpoints || []);
                  setShowStudyModal(true);
                }}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Daily Goal:</Text>
                <Text style={styles.infoValue}>{userData.studyGoalHours || 0} hours</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Checkpoints:</Text>
                <Text style={styles.infoValue}>
                  {userData.studyCheckpoints?.length || 0} selected
                </Text>
              </View>
              {userData.studyCheckpoints && userData.studyCheckpoints.length > 0 && (
                <View style={styles.checkpointsList}>
                  {userData.studyCheckpoints.map((checkpoint, index) => (
                    <Text key={index} style={styles.checkpointText}>
                      🕐 {checkpoint}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Weight Goal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Weight Goal</Text>
          <View style={styles.infoCard}>
            <View style={styles.weightGoalContainer}>
              {(['lose', 'maintain', 'gain'] as const).map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.weightGoalButton,
                    userData.weightGoal === goal && styles.weightGoalButtonActive
                  ]}
                  onPress={() => setWeightGoal(goal)}
                >
                  <Text style={[
                    styles.weightGoalText,
                    userData.weightGoal === goal && styles.weightGoalTextActive
                  ]}>
                    {goal === 'lose' ? '📉 Lose' :
                     goal === 'maintain' ? '➡️ Maintain' :
                     '📈 Gain'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.weightGoalDescription}>
              Portion size: {userData.weightGoal === 'lose' ? '70% (smaller)' :
                           userData.weightGoal === 'gain' ? '130% (larger)' :
                           '100% (normal)'}
            </Text>
          </View>
        </View>

        {/* Shop Testing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>�️A Shop Testing</Text>

        </View>

        {/* App Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 App Controls</Text>
          <TouchableOpacity style={styles.button} onPress={resetDay}>
            <Text style={styles.buttonText}>🔄 Reset Daily Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.warningButton]} 
            onPress={handleResetOnboarding}
          >
            <Text style={styles.buttonText}>🚀 Restart Onboarding</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]} 
            onPress={handleDataReset}
          >
            <Text style={styles.buttonText}>🗑️ Reset All Data</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version:</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Q-Coins:</Text>
              <Text style={styles.infoValue}>{userData.qCoins}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Streak:</Text>
              <Text style={styles.infoValue}>{userData.currentStreak} days</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data Storage:</Text>
              <Text style={styles.infoValue}>Local Device</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.textInput}
                value={tempUserName}
                onChangeText={setTempUserName}
                placeholder="Enter your name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buddy Name</Text>
              <TextInput
                style={styles.textInput}
                value={tempBuddyName}
                onChangeText={setTempBuddyName}
                placeholder="Enter hamster's name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Student Level</Text>
              <View style={styles.optionGrid}>
                {studentLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionButton,
                      tempStudentLevel === level && styles.optionButtonActive
                    ]}
                    onPress={() => setTempStudentLevel(level)}
                  >
                    <Text style={[
                      styles.optionText,
                      tempStudentLevel === level && styles.optionTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.textInput}
                value={tempCountry}
                onChangeText={setTempCountry}
                placeholder="Enter your country"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timezone</Text>
              <TextInput
                style={styles.textInput}
                value={tempTimezone}
                onChangeText={setTempTimezone}
                placeholder="e.g., UTC+5:30"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Character Selection Modal */}
      <Modal
        visible={showCharacterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCharacterModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choose Character</Text>
            <View style={styles.modalSpacer} />
          </View>
          
          <View style={styles.modalContent}>
            {characters.map((character) => (
              <TouchableOpacity
                key={character}
                style={[
                  styles.characterOption,
                  userData.selectedCharacter === character && styles.characterOptionActive
                ]}
                onPress={() => handleCharacterSelect(character)}
              >
                <Text style={styles.characterOptionTitle}>
                  {character.charAt(0).toUpperCase() + character.slice(1)} Hamster
                </Text>
                <Text style={styles.characterOptionDescription}>
                  {character === 'energetic' ? '⚡ High-energy and enthusiastic companion' :
                   character === 'scholar' ? '📚 Studious and focused study buddy' :
                   '😊 Friendly and balanced personality'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Habits Management Modal */}
      <Modal
        visible={showHabitsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHabitsModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Manage Habits</Text>
            <TouchableOpacity onPress={handleSaveHabits}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Select which habits you want to track in Quillby:
            </Text>
            {availableHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={styles.habitOption}
                onPress={() => toggleHabit(habit.id)}
              >
                <View style={styles.habitOptionLeft}>
                  <Text style={styles.habitOptionIcon}>{habit.icon}</Text>
                  <Text style={styles.habitOptionName}>{habit.name}</Text>
                </View>
                <Switch
                  value={tempHabits.includes(habit.id)}
                  onValueChange={() => toggleHabit(habit.id)}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={tempHabits.includes(habit.id) ? '#FFF' : '#FFF'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Study Goal Modal */}
      <Modal
        visible={showStudyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowStudyModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Study Goals</Text>
            <TouchableOpacity onPress={handleSaveStudyGoal}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Daily Study Goal (hours)</Text>
              <TextInput
                style={styles.textInput}
                value={tempStudyHours}
                onChangeText={setTempStudyHours}
                placeholder="2"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Study Checkpoints</Text>
              <Text style={styles.inputDescription}>
                Select times when you'll be reminded to check your progress:
              </Text>
              <View style={styles.checkpointGrid}>
                {availableCheckpoints.map((checkpoint) => (
                  <TouchableOpacity
                    key={checkpoint}
                    style={[
                      styles.checkpointOption,
                      tempCheckpoints.includes(checkpoint) && styles.checkpointOptionActive
                    ]}
                    onPress={() => toggleCheckpoint(checkpoint)}
                  >
                    <Text style={[
                      styles.checkpointOptionText,
                      tempCheckpoints.includes(checkpoint) && styles.checkpointOptionTextActive
                    ]}>
                      {checkpoint}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  content: {
    padding: SCREEN_WIDTH * 0.05,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  header: {
    marginBottom: SCREEN_HEIGHT * 0.03,
    alignItems: 'center',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    textAlign: 'center',
  },
  
  // Section Styles
  section: {
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.008,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
  },
  
  // Info Card Styles
  infoCard: {
    backgroundColor: '#FFF',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  infoValue: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  
  // Character Display
  characterDisplay: {
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.02,
  },
  characterName: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  characterDescription: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    textAlign: 'center',
  },
  
  // Habit Styles
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.008,
  },
  habitIcon: {
    fontSize: SCREEN_WIDTH * 0.05,
    marginRight: SCREEN_WIDTH * 0.03,
  },
  habitText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    flex: 1,
  },
  
  // Checkpoints List
  checkpointsList: {
    marginTop: SCREEN_HEIGHT * 0.01,
    paddingTop: SCREEN_HEIGHT * 0.01,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  checkpointText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    paddingVertical: SCREEN_HEIGHT * 0.003,
  },
  
  // Weight Goal Styles
  weightGoalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  weightGoalButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  weightGoalButtonActive: {
    backgroundColor: '#2196F3',
  },
  weightGoalText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
  },
  weightGoalTextActive: {
    color: '#FFF',
  },
  weightGoalDescription: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Button Styles
  button: {
    backgroundColor: '#2196F3',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: SCREEN_HEIGHT * 0.005,
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },

  buttonText: {
    color: '#FFF',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: SCREEN_HEIGHT * 0.06,
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
    color: '#333',
  },
  modalCancel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
  },
  modalSave: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#2196F3',
    fontWeight: '600',
  },
  modalSpacer: {
    width: SCREEN_WIDTH * 0.1,
  },
  modalContent: {
    flex: 1,
    padding: SCREEN_WIDTH * 0.05,
  },
  modalDescription: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  inputDescription: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: SCREEN_WIDTH * 0.04,
    fontSize: SCREEN_WIDTH * 0.04,
    backgroundColor: '#F9F9F9',
  },
  
  // Option Grid Styles
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  optionButtonActive: {
    backgroundColor: '#2196F3',
  },
  optionText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#FFF',
  },
  
  // Character Option Styles
  characterOption: {
    backgroundColor: '#F9F9F9',
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.015,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  characterOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  characterOptionTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  characterOptionDescription: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
  },
  
  // Habit Option Styles
  habitOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  habitOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitOptionIcon: {
    fontSize: SCREEN_WIDTH * 0.05,
    marginRight: SCREEN_WIDTH * 0.03,
  },
  habitOptionName: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    flex: 1,
  },
  
  // Checkpoint Grid Styles
  checkpointGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checkpointOption: {
    width: '30%',
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  checkpointOptionActive: {
    backgroundColor: '#4CAF50',
  },
  checkpointOptionText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
  },
  checkpointOptionTextActive: {
    color: '#FFF',
  },
  
  // Bottom Spacer
  bottomSpacer: {
    height: SCREEN_HEIGHT * 0.05,
  },
});
