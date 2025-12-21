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

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  initialDate?: string;
}

export default function CustomDatePicker({ visible, onClose, onDateSelect, initialDate }: CustomDatePickerProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Initialize with current date or provided initial date
  React.useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
      setSelectedDay(date.getDate());
    }
  }, [initialDate]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    const formattedDate = date.toISOString().split('T')[0];
    onDateSelect(formattedDate);
    onClose();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const today = new Date();
    const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDay;
      const isToday = isCurrentMonth && day === today.getDate();
      const isPast = new Date(selectedYear, selectedMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            styles.dayButton,
            isSelected && styles.selectedDay,
            isToday && styles.todayDay,
            isPast && styles.pastDay
          ]}
          onPress={() => !isPast && setSelectedDay(day)}
          disabled={isPast}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && styles.todayDayText,
            isPast && styles.pastDayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
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
            <Text style={styles.title}>Select Date</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Month/Year Selector */}
          <View style={styles.monthYearSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  style={[styles.monthButton, selectedMonth === index && styles.selectedMonthButton]}
                  onPress={() => setSelectedMonth(index)}
                >
                  <Text style={[styles.monthText, selectedMonth === index && styles.selectedMonthText]}>
                    {month.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
              {generateYears().map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearButton, selectedYear === year && styles.selectedYearButton]}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text style={[styles.yearText, selectedYear === year && styles.selectedYearText]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendar}>
            {/* Day headers */}
            <View style={styles.dayHeaders}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>
            
            {/* Calendar days */}
            <View style={styles.daysGrid}>
              {renderCalendar()}
            </View>
          </View>

          {/* Selected date display */}
          <View style={styles.selectedDateDisplay}>
            <Text style={styles.selectedDateText}>
              Selected: {months[selectedMonth]} {selectedDay}, {selectedYear}
            </Text>
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
  monthYearSelector: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  monthScroll: {
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  monthButton: {
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.02,
    marginRight: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedMonthButton: {
    backgroundColor: '#2196F3',
  },
  monthText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  selectedMonthText: {
    color: '#FFF',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  yearScroll: {
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  yearButton: {
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.02,
    marginRight: SCREEN_WIDTH * 0.02,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedYearButton: {
    backgroundColor: '#2196F3',
  },
  yearText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  selectedYearText: {
    color: '#FFF',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  calendar: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: '600',
    color: '#666',
    paddingVertical: SCREEN_WIDTH * 0.02,
    fontFamily: 'ChakraPetch_600SemiBold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    borderRadius: 8,
    margin: 1,
  },
  selectedDay: {
    backgroundColor: '#4CAF50',
  },
  todayDay: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  pastDay: {
    backgroundColor: '#F5F5F5',
  },
  dayText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'ChakraPetch_500Medium',
  },
  selectedDayText: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'ChakraPetch_700Bold',
  },
  todayDayText: {
    color: '#2196F3',
    fontWeight: '700',
    fontFamily: 'ChakraPetch_700Bold',
  },
  pastDayText: {
    color: '#CCC',
    fontFamily: 'ChakraPetch_400Regular',
  },
  selectedDateDisplay: {
    backgroundColor: '#F0F8FF',
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#1976D2',
    fontWeight: '600',
    fontFamily: 'ChakraPetch_600SemiBold',
  },
});