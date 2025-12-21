import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import ScrollablePicker from '../ui/ScrollablePicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EditGoalsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goals: {
    studyHours?: number;
    exerciseMinutes?: number;
    hydrationGlasses?: number;
    weightGoal?: 'lose' | 'maintain' | 'gain';
    sleepHours?: number;
  }) => void;
  currentGoals: {
    studyHours?: number;
    exerciseMinutes?: number;
    hydrationGlasses?: number;
    weightGoal?: 'lose' | 'maintain' | 'gain';
    sleepHours?: number;
  };
  enabledHabits: string[];
}

export default function EditGoalsModal({
  visible,
  onClose,
  onSave,
  currentGoals,
  enabledHabits,
}: EditGoalsModalProps) {
  // Study goal - separate hours and minutes
  const initialStudyHours = Math.floor(currentGoals.studyHours || 3);
  const initialStudyMinutes = Math.round(((currentGoals.studyHours || 3) % 1) * 60);
  const [studyHours, setStudyHours] = useState(initialStudyHours);
  const [studyMinutes, setStudyMinutes] = useState(initialStudyMinutes);
  
  // Exercise goal - separate hours and minutes
  const initialExerciseHours = Math.floor((currentGoals.exerciseMinutes || 30) / 60);
  const initialExerciseMinutes = (currentGoals.exerciseMinutes || 30) % 60;
  const [exerciseHours, setExerciseHours] = useState(initialExerciseHours);
  const [exerciseMinutes, setExerciseMinutes] = useState(initialExerciseMinutes);
  
  // Hydration goal
  const [hydrationGlasses, setHydrationGlasses] = useState(currentGoals.hydrationGlasses || 8);
  
  // Weight goal (for meals)
  const [weightGoal, setWeightGoal] = useState<'lose' | 'maintain' | 'gain'>(
    currentGoals.weightGoal || 'maintain'
  );
  
  // Sleep goal - separate hours and minutes
  const initialSleepHours = Math.floor(currentGoals.sleepHours || 7);
  const initialSleepMinutes = Math.round(((currentGoals.sleepHours || 7) % 1) * 60);
  const [sleepHours, setSleepHours] = useState(initialSleepHours);
  const [sleepMinutes, setSleepMinutes] = useState(initialSleepMinutes);

  // Picker modal states
  const [showPicker, setShowPicker] = useState<{
    type: 'studyHours' | 'studyMinutes' | 'exerciseHours' | 'exerciseMinutes' | 'sleepHours' | 'sleepMinutes' | 'hydration' | null;
  }>({ type: null });

  const handleSave = () => {
    const goals: any = {};
    
    if (enabledHabits.includes('study')) {
      goals.studyHours = studyHours + (studyMinutes / 60);
    }
    if (enabledHabits.includes('exercise')) {
      goals.exerciseMinutes = (exerciseHours * 60) + exerciseMinutes;
    }
    if (enabledHabits.includes('hydration')) {
      goals.hydrationGlasses = hydrationGlasses;
    }
    if (enabledHabits.includes('meals')) {
      goals.weightGoal = weightGoal;
    }
    if (enabledHabits.includes('sleep')) {
      goals.sleepHours = sleepHours + (sleepMinutes / 60);
    }
    
    onSave(goals);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Goals</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Goals List */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Study Goal */}
            {enabledHabits.includes('study') && (
              <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalIcon}>📚</Text>
                  <Text style={styles.goalTitle}>Study Goal</Text>
                </View>
                <View style={styles.timeInputRow}>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowPicker({ type: 'studyHours' })}
                  >
                    <Text style={styles.timeValue}>{studyHours}</Text>
                    <Text style={styles.timeLabel}>hrs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowPicker({ type: 'studyMinutes' })}
                  >
                    <Text style={styles.timeValue}>{studyMinutes}</Text>
                    <Text style={styles.timeLabel}>min</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Exercise Goal */}
            {enabledHabits.includes('exercise') && (
              <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalIcon}>🏃</Text>
                  <Text style={styles.goalTitle}>Exercise Goal</Text>
                </View>
                <View style={styles.timeInputRow}>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowPicker({ type: 'exerciseHours' })}
                  >
                    <Text style={styles.timeValue}>{exerciseHours}</Text>
                    <Text style={styles.timeLabel}>hrs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowPicker({ type: 'exerciseMinutes' })}
                  >
                    <Text style={styles.timeValue}>{exerciseMinutes}</Text>
                    <Text style={styles.timeLabel}>min</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Hydration Goal */}
            {enabledHabits.includes('hydration') && (
              <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalIcon}>💧</Text>
                  <Text style={styles.goalTitle}>Hydration Goal</Text>
                </View>
                <TouchableOpacity
                  style={styles.singleInput}
                  onPress={() => setShowPicker({ type: 'hydration' })}
                >
                  <Text style={styles.timeValue}>{hydrationGlasses}</Text>
                  <Text style={styles.timeLabel}>glasses</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Weight Goal (Meals) */}
            {enabledHabits.includes('meals') && (
              <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalIcon}>🍽️</Text>
                  <View>
                    <Text style={styles.goalTitle}>Weight Goal</Text>
                    <Text style={styles.goalSubtitle}>Affects meal portion sizes</Text>
                  </View>
                </View>
                <View style={styles.weightGoalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.weightGoalButton,
                      weightGoal === 'lose' && styles.weightGoalButtonSelected
                    ]}
                    onPress={() => setWeightGoal('lose')}
                  >
                    <Text style={[
                      styles.weightGoalButtonText,
                      weightGoal === 'lose' && styles.weightGoalButtonTextSelected
                    ]}>
                      📉 Lose
                    </Text>
                    {weightGoal === 'lose' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.weightGoalButton,
                      weightGoal === 'maintain' && styles.weightGoalButtonSelected
                    ]}
                    onPress={() => setWeightGoal('maintain')}
                  >
                    <Text style={[
                      styles.weightGoalButtonText,
                      weightGoal === 'maintain' && styles.weightGoalButtonTextSelected
                    ]}>
                      ⚖️ Maintain
                    </Text>
                    {weightGoal === 'maintain' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.weightGoalButton,
                      weightGoal === 'gain' && styles.weightGoalButtonSelected
                    ]}
                    onPress={() => setWeightGoal('gain')}
                  >
                    <Text style={[
                      styles.weightGoalButtonText,
                      weightGoal === 'gain' && styles.weightGoalButtonTextSelected
                    ]}>
                      📈 Gain
                    </Text>
                    {weightGoal === 'gain' && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sleep Goal */}
            {enabledHabits.includes('sleep') && (
              <View style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalIcon}>😴</Text>
                  <Text style={styles.goalTitle}>Sleep Goal</Text>
                </View>
                <View style={styles.timeInputRow}>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowPicker({ type: 'sleepHours' })}
                  >
                    <Text style={styles.timeValue}>{sleepHours}</Text>
                    <Text style={styles.timeLabel}>hrs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.timeInput}
                    onPress={() => setShowPicker({ type: 'sleepMinutes' })}
                  >
                    <Text style={styles.timeValue}>{sleepMinutes}</Text>
                    <Text style={styles.timeLabel}>min</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Pickers */}
      {showPicker.type === 'studyHours' && (
        <ScrollablePicker
          visible={true}
          onClose={() => setShowPicker({ type: null })}
          onSelect={(value) => {
            setStudyHours(value);
            setShowPicker({ type: null });
          }}
          selectedValue={studyHours}
          minValue={0}
          maxValue={12}
          label="Study Hours"
        />
      )}
      {showPicker.type === 'studyMinutes' && (
        <ScrollablePicker
          visible={true}
          onClose={() => setShowPicker({ type: null })}
          onSelect={(value) => {
            setStudyMinutes(value);
            setShowPicker({ type: null });
          }}
          selectedValue={studyMinutes}
          minValue={0}
          maxValue={59}
          label="Study Minutes"
        />
      )}
      {showPicker.type === 'exerciseHours' && (
        <ScrollablePicker
          visible={true}
          onClose={() => setShowPicker({ type: null })}
          onSelect={(value) => {
            setExerciseHours(value);
            setShowPicker({ type: null });
          }}
          selectedValue={exerciseHours}
          minValue={0}
          maxValue={5}
          label="Exercise Hours"
        />
      )}
      {showPicker.type === 'exerciseMinutes' && (
        <ScrollablePicker
          visible={true}
          onClose={() => setShowPicker({ type: null })}
          onSelect={(value) => {
            setExerciseMinutes(value);
            setShowPicker({ type: null });
          }}
          selectedValue={exerciseMinutes}
          minValue={0}
          maxValue={59}
          label="Exercise Minutes"
        />
      )}
      {showPicker.type === 'sleepHours' && (
        <ScrollablePicker
          visible={true}
          onClose={() => setShowPicker({ type: null })}
          onSelect={(value) => {
            setSleepHours(value);
            setShowPicker({ type: null });
          }}
          selectedValue={sleepHours}
          minValue={4}
          maxValue={12}
          label="Sleep Hours"
        />
      )}
      {showPicker.type === 'sleepMinutes' && (
        <ScrollablePicker
          visible={true}
          onClose={() => setShowPicker({ type: null })}
          onSelect={(value) => {
            setSleepMinutes(value);
            setShowPicker({ type: null });
          }}
          selectedValue={sleepMinutes}
          minValue={0}
          maxValue={59}
          label="Sleep Minutes"
        />
      )}
      {showPicker.type === 'hydration' && (
        <ScrollablePicker
          visible={true}
          onClose={() => setShowPicker({ type: null })}
          onSelect={(value) => {
            setHydrationGlasses(value);
            setShowPicker({ type: null });
          }}
          selectedValue={hydrationGlasses}
          minValue={1}
          maxValue={16}
          label="Water Glasses"
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.75,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  goalCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  goalSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  singleInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  weightGoalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  weightGoalButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  weightGoalButtonSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  weightGoalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  weightGoalButtonTextSelected: {
    color: '#2E7D32',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
