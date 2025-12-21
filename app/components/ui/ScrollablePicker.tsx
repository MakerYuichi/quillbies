import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScrollablePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: number) => void;
  selectedValue: number;
  values?: number[];
  title?: string;
  // Alternative props for range-based picker
  minValue?: number;
  maxValue?: number;
  label?: string;
}

export default function ScrollablePicker({
  visible,
  onClose,
  onSelect,
  selectedValue,
  values: providedValues,
  title: providedTitle,
  minValue,
  maxValue,
  label,
}: ScrollablePickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const ITEM_HEIGHT = 50;

  // Generate values array if minValue and maxValue are provided
  const values = providedValues || (minValue !== undefined && maxValue !== undefined
    ? Array.from({ length: maxValue - minValue + 1 }, (_, i) => minValue + i)
    : []);
  
  const title = providedTitle || label || 'Select Value';

  useEffect(() => {
    if (visible && scrollViewRef.current) {
      const index = values.indexOf(selectedValue);
      if (index !== -1) {
        // Scroll to selected value with slight delay to ensure layout is complete
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
          });
        }, 100);
      }
    }
  }, [visible, selectedValue, values]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContent}>
            {/* Selection indicator */}
            <View style={styles.selectionIndicator} />

            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Top padding */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />

              {values.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.pickerItem,
                    { height: ITEM_HEIGHT },
                  ]}
                  onPress={() => onSelect(value)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedValue === value && styles.pickerItemTextSelected,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Bottom padding */}
              <View style={{ height: ITEM_HEIGHT * 2 }} />
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
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
  pickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: SCREEN_WIDTH * 0.7,
    maxHeight: SCREEN_HEIGHT * 0.5,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pickerContent: {
    height: 250,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 50,
    marginTop: -25,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#4CAF50',
    zIndex: 1,
    pointerEvents: 'none',
  },
  scrollContent: {
    alignItems: 'center',
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.7,
  },
  pickerItemText: {
    fontSize: 24,
    color: '#999',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 28,
  },
});
