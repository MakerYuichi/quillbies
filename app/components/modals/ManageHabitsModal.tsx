import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Switch,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ManageHabitsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habits: string[]) => void;
  currentHabits: string[];
}

const HABIT_OPTIONS = [
  {
    id: 'study',
    name: 'Study Focus',
    description: 'Track study sessions and checkpoints',
    icon: '📚',
    isCore: true,
  },
  {
    id: 'exercise',
    name: 'Exercise',
    description: 'Log daily physical activity',
    icon: '🏃',
    isCore: false,
  },
  {
    id: 'hydration',
    name: 'Hydration',
    description: 'Track water intake',
    icon: '💧',
    isCore: false,
  },
  {
    id: 'meals',
    name: 'Meals',
    description: 'Track daily meals and nutrition',
    icon: '🍽️',
    isCore: false,
  },
  {
    id: 'sleep',
    name: 'Sleep',
    description: 'Monitor sleep quality',
    icon: '😴',
    isCore: false,
  },
];

export default function ManageHabitsModal({
  visible,
  onClose,
  onSave,
  currentHabits,
}: ManageHabitsModalProps) {
  const [selectedHabits, setSelectedHabits] = useState<string[]>(currentHabits);

  const toggleHabit = (habitId: string, isCore: boolean) => {
    if (isCore) return; // Can't disable core habits
    
    if (selectedHabits.includes(habitId)) {
      setSelectedHabits(selectedHabits.filter(h => h !== habitId));
    } else {
      setSelectedHabits([...selectedHabits, habitId]);
    }
  };

  const handleSave = () => {
    onSave(selectedHabits);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Manage Habits</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Habits List */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {HABIT_OPTIONS.map((habit) => {
              const isEnabled = selectedHabits.includes(habit.id);
              
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitCard,
                    isEnabled && styles.habitCardEnabled,
                    !isEnabled && styles.habitCardDisabled,
                  ]}
                  onPress={() => toggleHabit(habit.id, habit.isCore)}
                  activeOpacity={habit.isCore ? 1 : 0.7}
                >
                  <View style={styles.habitLeft}>
                    <Text style={styles.habitIcon}>{habit.icon}</Text>
                    <View style={styles.habitInfo}>
                      <View style={styles.habitNameRow}>
                        <Text style={[
                          styles.habitName,
                          !isEnabled && styles.habitNameDisabled
                        ]}>
                          {habit.name}
                        </Text>
                        {habit.isCore && (
                          <Text style={styles.coreLabel}>(Core)</Text>
                        )}
                      </View>
                      <Text style={[
                        styles.habitDescription,
                        !isEnabled && styles.habitDescriptionDisabled
                      ]}>
                        {habit.description}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isEnabled}
                    onValueChange={() => toggleHabit(habit.id, habit.isCore)}
                    disabled={habit.isCore}
                    trackColor={{ false: '#CCC', true: '#4CAF50' }}
                    thumbColor="#FFF"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    maxHeight: SCREEN_HEIGHT * 0.7,
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
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  habitCardEnabled: {
    backgroundColor: '#FFF',
    borderColor: '#4CAF50',
  },
  habitCardDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  habitNameDisabled: {
    color: '#888',
  },
  coreLabel: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '600',
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
  },
  habitDescriptionDisabled: {
    color: '#AAA',
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
});
