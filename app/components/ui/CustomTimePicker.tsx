import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  ScrollView,
  ImageBackground
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CustomTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  initialTime?: string;
}

export default function CustomTimePicker({ visible, onClose, onTimeSelect, initialTime }: CustomTimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  // Initialize with current time or provided initial time
  React.useEffect(() => {
    if (initialTime) {
      const [hours, minutes] = initialTime.split(':').map(Number);
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? 'PM' : 'AM';
      
      setSelectedHour(hour12);
      setSelectedMinute(minutes);
      setSelectedPeriod(period);
    } else {
      // Default to current time
      const now = new Date();
      const hour12 = now.getHours() === 0 ? 12 : now.getHours() > 12 ? now.getHours() - 12 : now.getHours();
      const period = now.getHours() >= 12 ? 'PM' : 'AM';
      
      setSelectedHour(hour12);
      setSelectedMinute(now.getMinutes());
      setSelectedPeriod(period);
    }
  }, [initialTime, visible]);

  const handleConfirm = () => {
    // Convert to 24-hour format
    let hour24 = selectedHour;
    if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    } else if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    }
    
    const formattedTime = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onTimeSelect(formattedTime);
    onClose();
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 1; i <= 12; i++) {
      hours.push(i);
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) { // 5-minute intervals
      minutes.push(i);
    }
    return minutes;
  };

  const formatDisplayTime = () => {
    const displayHour = (selectedHour || 12).toString().padStart(2, '0');
    const displayMinute = (selectedMinute || 0).toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${selectedPeriod}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ImageBackground
          source={require('../../../assets/backgrounds/bluebg.png')}
          style={styles.container}
          resizeMode="cover"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Select Time</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{formatDisplayTime()}</Text>
          </View>

          {/* Time Selectors */}
          <View style={styles.timeSelectors}>
            {/* Hour Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Hour</Text>
              <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                {generateHours().map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={[styles.selectorItem, selectedHour === hour && styles.selectedItem]}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text style={[styles.selectorText, selectedHour === hour && styles.selectedText]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minute Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Minute</Text>
              <ScrollView style={styles.selector} showsVerticalScrollIndicator={false}>
                {generateMinutes().map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={[styles.selectorItem, selectedMinute === minute && styles.selectedItem]}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text style={[styles.selectorText, selectedMinute === minute && styles.selectedText]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* AM/PM Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Period</Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[styles.periodButton, selectedPeriod === 'AM' && styles.selectedPeriodButton]}
                  onPress={() => setSelectedPeriod('AM')}
                >
                  <Text style={[styles.periodText, selectedPeriod === 'AM' && styles.selectedPeriodText]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodButton, selectedPeriod === 'PM' && styles.selectedPeriodButton]}
                  onPress={() => setSelectedPeriod('PM')}
                >
                  <Text style={[styles.periodText, selectedPeriod === 'PM' && styles.selectedPeriodText]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Quick Time Buttons */}
          <View style={styles.quickTimes}>
            <Text style={styles.quickTimesLabel}>Quick Select:</Text>
            <View style={styles.quickTimeButtons}>
              {[
                { label: '9:00 AM', hour: 9, minute: 0, period: 'AM' },
                { label: '12:00 PM', hour: 12, minute: 0, period: 'PM' },
                { label: '3:00 PM', hour: 3, minute: 0, period: 'PM' },
                { label: '6:00 PM', hour: 6, minute: 0, period: 'PM' },
              ].map((quickTime) => (
                <TouchableOpacity
                  key={quickTime.label}
                  style={styles.quickTimeButton}
                  onPress={() => {
                    setSelectedHour(quickTime.hour);
                    setSelectedMinute(quickTime.minute);
                    setSelectedPeriod(quickTime.period as 'AM' | 'PM');
                  }}
                >
                  <Text style={styles.quickTimeButtonText}>{quickTime.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ImageBackground>
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
  container: {
    borderRadius: 20,
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    padding: SCREEN_WIDTH * 0.05,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#ff0000ff',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'ChakraPetch_700Bold',
  },
  confirmText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#077129ff',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  timeDisplay: {
    backgroundColor: '#F0F8FF',
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  timeText: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: '700',
    color: '#1976D2',
    fontFamily: 'ChakraPetch_700Bold',
  },
  timeSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  selectorContainer: {
    flex: 1,
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  selectorLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  selector: {
    height: SCREEN_HEIGHT * 0.2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  selectorItem: {
    padding: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#E3F2FD',
  },
  selectorText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'ChakraPetch_500Medium',
  },
  selectedText: {
    color: '#1976D2',
    fontWeight: '700',
    fontFamily: 'ChakraPetch_700Bold',
  },
  periodSelector: {
    flexDirection: 'column',
    gap: SCREEN_HEIGHT * 0.01,
  },
  periodButton: {
    backgroundColor: '#F5F5F5',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedPeriodButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  periodText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  selectedPeriodText: {
    color: '#1976D2',
    fontWeight: '700',
    fontFamily: 'ChakraPetch_700Bold',
  },
  quickTimes: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  quickTimesLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.01,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  quickTimeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH * 0.02,
  },
  quickTimeButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  quickTimeButtonText: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#1976D2',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
});